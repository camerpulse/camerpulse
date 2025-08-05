import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  MapPin, 
  Truck, 
  Shield, 
  MessageSquare,
  Plus,
  Minus
} from 'lucide-react';
import { useSlugResolver } from '@/hooks/useSlugResolver';
import { formatCurrency } from '@/lib/utils';

/**
 * Individual product detail page with full product information and purchase options
 */
const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { entity: product, loading, error } = useSlugResolver({ table: 'products' });
  const [quantity, setQuantity] = React.useState(1);

  // Mock data for demonstration
  const mockProduct = {
    id: '1',
    title: 'Traditional Ndole Spice Mix',
    description: 'Authentic Cameroonian Ndole spice blend made from locally sourced ingredients. Perfect for preparing traditional Ndole dishes with authentic flavor.',
    price: 2500,
    originalPrice: 3000,
    currency: 'FCFA',
    category: 'Food & Beverages',
    inStock: true,
    stockQuantity: 45,
    rating: 4.8,
    reviewCount: 24,
    images: [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg'
    ],
    vendor: {
      name: 'Mama Ngozi Kitchen',
      avatar: '',
      rating: 4.9,
      location: 'Douala, Cameroon',
      verified: true,
      joinedDate: '2022-03-15'
    },
    specifications: {
      'Weight': '500g',
      'Origin': 'Cameroon',
      'Shelf Life': '12 months',
      'Storage': 'Store in cool, dry place',
      'Ingredients': 'Palm nuts, dried fish, crayfish, pepper, local spices'
    },
    features: [
      'Made from premium local ingredients',
      'Traditional recipe passed down generations',
      'No artificial preservatives',
      'Vacuum sealed for freshness',
      'Perfect blend for authentic Ndole'
    ],
    shipping: {
      freeShipping: true,
      estimatedDays: '2-3 business days',
      locations: ['Douala', 'Yaoundé', 'Bamenda']
    },
    reviews: [
      {
        id: '1',
        name: 'Sarah M.',
        rating: 5,
        comment: 'Amazing quality! Tastes just like my grandmother\'s cooking.',
        date: '2024-01-20',
        verified: true
      },
      {
        id: '2',
        name: 'Jean Paul K.',
        rating: 4,
        comment: 'Good product, fast delivery. Will order again.',
        date: '2024-01-18',
        verified: true
      }
    ]
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg font-medium">Product not found</p>
            <p className="text-muted-foreground">The product you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = product || mockProduct;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Marketplace</span>
        <span>/</span>
        <span>Products</span>
        <span>/</span>
        <Badge variant="outline">{data.category}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <img 
                src={data.images[0]} 
                alt={data.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
          
          {/* Thumbnail Images */}
          <div className="flex gap-2">
            {data.images.slice(1).map((image, index) => (
              <div key={index} className="w-20 h-20 border rounded-lg overflow-hidden cursor-pointer hover:border-primary">
                <img src={image} alt={`${data.title} ${index + 2}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
            <p className="text-muted-foreground mb-4">{data.description}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(data.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="font-medium">{data.rating}</span>
              <span className="text-muted-foreground">({data.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">{formatCurrency(data.price, data.currency)}</span>
              {data.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(data.originalPrice, data.currency)}
                </span>
              )}
              {data.originalPrice && (
                <Badge variant="destructive">
                  -{Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)}%
                </Badge>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {data.inStock ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">In Stock ({data.stockQuantity} available)</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">Out of Stock</span>
                </>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center border rounded-lg w-fit">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setQuantity(Math.min(data.stockQuantity, quantity + 1))}
                  disabled={quantity >= data.stockQuantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1" size="lg" disabled={!data.inStock}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="outline" className="w-full" size="lg">
              Buy Now
            </Button>
          </div>

          {/* Shipping Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {data.shipping.freeShipping ? 'Free shipping' : 'Shipping calculated at checkout'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Secure payment & buyer protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Delivers to: {data.shipping.locations.join(', ')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Product Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b last:border-b-0">
                    <span className="font-medium">{key}:</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.reviews.map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.name}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  <Separator />
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sold by</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={data.vendor.avatar} />
                  <AvatarFallback>{data.vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    {data.vendor.name}
                    {data.vendor.verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">{data.vendor.rating}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{data.vendor.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Seller since {new Date(data.vendor.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  View Store
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Products */}
          <Card>
            <CardHeader>
              <CardTitle>Related Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <img src="/placeholder.svg" alt="Related product" className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="font-medium text-sm">Cameroon Pepper Mix</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(1800, 'FCFA')}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex gap-2">
                  <img src="/placeholder.svg" alt="Related product" className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="font-medium text-sm">Palm Oil - Traditional</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(3500, 'FCFA')}</p>
                  </div>
                </div>
              </div>
              <Button variant="link" size="sm" className="w-full">
                View more from this seller
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;