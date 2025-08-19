import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, Star, Clock, Shield, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  ownership: string;
  region: string;
  division: string;
  village_or_city: string;
  overall_rating: number;
  verification_status: string;
  is_claimable: boolean;
  institution_type: 'school' | 'hospital' | 'pharmacy';
  phone?: string;
  email?: string;
  website?: string;
  emergency_services?: boolean;
  delivery_available?: boolean;
  languages_taught?: string[];
  services_offered?: string[];
  created_at: string;
  distance?: number;
}

interface SearchFilters {
  institution_type: string[];
  ownership: string[];
  region: string;
  verified_status: string;
  min_rating: number;
  emergency_services: boolean | null;
  delivery_available: boolean | null;
  language_supported: string;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const OWNERSHIP_TYPES = ['government', 'private', 'community', 'religious', 'mission', 'ngo'];

const LANGUAGES = ['English', 'Pidgin', 'Both'];

const SORT_OPTIONS = [
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'newest_added', label: 'Recently Added' },
  { value: 'closest', label: 'Closest to You' }
];

export default function UnifiedServicesSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    institution_type: [],
    ownership: [],
    region: '',
    verified_status: '',
    min_rating: 0,
    emergency_services: null,
    delivery_available: null,
    language_supported: ''
  });
  const [sortBy, setSortBy] = useState('rating_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  // Typeahead suggestions
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(async () => {
        try {
          const suggestions = await generateSuggestions(searchQuery);
          setSuggestions(suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error generating suggestions:', error);
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Main search function
  useEffect(() => {
    if (searchQuery.length >= 1 || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
    }
  }, [searchQuery, filters, sortBy]);

  const generateSuggestions = async (query: string): Promise<string[]> => {
    const suggestions = new Set<string>();
    
    // Get suggestions from all three tables
    const queries = [
      supabase.from('schools').select('name').ilike('name', `%${query}%`).limit(5),
      supabase.from('hospitals').select('name').ilike('name', `%${query}%`).limit(5),
      supabase.from('pharmacies').select('name').ilike('name', `%${query}%`).limit(5)
    ];

    const results = await Promise.all(queries);
    
    results.forEach(({ data }) => {
      data?.forEach(item => suggestions.add(item.name));
    });

    // Add location-based suggestions
    CAMEROON_REGIONS.forEach(region => {
      if (region.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(region);
      }
    });

    return Array.from(suggestions).slice(0, 8);
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const allResults: SearchResult[] = [];

      // Search schools if no institution filter or schools included
      if (filters.institution_type.length === 0 || filters.institution_type.includes('school')) {
        const { data: schools } = await searchInTable('schools', 'school');
        if (schools) allResults.push(...schools);
      }

      // Search hospitals if no institution filter or hospitals included
      if (filters.institution_type.length === 0 || filters.institution_type.includes('hospital')) {
        const { data: hospitals } = await searchInTable('hospitals', 'hospital');
        if (hospitals) allResults.push(...hospitals);
      }

      // Search pharmacies if no institution filter or pharmacies included
      if (filters.institution_type.length === 0 || filters.institution_type.includes('pharmacy')) {
        const { data: pharmacies } = await searchInTable('pharmacies', 'pharmacy');
        if (pharmacies) allResults.push(...pharmacies);
      }

      // Apply client-side sorting
      const sortedResults = sortResults(allResults);
      setResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchInTable = async (table: 'schools' | 'hospitals' | 'pharmacies', institutionType: 'school' | 'hospital' | 'pharmacy') => {
    let query;
    
    if (table === 'schools') {
      query = supabase.from('schools').select('*');
    } else if (table === 'hospitals') {
      query = supabase.from('hospitals').select('*');
    } else {
      query = supabase.from('pharmacies').select('*');
    }

    // Text search with fuzzy matching
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,region.ilike.%${searchQuery}%,division.ilike.%${searchQuery}%,village_or_city.ilike.%${searchQuery}%`);
    }

    // Apply filters
    if (filters.ownership.length > 0) {
      query = query.in('ownership', filters.ownership);
    }
    if (filters.region) {
      query = query.eq('region', filters.region);
    }
    if (filters.verified_status) {
      query = query.eq('verification_status', filters.verified_status);
    }
    if (filters.min_rating > 0) {
      query = query.gte('overall_rating', filters.min_rating);
    }

    // Institution-specific filters
    if (institutionType === 'hospital' && filters.emergency_services !== null) {
      query = query.eq('emergency_services', filters.emergency_services);
    }
    if (institutionType === 'pharmacy' && filters.delivery_available !== null) {
      query = query.eq('delivery_available', filters.delivery_available);
    }

    const { data, error } = await query.limit(50);
    
    if (error) throw error;

    return {
      data: data?.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type || item.school_type,
        ownership: item.ownership,
        region: item.region,
        division: item.division,
        village_or_city: item.village_or_city,
        overall_rating: item.overall_rating || 0,
        verification_status: item.verification_status || 'unverified',
        is_claimable: item.is_claimable || false,
        institution_type: institutionType,
        phone: item.phone,
        email: item.email,
        website: item.website,
        emergency_services: item.emergency_services,
        delivery_available: item.delivery_available,
        languages_taught: item.languages_taught,
        services_offered: item.services_offered,
        created_at: item.created_at
      })) || []
    };
  };

  const sortResults = (results: SearchResult[]) => {
    switch (sortBy) {
      case 'rating_desc':
        return results.sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0));
      case 'alphabetical':
        return results.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest_added':
        return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'closest':
        return results.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      default:
        return results;
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleInstitutionType = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      institution_type: checked 
        ? [...prev.institution_type, type]
        : prev.institution_type.filter(t => t !== type)
    }));
  };

  const toggleOwnership = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      ownership: checked 
        ? [...prev.ownership, type]
        : prev.ownership.filter(t => t !== type)
    }));
  };

  const getInstitutionIcon = (type: string) => {
    switch (type) {
      case 'school': return '🏫';
      case 'hospital': return '🏥';
      case 'pharmacy': return '💊';
      default: return '📍';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            CamerPulse Services Directory
          </h1>
          <p className="text-xl text-muted-foreground">
            Find schools, hospitals, and pharmacies across Cameroon
          </p>
        </div>

        {/* Search Interface */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for schools, hospitals, pharmacies, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
            </div>

            {/* Typeahead Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute top-full mt-1 w-full z-50">
                <CardContent className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-md"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 mt-4 items-center">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {results.length > 0 && (
              <span className="text-muted-foreground">
                {results.length} results found
              </span>
            )}
          </div>

          {/* Advanced Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Institution Type Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Institution Type</label>
                      {['school', 'hospital', 'pharmacy'].map(type => (
                        <div key={type} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={filters.institution_type.includes(type)}
                            onCheckedChange={(checked) => toggleInstitutionType(type, checked as boolean)}
                          />
                          <label htmlFor={`type-${type}`} className="text-sm capitalize">
                            {getInstitutionIcon(type)} {type}s
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Ownership Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Ownership</label>
                      {OWNERSHIP_TYPES.map(type => (
                        <div key={type} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`ownership-${type}`}
                            checked={filters.ownership.includes(type)}
                            onCheckedChange={(checked) => toggleOwnership(type, checked as boolean)}
                          />
                          <label htmlFor={`ownership-${type}`} className="text-sm capitalize">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Region Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Region</label>
                      <Select value={filters.region} onValueChange={(value) => handleFilterChange('region', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Regions</SelectItem>
                          {CAMEROON_REGIONS.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Verification Status */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Verification</label>
                      <Select value={filters.verified_status} onValueChange={(value) => handleFilterChange('verified_status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Status</SelectItem>
                          <SelectItem value="verified">Verified Only</SelectItem>
                          <SelectItem value="unverified">Unverified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Minimum Rating */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                      <Select value={filters.min_rating.toString()} onValueChange={(value) => handleFilterChange('min_rating', Number(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Any Rating</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Service Filters */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Services</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="emergency"
                            checked={filters.emergency_services === true}
                            onCheckedChange={(checked) => handleFilterChange('emergency_services', checked ? true : null)}
                          />
                          <label htmlFor="emergency" className="text-sm">Emergency Services</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="delivery"
                            checked={filters.delivery_available === true}
                            onCheckedChange={(checked) => handleFilterChange('delivery_available', checked ? true : null)}
                          />
                          <label htmlFor="delivery" className="text-sm">Delivery Available</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Results */}
        <div className="max-w-6xl mx-auto">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Searching...</p>
            </div>
          )}

          {!loading && results.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search terms or filters</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <Card key={`${result.institution_type}-${result.id}`} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getInstitutionIcon(result.institution_type)}</span>
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">{result.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {result.type} • {result.ownership}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {result.verification_status === 'verified' && (
                        <Badge variant="default" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {result.is_claimable && (
                        <Badge variant="outline" className="text-xs">
                          Claimable
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Rating */}
                  {result.overall_rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(result.overall_rating)}</div>
                      <span className="text-sm text-muted-foreground">
                        {result.overall_rating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{result.village_or_city}, {result.division}, {result.region}</span>
                  </div>

                  {/* Services Badges */}
                  <div className="flex flex-wrap gap-1">
                    {result.emergency_services && (
                      <Badge variant="outline" className="text-xs">
                        Emergency
                      </Badge>
                    )}
                    {result.delivery_available && (
                      <Badge variant="outline" className="text-xs">
                        <Truck className="h-3 w-3 mr-1" />
                        Delivery
                      </Badge>
                    )}
                    {result.languages_taught && result.languages_taught.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {result.languages_taught.join(', ')}
                      </Badge>
                    )}
                  </div>

                  {/* Contact Info */}
                  {(result.phone || result.email) && (
                    <Separator />
                  )}
                  <div className="space-y-1">
                    {result.phone && (
                      <p className="text-xs text-muted-foreground">📞 {result.phone}</p>
                    )}
                    {result.email && (
                      <p className="text-xs text-muted-foreground">✉️ {result.email}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Load More / Pagination could go here */}
        {results.length >= 50 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Results</Button>
          </div>
        )}
      </div>
    </div>
  );
}