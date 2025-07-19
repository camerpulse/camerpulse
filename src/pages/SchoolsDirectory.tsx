import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServicesLayout } from '@/components/Layout/ServicesLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  School, 
  MapPin, 
  Star, 
  Users, 
  GraduationCap, 
  Search,
  Plus,
  Eye,
  Clock,
  Phone,
  Mail,
  Globe,
  Award,
  TrendingUp,
  BookOpen,
  Building,
  Shield,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { AddSchoolDialog } from '@/components/schools/AddSchoolDialog';
import { SchoolCard } from '@/components/schools/SchoolCard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface School {
  id: string;
  name: string;
  school_type: string;
  ownership: string;
  region: string;
  division: string;
  village_or_city: string;
  languages_taught: string[];
  programs_offered?: string;
  photo_gallery: string[];
  founder_or_don?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_website?: string;
  verification_status: string;
  claim_status: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
  established_year?: number;
  student_capacity?: number;
  current_enrollment?: number;
  fees_range_min?: number;
  fees_range_max?: number;
  average_rating: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  school_name: string;
  category: string;
  date: string;
}

export default function SchoolsDirectory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [featuredSchools, setFeaturedSchools] = useState<School[]>([]);
  const [topRatedSchools, setTopRatedSchools] = useState<School[]>([]);
  const [institutionNews, setInstitutionNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedOwnership, setSelectedOwnership] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [activeTab, setActiveTab] = useState('all');

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const schoolTypes = [
    { value: 'nursery', label: 'Nursery', icon: '🧸' },
    { value: 'primary', label: 'Primary', icon: '📚' },
    { value: 'secondary', label: 'Secondary', icon: '🎓' },
    { value: 'vocational', label: 'Vocational', icon: '🛠️' },
    { value: 'university', label: 'University', icon: '🏛️' },
    { value: 'special', label: 'Special Needs', icon: '⭐' }
  ];

  const ownershipTypes = ['government', 'private', 'community', 'religious', 'ngo'];

  useEffect(() => {
    fetchSchools();
    fetchFeaturedSchools();
    fetchTopRatedSchools();
    fetchInstitutionNews();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: "Error",
        description: "Failed to load schools directory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('verification_status', 'verified')
        .order('average_rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedSchools(data || []);
    } catch (error) {
      console.error('Error fetching featured schools:', error);
    }
  };

  const fetchTopRatedSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .gte('average_rating', 4.0)
        .order('average_rating', { ascending: false })
        .limit(8);

      if (error) throw error;
      setTopRatedSchools(data || []);
    } catch (error) {
      console.error('Error fetching top rated schools:', error);
    }
  };

  const fetchInstitutionNews = async () => {
    // Mock news data - in real implementation, this would come from a news table
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'Government Announces New Educational Infrastructure Program',
        summary: 'Major investment in rural school development across all regions',
        school_name: 'Ministry of Education',
        category: 'Policy',
        date: '2024-01-15'
      },
      {
        id: '2',
        title: 'Outstanding Performance in National Exams',
        summary: 'Several schools achieve 100% pass rates in recent examinations',
        school_name: 'Various Schools',
        category: 'Achievement',
        date: '2024-01-10'
      },
      {
        id: '3',
        title: 'New STEM Laboratory Inaugurated',
        summary: 'State-of-the-art facilities now available for science education',
        school_name: 'Cameroon College of Arts',
        category: 'Infrastructure',
        date: '2024-01-08'
      }
    ];
    setInstitutionNews(mockNews);
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.village_or_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.division.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || school.region === selectedRegion;
    const matchesType = selectedType === 'all' || school.school_type === selectedType;
    const matchesOwnership = selectedOwnership === 'all' || school.ownership === selectedOwnership;

    return matchesSearch && matchesRegion && matchesType && matchesOwnership;
  });

  const getFilteredSchoolsByType = (type: string) => {
    if (type === 'all') return filteredSchools;
    return filteredSchools.filter(school => school.school_type === type);
  };

  const getVerificationBadge = (status: string) => {
    const badges = {
      verified: { label: 'Verified', variant: 'default' as const, icon: Award },
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      under_review: { label: 'Under Review', variant: 'outline' as const, icon: Eye },
      rejected: { label: 'Rejected', variant: 'destructive' as const, icon: Clock }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <ServicesLayout serviceType="schools">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <School className="h-10 w-10" />
                <h1 className="text-4xl font-bold">Schools Directory</h1>
              </div>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-6">
                Discover, rate, and connect with educational institutions across Cameroon
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{schools.length} Schools</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>All 10 Regions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Community Rated</span>
                </div>
              </div>
            </div>

            {/* Search Bar with Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search schools by name, city, or division..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  />
                </div>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add School
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {schoolTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedOwnership} onValueChange={setSelectedOwnership}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Ownership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ownership</SelectItem>
                    {ownershipTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Featured Schools Slider */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Featured Schools
              </h2>
              <Button variant="outline" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSchools.slice(0, 6).map((school) => (
                <Card key={school.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          {school.name}
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {school.village_or_city}, {school.region}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(school.average_rating)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{school.school_type}</span>
                      <span className="capitalize">{school.ownership}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Top Rated Schools Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Top Rated Schools
              </h2>
              <Button variant="outline" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topRatedSchools.slice(0, 8).map((school) => (
                <Card key={school.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(school.average_rating)}
                      <span className="text-sm font-medium ml-1">
                        {school.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{school.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {school.village_or_city}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {school.total_ratings} ratings
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* School Type Tabs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Browse by School Type
            </h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">All</TabsTrigger>
                {schoolTypes.map(type => (
                  <TabsTrigger key={type.value} value={type.value}>
                    <span className="hidden sm:inline">{type.icon}</span>
                    <span className="ml-1">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {getFilteredSchoolsByType('all').slice(0, 9).map((school) => (
                    <SchoolCard key={school.id} school={school} onUpdate={fetchSchools} />
                  ))}
                </div>
              </TabsContent>
              
              {schoolTypes.map(type => (
                <TabsContent key={type.value} value={type.value}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {getFilteredSchoolsByType(type.value).slice(0, 9).map((school) => (
                      <SchoolCard key={school.id} school={school} onUpdate={fetchSchools} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>

          {/* Verified Badge Legend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Verification System
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="default">Verified</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Official documents confirmed, location verified by community
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Under review by our moderation team
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <Badge variant="outline">Under Review</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Additional verification steps in progress
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="h-5 w-5 text-primary" />
                  <Badge variant="default">Community Added</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Added by community members, awaiting verification
                </p>
              </Card>
            </div>
          </section>

          {/* Institution News Feed */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Education News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {institutionNews.map((news) => (
                <Card key={news.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{news.category}</Badge>
                      <span className="text-sm text-muted-foreground">{news.date}</span>
                    </div>
                    <CardTitle className="text-lg">{news.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{news.summary}</p>
                    <p className="text-sm font-medium">{news.school_name}</p>
                    <Button variant="link" className="p-0 h-auto mt-2">
                      Read More <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center py-12 bg-primary/5 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Add Your School to the Directory</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Help build the most comprehensive educational directory in Cameroon. 
              List your school to connect with students, parents, and the community.
            </p>
            <Button size="lg" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add Your School
            </Button>
          </section>
        </div>

        {/* Add School Dialog */}
        <AddSchoolDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
          onSuccess={fetchSchools}
        />
      </div>
    </ServicesLayout>
  );
}