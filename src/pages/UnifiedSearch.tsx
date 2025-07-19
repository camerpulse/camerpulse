import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Star,
  MapPin,
  Phone,
  Clock,
  Building2,
  Hospital,
  Pill,
  GraduationCap,
  CheckCircle,
  Grid,
  List,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'pharmacy';
  region: string;
  division: string;
  village_or_city: string;
  contact_phone?: string;
  working_hours?: string;
  is_verified: boolean;
  is_claimed: boolean;
  average_rating?: number;
  total_ratings?: number;
}

const INSTITUTION_TYPES = [
  { value: 'school', label: 'Schools', icon: GraduationCap, color: 'text-green-600' },
  { value: 'hospital', label: 'Hospitals', icon: Hospital, color: 'text-red-600' },
  { value: 'pharmacy', label: 'Pharmacies', icon: Pill, color: 'text-blue-600' }
];

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export default function UnifiedSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length > 2 || typeFilter !== 'all' || regionFilter !== 'all') {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery, typeFilter, regionFilter]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const promises = [];
      
      if (typeFilter === 'all' || typeFilter === 'school') {
        promises.push(supabase.from('schools').select('*').limit(50));
      }
      if (typeFilter === 'all' || typeFilter === 'hospital') {
        promises.push(supabase.from('hospitals').select('*').limit(50));
      }
      if (typeFilter === 'all' || typeFilter === 'pharmacy') {
        promises.push(supabase.from('pharmacies').select('*').limit(50));
      }

      const responses = await Promise.all(promises);
      
      let allResults: SearchResult[] = [];
      
      responses.forEach((response, index) => {
        if (response.data) {
          let type: 'school' | 'hospital' | 'pharmacy';
          if (typeFilter !== 'all') {
            type = typeFilter as 'school' | 'hospital' | 'pharmacy';
          } else {
            type = ['school', 'hospital', 'pharmacy'][index] as 'school' | 'hospital' | 'pharmacy';
          }
          
          const mappedResults = response.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            type,
            region: item.region || '',
            division: item.division || '',
            village_or_city: item.village_or_city || '',
            contact_phone: item.contact_phone,
            working_hours: item.working_hours,
            is_verified: item.is_verified || false,
            is_claimed: item.is_claimed || false,
            average_rating: item.average_rating || 0,
            total_ratings: item.total_ratings || 0
          }));
          
          allResults = [...allResults, ...mappedResults];
        }
      });

      // Apply filters
      let filteredResults = allResults;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredResults = filteredResults.filter(result =>
          result.name.toLowerCase().includes(query) ||
          result.village_or_city.toLowerCase().includes(query) ||
          result.division.toLowerCase().includes(query)
        );
      }

      if (regionFilter !== 'all') {
        filteredResults = filteredResults.filter(result => result.region === regionFilter);
      }

      // Sort by name
      filteredResults.sort((a, b) => a.name.localeCompare(b.name));

      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search institutions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionIcon = (type: string) => {
    const typeConfig = INSTITUTION_TYPES.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Building2;
  };

  const getInstitutionColor = (type: string) => {
    const typeConfig = INSTITUTION_TYPES.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'text-gray-600';
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Service Directory
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Search across all institutions in Cameroon
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search institutions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={performSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Institution Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {INSTITUTION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {CAMEROON_REGIONS.map(region => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Results ({results.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-muted-foreground">Try searching for schools, hospitals, or pharmacies</p>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4"
                }>
                  {results.map((result) => (
                    <Card 
                      key={result.id} 
                      className="cursor-pointer transition-all hover:shadow-lg"
                      onClick={() => navigate(`/${result.type}s/${result.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {React.createElement(getInstitutionIcon(result.type), {
                              className: `h-4 w-4 ${getInstitutionColor(result.type)}`
                            })}
                            <h3 className="font-medium">{result.name}</h3>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {result.village_or_city}, {result.region}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {result.is_verified && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-2 w-2 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {result.average_rating && result.average_rating > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-2 w-2 mr-1 fill-yellow-400 text-yellow-400" />
                                {result.average_rating.toFixed(1)}
                              </Badge>
                            )}
                            <Badge variant="outline" className="capitalize text-xs">
                              {result.type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}