import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/Marketplace/ProductCard';
import { 
  Star, 
  MapPin, 
  Shield, 
  Store, 
  Package, 
  Users, 
  Calendar,
  Clock,
  MessageSquare,
  Heart,
  Share2,
  Award,
  TrendingUp,
  Truck,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';

const VendorDetailPage: React.FC = () => {
  const { vendorSlug } = useParams<{ vendorSlug: string }>();
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Mock vendor data - replace with real API call
  const vendor = {
    id: '1',
    name: 'Mama Ngozi Kitchen',
    description: 'Traditional Cameroonian foods and spices. Family recipes passed down through generations. We specialize in authentic local ingredients and traditional cooking methods.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=200&h=200&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1556909114-4f311c22c234?w=1200&h=400&fit=crop',
    location: 'Douala, Littoral Region, Cameroon',
    rating: 4.9,
    reviewCount: 128,
    productsCount: 45,
    totalSales: 2450,
    category: 'Food & Beverages',
    verified: true,
    joinedDate: '2022-03-15',
    lastActive: 'Online now',
    responseTime: '1 hour',
    badges: ['Top Seller', 'Fast Shipping', 'Eco Friendly'],
    specialties: ['Traditional Spices', 'Palm Oil', 'Dried Fish', 'Local Vegetables'],
    businessInfo: {
      founded: '2018',
      employees: '5-10',
      businessType: 'Family Business',
      languages: ['English', 'French'],
      certifications: ['Organic Certified', 'Fair Trade'],
      shippingRegions: ['Douala', 'Yaoundé', 'Bamenda', 'Bafoussam']
    },
    contact: {
      phone: '+237 6 XX XX XX XX',
      email: 'mamangozi@example.com',
      website: 'www.mamangozikitchen.cm',
      whatsapp: '+237 6 XX XX XX XX'
    },
    socialMedia: {
      facebook: 'mamangozikitchen',
      instagram: '@mamangozikitchen',
      twitter: '@mamangozi_cm'
    },
    policies: {
      returnPolicy: '7-day return policy for unopened items',
      shippingPolicy: 'Free shipping on orders over 10,000 FCFA',
      paymentMethods: ['Mobile Money', 'Bank Transfer', 'Cash on Delivery']
    },
    stats: {
      totalOrders: 1234,
      repeatCustomers: 456,
      averageOrderValue: 8500,
      onTimeDelivery: 98
    }
  };

  // Mock products from this vendor
  const vendorProducts = [
    {
      id: '1',
      name: 'Traditional Ndole Spice Mix',
      price: 2500,
      original_price: 3000,
      currency: 'XAF',
      rating: 4.8,
      images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop'],
      in_stock: true,
      vendor_id: '1',
      vendor: {
        id: '1',
        business_name: 'Mama Ngozi Kitchen',
        verification_status: 'verified'
      }
    },
    {
      id: '2',
      name: 'Pure Palm Oil',
      price: 4500,
      currency: 'XAF',
      rating: 4.9,
      images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop'],
      in_stock: true,
      vendor_id: '1',
      vendor: {
        id: '1',
        business_name: 'Mama Ngozi Kitchen',
        verification_status: 'verified'
      }
    },
    {
      id: '3',
      name: 'Dried Fish Assortment',
      price: 3500,
      currency: 'XAF',
      rating: 4.7,
      images: ['https://images.unsplash.com/photo-1544943845-9611ad6bb9e6?w=300&h=300&fit=crop'],
      in_stock: true,
      vendor_id: '1',
      vendor: {
        id: '1',
        business_name: 'Mama Ngozi Kitchen',
        verification_status: 'verified'
      }
    }
  ];

  const reviews = [
    {
      id: '1',
      author: 'Sarah M.',
      rating: 5,
      comment: 'Amazing quality! The spices taste exactly like my grandmother\'s cooking. Fast delivery and excellent packaging.',
      date: '2024-01-20',
      verified: true,
      helpful: 15
    },
    {
      id: '2',
      author: 'Jean Paul K.',
      rating: 5,
      comment: 'Best palm oil I\'ve found in Douala. Authentic and fresh. Will definitely order again.',
      date: '2024-01-18',
      verified: true,
      helpful: 8
    },
    {
      id: '3',
      author: 'Marie L.',
      rating: 4,
      comment: 'Good products overall. Delivery was a bit delayed but quality made up for it.',
      date: '2024-01-15',
      verified: true,
      helpful: 3
    }
  ];

  if (!vendor) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg font-medium">Vendor not found</p>
              <p className="text-muted-foreground">The vendor you're looking for doesn't exist or has been removed.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Cover Image & Header */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={vendor.coverImage}
            alt={`${vendor.name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Breadcrumb */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 text-white text-sm">
              <Link to="/marketplace" className="hover:underline">Marketplace</Link>
              <span>/</span>
              <Link to="/marketplace/vendors" className="hover:underline">Vendors</Link>
              <span>/</span>
              <span>{vendor.name}</span>
            </div>
          </div>

          {/* Vendor Header Info */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={vendor.avatar} />
                <AvatarFallback className="text-2xl">
                  {vendor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl font-bold">{vendor.name}</h1>
                      {vendor.verified && (
                        <Badge className="bg-green-500 text-white">
                          <Shield className="w-4 h-4 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {vendor.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {vendor.rating} ({vendor.reviewCount} reviews)
                      </div>
                      <Badge variant="secondary">{vendor.category}</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant={isFollowing ? "secondary" : "outline"}
                      onClick={() => setIsFollowing(!isFollowing)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Vendor
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold">{vendor.productsCount}</div>
                    <div className="text-xs text-muted-foreground">Products</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <div className="text-xl font-bold">{vendor.totalSales.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Sales</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-xl font-bold">{vendor.stats.repeatCustomers}</div>
                    <div className="text-xs text-muted-foreground">Repeat Customers</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Truck className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-xl font-bold">{vendor.stats.onTimeDelivery}%</div>
                    <div className="text-xs text-muted-foreground">On-time Delivery</div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Tabs */}
              <Tabs defaultValue="products" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="policies">Policies</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Products ({vendorProducts.length})</h2>
                    <Link to={`/marketplace/products?vendor=${vendor.id}`}>
                      <Button variant="outline">View All Products</Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendorProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {vendor.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{vendor.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Business Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Founded:</span>
                              <span>{vendor.businessInfo.founded}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Employees:</span>
                              <span>{vendor.businessInfo.employees}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Business Type:</span>
                              <span>{vendor.businessInfo.businessType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Languages:</span>
                              <span>{vendor.businessInfo.languages.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Specialties</h4>
                          <div className="flex flex-wrap gap-1">
                            {vendor.specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          
                          <h4 className="font-semibold mb-2 mt-4">Certifications</h4>
                          <div className="flex flex-wrap gap-1">
                            {vendor.businessInfo.certifications.map((cert, index) => (
                              <Badge key={index} className="text-xs bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Customer Reviews</h2>
                    <Button variant="outline">
                      <Star className="w-4 h-4 mr-2" />
                      Write Review
                    </Button>
                  </div>

                  {/* Rating Summary */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold">{vendor.rating}</div>
                          <div className="flex items-center justify-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(vendor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Based on {vendor.reviewCount} reviews
                          </div>
                        </div>

                        <div className="flex-1">
                          {[5, 4, 3, 2, 1].map((stars) => (
                            <div key={stars} className="flex items-center gap-2 mb-1">
                              <span className="text-sm w-8">{stars}</span>
                              <Star className="w-3 h-3 text-yellow-400" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full" 
                                  style={{ width: `${Math.random() * 80 + 10}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-8">
                                {Math.floor(Math.random() * 50)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{review.author}</span>
                                  {review.verified && (
                                    <Badge variant="secondary" className="text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verified Purchase
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {new Date(review.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              👍 Helpful ({review.helpful})
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="policies" className="space-y-6">
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Return Policy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{vendor.policies.returnPolicy}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Shipping Policy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{vendor.policies.shippingPolicy}</p>
                        <div>
                          <h4 className="font-semibold mb-2">Shipping Regions:</h4>
                          <div className="flex flex-wrap gap-1">
                            {vendor.businessInfo.shippingRegions.map((region, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {region}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {vendor.policies.paymentMethods.map((method, index) => (
                            <Badge key={index} className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Vendor Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Vendor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined {new Date(vendor.joinedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{vendor.lastActive}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span>Responds in {vendor.responseTime}</span>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Badges</h4>
                    <div className="flex flex-wrap gap-1">
                      {vendor.badges.map((badge, index) => (
                        <Badge key={index} className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{vendor.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{vendor.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>{vendor.contact.website}</span>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Social Media</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Facebook className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Instagram className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Twitter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust & Safety */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Trust & Safety</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>KYC Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Business License Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span>Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>Report Vendor</span>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Vendors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Similar Vendors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((similar) => (
                    <div key={similar} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>V{similar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Similar Vendor {similar}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs">4.{7 + similar}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" size="sm">
                    View More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VendorDetailPage;