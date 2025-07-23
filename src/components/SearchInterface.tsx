import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Clock,
  Star,
  Bookmark,
  X,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function SearchInterface() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categories: [] as string[],
    regions: [] as string[],
    budgetMin: '',
    budgetMax: '',
    status: 'all',
    deadlineFrom: '',
    deadlineTo: '',
    tenderType: 'all'
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const categories = [
    'Construction', 'IT Services', 'Healthcare', 'Education', 'Transportation',
    'Telecommunications', 'Energy', 'Agriculture', 'Security', 'Consulting'
  ];

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadSavedSearches(),
      loadRecentlyViewed(),
      loadRecommendations(),
      performSearch() // Load all tenders initially
    ]);
  };

  const loadSavedSearches = async () => {
    // Mock saved searches - would come from database in real app
    setSavedSearches([
      {
        id: '1',
        name: 'Road Construction Projects',
        query: 'road construction',
        filters: { categories: ['Construction'], regions: ['Littoral'] },
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'IT Projects in Centre',
        query: 'software development',
        filters: { categories: ['IT Services'], regions: ['Centre'] },
        created_at: new Date().toISOString()
      }
    ]);
  };

  const loadRecentlyViewed = async () => {
    // Mock recently viewed - would come from browser storage or database
    try {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .limit(3)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRecentlyViewed(data);
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

  const loadRecommendations = async () => {
    // Mock recommendations based on user profile/activity
    try {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .eq('status', 'active')
        .limit(4)
        .order('views_count', { ascending: false });

      if (!error && data) {
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tenders')
        .select('*');

      // Apply search query
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply filters
      if (filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      if (filters.regions.length > 0) {
        query = query.in('region', filters.regions);
      }

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.tenderType !== 'all') {
        query = query.eq('tender_type', filters.tenderType);
      }

      if (filters.budgetMin) {
        query = query.gte('budget_min', parseInt(filters.budgetMin));
      }

      if (filters.budgetMax) {
        query = query.lte('budget_max', parseInt(filters.budgetMax));
      }

      if (filters.deadlineFrom) {
        query = query.gte('deadline', filters.deadlineFrom);
      }

      if (filters.deadlineTo) {
        query = query.lte('deadline', filters.deadlineTo);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setResults(data || []);

    } catch (error: any) {
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleRegionToggle = (region: string) => {
    setFilters(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      regions: [],
      budgetMin: '',
      budgetMax: '',
      status: 'all',
      deadlineFrom: '',
      deadlineTo: '',
      tenderType: 'all'
    });
  };

  const saveCurrentSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "No Search Query",
        description: "Please enter a search query to save.",
        variant: "destructive"
      });
      return;
    }

    const newSearch = {
      id: Date.now().toString(),
      name: `Search: ${searchQuery}`,
      query: searchQuery,
      filters: { ...filters },
      created_at: new Date().toISOString()
    };

    setSavedSearches(prev => [newSearch, ...prev.slice(0, 9)]); // Keep max 10 saved searches
    
    toast({
      title: "Search Saved",
      description: "Your search has been saved for quick access."
    });
  };

  const loadSavedSearch = (savedSearch: any) => {
    setSearchQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    performSearch();
  };

  const formatCurrency = (amount: number, currency: string = 'FCFA') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'FCFA' ? 'XAF' : currency,
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      case 'awarded': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Saved Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Saved Searches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {savedSearches.map((search) => (
                <Button
                  key={search.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-auto p-2"
                  onClick={() => loadSavedSearch(search)}
                >
                  <div className="text-left">
                    <div className="font-medium text-xs">{search.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(search.created_at), 'MMM dd')}
                    </div>
                  </div>
                </Button>
              ))}
              {savedSearches.length === 0 && (
                <p className="text-xs text-muted-foreground">No saved searches yet</p>
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="categories">
                  <AccordionTrigger className="text-sm">Categories</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={filters.categories.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                          />
                          <Label htmlFor={category} className="text-xs">{category}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="regions">
                  <AccordionTrigger className="text-sm">Regions</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {regions.map((region) => (
                        <div key={region} className="flex items-center space-x-2">
                          <Checkbox
                            id={region}
                            checked={filters.regions.includes(region)}
                            onCheckedChange={() => handleRegionToggle(region)}
                          />
                          <Label htmlFor={region} className="text-xs">{region}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="budget">
                  <AccordionTrigger className="text-sm">Budget Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="budgetMin" className="text-xs">Minimum (FCFA)</Label>
                        <Input
                          id="budgetMin"
                          type="number"
                          placeholder="e.g., 1000000"
                          value={filters.budgetMin}
                          onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="budgetMax" className="text-xs">Maximum (FCFA)</Label>
                        <Input
                          id="budgetMax"
                          type="number"
                          placeholder="e.g., 10000000"
                          value={filters.budgetMax}
                          onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="other">
                  <AccordionTrigger className="text-sm">Other Filters</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="awarded">Awarded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Tender Type</Label>
                        <Select value={filters.tenderType} onValueChange={(value) => handleFilterChange('tenderType', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="open">Open Tender</SelectItem>
                            <SelectItem value="restricted">Restricted Tender</SelectItem>
                            <SelectItem value="negotiated">Negotiated Tender</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Recently Viewed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recently Viewed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentlyViewed.map((tender) => (
                <Link key={tender.id} to={`/tenders/${tender.id}`}>
                  <div className="p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                    <h4 className="font-medium text-xs line-clamp-2">{tender.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{tender.category}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Header */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenders by title, description, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  className="pl-10 h-12"
                />
              </div>
              <Button onClick={performSearch} disabled={loading} className="h-12">
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button variant="outline" onClick={saveCurrentSearch} className="h-12">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>

            {/* Active Filters */}
            {(filters.categories.length > 0 || filters.regions.length > 0 || filters.status !== 'all') && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {filters.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleCategoryToggle(category)}
                    />
                  </Badge>
                ))}
                {filters.regions.map((region) => (
                  <Badge key={region} variant="secondary" className="text-xs">
                    {region}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleRegionToggle(region)}
                    />
                  </Badge>
                ))}
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {filters.status}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleFilterChange('status', 'all')}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {!searchQuery && recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recommended for You
                </CardTitle>
                <CardDescription>Based on your activity and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((tender) => (
                    <Link key={tender.id} to={`/tenders/${tender.id}`}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-medium text-sm line-clamp-2">{tender.title}</h3>
                              <Badge className={getStatusColor(tender.status)}>
                                {tender.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {tender.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {tender.region}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {tender.budget_min && tender.budget_max 
                                  ? `${formatCurrency(tender.budget_min)} - ${formatCurrency(tender.budget_max)}`
                                  : 'Budget TBD'
                                }
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {getDaysRemaining(tender.deadline)} days left
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Tenders'} ({results.length})
              </h2>
              <Select defaultValue="newest">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="deadline">Deadline Soon</SelectItem>
                  <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                  <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                  <SelectItem value="most-viewed">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((tender) => (
                  <Card key={tender.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <Link to={`/tenders/${tender.id}`}>
                              <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
                                {tender.title}
                              </h3>
                            </Link>
                            <Badge className={getStatusColor(tender.status)}>
                              {tender.status?.toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {tender.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {tender.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {tender.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Deadline: {format(new Date(tender.deadline), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {getDaysRemaining(tender.deadline)} days remaining
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-primary">
                              {tender.budget_min && tender.budget_max 
                                ? `${formatCurrency(tender.budget_min)} - ${formatCurrency(tender.budget_max)}`
                                : 'Budget TBD'
                              }
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{tender.views_count || 0} views</span>
                              <span>{tender.bids_count || 0} bids</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tenders found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or clear some filters
                    </p>
                    <Button variant="outline" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}