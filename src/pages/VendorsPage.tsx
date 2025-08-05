import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MapPin, 
  Star, 
  Store, 
  Package, 
  Users, 
  TrendingUp,
  Filter,
  ExternalLink
} from 'lucide-react';

/**
 * Marketplace vendors listing page with search and filtering
 */
const VendorsPage: React.FC = () => {
  const mockVendors = [
    {
      id: '1',
      name: 'Mama Ngozi Kitchen',
      description: 'Traditional Cameroonian foods and spices. Family recipes passed down through generations.',
      avatar: '',
      coverImage: '/placeholder.svg',
      location: 'Douala, Cameroon',
      rating: 4.9,
      reviewCount: 128,
      productsCount: 45,
      category: 'Food & Beverages',
      verified: true,
      joinedDate: '2022-03-15',
      totalSales: 2450,
      specialties: ['Traditional Spices', 'Palm Oil', 'Dried Fish']
    },
    {
      id: '2',
      name: 'Artisan Crafts CM',
      description: 'Handmade traditional crafts, wood carvings, and authentic Cameroonian art pieces.',
      avatar: '',
      coverImage: '/placeholder.svg',
      location: 'Yaoundé, Cameroon',
      rating: 4.7,
      reviewCount: 89,
      productsCount: 32,
      category: 'Arts & Crafts',
      verified: true,
      joinedDate: '2021-11-20',
      totalSales: 1680,
      specialties: ['Wood Carving', 'Traditional Masks', 'Jewelry']
    },
    {
      id: '3',
      name: 'TechHub Cameroon',
      description: 'Electronics, gadgets, and tech accessories. Authorized dealer for major brands.',
      avatar: '',
      coverImage: '/placeholder.svg',
      location: 'Bamenda, Cameroon',
      rating: 4.6,
      reviewCount: 203,
      productsCount: 156,
      category: 'Electronics',
      verified: true,
      joinedDate: '2020-08-10',
      totalSales: 5230,
      specialties: ['Smartphones', 'Laptops', 'Accessories']
    },
    {
      id: '4',
      name: 'Green Fashion Store',
      description: 'Sustainable fashion and traditional Cameroonian clothing. Eco-friendly materials.',
      avatar: '',
      coverImage: '/placeholder.svg',
      location: 'Limbe, Cameroon',
      rating: 4.8,
      reviewCount: 67,
      productsCount: 78,
      category: 'Fashion',
      verified: false,
      joinedDate: '2023-01-05',
      totalSales: 890,
      specialties: ['Traditional Clothing', 'Eco Fashion', 'Accessories']
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Vendors</h1>
          <p className="text-muted-foreground">
            Discover local vendors and businesses across Cameroon
          </p>
        </div>
        <Button>
          <Store className="w-4 h-4 mr-2" />
          Become a Vendor
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">
              69% verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5K</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">432</div>
            <p className="text-xs text-muted-foreground">
              35% of total vendors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Find Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search vendors by name, category, or location..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food & Beverages</SelectItem>
                  <SelectItem value="crafts">Arts & Crafts</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="douala">Douala</SelectItem>
                  <SelectItem value="yaounde">Yaoundé</SelectItem>
                  <SelectItem value="bamenda">Bamenda</SelectItem>
                  <SelectItem value="bafoussam">Bafoussam</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4plus">4+ Stars</SelectItem>
                  <SelectItem value="3plus">3+ Stars</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockVendors.map((vendor) => (
          <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <img 
                src={vendor.coverImage} 
                alt={`${vendor.name} cover`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                {vendor.verified && (
                  <Badge variant="secondary" className="bg-white/90 text-primary">
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="relative pb-2">
              {/* Avatar positioned over cover image */}
              <div className="absolute -top-6 left-4">
                <Avatar className="w-12 h-12 border-4 border-white">
                  <AvatarImage src={vendor.avatar} />
                  <AvatarFallback>{vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              </div>

              <div className="pt-8">
                <CardTitle className="text-lg">{vendor.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {vendor.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Location and Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {vendor.location}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{vendor.rating}</span>
                  <span className="text-sm text-muted-foreground">({vendor.reviewCount})</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">{vendor.productsCount}</p>
                  <p className="text-muted-foreground">Products</p>
                </div>
                <div>
                  <p className="font-medium">{vendor.totalSales.toLocaleString()}</p>
                  <p className="text-muted-foreground">Sales</p>
                </div>
              </div>

              {/* Category Badge */}
              <div className="flex justify-center">
                <Badge variant="outline">{vendor.category}</Badge>
              </div>

              {/* Specialties */}
              <div>
                <p className="text-sm font-medium mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Store className="w-4 h-4 mr-2" />
                  View Store
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              {/* Join Date */}
              <p className="text-xs text-muted-foreground text-center">
                Member since {new Date(vendor.joinedDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Vendors
        </Button>
      </div>
    </div>
  );
};

export default VendorsPage;