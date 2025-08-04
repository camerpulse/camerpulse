import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMarketplaceVendors, mockMarketplaceProducts } from '@/data/mockData';
import { ProductCard } from '@/components/Marketplace/ProductCard';
import { 
  ArrowLeft, 
  Star, 
  Shield, 
  MapPin, 
  Clock, 
  Phone,
  Mail,
  Store,
  Package,
  TrendingUp,
  Calendar,
  MessageCircle,
  Award
} from 'lucide-react';

const VendorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [vendorProducts, setVendorProducts] = useState<any[]>([]);

  useEffect(() => {
    const foundVendor = mockMarketplaceVendors.find(v => v.id === id);
    if (foundVendor) {
      setVendor(foundVendor);
      // Get products for this vendor
      const products = mockMarketplaceProducts.filter(p => p.vendor_id === id);
      setVendorProducts(products);
    } else {
      navigate('/marketplace');
    }
  }, [id, navigate]);

  if (!vendor) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Vendor not found</h1>
            <Button asChild className="mt-4">
              <Link to="/marketplace">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          asChild
          className="mb-6"
        >
          <Link to="/marketplace">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
        </Button>

        {/* Vendor Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <img 
                src={vendor.profile.avatar_url} 
                alt={vendor.business_name}
                className="w-32 h-32 rounded-lg object-cover border-2 border-primary/20"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{vendor.business_name}</h1>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified Vendor
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <Badge variant="outline" className="font-mono text-sm">
                        ID: {vendor.vendor_id}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(vendor.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-lg mb-4">{vendor.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{vendor.rating}</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{vendor.total_sales}</div>
                    <div className="text-sm text-muted-foreground">Sales</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{vendorProducts.length}</div>
                    <div className="text-sm text-muted-foreground">Products</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{vendor.established_year}</div>
                    <div className="text-sm text-muted-foreground">Since</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{vendor.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{vendor.business_hours}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                  <Button variant="outline">
                    <Store className="w-4 h-4 mr-2" />
                    Follow Store
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Details */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Products ({vendorProducts.length})
            </TabsTrigger>
            <TabsTrigger value="about">
              <Store className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="w-4 h-4 mr-2" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vendorProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {vendorProducts.length === 0 && (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground">This vendor hasn't listed any products yet.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {vendor.business_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Business Description</h4>
                  <p className="text-muted-foreground">{vendor.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="outline">{specialty}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Shipping Regions</h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.shipping_regions.map((region: string, index: number) => (
                      <Badge key={index} variant="secondary">{region}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Established in {vendor.established_year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span>Vendor ID: {vendor.vendor_id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Customer Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Reviews coming soon</h3>
                  <p className="text-muted-foreground">
                    Customer reviews and ratings will be displayed here once available.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default VendorProfile;