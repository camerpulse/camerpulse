import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  Filter,
  Plus,
  Eye,
  Clock,
  Phone,
  Mail,
  Globe,
  Award
} from 'lucide-react';
import { AddSchoolDialog } from '@/components/schools/AddSchoolDialog';
import { SchoolCard } from '@/components/schools/SchoolCard';

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

export default function SchoolsDirectory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedOwnership, setSelectedOwnership] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const schoolTypes = ['nursery', 'primary', 'secondary', 'vocational', 'university', 'special'];
  const ownershipTypes = ['government', 'private', 'community', 'religious', 'ngo'];

  useEffect(() => {
    fetchSchools();
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

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.village_or_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.division.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || school.region === selectedRegion;
    const matchesType = selectedType === 'all' || school.school_type === selectedType;
    const matchesOwnership = selectedOwnership === 'all' || school.ownership === selectedOwnership;

    return matchesSearch && matchesRegion && matchesType && matchesOwnership;
  });

  const sortedSchools = [...filteredSchools].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'location':
        return a.village_or_city.localeCompare(b.village_or_city);
      default:
        return 0;
    }
  });

  const getVerificationBadge = (status: string) => {
    const badges = {
      verified: { label: 'Verified', variant: 'default' as const, icon: Award },
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      under_review: { label: 'Under Review', variant: 'outline' as const, icon: Eye },
      rejected: { label: 'Rejected', variant: 'destructive' as const, icon: Clock }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getSchoolTypeIcon = (type: string) => {
    const icons = {
      nursery: '🏫',
      primary: '📚',
      secondary: '🎓',
      vocational: '🛠️',
      university: '🏛️',
      special: '⭐'
    };
    return icons[type as keyof typeof icons] || '🏫';
  };

  return (
    <ServicesLayout serviceType="schools">
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <School className="h-8 w-8" />
                <h1 className="text-4xl font-bold">Schools Directory</h1>
              </div>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Discover, rate, and connect with educational institutions across Cameroon
              </p>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm">
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

            {/* Search and Add Button */}
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
                      <SelectItem key={type} value={type}>
                        {getSchoolTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
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

        {/* Results Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold">
                {filteredSchools.length} Schools Found
              </h2>
              {(searchTerm || selectedRegion !== 'all' || selectedType !== 'all' || selectedOwnership !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRegion('all');
                    setSelectedType('all');
                    setSelectedOwnership('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedSchools.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <School className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No schools found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or add a new school to the directory.
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First School
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSchools.map((school) => (
                <SchoolCard key={school.id} school={school} onUpdate={fetchSchools} />
              ))}
            </div>
          )}
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