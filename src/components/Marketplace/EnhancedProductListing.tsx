import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Grid3X3, 
  List, 
  Filter, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Shield,
  SlidersHorizontal,
  X,
  MapPin,
  TrendingUp,
  Clock,
  Truck
} from 'lucide-react';

interface FilterState {
  category: string;
  priceRange: [number, number];
  rating: number;
  verified: boolean;
  location: string;
  inStock: boolean;
  freeShipping: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  currency: string;
  category: string;
  rating: number;
  review_count: number;
  images: string[];
  vendor: {
    id: string;
    business_name: string;
    verification_status: string;
    rating: number;
    location: string;
  };
  in_stock: boolean;
  stock_quantity: number;
  free_shipping: boolean;
  featured: boolean;
  new_arrival: boolean;
  discount_percentage?: number;
}

const ProductCard = ({ 
  product, 
  viewMode = 'grid' 
}: { 
  product: Product; 
  viewMode: 'grid' | 'list' 
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'XAF' ? 'XAF' : currency
    }).format(price);
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <img
                src={product.images[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
              {product.discount_percentage && (
                <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs">
                  -{product.discount_percentage}%
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.review_count} reviews)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {product.vendor.business_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{product.vendor.business_name}</span>
                {product.vendor.verification_status === 'verified' && (
                  <Shield className="w-4 h-4 text-green-500" />
                )}
                <span className="text-xs text-muted-foreground">• {product.vendor.location}</span>
              </div>

              <div className="flex items-center gap-2">
                {product.free_shipping && (
                  <Badge variant="secondary" className="text-xs">
                    <Truck className="w-3 h-3 mr-1" />
                    Free Shipping
                  </Badge>
                )}
                {product.featured && (
                  <Badge className="bg-gradient-primary text-white text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {product.new_arrival && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-col justify-between items-end w-48">
              <div className="text-right">
                <div className="text-xl font-bold text-primary">
                  {formatPrice(product.price, product.currency)}
                </div>
                {product.original_price && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.original_price, product.currency)}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {product.in_stock ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button size="sm" disabled={!product.in_stock}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount_percentage && (
            <Badge className="bg-red-500 text-white">
              -{product.discount_percentage}%
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-gradient-primary text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {product.new_arrival && (
            <Badge variant="outline" className="bg-white">
              <Clock className="w-3 h-3 mr-1" />
              New
            </Badge>
          )}
        </div>

        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button size="icon" variant="secondary" className="h-10 w-10">
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-10 w-10"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button size="icon" variant="secondary" className="h-10 w-10">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {/* Stock status */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Category */}
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>

          {/* Product name */}
          <h3 className="font-semibold line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.review_count})
            </span>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.original_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.original_price, product.currency)}
                </span>
              )}
            </div>
            {product.stock_quantity && product.stock_quantity < 10 && (
              <p className="text-xs text-orange-500">
                Only {product.stock_quantity} left in stock
              </p>
            )}
          </div>

          {/* Vendor info */}
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {product.vendor.business_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {product.vendor.business_name}
              </p>
              <div className="flex items-center gap-1">
                {product.vendor.verification_status === 'verified' && (
                  <Shield className="h-3 w-3 text-green-500" />
                )}
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {product.vendor.location}
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {product.free_shipping && (
              <Badge variant="secondary" className="text-xs">
                <Truck className="w-3 h-3 mr-1" />
                Free Ship
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
          </div>

          {/* Action button */}
          <Button 
            className="w-full" 
            size="sm"
            disabled={!product.in_stock}
          >
            {product.in_stock ? (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            ) : (
              'Out of Stock'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FilterSidebar = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  isOpen,
  onClose 
}: {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const categories = [
    'All Categories',
    'Electronics',
    'Fashion',
    'Food & Beverages',
    'Arts & Crafts',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Fitness',
    'Books & Media'
  ];

  const locations = [
    'All Locations',
    'Douala',
    'Yaoundé',
    'Bamenda',
    'Bafoussam',
    'Limbe',
    'Kribi'
  ];

  const sidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-medium mb-3">Category</h4>
        <Select value={filters.category} onValueChange={(value) => onFiltersChange({ category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase().replace(/ /g, '-')}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3">Price Range (XAF)</h4>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="Min" 
              value={filters.priceRange[0] || ''}
              onChange={(e) => onFiltersChange({ 
                priceRange: [Number(e.target.value), filters.priceRange[1]] 
              })}
            />
            <Input 
              type="number" 
              placeholder="Max"
              value={filters.priceRange[1] || ''}
              onChange={(e) => onFiltersChange({ 
                priceRange: [filters.priceRange[0], Number(e.target.value)] 
              })}
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="font-medium mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox 
                checked={filters.rating === rating}
                onCheckedChange={(checked) => onFiltersChange({ rating: checked ? rating : 0 })}
              />
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm">& Up</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <h4 className="font-medium mb-3">Location</h4>
        <Select value={filters.location} onValueChange={(value) => onFiltersChange({ location: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location} value={location.toLowerCase().replace(/ /g, '-')}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Filters */}
      <div>
        <h4 className="font-medium mb-3">Additional Options</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={filters.verified}
              onCheckedChange={(checked) => onFiltersChange({ verified: !!checked })}
            />
            <label className="text-sm">Verified Vendors Only</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={filters.inStock}
              onCheckedChange={(checked) => onFiltersChange({ inStock: !!checked })}
            />
            <label className="text-sm">In Stock Only</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={filters.freeShipping}
              onCheckedChange={(checked) => onFiltersChange({ freeShipping: !!checked })}
            />
            <label className="text-sm">Free Shipping</label>
          </div>
        </div>
      </div>
    </div>
  );

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 md:relative md:inset-auto md:z-auto">
        <div className="md:hidden fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="fixed top-0 left-0 bottom-0 w-80 bg-background border-r p-6 overflow-y-auto md:relative md:w-auto md:bg-transparent md:border-0 md:p-0">
          {sidebarContent}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:block">
      {sidebarContent}
    </div>
  );
};

export const EnhancedProductListing = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    priceRange: [0, 0],
    rating: 0,
    verified: false,
    location: '',
    inStock: false,
    freeShipping: false
  });

  const itemsPerPage = 20;

  // Mock data - replace with real API calls
  const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => ({
    id: `product-${i + 1}`,
    name: `Product ${i + 1} - Authentic Cameroon Item`,
    description: `High-quality product from verified Cameroon vendor. Perfect for daily use and special occasions.`,
    price: Math.floor(Math.random() * 50000) + 1000,
    original_price: Math.random() > 0.6 ? Math.floor(Math.random() * 60000) + 2000 : undefined,
    currency: 'XAF',
    category: ['Electronics', 'Fashion', 'Food & Beverages', 'Arts & Crafts'][Math.floor(Math.random() * 4)],
    rating: 3 + Math.random() * 2,
    review_count: Math.floor(Math.random() * 100) + 1,
    images: [`https://images.unsplash.com/photo-${1500000000000 + i}?w=300&h=300&fit=crop`],
    vendor: {
      id: `vendor-${i % 10 + 1}`,
      business_name: `Vendor ${i % 10 + 1}`,
      verification_status: Math.random() > 0.3 ? 'verified' : 'pending',
      rating: 3.5 + Math.random() * 1.5,
      location: ['Douala', 'Yaoundé', 'Bamenda', 'Bafoussam'][Math.floor(Math.random() * 4)]
    },
    in_stock: Math.random() > 0.1,
    stock_quantity: Math.floor(Math.random() * 100) + 1,
    free_shipping: Math.random() > 0.5,
    featured: Math.random() > 0.8,
    new_arrival: Math.random() > 0.7,
    discount_percentage: Math.random() > 0.6 ? Math.floor(Math.random() * 50) + 5 : undefined
  }));

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setTotalProducts(mockProducts.length);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 0],
      rating: 0,
      verified: false,
      location: '',
      inStock: false,
      freeShipping: false
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Apply search logic here
  };

  const filteredProducts = products.filter(product => {
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.category && product.category.toLowerCase() !== filters.category) {
      return false;
    }
    if (filters.rating && product.rating < filters.rating) {
      return false;
    }
    if (filters.verified && product.vendor.verification_status !== 'verified') {
      return false;
    }
    if (filters.inStock && !product.in_stock) {
      return false;
    }
    if (filters.freeShipping && !product.free_shipping) {
      return false;
    }
    if (filters.priceRange[0] && product.price < filters.priceRange[0]) {
      return false;
    }
    if (filters.priceRange[1] && product.price > filters.priceRange[1]) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.new_arrival ? 1 : -1;
      default:
        return 0; // relevance - keep original order
    }
  });

  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with search */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Marketplace Products</h1>
        
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setFiltersOpen(true)}
              className="md:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Showing {currentProducts.length} of {sortedProducts.length} products
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Customer Rating</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <div className="w-64 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />
        </div>

        {/* Products Grid/List */}
        <div className="flex-1">
          {loading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="w-full h-48 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {currentProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};