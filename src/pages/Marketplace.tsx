import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { ProductCard } from '@/components/Marketplace/ProductCard';
import { ShoppingCart } from '@/components/Marketplace/ShoppingCart';
import { AdvancedSearch } from '@/components/Marketplace/AdvancedSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { mockMarketplaceProducts, mockMarketplaceVendors } from '@/data/mockData';
import { 
  Search, 
  Package, 
  Star, 
  Truck, 
  Shield, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  Filter, 
  Grid, 
  List, 
  Eye,
  MapPin,
  Users,
  CheckCircle,
  Award
} from 'lucide-react';

const Marketplace = () => {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    { name: 'Electronics', icon: '💻', count: 245, color: 'from-blue-500 to-blue-600' },
    { name: 'Fashion', icon: '👗', count: 189, color: 'from-pink-500 to-pink-600' },
    { name: 'Art & Crafts', icon: '🎨', count: 156, color: 'from-purple-500 to-purple-600' },
    { name: 'Food & Agriculture', icon: '🌾', count: 98, color: 'from-green-500 to-green-600' },
    { name: 'Home & Garden', icon: '🏠', count: 67, color: 'from-orange-500 to-orange-600' },
    { name: 'Health & Beauty', icon: '💄', count: 134, color: 'from-rose-500 to-rose-600' }
  ];

  const trendingProducts = mockMarketplaceProducts.filter(p => p.rating >= 4.7).slice(0, 6);
  const newArrivals = [...mockMarketplaceProducts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 8);
  const topVendors = mockMarketplaceVendors.filter(v => v.rating >= 4.5).slice(0, 3);

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Premium Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
          </div>
          
          <div className="relative container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Africa's #1 Trusted Marketplace</span>
                <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                  50K+ Users
                </Badge>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Discover Authentic
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400"> Cameroon</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Shop premium products from verified local vendors. Experience secure payments, 
                fast delivery, and authentic Cameroonian craftsmanship.
              </p>

              {/* Enhanced Search Bar */}
              <div className="max-w-3xl mx-auto mb-8">
                <div className="relative bg-white rounded-2xl shadow-2xl p-2">
                  <div className="flex">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input 
                        placeholder="Search 25,000+ authentic products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-4 text-lg border-0 focus:ring-0 bg-transparent"
                      />
                    </div>
                    <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-4 rounded-xl text-white font-semibold shadow-lg">
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="font-medium">KYC Verified Vendors</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">Fast Nationwide Delivery</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  <span className="font-medium">Secure Escrow Payments</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Dashboard */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Verified Vendors', value: '1,247', icon: Users, color: 'text-blue-600' },
                { label: 'Products', value: '25,000+', icon: Package, color: 'text-green-600' },
                { label: 'Happy Customers', value: '50,000+', icon: Star, color: 'text-yellow-600' },
                { label: 'Platform Rating', value: '4.9★', icon: Award, color: 'text-purple-600' }
              ].map((stat, index) => (
                <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Shop by Category</h2>
              <p className="text-xl text-slate-600">Discover authentic Cameroonian products across all categories</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <CardContent className="p-6 text-center relative">
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">{category.name}</h3>
                    <p className="text-sm text-slate-600">{category.count} products</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-2">Trending Products</h2>
                <p className="text-xl text-slate-600">Most popular items this week</p>
              </div>
              <Button variant="outline" size="lg" className="group">
                View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {trendingProducts.map((product) => (
                <Card key={product.id} className="relative group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-red-500 text-white shadow-lg">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  </div>
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button size="sm" variant="secondary" className="gap-2 shadow-lg">
                        <Eye className="w-4 h-4" />
                        Quick View
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 truncate mb-2">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-slate-700">{product.rating}</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{product.price.toLocaleString()} {product.currency}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Vendors */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Vendors</h2>
              <p className="text-xl text-slate-600">Meet our top-rated sellers</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {topVendors.map((vendor) => (
                <Card key={vendor.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <img 
                        src={vendor.profile.avatar_url} 
                        alt={vendor.business_name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-green-100"
                      />
                      <Badge className="bg-green-500 text-white mb-3">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified Seller
                      </Badge>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{vendor.business_name}</h3>
                      <p className="text-slate-600 mb-4">{vendor.description}</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{vendor.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Products</span>
                        <span className="font-semibold">{vendor.total_sales}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Location</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="text-sm">{vendor.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                      Visit Store
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* All Products */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-2">All Products</h2>
                <p className="text-xl text-slate-600">Browse our complete collection</p>
              </div>
              <div className="flex items-center gap-3">
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {showAdvancedSearch && (
              <div className="mb-8">
                <AdvancedSearch onFiltersChange={handleFiltersChange} />
              </div>
            )}

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-slate-600 text-lg">Loading amazing products...</p>
              </div>
            ) : (
              <div className={`grid ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
                  : 'grid-cols-1 gap-6'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-20">
                <Package className="w-20 h-20 text-slate-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">No products found</h3>
                <p className="text-slate-600 text-lg">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Selling?</h2>
            <p className="text-xl md:text-2xl text-green-100 mb-10 max-w-3xl mx-auto">
              Join thousands of successful vendors on Africa's most trusted marketplace. 
              Start your journey today with our easy vendor onboarding process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
                Become a Vendor
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold text-white border-white hover:bg-white hover:text-green-600">
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </div>
      
      <ShoppingCart />
    </AppLayout>
  );
};

export default Marketplace;