import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { VendorCard } from '@/components/Marketplace/VendorCard';
import { ProductCard } from '@/components/Marketplace/ProductCard';
import { VendorRegistration } from '@/components/Marketplace/VendorRegistration';
import { ProductListing } from '@/components/Marketplace/ProductListing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  Store, 
  Plus,
  TrendingUp,
  Users,
  Star,
  Shield,
  Package,
  CreditCard
} from 'lucide-react';

interface Vendor {
  id: string;
  business_name: string;
  vendor_id: string;
  description?: string;
  rating?: number;
  total_sales?: number;
  verification_status: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  images?: string[];
  in_stock?: boolean;
  stock_quantity?: number;
  vendor_id: string;
  created_at?: string;
  updated_at?: string;
  vendor?: Vendor;
}

const Marketplace = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showVendorRegistration, setShowVendorRegistration] = useState(false);
  const [showProductListing, setShowProductListing] = useState(false);
  const [isVendor, setIsVendor] = useState(false);

  const categories = [
    'all', 'electronics', 'fashion', 'food', 'services', 'crafts', 'agriculture', 'automotive', 'books', 'health'
  ];

  useEffect(() => {
    fetchMarketplaceData();
    if (user) {
      checkVendorStatus();
    }
  }, [user]);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);

      // Fetch vendors
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .eq('verification_status', 'verified')
        .order('rating', { ascending: false });

      if (vendorsError) throw vendorsError;

      // Fetch products with vendor info
      const { data: productsData, error: productsError } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          vendor:marketplace_vendors(*)
        `)
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      setVendors(vendorsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkVendorStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('marketplace_vendors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setIsVendor(true);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVendors = vendors.filter(vendor => 
    vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                CamerPulse Marketplace
              </h1>
              <p className="text-muted-foreground">
                Secure commerce with KYC-verified Cameroonian vendors
              </p>
            </div>
            
            {user && (
              <div className="flex gap-2">
                {!isVendor && (
                  <Button onClick={() => setShowVendorRegistration(true)}>
                    <Store className="w-4 h-4 mr-2" />
                    Become a Vendor
                  </Button>
                )}
                
                {isVendor && (
                  <Button onClick={() => setShowProductListing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    List Product
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Store className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{vendors.length}</div>
                <div className="text-sm text-muted-foreground">Verified Vendors</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-cm-green mx-auto mb-2" />
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-muted-foreground">Products Available</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-cm-yellow mx-auto mb-2" />
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">KYC Verified</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CreditCard className="w-8 h-8 text-cm-red mx-auto mb-2" />
                <div className="text-2xl font-bold">Secure</div>
                <div className="text-sm text-muted-foreground">Escrow Protection</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Products ({filteredProducts.length})
            </TabsTrigger>
            <TabsTrigger value="vendors">
              <Store className="w-4 h-4 mr-2" />
              Vendors ({filteredVendors.length})
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
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'No products available yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vendors">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-64 animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredVendors.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'No vendors available yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <VendorCard 
                    key={vendor.id} 
                    vendor={{
                      id: vendor.id,
                      name: vendor.business_name,
                      vendorId: vendor.vendor_id,
                      businessName: vendor.business_name,
                      category: 'General', // Default category
                      location: 'Cameroon',
                      rating: vendor.rating || 0,
                      totalReviews: 0,
                      verified: vendor.verification_status === 'verified',
                      description: vendor.description || '',
                      productsCount: products.filter(p => p.vendor_id === vendor.id).length,
                      escrowActive: true,
                      joinedDate: vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : '',
                      lastActive: 'Recently'
                    }} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Vendor Registration Modal */}
      {showVendorRegistration && (
        <VendorRegistration
          isOpen={showVendorRegistration}
          onClose={() => setShowVendorRegistration(false)}
          onSuccess={() => {
            setShowVendorRegistration(false);
            setIsVendor(true);
            fetchMarketplaceData();
          }}
        />
      )}

      {/* Product Listing Modal */}
      {showProductListing && (
        <ProductListing
          isOpen={showProductListing}
          onClose={() => setShowProductListing(false)}
          onSuccess={() => {
            setShowProductListing(false);
            fetchMarketplaceData();
          }}
        />
      )}
    </div>
  );
};

export default Marketplace;