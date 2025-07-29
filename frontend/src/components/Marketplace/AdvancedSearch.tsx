import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Filter, X, Search, Star } from 'lucide-react';

interface SearchFilters {
  query: string;
  category: string;
  vendor: string;
  priceMin: number;
  priceMax: number;
  rating: number;
  region: string;
  sortBy: string;
  inStock: boolean;
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export const AdvancedSearch = ({ onFiltersChange, initialFilters = {} }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    vendor: '',
    priceMin: 0,
    priceMax: 1000000,
    rating: 0,
    region: '',
    sortBy: 'newest',
    inStock: true,
    ...initialFilters,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch vendors
  const { data: vendors } = useQuery({
    queryKey: ['marketplace-vendors-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_vendors')
        .select('id, business_name')
        .eq('verification_status', 'verified')
        .order('business_name');

      if (error) throw error;
      return data || [];
    },
  });

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters: SearchFilters = {
      query: '',
      category: '',
      vendor: '',
      priceMin: 0,
      priceMax: 1000000,
      rating: 0,
      region: '',
      sortBy: 'newest',
      inStock: true,
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'priceMin' && value === 0) return false;
    if (key === 'priceMax' && value === 1000000) return false;
    if (key === 'rating' && value === 0) return false;
    if (key === 'sortBy' && value === 'newest') return false;
    if (key === 'inStock' && value === true) return false;
    return value !== '' && value !== null && value !== undefined;
  }).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search & Filter</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, description, or vendor..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.sortBy === 'price_low' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('sortBy', 'price_low')}
          >
            Price: Low to High
          </Button>
          <Button
            variant={filters.sortBy === 'price_high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('sortBy', 'price_high')}
          >
            Price: High to Low
          </Button>
          <Button
            variant={filters.sortBy === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('sortBy', 'rating')}
          >
            Highest Rated
          </Button>
        </div>

        {showAdvanced && (
          <>
            <Separator />
            
            {/* Advanced Filters */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => updateFilter('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Select
                  value={filters.vendor}
                  onValueChange={(value) => updateFilter('vendor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All vendors</SelectItem>
                    {vendors?.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.business_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => updateFilter('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All regions</SelectItem>
                    <SelectItem value="Centre">Centre</SelectItem>
                    <SelectItem value="Littoral">Littoral</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="Southwest">Southwest</SelectItem>
                    <SelectItem value="Northwest">Northwest</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="Adamawa">Adamawa</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="Far North">Far North</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <Label>Price Range (XAF)</Label>
              <div className="px-3">
                <Slider
                  min={0}
                  max={1000000}
                  step={1000}
                  value={[filters.priceMin, filters.priceMax]}
                  onValueChange={([min, max]) => {
                    updateFilter('priceMin', min);
                    updateFilter('priceMax', max);
                  }}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{filters.priceMin.toLocaleString()} XAF</span>
                <span>{filters.priceMax.toLocaleString()} XAF</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={filters.rating >= rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter('rating', rating)}
                    className="flex items-center space-x-1"
                  >
                    <Star className="w-4 h-4" />
                    <span>{rating}+</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};