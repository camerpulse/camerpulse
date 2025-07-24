import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  MapPin,
  Star,
  Users,
  Phone,
  Mail,
  Clock,
  Search,
  Filter,
  Building2,
  BookOpen,
  Award,
  TrendingUp,
  Eye,
  Plus
} from 'lucide-react';

interface School {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'university' | 'technical';
  location: string;
  region: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  establishedYear: number;
  phone?: string;
  email?: string;
  website?: string;
  description: string;
  facilities: string[];
  isVerified: boolean;
  isPublic: boolean;
}

const SchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [loading, setLoading] = useState(true);

  const mockSchools: School[] = [
    {
      id: '1',
      name: 'Université de Yaoundé I',
      type: 'university',
      location: 'Yaoundé',
      region: 'Centre',
      rating: 4.5,
      reviewCount: 234,
      studentCount: 45000,
      establishedYear: 1962,
      phone: '+237 222 234 567',
      email: 'info@uy1.uninet.cm',
      website: 'www.uy1.uninet.cm',
      description: 'Premier university in Cameroon offering diverse academic programs.',
      facilities: ['Library', 'Research Centers', 'Computer Labs', 'Sports Complex'],
      isVerified: true,
      isPublic: true
    },
    {
      id: '2',
      name: 'Lycée Général Leclerc',
      type: 'secondary',
      location: 'Yaoundé',
      region: 'Centre',
      rating: 4.2,
      reviewCount: 89,
      studentCount: 2500,
      establishedYear: 1952,
      phone: '+237 222 123 456',
      description: 'Leading secondary school with excellent academic performance.',
      facilities: ['Science Labs', 'Library', 'Sports Field', 'Art Studio'],
      isVerified: true,
      isPublic: true
    },
    {
      id: '3',
      name: 'École Publique de Bali',
      type: 'primary',
      location: 'Bali',
      region: 'Northwest',
      rating: 3.8,
      reviewCount: 45,
      studentCount: 800,
      establishedYear: 1975,
      description: 'Community primary school serving rural areas.',
      facilities: ['Playground', 'Library', 'Computer Room'],
      isVerified: true,
      isPublic: true
    },
    {
      id: '4',
      name: 'Collège Privé Bilingue',
      type: 'secondary',
      location: 'Douala',
      region: 'Littoral',
      rating: 4.0,
      reviewCount: 67,
      studentCount: 1200,
      establishedYear: 1985,
      phone: '+237 233 456 789',
      description: 'Bilingual private college with modern facilities.',
      facilities: ['Language Labs', 'Science Labs', 'Swimming Pool', 'Tennis Court'],
      isVerified: true,
      isPublic: false
    },
    {
      id: '5',
      name: 'University of Buea',
      type: 'university',
      location: 'Buea',
      region: 'Southwest',
      rating: 4.3,
      reviewCount: 156,
      studentCount: 15000,
      establishedYear: 1993,
      phone: '+237 233 322 134',
      email: 'info@ubuea.cm',
      website: 'www.ubuea.cm',
      description: 'Anglo-Saxon university system with quality education.',
      facilities: ['Modern Labs', 'Digital Library', 'Research Centers', 'Student Housing'],
      isVerified: true,
      isPublic: true
    }
  ];

  const schoolTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'primary', label: 'Primary Schools' },
    { value: 'secondary', label: 'Secondary Schools' },
    { value: 'university', label: 'Universities' },
    { value: 'technical', label: 'Technical Schools' }
  ];

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'centre', label: 'Centre' },
    { value: 'littoral', label: 'Littoral' },
    { value: 'west', label: 'West' },
    { value: 'northwest', label: 'Northwest' },
    { value: 'southwest', label: 'Southwest' },
    { value: 'north', label: 'North' },
    { value: 'adamawa', label: 'Adamawa' },
    { value: 'east', label: 'East' },
    { value: 'south', label: 'South' },
    { value: 'far-north', label: 'Far North' }
  ];

  useEffect(() => {
    setTimeout(() => {
      setSchools(mockSchools);
      setFilteredSchools(mockSchools);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = schools;

    if (searchQuery) {
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(school => school.type === selectedType);
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(school => 
        school.region.toLowerCase() === selectedRegion
      );
    }

    setFilteredSchools(filtered);
  }, [schools, searchQuery, selectedType, selectedRegion]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'primary': return 'Primary';
      case 'secondary': return 'Secondary';
      case 'university': return 'University';
      case 'technical': return 'Technical';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-green-100 text-green-800';
      case 'secondary': return 'bg-blue-100 text-blue-800';
      case 'university': return 'bg-purple-100 text-purple-800';
      case 'technical': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { label: 'Total Schools', value: '12,500+', icon: GraduationCap },
    { label: 'Students', value: '2.8M+', icon: Users },
    { label: 'Universities', value: '85+', icon: BookOpen },
    { label: 'Average Rating', value: '4.2', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Schools Directory
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Discover and rate educational institutions across Cameroon. 
              Find the best schools for quality education and community development.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white text-gray-900"
              />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {schoolTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="directory">School Directory</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Educational Institutions</h2>
                <p className="text-muted-foreground">
                  {loading ? 'Loading...' : `${filteredSchools.length} schools found`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
                <Link to="/schools/add">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add School
                  </Button>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                      <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSchools.map((school) => (
                  <Card key={school.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2 flex items-center gap-2">
                            {school.name}
                            {school.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                ✓ Verified
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            <Badge className={getTypeColor(school.type)}>
                              {getTypeLabel(school.type)}
                            </Badge>
                            <Badge variant={school.isPublic ? "default" : "outline"}>
                              {school.isPublic ? 'Public' : 'Private'}
                            </Badge>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{school.rating}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {school.reviewCount} reviews
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{school.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{school.location}, {school.region}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span>{school.studentCount.toLocaleString()} students</span>
                        </div>
                        {school.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>{school.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>Est. {school.establishedYear}</span>
                        </div>
                      </div>

                      {school.facilities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Facilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {school.facilities.slice(0, 3).map((facility, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {facility}
                              </Badge>
                            ))}
                            {school.facilities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{school.facilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {Math.floor(Math.random() * 500) + 100} views
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/schools/${school.id}`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                          <Button size="sm">
                            Rate School
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && filteredSchools.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No schools found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or browse all schools.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedType('all');
                      setSelectedRegion('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Schools Map</CardTitle>
                <CardDescription>
                  Interactive map showing school locations across Cameroon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Map component will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rankings">
            <Card>
              <CardHeader>
                <CardTitle>School Rankings</CardTitle>
                <CardDescription>
                  Top-rated schools by category and region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Rankings will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SchoolsPage;