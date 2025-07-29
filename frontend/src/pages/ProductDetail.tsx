import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockMarketplaceProducts } from '@/data/mockData';
import { 
  ArrowLeft, 
  Star, 
  Shield, 
  Truck, 
  Heart, 
  Share2, 
  ShoppingCart,
  Store,
  MapPin,
  Clock,
  CheckCircle,
  MessageCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const foundProduct = mockMarketplaceProducts.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      navigate('/marketplace');
    }
  }, [id, navigate]);

  const handleAddToCart = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleBuyNow = () => {
    toast({
      title: "Redirect to Checkout",
      description: "You would be redirected to the checkout page.",
    });
  };

  if (!product) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Product not found</h1>
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link to="/marketplace" className="hover:text-primary">Marketplace</Link>
          <span>/</span>
          <Link to={`/marketplace?category=${product.category}`} className="hover:text-primary">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden border">
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={product.in_stock ? 'default' : 'destructive'}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </Badge>
                {product.brand && (
                  <Badge variant="outline">{product.brand}</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.review_count || 0} reviews)
                </span>
              </div>
              <p className="text-2xl font-bold text-primary mb-4">
                {product.price.toLocaleString()} {product.currency}
              </p>
              <p className="text-muted-foreground mb-6">{product.description}</p>
            </div>

            {/* Features */}
            {product.features && (
              <div>
                <h3 className="font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.sku && (
                <div>
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="ml-2 font-medium">{product.sku}</span>
                </div>
              )}
              {product.weight_kg && (
                <div>
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="ml-2 font-medium">{product.weight_kg}kg</span>
                </div>
              )}
              {product.warranty_months > 0 && (
                <div>
                  <span className="text-muted-foreground">Warranty:</span>
                  <span className="ml-2 font-medium">{product.warranty_months} months</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Stock:</span>
                <span className="ml-2 font-medium">{product.stock_quantity} available</span>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Total: {(product.price * quantity).toLocaleString()} {product.currency}
                </span>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Adding..." : "Add to Cart"}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                Secure Payment
              </div>
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-blue-500" />
                Fast Delivery
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Verified Vendor
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Info */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Sold by {product.marketplace_vendors.business_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <img 
                src={product.marketplace_vendors.profile.avatar_url} 
                alt={product.marketplace_vendors.business_name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{product.marketplace_vendors.business_name}</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {product.marketplace_vendors.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {product.marketplace_vendors.rating} rating
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {product.marketplace_vendors.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {product.marketplace_vendors.business_hours}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/vendor/${product.marketplace_vendors.id}`}>
                      View Store
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProductDetail;