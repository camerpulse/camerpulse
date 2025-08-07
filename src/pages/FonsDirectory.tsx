import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Crown, Filter, Search, MapPin, Star, Users, 
  ChevronDown, Grid, List, Eye, Calendar,
  Sparkles, Award, Shield, Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TraditionalLeader {
  id: string;
  full_name: string;
  title: string;
  village_id?: string;
  region: string;
  division?: string;
  subdivision?: string;
  gender?: string;
  accession_date?: string;
  biography?: string;
  portrait_url?: string;
  overall_rating: number;
  total_ratings: number;
  is_verified: boolean;
  status: string;
  slug: string;
  villages?: {
    village_name: string;
  };
}

const FonsDirectory = () => {
  const [leaders, setLeaders] = useState<TraditionalLeader[]>([]);
  const [filteredLeaders, setFilteredLeaders] = useState<TraditionalLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedTitle, setSelectedTitle] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [minRatings, setMinRatings] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const titles = [
    { value: 'fon', label: 'Fon', emoji: '👑' },
    { value: 'chief', label: 'Chief', emoji: '🏛️' },
    { value: 'sultan', label: 'Sultan', emoji: '🕌' },
    { value: 'lamido', label: 'Lamido', emoji: '⚔️' },
    { value: 'emir', label: 'Emir', emoji: '🌟' },
    { value: 'oba', label: 'Oba', emoji: '👑' },
    { value: 'sarki', label: 'Sarki', emoji: '🏰' },
    { value: 'etsu', label: 'Etsu', emoji: '🔱' },
    { value: 'mai', label: 'Mai', emoji: '⭐' }
  ];

  useEffect(() => {
    fetchLeaders();
  }, []);

  useEffect(() => {
    filterLeaders();
  }, [leaders, searchTerm, selectedRegion, selectedTitle, selectedGender, minRatings, sortBy, showVerifiedOnly]);

  const fetchLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from('traditional_leaders')
        .select(`
          *,
          villages:village_id(village_name)
        `)
        .eq('status', 'active')
        .order('overall_rating', { ascending: false });

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching traditional leaders:', error);
      toast.error('Failed to load traditional leaders');
    } finally {
      setLoading(false);
    }
  };

  const filterLeaders = () => {
    let filtered = [...leaders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(leader =>
        leader.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leader.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leader.villages?.village_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Region filter
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(leader => leader.region === selectedRegion);
    }

    // Title filter
    if (selectedTitle !== 'all') {
      filtered = filtered.filter(leader => leader.title === selectedTitle);
    }

    // Gender filter
    if (selectedGender !== 'all') {
      filtered = filtered.filter(leader => leader.gender === selectedGender);
    }

    // Minimum ratings filter
    if (minRatings > 0) {
      filtered = filtered.filter(leader => leader.total_ratings >= minRatings);
    }

    // Verified only filter
    if (showVerifiedOnly) {
      filtered = filtered.filter(leader => leader.is_verified);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.overall_rating - a.overall_rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
        break;
      case 'region':
        filtered.sort((a, b) => a.region.localeCompare(b.region));
        break;
      case 'reviews':
        filtered.sort((a, b) => b.total_ratings - a.total_ratings);
        break;
    }

    setFilteredLeaders(filtered);
  };

  const getTitleInfo = (title: string) => {
    return titles.find(t => t.value === title) || { label: title, emoji: '👑' };
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-amber-400/50 text-amber-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRegion('all');
    setSelectedTitle('all');
    setSelectedGender('all');
    setMinRatings(0);
    setShowVerifiedOnly(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="relative bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 text-white">
          {/* African Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }} />
          </div>
          
          <div className="relative container mx-auto px-4 py-16">
            <div className="animate-pulse">
              <div className="h-12 bg-white/20 rounded w-1/3 mb-4" />
              <div className="h-6 bg-white/20 rounded w-2/3" />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="animate-pulse bg-white rounded-lg p-6 shadow-lg">
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Hero Header with African Patterns */}
      <div className="relative bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 text-white overflow-hidden">
        {/* African Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        {/* Cowrie Shell Decorations */}
        <div className="absolute top-4 right-4 opacity-20">
          <div className="flex space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-amber-200 rounded-full opacity-60" />
            ))}
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Crown className="h-12 w-12 text-amber-300 mr-4" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-200 to-orange-100 bg-clip-text text-transparent">
                Fons Directory
              </h1>
              <Crown className="h-12 w-12 text-amber-300 ml-4" />
            </div>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              Honoring the traditional leadership of Cameroon - Preserving our royal heritage 
              and celebrating the wisdom of our Fons, Chiefs, Sultans, and Lamidos
            </p>
            <div className="flex items-center justify-center mt-6 space-x-6 text-amber-200">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>{leaders.length} Traditional Leaders</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span>{leaders.filter(l => l.is_verified).length} Verified</span>
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                <span>{regions.length} Regions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-lg border-amber-200 bg-gradient-to-b from-white to-amber-50/30">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-amber-700 hover:text-amber-900"
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-semibold text-amber-900 mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-600" />
                    <Input
                      placeholder="Search by name, village, or region..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-amber-200 focus:border-amber-400"
                    />
                  </div>
                </div>

                <Separator className="bg-amber-200" />

                {/* Region Filter */}
                <div>
                  <label className="text-sm font-semibold text-amber-900 mb-2 block">Region</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title Filter */}
                <div>
                  <label className="text-sm font-semibold text-amber-900 mb-2 block">Traditional Title</label>
                  <Select value={selectedTitle} onValueChange={setSelectedTitle}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400">
                      <SelectValue placeholder="All Titles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Titles</SelectItem>
                      {titles.map(title => (
                        <SelectItem key={title.value} value={title.value}>
                          <span className="flex items-center">
                            <span className="mr-2">{title.emoji}</span>
                            {title.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="text-sm font-semibold text-amber-900 mb-2 block">Gender</label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400">
                      <SelectValue placeholder="All Genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Verified Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="verified" 
                    checked={showVerifiedOnly}
                    onCheckedChange={(checked) => setShowVerifiedOnly(checked as boolean)}
                    className="border-amber-400 data-[state=checked]:bg-amber-600"
                  />
                  <label htmlFor="verified" className="text-sm font-medium text-amber-900">
                    Verified Leaders Only
                  </label>
                </div>

                <Separator className="bg-amber-200" />

                {/* Sort Options */}
                <div>
                  <label className="text-sm font-semibold text-amber-900 mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="region">Region</SelectItem>
                      <SelectItem value="reviews">Most Reviewed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-amber-900">
                  {filteredLeaders.length} Traditional Leader{filteredLeaders.length !== 1 ? 's' : ''}
                </h2>
                <p className="text-amber-700">Honoring our cultural heritage and traditional leadership</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Leaders Grid/List */}
            {filteredLeaders.length === 0 ? (
              <Card className="text-center p-12 border-amber-200">
                <Crown className="h-16 w-16 mx-auto text-amber-400 mb-4" />
                <h3 className="text-xl font-semibold text-amber-900 mb-2">No leaders found</h3>
                <p className="text-amber-700 mb-4">
                  Try adjusting your search filters or explore different regions
                </p>
                <Button onClick={clearFilters} className="bg-amber-600 hover:bg-amber-700">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredLeaders.map((leader) => {
                  const titleInfo = getTitleInfo(leader.title);
                  
                  return (
                    <Card 
                      key={leader.id} 
                      className="group hover:shadow-xl transition-all duration-300 border-amber-200 bg-gradient-to-b from-white to-amber-50/30 overflow-hidden"
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {/* Portrait */}
                          <div className="relative h-48 bg-gradient-to-b from-amber-100 to-orange-100 overflow-hidden">
                            {leader.portrait_url ? (
                              <img 
                                src={leader.portrait_url} 
                                alt={leader.full_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Avatar className="w-24 h-24 border-4 border-amber-300">
                                  <AvatarFallback className="bg-amber-200 text-amber-800 text-2xl font-bold">
                                    {leader.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}
                            
                            {/* Decorative Frame */}
                            <div className="absolute inset-0 border-4 border-amber-300/50 pointer-events-none" />
                            
                            {/* Status Badges */}
                            <div className="absolute top-2 left-2 flex space-x-1">
                              {leader.is_verified && (
                                <Badge className="bg-emerald-600 text-white">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              <Badge className="bg-amber-600 text-white">
                                <span className="mr-1">{titleInfo.emoji}</span>
                                {titleInfo.label}
                              </Badge>
                            </div>
                            
                            {/* Rating Badge */}
                            {leader.total_ratings > 0 && (
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                                <span className="text-xs font-medium text-amber-900">
                                  {leader.overall_rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-bold text-lg text-amber-900 line-clamp-1">
                                  {leader.full_name}
                                </h3>
                                <div className="flex items-center text-amber-700 text-sm">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{leader.villages?.village_name || 'Multiple Villages'}, {leader.region}</span>
                                </div>
                              </div>
                              
                              {leader.total_ratings > 0 && (
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center">
                                    {renderStars(leader.overall_rating)}
                                  </div>
                                  <span className="text-sm text-amber-700">
                                    ({leader.total_ratings} review{leader.total_ratings !== 1 ? 's' : ''})
                                  </span>
                                </div>
                              )}
                              
                              {leader.biography && (
                                <p className="text-sm text-amber-800 line-clamp-2">
                                  {leader.biography}
                                </p>
                              )}
                              
                              <div className="pt-2">
                                <Link to={`/fons/${leader.slug}`}>
                                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </>
                      ) : (
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-16 h-16 border-2 border-amber-300">
                              <AvatarImage src={leader.portrait_url} />
                              <AvatarFallback className="bg-amber-200 text-amber-800 font-bold">
                                {leader.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-amber-900 truncate">
                                  {leader.full_name}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  {leader.is_verified && (
                                    <Badge className="bg-emerald-600 text-white">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                  <Badge className="bg-amber-600 text-white">
                                    <span className="mr-1">{titleInfo.emoji}</span>
                                    {titleInfo.label}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex items-center text-amber-700 text-sm mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{leader.villages?.village_name || 'Multiple Villages'}, {leader.region}</span>
                              </div>
                              
                              {leader.total_ratings > 0 && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <div className="flex items-center">
                                    {renderStars(leader.overall_rating)}
                                  </div>
                                  <span className="text-sm text-amber-700">
                                    ({leader.total_ratings} review{leader.total_ratings !== 1 ? 's' : ''})
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <Link to={`/fons/${leader.slug}`}>
                                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FonsDirectory;