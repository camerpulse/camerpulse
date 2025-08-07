import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Heart, 
  Star, 
  TrendingUp, 
  Zap, 
  Award, 
  Shield, 
  Truck, 
  Percent,
  Grid3X3,
  Smartphone,
  Shirt,
  Coffee,
  Palette,
  Home,
  Dumbbell,
  Book,
  Stethoscope,
  Car,
  ChevronRight,
  Tag
} from 'lucide-react';

interface Category {
  name: string;
  icon: React.ComponentType<any>;
  count: number;
  slug: string;
  subcategories?: string[];
}

interface QuickLink {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
  color?: string;
}

export const MarketplaceSidebar = ({ className = '' }: { className?: string }) => {
  const location = useLocation();

  const categories: Category[] = [
    {
      name: 'Electronics',
      icon: Smartphone,
      count: 1234,
      slug: 'electronics',
      subcategories: ['Phones', 'Laptops', 'Tablets', 'Accessories']
    },
    {
      name: 'Fashion',
      icon: Shirt,
      count: 856,
      slug: 'fashion',
      subcategories: ['Men', 'Women', 'Children', 'Accessories']
    },
    {
      name: 'Food & Beverages',
      icon: Coffee,
      count: 923,
      slug: 'food',
      subcategories: ['Traditional Foods', 'Spices', 'Beverages', 'Snacks']
    },
    {
      name: 'Arts & Crafts',
      icon: Palette,
      count: 567,
      slug: 'arts',
      subcategories: ['Traditional Art', 'Handmade', 'Sculptures', 'Paintings']
    },
    {
      name: 'Home & Garden',
      icon: Home,
      count: 432,
      slug: 'home',
      subcategories: ['Furniture', 'Decoration', 'Kitchen', 'Garden']
    },
    {
      name: 'Health & Beauty',
      icon: Stethoscope,
      count: 321,
      slug: 'health',
      subcategories: ['Skincare', 'Healthcare', 'Beauty', 'Wellness']
    },
    {
      name: 'Sports & Fitness',
      icon: Dumbbell,
      count: 234,
      slug: 'sports',
      subcategories: ['Equipment', 'Clothing', 'Accessories', 'Supplements']
    },
    {
      name: 'Books & Media',
      icon: Book,
      count: 156,
      slug: 'books',
      subcategories: ['Books', 'Music', 'Movies', 'Games']
    },
    {
      name: 'Automotive',
      icon: Car,
      count: 89,
      slug: 'automotive',
      subcategories: ['Parts', 'Accessories', 'Tools', 'Care Products']
    }
  ];

  const quickLinks: QuickLink[] = [
    {
      name: 'Featured Products',
      icon: Star,
      path: '/marketplace/featured',
      badge: 'Hot',
      color: 'text-yellow-500'
    },
    {
      name: 'Flash Deals',
      icon: Zap,
      path: '/marketplace/deals',
      badge: 'Limited',
      color: 'text-red-500'
    },
    {
      name: 'New Arrivals',
      icon: TrendingUp,
      path: '/marketplace/new',
      badge: 'Fresh',
      color: 'text-green-500'
    },
    {
      name: 'Top Rated',
      icon: Award,
      path: '/marketplace/top-rated',
      color: 'text-primary'
    },
    {
      name: 'Free Shipping',
      icon: Truck,
      path: '/marketplace/free-shipping',
      color: 'text-blue-500'
    },
    {
      name: 'Verified Vendors',
      icon: Shield,
      path: '/marketplace/verified',
      color: 'text-green-600'
    }
  ];

  const specialOffers = [
    {
      title: 'Weekend Sale',
      description: 'Up to 50% off selected items',
      discount: '50%',
      link: '/marketplace/weekend-sale',
      color: 'from-red-500 to-pink-500'
    },
    {
      title: 'Local Vendors',
      description: 'Support Cameroon businesses',
      discount: 'Support',
      link: '/marketplace/local',
      color: 'from-green-500 to-blue-500'
    },
    {
      title: 'Bulk Orders',
      description: 'Special prices for bulk purchases',
      discount: 'Bulk',
      link: '/marketplace/bulk',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Access */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50 ${
                isActiveLink(link.path) ? 'bg-muted text-primary' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <link.icon className={`w-4 h-4 ${link.color || 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">{link.name}</span>
              </div>
              {link.badge && (
                <Badge variant="secondary" className="text-xs">
                  {link.badge}
                </Badge>
              )}
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {categories.slice(0, 8).map((category) => (
            <div key={category.slug}>
              <Link
                to={`/marketplace/category/${category.slug}`}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50 group ${
                  isActiveLink(`/marketplace/category/${category.slug}`) ? 'bg-muted text-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <category.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {category.count}
                  </span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
              
              {/* Subcategories - show on hover or when active */}
              {isActiveLink(`/marketplace/category/${category.slug}`) && category.subcategories && (
                <div className="ml-6 mt-1 space-y-1">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      to={`/marketplace/category/${category.slug}/${sub.toLowerCase().replace(/ /g, '-')}`}
                      className="block p-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <Separator className="my-2" />
          
          <Link
            to="/marketplace/categories"
            className="flex items-center justify-center p-2 text-sm text-primary hover:bg-muted/50 rounded-lg transition-colors"
          >
            View All Categories
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </CardContent>
      </Card>

      {/* Special Offers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Special Offers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {specialOffers.map((offer, index) => (
            <Link
              key={index}
              to={offer.link}
              className="block group"
            >
              <div className={`p-3 rounded-lg bg-gradient-to-r ${offer.color} text-white group-hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{offer.title}</h4>
                    <p className="text-xs opacity-90 mt-1">{offer.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{offer.discount}</div>
                    <div className="text-xs opacity-75">OFF</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* My Account Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Store className="w-4 h-4" />
            My Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Link
            to="/marketplace/orders"
            className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-muted/50"
          >
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">My Orders</span>
          </Link>
          <Link
            to="/marketplace/wishlist"
            className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-muted/50"
          >
            <Heart className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Wishlist</span>
          </Link>
          <Link
            to="/marketplace/reviews"
            className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-muted/50"
          >
            <Star className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">My Reviews</span>
          </Link>
          
          <Separator className="my-2" />
          
          <Link
            to="/marketplace/sell"
            className="flex items-center justify-center gap-2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span className="text-sm font-medium">Sell on CamerPulse</span>
          </Link>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h4 className="font-medium text-sm">Need Help?</h4>
            <p className="text-xs text-muted-foreground">
              Our customer support team is here to help you 24/7
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};