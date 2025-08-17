import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X } from 'lucide-react';

interface PoliticalFiltersProps {
  filters: {
    search?: string;
    region?: string;
    party?: string;
    level_of_office?: string;
    term_status?: string;
    political_leaning?: string;
    is_active?: boolean;
    verified_only?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  type: 'politicians' | 'parties';
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const OFFICE_LEVELS = [
  'National', 'Regional', 'Local', 'Traditional'
];

const TERM_STATUSES = [
  'active', 'completed', 'suspended', 'terminated'
];

const POLITICAL_LEANINGS = [
  'Left', 'Center-Left', 'Center', 'Center-Right', 'Right'
];

const POPULAR_PARTIES = [
  'CPDM', 'SDF', 'UNDP', 'UDC', 'MDR', 'UPC'
];

export const PoliticalFilters: React.FC<PoliticalFiltersProps> = ({
  filters,
  onFiltersChange,
  type,
  showAdvanced = false,
  onToggleAdvanced,
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== false
    ).length;
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {onToggleAdvanced && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleAdvanced}
              >
                {showAdvanced ? 'Simple' : 'Advanced'}
              </Button>
            )}
            
            {getActiveFilterCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${type}...`}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Active Filters */}
        {getActiveFilterCount() > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (value === undefined || value === '' || value === false) return null;
              return (
                <Badge 
                  key={key} 
                  variant="secondary" 
                  className="flex items-center gap-1"
                >
                  {key}: {String(value)}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeFilter(key)}
                  />
                </Badge>
              );
            })}
          </div>
        )}

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Region */}
          <div>
            <label className="text-sm font-medium mb-2 block">Region</label>
            <Select
              value={filters.region || 'all'}
              onValueChange={(value) => handleFilterChange('region', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
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

          {/* Party (for politicians) or Political Leaning (for parties) */}
          {type === 'politicians' ? (
            <div>
              <label className="text-sm font-medium mb-2 block">Political Party</label>
              <Select
                value={filters.party || 'all'}
                onValueChange={(value) => handleFilterChange('party', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Parties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  {POPULAR_PARTIES.map(party => (
                    <SelectItem key={party} value={party}>
                      {party}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-2 block">Political Leaning</label>
              <Select
                value={filters.political_leaning || 'all'}
                onValueChange={(value) => handleFilterChange('political_leaning', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Leanings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leanings</SelectItem>
                  {POLITICAL_LEANINGS.map(leaning => (
                    <SelectItem key={leaning} value={leaning}>
                      {leaning}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Office Level (for politicians) or Status (for parties) */}
          {type === 'politicians' ? (
            <div>
              <label className="text-sm font-medium mb-2 block">Office Level</label>
              <Select
                value={filters.level_of_office || 'all'}
                onValueChange={(value) => handleFilterChange('level_of_office', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {OFFICE_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="active-only"
                checked={filters.is_active === true}
                onCheckedChange={(checked) => 
                  handleFilterChange('is_active', checked ? true : undefined)
                }
              />
              <label htmlFor="active-only" className="text-sm font-medium">
                Active parties only
              </label>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-semibold">Advanced Options</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type === 'politicians' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Term Status</label>
                  <Select
                    value={filters.term_status || 'all'}
                    onValueChange={(value) => handleFilterChange('term_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {TERM_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="verified-only"
                  checked={filters.verified_only === true}
                  onCheckedChange={(checked) => 
                    handleFilterChange('verified_only', checked ? true : undefined)
                  }
                />
                <label htmlFor="verified-only" className="text-sm font-medium">
                  Verified profiles only
                </label>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};