import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MarketplaceSidebar } from '@/components/Marketplace/MarketplaceSidebar';
import { 
  Search, 
  MapPin, 
  Star, 
  Store, 
  Package, 
  Users, 
  TrendingUp,
  Filter,
  ExternalLink,
  Shield,
  Award,
  Heart,
  MessageSquare,
  Clock,
  CheckCircle,
  Grid3X3,
  List
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage: string;
  location: string;
  rating: number;
  reviewCount: number;
  productsCount: number;
  category: string;
  verified: boolean;
  joinedDate: string;
  totalSales: number;
  specialties: string[];
  responseTime: string;
  lastActive: string;
  badges: string[];
}

const VendorCard = ({ vendor, viewMode = 'grid' }: { vendor: Vendor; viewMode: 'grid' | 'list' }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Vendor Avatar & Cover */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                <img 
                  src={vendor.coverImage} 
                  alt={`${vendor.name} cover`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Avatar className="absolute -bottom-4 left-4 w-12 h-12 border-4 border-white">
                <AvatarImage src={vendor.avatar} />
                <AvatarFallback>{vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>

            {/* Vendor Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{vendor.name}</h3>
                    {vendor.verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {vendor.badges.map((badge) => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{vendor.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{vendor.rating}</span>
                    <span className="text-sm text-muted-foreground">({vendor.reviewCount})</span>
                  </div>
                  <Badge variant="outline">{vendor.category}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {vendor.location}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {vendor.productsCount} products
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {vendor.totalSales.toLocaleString()} sales
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Responds in {vendor.responseTime}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {vendor.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button 
                    variant={isFollowing ? "secondary" : "outline"} 
                    size="sm"
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Link to={`/marketplace/vendors/${vendor.name.toLowerCase().replace(/ /g, '-')}-${vendor.id}`}>
                    <Button size="sm">
                      <Store className="w-4 h-4 mr-2" />
                      View Store
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
        <img 
          src={vendor.coverImage} 
          alt={`${vendor.name} cover`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {vendor.verified && (
            <Badge className="bg-white/90 text-primary">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <div className="absolute top-2 left-2">
          {vendor.badges.map((badge) => (
            <Badge key={badge} className="bg-white/90 text-primary mb-1 block">
              {badge}
            </Badge>
          ))}
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
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="truncate">{vendor.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsFollowing(!isFollowing)}
            >
              <Heart className={`w-4 h-4 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {vendor.description}
          </p>
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

        {/* Response Time */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Responds in {vendor.responseTime}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link 
            to={`/marketplace/vendors/${vendor.name.toLowerCase().replace(/ /g, '-')}-${vendor.id}`}
            className="flex-1"
          >
            <Button className="w-full" size="sm">
              <Store className="w-4 h-4 mr-2" />
              View Store
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>

        {/* Join Date */}
        <p className="text-xs text-muted-foreground text-center">
          Member since {new Date(vendor.joinedDate).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

const MarketplaceVendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data
  const mockVendors: Vendor[] = Array.from({ length: 24 }, (_, i) => ({
    id: `vendor-${i + 1}`,
    name: `${['Mama Ngozi', 'Artisan Crafts', 'TechHub', 'Green Fashion', 'Local Foods', 'Digital Store'][i % 6]} ${Math.ceil((i + 1) / 6)}`,
    description: `${['Traditional Cameroonian foods and spices', 'Handmade crafts and art pieces', 'Electronics and tech accessories', 'Sustainable fashion items', 'Local produce and beverages', 'Digital products and services'][i % 6]}. Family business with years of experience.`,
    avatar: `https://images.unsplash.com/photo-${1500000000000 + i}?w=100&h=100&fit=crop&crop=face`,
    coverImage: `https://images.unsplash.com/photo-${1600000000000 + i}?w=400&h=200&fit=crop`,
    location: ['Douala', 'Yaoundé', 'Bamenda', 'Bafoussam', 'Limbe', 'Kribi'][i % 6],
    rating: 3.5 + Math.random() * 1.5,
    reviewCount: Math.floor(Math.random() * 200) + 10,
    productsCount: Math.floor(Math.random() * 100) + 5,
    category: ['Food & Beverages', 'Arts & Crafts', 'Electronics', 'Fashion', 'Home & Garden', 'Digital Services'][i % 6],
    verified: Math.random() > 0.3,
    joinedDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
    totalSales: Math.floor(Math.random() * 5000) + 100,
    specialties: [
      ['Traditional Spices', 'Palm Oil', 'Dried Fish'],
      ['Wood Carving', 'Traditional Masks', 'Jewelry'],
      ['Smartphones', 'Laptops', 'Accessories'],
      ['Traditional Clothing', 'Eco Fashion', 'Accessories'],
      ['Furniture', 'Decoration', 'Garden Tools'],
      ['Web Design', 'Software', 'Consulting']
    ][i % 6],
    responseTime: ['1 hour', '2 hours', '30 minutes', '4 hours', '1 day'][Math.floor(Math.random() * 5)],
    lastActive: Math.random() > 0.5 ? 'Online now' : `${Math.floor(Math.random() * 7) + 1} days ago`,
    badges: Math.random() > 0.7 ? ['Top Seller'] : Math.random() > 0.5 ? ['Fast Shipping'] : []
  }));

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVendors(mockVendors);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    if (searchTerm && !vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !vendor.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && vendor.category.toLowerCase() !== categoryFilter) {
      return false;
    }
    if (locationFilter !== 'all' && vendor.location.toLowerCase() !== locationFilter) {
      return false;
    }
    return true;
  });

  const sortedVendors = [...filteredVendors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'sales':
        return b.totalSales - a.totalSales;
      case 'products':
        return b.productsCount - a.productsCount;
      case 'newest':
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
      default:
        return 0; // relevance
    }
  });

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <MarketplaceSidebar />
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-6">
              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Marketplace Vendors</h1>
                  <p className="text-muted-foreground">
                    Discover trusted vendors and businesses across Cameroon
                  </p>
                </div>
                <Link to="/marketplace/sell">
                  <Button>
                    <Store className="w-4 h-4 mr-2" />
                    Become a Vendor
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Store className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{vendors.length}</div>
                    <div className="text-sm text-muted-foreground">Total Vendors</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{vendors.filter(v => v.verified).length}</div>
                    <div className="text-sm text-muted-foreground">Verified</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{vendors.reduce((sum, v) => sum + v.productsCount, 0)}</div>
                    <div className="text-sm text-muted-foreground">Total Products</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{vendors.filter(v => v.lastActive === 'Online now').length}</div>
                    <div className="text-sm text-muted-foreground">Online Now</div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search vendors by name, category, or location..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="food & beverages">Food & Beverages</SelectItem>
                            <SelectItem value="arts & crafts">Arts & Crafts</SelectItem>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="fashion">Fashion</SelectItem>
                            <SelectItem value="home & garden">Home & Garden</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            <SelectItem value="douala">Douala</SelectItem>
                            <SelectItem value="yaoundé">Yaoundé</SelectItem>
                            <SelectItem value="bamenda">Bamenda</SelectItem>
                            <SelectItem value="bafoussam">Bafoussam</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">Relevance</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                            <SelectItem value="sales">Most Sales</SelectItem>
                            <SelectItem value="products">Most Products</SelectItem>
                            <SelectItem value="newest">Newest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {sortedVendors.length} vendors found
                        </span>
                        <div className="flex border rounded-lg">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-r-none"
                          >
                            <Grid3X3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-l-none"
                          >
                            <List className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vendors Grid/List */}
              {loading ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {[...Array(12)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-32 bg-muted"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {sortedVendors.map((vendor) => (
                    <VendorCard key={vendor.id} vendor={vendor} viewMode={viewMode} />
                  ))}
                </div>
              )}

              {/* Load More */}
              {sortedVendors.length > 0 && (
                <div className="text-center">
                  <Button variant="outline" size="lg">
                    Load More Vendors
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MarketplaceVendors;