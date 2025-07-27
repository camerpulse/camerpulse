import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { VendorCard } from '@/components/Marketplace/VendorCard';
import { ProductCard } from '@/components/Marketplace/ProductCard';
import { ShoppingCart } from '@/components/Marketplace/ShoppingCart';
import { AdvancedSearch } from '@/components/Marketplace/AdvancedSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { mockMarketplaceProducts, mockMarketplaceVendors } from '@/data/mockData';
import { Search, Package, Store } from 'lucide-react';

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

  return (
    <AppLayout>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            CamerPulse Marketplace
          </h1>
          <p className="text-muted-foreground">
            Secure commerce with KYC-verified Cameroonian vendors
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              <Search className="w-4 h-4 mr-2" />
              {showAdvancedSearch ? 'Hide' : 'Show'} Search
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
              Products ({filteredProducts.length})
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
      </main>
    </AppLayout>
  );
};

export default Marketplace;