import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, X, MapPin, Calendar, Users, TrendingUp } from 'lucide-react';

interface FilterState {
  searchQuery: string;
  category: string;
  region: string;
  status: string;
  sortBy: string;
  minSignatures: string;
  timeframe: string;
}

interface PetitionSearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  resultCount?: number;
}

const CATEGORIES = [
  { value: 'governance', label: 'Governance', icon: '🏛️' },
  { value: 'justice', label: 'Justice', icon: '⚖️' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { value: 'digital_rights', label: 'Digital Rights', icon: '💻' },
  { value: 'local_issues', label: 'Local Issues', icon: '🏘️' },
  { value: 'corruption', label: 'Corruption', icon: '🛡️' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'environment', label: 'Environment', icon: '🌍' },
  { value: 'traditional_authority', label: 'Traditional Authority', icon: '👑' },
  { value: 'others', label: 'Others', icon: '📝' }
];

const REGIONS = [
  { value: 'national', label: 'National' },
  { value: 'centre', label: 'Centre' },
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'southwest', label: 'Southwest' },
  { value: 'northwest', label: 'Northwest' },
  { value: 'littoral', label: 'Littoral' },
  { value: 'adamawa', label: 'Adamawa' },
  { value: 'far_north', label: 'Far North' }
];

export const PetitionSearchFilters: React.FC<PetitionSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  resultCount
}) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      key !== 'searchQuery' && value && value !== 'all'
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter Petitions
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        {resultCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            {resultCount} petitions found
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search petitions by title, description, or target..." 
            className="pl-10" 
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
          />
        </div>

        {/* Quick Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {REGIONS.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{region.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="signatures">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Most Signatures</span>
                </div>
              </SelectItem>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Most Recent</span>
                </div>
              </SelectItem>
              <SelectItem value="trending">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </div>
              </SelectItem>
              <SelectItem value="deadline">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline Soon</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Minimum Signatures</label>
            <Select value={filters.minSignatures} onValueChange={(value) => updateFilter('minSignatures', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any amount</SelectItem>
                <SelectItem value="10">10+ signatures</SelectItem>
                <SelectItem value="100">100+ signatures</SelectItem>
                <SelectItem value="500">500+ signatures</SelectItem>
                <SelectItem value="1000">1,000+ signatures</SelectItem>
                <SelectItem value="5000">5,000+ signatures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Created Within</label>
            <Select value={filters.timeframe} onValueChange={(value) => updateFilter('timeframe', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any time</SelectItem>
                <SelectItem value="day">Last 24 hours</SelectItem>
                <SelectItem value="week">Last week</SelectItem>
                <SelectItem value="month">Last month</SelectItem>
                <SelectItem value="quarter">Last 3 months</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <Separator />
            <div className="flex flex-wrap gap-2">
              {filters.category && filters.category !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {CATEGORIES.find(c => c.value === filters.category)?.icon}
                  {CATEGORIES.find(c => c.value === filters.category)?.label}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('category', 'all')} 
                  />
                </Badge>
              )}
              {filters.region && filters.region !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {REGIONS.find(r => r.value === filters.region)?.label}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('region', 'all')} 
                  />
                </Badge>
              )}
              {filters.status && filters.status !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Status: {filters.status}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('status', 'all')} 
                  />
                </Badge>
              )}
              {filters.minSignatures && filters.minSignatures !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {filters.minSignatures}+ signatures
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('minSignatures', 'all')} 
                  />
                </Badge>
              )}
              {filters.timeframe && filters.timeframe !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Within: {filters.timeframe}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('timeframe', 'all')} 
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};