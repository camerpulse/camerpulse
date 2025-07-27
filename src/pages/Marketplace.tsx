import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { VendorCard } from '@/components/Marketplace/VendorCard';
import { ProductCard } from '@/components/Marketplace/ProductCard';
import { ShoppingCart } from '@/components/Marketplace/ShoppingCart';
import { AdvancedSearch } from '@/components/Marketplace/AdvancedSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { mockMarketplaceProducts, mockMarketplaceVendors } from '@/data/mockData';
import { Search, Package, Store, ShoppingBag, Star, Truck, Shield, Zap, ArrowRight, TrendingUp, Clock, Heart, Filter, Grid, List, Eye } from 'lucide-react';

const Marketplace = () => {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      const { data: vendorsData } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .eq('verification_status', 'verified');

      const { data: productsData } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          vendor:marketplace_vendors(*),
          category:product_categories(*)
        `)
        .eq('in_stock', true);

      setVendors(vendorsData || mockMarketplaceVendors);
      setProducts(productsData || mockMarketplaceProducts);
      setFilteredProducts(productsData || mockMarketplaceProducts);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      setVendors(mockMarketplaceVendors);
      setProducts(mockMarketplaceProducts);
      setFilteredProducts(mockMarketplaceProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: any) => {
    setSearchFilters(filters);
    
    let filtered = [...products];

    // Apply search query
    if (filters.query) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(filters.query.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.query.toLowerCase()) ||
        product.vendor?.business_name?.toLowerCase().includes(filters.query.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category_id === filters.category);
    }

    // Apply vendor filter
    if (filters.vendor) {
      filtered = filtered.filter(product => product.vendor_id === filters.vendor);
    }

    // Apply price range
    if (filters.priceMin > 0 || filters.priceMax < 1000000) {
      filtered = filtered.filter(product =>
        product.price >= filters.priceMin && product.price <= filters.priceMax
      );
    }

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => (product.rating || 0) >= filters.rating);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredProducts(filtered);
  };

  const categories = [
    { name: 'Electronics', icon: '📱', count: 245, trending: true },
    { name: 'Fashion', icon: '👗', count: 189, trending: false },
    { name: 'Art & Crafts', icon: '🎨', count: 156, trending: true },
    { name: 'Food & Agriculture', icon: '🌾', count: 98, trending: false },
    { name: 'Home & Garden', icon: '🏠', count: 67, trending: false },
    { name: 'Health & Beauty', icon: '💅', count: 134, trending: true }
  ];

  const featuredProducts = mockMarketplaceProducts.slice(0, 4);
  const trendingProducts = mockMarketplaceProducts.filter(p => p.rating >= 4.7).slice(0, 6);
  const newArrivals = [...mockMarketplaceProducts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 8);
  const bestSellers = mockMarketplaceProducts.filter(p => p.rating >= 4.8).slice(0, 4);
  const topVendors = mockMarketplaceVendors.filter(v => v.rating >= 4.5).slice(0, 3);

  const deals = [
    { 
      title: "Weekend Special", 
      description: "Up to 30% off on Electronics", 
      badge: "Limited Time",
      color: "bg-red-500"
    },
    { 
      title: "Artisan Week", 
      description: "Support local crafts - Free shipping", 
      badge: "This Week",
      color: "bg-blue-500"
    }
  ];

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
          <div className="container mx-auto px-4 py-16 relative">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <Zap className="w-3 h-3 mr-1" />
                Trusted by 50,000+ Cameroonians
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Africa's Premier
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70"> Digital Marketplace</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Connect with verified Cameroonian vendors. Shop authentic products. 
                Support local businesses with secure transactions and escrow protection.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    placeholder="Search for products, vendors, or categories..."
                    className="pl-12 pr-4 py-4 text-lg rounded-full border-2 focus:border-primary/50"
                  />
                  <Button size="lg" className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full">
                    Search
                  </Button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  KYC Verified Vendors
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  Fast Nationwide Delivery
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  5-Star Customer Protection
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="text-center p-4">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-primary">1,247</div>
                <div className="text-sm text-muted-foreground">Verified Vendors</div>
              </CardContent>
            </Card>
            <Card className="text-center p-4">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-primary">25,000+</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </CardContent>
            </Card>
            <Card className="text-center p-4">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-primary">50,000+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </CardContent>
            </Card>
            <Card className="text-center p-4">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">Platform Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Shop by Category</h2>
              <Button variant="outline" className="group">
                View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Card key={category.name} className="relative overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    {category.trending && (
                      <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} items</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trending Now Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
                <p className="text-muted-foreground">Most popular products this week</p>
              </div>
              <Button variant="outline" className="group">
                View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {trendingProducts.map((product) => (
                <Card key={product.id} className="relative group hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant="secondary" className="bg-red-500 text-white">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  </div>
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button size="sm" variant="secondary" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Quick View
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                      <div className="flex items-center gap-1 my-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{product.rating}</span>
                      </div>
                      <p className="text-sm font-bold text-primary">{product.price.toLocaleString()} {product.currency}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Deals Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Special Deals</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {deals.map((deal, index) => (
                <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer">
                  <div className={`absolute inset-0 ${deal.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">{deal.badge}</Badge>
                        <h3 className="text-xl font-bold mb-2">{deal.title}</h3>
                        <p className="text-muted-foreground">{deal.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">New Arrivals</h2>
                <p className="text-muted-foreground">Fresh products added this week</p>
              </div>
              <Button variant="outline" className="group">
                View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.slice(0, 4).map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-green-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  </div>
                  <ProductCard product={product} />
                </Card>
              ))}
            </div>
          </div>

          {/* Top Vendors Spotlight */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Featured Vendors</h2>
                <p className="text-muted-foreground">Top-rated sellers on our platform</p>
              </div>
              <Button variant="outline" className="group">
                View All Vendors <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {topVendors.map((vendor) => (
                <Card key={vendor.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img 
                        src={vendor.profile.avatar_url} 
                        alt={vendor.business_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg">{vendor.business_name}</h3>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{vendor.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{vendor.rating}</span>
                            <span className="text-sm text-muted-foreground">({vendor.total_sales} sales)</span>
                          </div>
                          <Badge variant="outline">{vendor.location}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Marketplace Browser Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className="lg:w-80 space-y-6">
              {showAdvancedSearch && (
                <div className="lg:sticky lg:top-4">
                  <AdvancedSearch
                    onFiltersChange={handleFiltersChange}
                    initialFilters={{ query: searchTerm }}
                  />
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6 bg-card/50 backdrop-blur-sm p-4 rounded-lg border">
                <div className="flex items-center space-x-4 flex-1">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="lg:hidden"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  
                  <div className="hidden lg:flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">View:</span>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length} products found
                  </span>
                  <ShoppingCart />
                </div>
              </div>

              <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="products" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    All Products ({filteredProducts.length})
                  </TabsTrigger>
                  <TabsTrigger value="vendors" className="flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Vendors ({vendors.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="products">
                  {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[...Array(8)].map((_, i) => (
                        <Card key={i} className="h-64 animate-pulse">
                          <CardContent className="p-4">
                            <div className="w-full h-32 bg-muted rounded mb-4"></div>
                            <div className="h-4 bg-muted rounded mb-2"></div>
                            <div className="h-4 bg-muted rounded w-2/3"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <Card className="p-12 text-center">
                      <div className="space-y-4">
                        <Package className="w-16 h-16 mx-auto text-muted-foreground" />
                        <div>
                          <h3 className="text-lg font-semibold">No products found</h3>
                          <p className="text-muted-foreground">Try adjusting your search filters or browse our categories</p>
                        </div>
                        <Button onClick={() => window.location.reload()}>
                          Browse All Products
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <div className={viewMode === 'grid' ? 
                      "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
                      "space-y-4"
                    }>
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="vendors">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendor) => (
                      <VendorCard 
                        key={vendor.id} 
                        vendor={{
                          id: vendor.id,
                          name: vendor.business_name,
                          vendorId: vendor.vendor_id,
                          businessName: vendor.business_name,
                          category: 'General',
                          location: vendor.location || 'Cameroon',
                          rating: vendor.rating || 0,
                          totalReviews: vendor.total_sales || 0,
                          verified: vendor.verification_status === 'verified',
                          description: vendor.description || '',
                          productsCount: 0,
                          escrowActive: true,
                          joinedDate: '',
                          lastActive: 'Recently'
                        }} 
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default Marketplace;