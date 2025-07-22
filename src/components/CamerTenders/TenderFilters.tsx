import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  Grid3X3,
  List,
  BarChart3
} from 'lucide-react';

interface FilterState {
  searchTerm: string;
  category: string;
  region: string;
  type: string;
  budgetRange: [number, number];
  deadline: string;
  status: string;
}

interface TenderFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  viewMode: 'grid' | 'list' | 'flow';
  onViewModeChange: (mode: 'grid' | 'list' | 'flow') => void;
  categories: Array<{ name: string; count: number }>;
  regions: string[];
  activeFilterCount?: number;
}

export const TenderFilters: React.FC<TenderFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  viewMode,
  onViewModeChange,
  categories,
  regions,
  activeFilterCount = 0
}) => {
  const formatBudgetDisplay = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(0)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Main Search and Quick Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tenders by title, description, or issuer..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
                className="pl-10 pr-4"
              />
            </div>
          </div>
          
          {/* Quick Filter Dropdowns */}
          <div className="flex flex-wrap gap-2">
            <Select 
              value={filters.category} 
              onValueChange={(value) => onFiltersChange({ category: value })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.region} 
              onValueChange={(value) => onFiltersChange({ region: value })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.type} 
              onValueChange={(value) => onFiltersChange({ type: value })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="ngo">NGO/Donor</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.status} 
              onValueChange={(value) => onFiltersChange({ status: value })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closing_soon">Closing Soon</SelectItem>
                <SelectItem value="evaluation">In Evaluation</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Budget Range Slider */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
              <DollarSign className="h-4 w-4" />
              Budget:
            </div>
            
            <div className="flex-1 max-w-md">
              <Slider
                value={filters.budgetRange}
                onValueChange={(value) => onFiltersChange({ budgetRange: value as [number, number] })}
                max={100000000000}
                min={0}
                step={1000000000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatBudgetDisplay(filters.budgetRange[0])} FCFA</span>
                <span>{formatBudgetDisplay(filters.budgetRange[1])} FCFA</span>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            {/* Active Filters Count */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {activeFilterCount} active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}

            {/* View Mode Toggles */}
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none border-r"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none border-r"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'flow' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('flow')}
                className="rounded-l-none"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filter Pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {filters.category !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                {filters.category}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onFiltersChange({ category: 'all' })}
                />
              </Badge>
            )}
            
            {filters.region !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {filters.region}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onFiltersChange({ region: 'all' })}
                />
              </Badge>
            )}
            
            {filters.type !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {filters.type}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onFiltersChange({ type: 'all' })}
                />
              </Badge>
            )}

            {filters.status !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                {filters.status}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onFiltersChange({ status: 'all' })}
                />
              </Badge>
            )}

            {(filters.budgetRange[0] > 0 || filters.budgetRange[1] < 100000000000) && (
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatBudgetDisplay(filters.budgetRange[0])} - {formatBudgetDisplay(filters.budgetRange[1])}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onFiltersChange({ budgetRange: [0, 100000000000] })}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};