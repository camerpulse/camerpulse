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
import { Search, Package, Store, ShoppingBag, Star, Truck, Shield, Zap, ArrowRight, TrendingUp } from 'lucide-react';

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
    { name: 'Services', icon: '🔧', count: 134, trending: true }
  ];

  const featuredProducts = mockMarketplaceProducts.slice(0, 4);

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

          {/* Featured Products */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
              <Button variant="outline" className="group">
                View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        {/* Marketplace Browser Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 flex-1">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              >
                <Search className="w-4 h-4 mr-2" />
                {showAdvancedSearch ? 'Hide' : 'Show'} Advanced Search
              </Button>
            </div>
            
            <ShoppingCart />
          </div>

          {showAdvancedSearch && (
            <div className="mb-6">
              <AdvancedSearch
                onFiltersChange={handleFiltersChange}
                initialFilters={{ query: searchTerm }}
              />
            </div>
          )}

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="products">
                <Package className="w-4 h-4 mr-2" />
                All Products ({filteredProducts.length})
              </TabsTrigger>
              <TabsTrigger value="vendors">
                <Store className="w-4 h-4 mr-2" />
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
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      location: 'Cameroon',
                      rating: vendor.rating || 0,
                      totalReviews: 0,
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
      </main>
    </AppLayout>
  );
};

export default Marketplace;