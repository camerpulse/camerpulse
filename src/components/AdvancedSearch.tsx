import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Search, Filter, Save, Star, Calendar, DollarSign, MapPin, Building } from 'lucide-react';

interface SearchCriteria {
  query: string;
  categories: string[];
  regions: string[];
  budgetRange: [number, number];
  deadline: string;
  status: string;
  verified: boolean;
  sortBy: string;
  dateRange: string;
}

export const AdvancedSearch: React.FC = () => {
  const { saveSearch, savedSearches } = useSavedSearches();
  const { trackSearch } = useActivityTracking();
  
  const [criteria, setCriteria] = useState<SearchCriteria>({
    query: '',
    categories: [],
    regions: [],
    budgetRange: [0, 1000000],
    deadline: '',
    status: '',
    verified: false,
    sortBy: 'relevance',
    dateRange: ''
  });

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  const categories = [
    'Construction', 'IT Services', 'Healthcare', 'Education', 'Transport',
    'Agriculture', 'Energy', 'Water & Sanitation', 'Security', 'Consulting'
  ];

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const handleCategoryToggle = (category: string) => {
    setCriteria(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleRegionToggle = (region: string) => {
    setCriteria(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  const handleSearch = () => {
    // Perform search with criteria
    trackSearch(criteria.query, criteria, 0); // 0 results for now
    console.log('Searching with criteria:', criteria);
  };

  const handleSaveSearch = async () => {
    if (!saveName.trim()) return;
    
    try {
      await saveSearch(saveName, criteria);
      setSaveName('');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const clearFilters = () => {
    setCriteria({
      query: '',
      categories: [],
      regions: [],
      budgetRange: [0, 1000000],
      deadline: '',
      status: '',
      verified: false,
      sortBy: 'relevance',
      dateRange: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Advanced Search</h1>
        </div>
        <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
          <Save className="h-4 w-4 mr-2" />
          Save Search
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Filters */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
              <CardDescription>Refine your search criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Categories</Label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={criteria.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label htmlFor={category} className="text-sm">{category}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Regions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Regions</Label>
                <div className="space-y-2">
                  {regions.slice(0, 5).map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={region}
                        checked={criteria.regions.includes(region)}
                        onCheckedChange={() => handleRegionToggle(region)}
                      />
                      <Label htmlFor={region} className="text-sm">{region}</Label>
                    </div>
                  ))}
                  {regions.length > 5 && (
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Show more regions...
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Budget Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Budget Range (FCFA)</Label>
                <div className="px-2">
                  <Slider
                    value={criteria.budgetRange}
                    onValueChange={(value) => setCriteria(prev => ({...prev, budgetRange: value as [number, number]}))}
                    max={10000000}
                    step={100000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{criteria.budgetRange[0].toLocaleString()}</span>
                    <span>{criteria.budgetRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={criteria.status} onValueChange={(value) => setCriteria(prev => ({...prev, status: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closing_soon">Closing Soon</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={criteria.verified}
                  onCheckedChange={(checked) => setCriteria(prev => ({...prev, verified: checked as boolean}))}
                />
                <Label htmlFor="verified" className="text-sm">Verified businesses only</Label>
              </div>

              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Saved Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Saved Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedSearches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved searches yet</p>
              ) : (
                <div className="space-y-2">
                  {savedSearches.slice(0, 3).map((search) => (
                    <Button
                      key={search.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setCriteria(search.search_criteria)}
                    >
                      {search.search_name}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search tenders, contracts, businesses..."
                    value={criteria.query}
                    onChange={(e) => setCriteria(prev => ({...prev, query: e.target.value}))}
                    className="text-lg"
                  />
                </div>
                <Button onClick={handleSearch} size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Active Filters */}
              {(criteria.categories.length > 0 || criteria.regions.length > 0 || criteria.verified) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {criteria.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => handleCategoryToggle(category)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                  {criteria.regions.map((region) => (
                    <Badge key={region} variant="secondary">
                      <MapPin className="h-3 w-3 mr-1" />
                      {region}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => handleRegionToggle(region)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                  {criteria.verified && (
                    <Badge variant="secondary">
                      <Building className="h-3 w-3 mr-1" />
                      Verified Only
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setCriteria(prev => ({...prev, verified: false}))}
                      >
                        ×
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sort Options */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing results for your search criteria
            </p>
            <Select value={criteria.sortBy} onValueChange={(value) => setCriteria(prev => ({...prev, sortBy: value}))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date_desc">Newest First</SelectItem>
                <SelectItem value="date_asc">Oldest First</SelectItem>
                <SelectItem value="budget_desc">Highest Budget</SelectItem>
                <SelectItem value="budget_asc">Lowest Budget</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Results Placeholder */}
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Ready to Search</h3>
              <p className="text-muted-foreground">
                Enter your search criteria and click Search to find relevant tenders and opportunities
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Save Search</CardTitle>
              <CardDescription>Give your search a name to save it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="saveName">Search Name</Label>
                <Input
                  id="saveName"
                  placeholder="e.g., IT Tenders in Yaoundé"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveSearch} disabled={!saveName.trim()}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};