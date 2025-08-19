import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X, Users, MapPin, Briefcase, Star } from 'lucide-react';

interface FilterState {
  search: string;
  region: string;
  role: string;
  party: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface PoliticalFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  showPartyFilter?: boolean;
  showStatusFilter?: boolean;
  regions?: string[];
  roles?: string[];
  parties?: string[];
  resultCount?: number;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const POLITICAL_ROLES = [
  'President', 'Prime Minister', 'Minister', 'Deputy Minister',
  'Senator', 'MP', 'Mayor', 'Governor', 'Traditional Ruler'
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'rating', label: 'Rating' },
  { value: 'region', label: 'Region' },
  { value: 'role', label: 'Role' },
  { value: 'created_at', label: 'Date Added' },
];

export function PoliticalFilters({
  filters,
  onFiltersChange,
  onReset,
  showPartyFilter = false,
  showStatusFilter = false,
  regions = CAMEROON_REGIONS,
  roles = POLITICAL_ROLES,
  parties = [],
  resultCount
}: PoliticalFiltersProps) {
  
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => 
    value && value !== 'all' && value !== '' && key !== 'sortBy' && key !== 'sortOrder'
  ).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        
        {resultCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            {resultCount.toLocaleString()} result{resultCount !== 1 ? 's' : ''} found
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Search className="w-4 h-4" />
            Search
          </label>
          <Input
            placeholder="Search by name, role, or keyword..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Region Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            Region
          </label>
          <Select
            value={filters.region}
            onValueChange={(value) => onFiltersChange({ region: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            Role
          </label>
          <Select
            value={filters.role}
            onValueChange={(value) => onFiltersChange({ role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Party Filter */}
        {showPartyFilter && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Users className="w-4 h-4" />
              Political Party
            </label>
            <Select
              value={filters.party}
              onValueChange={(value) => onFiltersChange({ party: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All parties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parties</SelectItem>
                {parties.map((party) => (
                  <SelectItem key={party} value={party}>
                    {party}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status Filter */}
        {showStatusFilter && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="former">Former</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sorting */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Star className="w-4 h-4" />
            Sort By
          </label>
          <div className="flex gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => onFiltersChange({ sortBy: value })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.sortOrder}
              onValueChange={(value: 'asc' | 'desc') => onFiltersChange({ sortOrder: value })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A-Z</SelectItem>
                <SelectItem value="desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Filters:</label>
            <div className="flex flex-wrap gap-1">
              {filters.search && (
                <Badge variant="outline" className="gap-1">
                  Search: {filters.search}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ search: '' })}
                  />
                </Badge>
              )}
              {filters.region && filters.region !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  Region: {filters.region}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ region: 'all' })}
                  />
                </Badge>
              )}
              {filters.role && filters.role !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  Role: {filters.role}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ role: 'all' })}
                  />
                </Badge>
              )}
              {filters.party && filters.party !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  Party: {filters.party}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ party: 'all' })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}