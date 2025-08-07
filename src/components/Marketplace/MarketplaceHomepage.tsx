import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  ShoppingCart, 
  TrendingUp, 
  Star, 
  Shield, 
  Truck, 
  Heart,
  Eye,
  Grid3X3,
  List,
  Filter,
  MapPin,
  Store,
  Package,
  Users,
  Zap,
  Award,
  Percent,
  Clock,
  ChevronRight,
  Play
} from 'lucide-react';

// Enhanced product card for homepage
const EnhancedProductCard = ({ product, size = 'default' }: { product: any, size?: 'small' | 'default' | 'large' }) => {
  const cardClass = size === 'small' ? 'h-64' : size === 'large' ? 'h-96' : 'h-80';
  const imageClass = size === 'small' ? 'h-32' : size === 'large' ? 'h-48' : 'h-40';

  return (
    <Card className={`group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden ${cardClass}`}>
      <div className={`relative ${imageClass} overflow-hidden`}>
        <img 
          src={product.images?.[0] || `https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <Badge className="bg-gradient-primary text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {product.discount && (
            <Badge className="bg-red-500 text-white">
              -{product.discount}%
            </Badge>
          )}
        </div>

        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button size="icon" variant="secondary" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {/* Stock indicator */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Product name */}
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: product.currency || 'XAF'
              }).format(product.price)}
            </span>
            {product.original_price && (
              <span className="text-sm text-muted-foreground line-through">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: product.currency || 'XAF'
                }).format(product.original_price)}
              </span>
            )}
          </div>

          {/* Vendor & rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {product.vendor?.business_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[60px]">
                {product.vendor?.business_name}
              </span>
              {product.vendor?.verification_status === 'verified' && (
                <Shield className="h-3 w-3 text-green-500" />
              )}
            </div>
            
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs">{product.rating}</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <Button 
            size="sm" 
            className="w-full mt-2"
            variant={product.in_stock ? "default" : "secondary"}
            disabled={!product.in_stock}
          >
            {product.in_stock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Category card component
const CategoryCard = ({ category }: { category: any }) => (
  <Link to={`/marketplace/category/${category.slug}`}>
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <CardContent className="p-4 text-center">
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <category.icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
        <p className="text-xs text-muted-foreground">{category.count} items</p>
      </CardContent>
    </Card>
  </Link>
);

// Hero banner component
const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    {
      id: 1,
      title: "Discover Authentic Cameroon Products",
      subtitle: "From traditional crafts to modern electronics",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop",
      cta: "Shop Now",
      link: "/marketplace/featured"
    },
    {
      id: 2,
      title: "Support Local Vendors",
      subtitle: "Every purchase helps build our community",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop",
      cta: "Explore Vendors",
      link: "/marketplace/vendors"
    },
    {
      id: 3,
      title: "Secure & Protected Shopping",
      subtitle: "KYC-verified sellers, escrow payments",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=400&fit=crop",
      cta: "Learn More",
      link: "/marketplace/security"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl mb-6">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            transform: `translateX(${(index - currentSlide) * 100}%)`
          }}
        >
          <div 
            className="w-full h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${banner.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-start p-8 md:p-12">
              <div className="text-white max-w-md">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                <p className="text-lg md:text-xl mb-4 opacity-90">{banner.subtitle}</p>
                <Link to={banner.link}>
                  <Button size="lg" className="bg-white text-black hover:bg-white/90">
                    {banner.cta}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export const MarketplaceHomepage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Mock data - replace with real API calls
  const mockCategories = [
    { name: 'Electronics', icon: Zap, count: 1234, slug: 'electronics' },
    { name: 'Fashion', icon: Star, count: 856, slug: 'fashion' },
    { name: 'Food & Beverages', icon: Package, count: 923, slug: 'food' },
    { name: 'Arts & Crafts', icon: Award, count: 567, slug: 'arts' },
    { name: 'Home & Garden', icon: Store, count: 432, slug: 'home' },
    { name: 'Health & Beauty', icon: Heart, count: 321, slug: 'health' },
    { name: 'Sports', icon: TrendingUp, count: 234, slug: 'sports' },
    { name: 'Books', icon: Users, count: 156, slug: 'books' },
  ];

  const mockFeaturedProducts = [
    {
      id: '1',
      name: 'Traditional Ndole Spice Mix',
      price: 2500,
      original_price: 3000,
      currency: 'XAF',
      rating: 4.8,
      images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop'],
      vendor: { business_name: 'Mama Ngozi', verification_status: 'verified' },
      in_stock: true,
      is_featured: true,
      discount: 17
    },
    {
      id: '2',
      name: 'Handwoven Basket Set',
      price: 15000,
      currency: 'XAF',
      rating: 4.9,
      images: ['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=300&h=300&fit=crop'],
      vendor: { business_name: 'Artisan Crafts', verification_status: 'verified' },
      in_stock: true,
      is_featured: true
    },
    {
      id: '3',
      name: 'Solar Power Bank',
      price: 25000,
      original_price: 30000,
      currency: 'XAF',
      rating: 4.6,
      images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop'],
      vendor: { business_name: 'TechHub CM', verification_status: 'verified' },
      in_stock: true,
      discount: 17
    },
    {
      id: '4',
      name: 'African Print Dress',
      price: 18000,
      currency: 'XAF',
      rating: 4.7,
      images: ['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=300&h=300&fit=crop'],
      vendor: { business_name: 'Fashion House', verification_status: 'verified' },
      in_stock: true
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to search results
    window.location.href = `/marketplace/search?q=${encodeURIComponent(searchTerm)}`;
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Search Bar Section */}
        <div className="bg-gradient-primary py-8">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for products, categories, or vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-20 py-3 text-lg bg-white"
                />
                <Button 
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-6"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-8">
          {/* Hero Banner */}
          <HeroBanner />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Store className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">1,234</div>
                <div className="text-sm text-muted-foreground">Verified Vendors</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">15,678</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">89,234</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">Secure Payments</div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Shop by Category</h2>
              <Link to="/marketplace/categories">
                <Button variant="outline">
                  View All Categories
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {mockCategories.map((category, index) => (
                <CategoryCard key={index} category={category} />
              ))}
            </div>
          </section>

          {/* Featured Products */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Featured Products
              </h2>
              <Link to="/marketplace/featured">
                <Button variant="outline">
                  View All Featured
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {mockFeaturedProducts.map((product) => (
                <EnhancedProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Flash Deals */}
          <section>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Flash Deals
                </h2>
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Ends in 23:45:12</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mockFeaturedProducts.slice(0, 6).map((product) => (
                  <div key={product.id} className="bg-white rounded-lg p-3">
                    <EnhancedProductCard product={{...product, discount: 25}} size="small" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* New Arrivals */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                New Arrivals
              </h2>
              <Link to="/marketplace/new">
                <Button variant="outline">
                  View All New
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {mockFeaturedProducts.map((product) => (
                <EnhancedProductCard key={`new-${product.id}`} product={product} />
              ))}
            </div>
          </section>

          {/* Top Vendors */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Top Rated Vendors
              </h2>
              <Link to="/marketplace/vendors">
                <Button variant="outline">
                  View All Vendors
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((vendor) => (
                <Card key={vendor} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback>V{vendor}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold">Top Vendor {vendor}</h3>
                        <p className="text-sm text-muted-foreground">Electronics & Gadgets</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">4.9 (234 reviews)</span>
                        </div>
                      </div>
                      <Badge>
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-bold text-lg">156</div>
                        <div className="text-muted-foreground">Products</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">2.3k</div>
                        <div className="text-muted-foreground">Sales</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">99%</div>
                        <div className="text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Trust & Security */}
          <section className="bg-muted/30 rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Why Choose CamerPulse Marketplace?</h2>
              <p className="text-muted-foreground">Your safety and satisfaction are our top priorities</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">KYC Verified Vendors</h3>
                <p className="text-sm text-muted-foreground">All vendors go through strict verification process</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Fast & Secure Delivery</h3>
                <p className="text-sm text-muted-foreground">Reliable shipping with tracking and insurance</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Customer Support</h3>
                <p className="text-sm text-muted-foreground">24/7 support to help with any issues</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};