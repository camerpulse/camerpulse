import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface SearchFilters {
  query: string;
  region: string;
  party: string;
  status: string;
  trustScoreMin: number;
  sortBy: string;
}

interface SenatorSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  totalResults?: number;
  loading?: boolean;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 
  'Littoral', 'North', 'Northwest', 'South', 
  'Southwest', 'West'
];

const POLITICAL_PARTIES = [
  'CPDM', 'SDF', 'UNDP', 'UPC', 'MDR', 'FSNC', 'UDC', 'Other'
];

const SENATOR_STATUS = [
  'Active', 'Claimed', 'Verified', 'Inactive'
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'trust_score', label: 'Trust Score (High to Low)' },
  { value: 'followers', label: 'Most Followed' },
  { value: 'recent', label: 'Recently Updated' }
];

export const SenatorSearch = ({ 
  onFiltersChange, 
  totalResults = 0, 
  loading = false 
}: SenatorSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    region: '',
    party: '',
    status: '',
    trustScoreMin: 0,
    sortBy: 'trust_score'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Count active filters
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === 'query' || key === 'sortBy') return false;
      return value !== '' && value !== 0;
    }).length;
    
    setActiveFiltersCount(count);
    
    // Notify parent of filter changes
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      region: '',
      party: '',
      status: '',
      trustScoreMin: 0,
      sortBy: 'trust_score'
    });
  };

  const clearSpecificFilter = (key: keyof SearchFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'trustScoreMin' ? 0 : ''
    }));
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Search Senators</CardTitle>
          <div className="flex items-center gap-2">
            {totalResults > 0 && (
              <Badge variant="secondary">
                {totalResults} result{totalResults !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-2 px-1.5 py-0.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by senator name, region, or party..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Sort */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Region Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Region</label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => handleFilterChange('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All regions</SelectItem>
                    {CAMEROON_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Party Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Political Party</label>
                <Select
                  value={filters.party}
                  onValueChange={(value) => handleFilterChange('party', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All parties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All parties</SelectItem>
                    {POLITICAL_PARTIES.map(party => (
                      <SelectItem key={party} value={party}>
                        {party}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {SENATOR_STATUS.map(status => (
                      <SelectItem key={status} value={status.toLowerCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Trust Score Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Minimum Trust Score: {filters.trustScoreMin}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.trustScoreMin}
                onChange={(e) => handleFilterChange('trustScoreMin', parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Filters:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-destructive hover:text-destructive"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.region && (
                    <Badge variant="secondary" className="gap-1">
                      Region: {filters.region}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => clearSpecificFilter('region')}
                      />
                    </Badge>
                  )}
                  {filters.party && (
                    <Badge variant="secondary" className="gap-1">
                      Party: {filters.party}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => clearSpecificFilter('party')}
                      />
                    </Badge>
                  )}
                  {filters.status && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {filters.status}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => clearSpecificFilter('status')}
                      />
                    </Badge>
                  )}
                  {filters.trustScoreMin > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      Trust Score ≥ {filters.trustScoreMin}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => clearSpecificFilter('trustScoreMin')}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};