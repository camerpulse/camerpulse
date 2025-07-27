import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { VendorCard } from '@/components/Marketplace/VendorCard';
import { ProductCard } from '@/components/Marketplace/ProductCard';
import { ShoppingCart } from '@/components/Marketplace/ShoppingCart';
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        .select('*, vendor:marketplace_vendors(*)')
        .eq('in_stock', true);

      setVendors(vendorsData || mockMarketplaceVendors);
      setProducts(productsData || mockMarketplaceProducts);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      setVendors(mockMarketplaceVendors);
      setProducts(mockMarketplaceProducts);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <ShoppingCart />
        </div>

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