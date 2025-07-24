import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Filter, Phone, Globe, Clock, Heart, Users, Building, Star, AlertTriangle, Ambulance, Shield, TrendingUp, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HospitalCard } from '@/components/hospitals/HospitalCard';
import { AddHospitalDialog } from '@/components/hospitals/AddHospitalDialog';
import { HospitalRatingDialog } from '@/components/hospitals/HospitalRatingDialog';
import { HospitalDetailsDialog } from '@/components/hospitals/HospitalDetailsDialog';

interface Hospital {
  id: string;
  name: string;
  type: string;
  ownership: string;
  region: string;
  division: string;
  village_or_city: string;
  emergency_services: boolean;
  working_hours?: string;
  services_offered?: string[];
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  verification_status: string;
  overall_rating: number;
  total_ratings: number;
  created_at: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  hospital_name: string;
  category: string;
  date: string;
}

export default function HospitalsDirectory() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [featuredHospitals, setFeaturedHospitals] = useState<Hospital[]>([]);
  const [emergencyHospitals, setEmergencyHospitals] = useState<Hospital[]>([]);
  const [hospitalNews, setHospitalNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const hospitalTypes = [
    { value: 'general', label: 'General Hospital', icon: '🏥' },
    { value: 'private_clinic', label: 'Private Clinic', icon: '🏠' },
    { value: 'district', label: 'District Hospital', icon: '🏢' },
    { value: 'diagnostic_center', label: 'Diagnostic Center', icon: '🔬' },
    { value: 'emergency', label: 'Emergency Center', icon: '🚑' },
    { value: 'traditional', label: 'Traditional Medicine', icon: '🌿' }
  ];

  const ownershipTypes = [
    'government', 'private', 'community', 'mission', 'ngo'
  ];

  useEffect(() => {
    fetchHospitals();
    fetchFeaturedHospitals();
    fetchEmergencyHospitals();
    fetchHospitalNews();
  }, []);

  const fetchHospitals = async () => {
    try {
      let query = supabase
        .from('hospitals')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,village_or_city.ilike.%${searchQuery}%,division.ilike.%${searchQuery}%`);
      }

      if (selectedRegion && selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      if (selectedType && selectedType !== 'all') {
        query = query.eq('type', selectedType as any);
      }

      if (selectedOwnership) {
        query = query.eq('ownership', selectedOwnership as any);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching hospitals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load hospitals',
          variant: 'destructive',
        });
        return;
      }

      setHospitals(data || []);
    } catch (error) {
      console.error('Error in fetchHospitals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hospitals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('verification_status', 'verified')
        .order('overall_rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedHospitals(data || []);
    } catch (error) {
      console.error('Error fetching featured hospitals:', error);
    }
  };

  const fetchEmergencyHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('emergency_services', true)
        .order('overall_rating', { ascending: false })
        .limit(8);

      if (error) throw error;
      setEmergencyHospitals(data || []);
    } catch (error) {
      console.error('Error fetching emergency hospitals:', error);
    }
  };

  const fetchHospitalNews = async () => {
    // Mock news data - in real implementation, this would come from a news table
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'New Cardiac Surgery Unit Opens at Regional Hospital',
        summary: 'Advanced cardiac care now available in the North West region',
        hospital_name: 'Bamenda Regional Hospital',
        category: 'Infrastructure',
        date: '2024-01-15'
      },
      {
        id: '2',
        title: 'Free Medical Outreach in Rural Communities',
        summary: 'Mobile clinic provides essential healthcare services',
        hospital_name: 'Hope Medical Center',
        category: 'Community',
        date: '2024-01-12'
      },
      {
        id: '3',
        title: 'Emergency Response Time Improved by 40%',
        summary: 'New ambulance fleet enhances emergency services',
        hospital_name: 'Douala General Hospital',
        category: 'Emergency',
        date: '2024-01-10'
      }
    ];
    setHospitalNews(mockNews);
  };

  useEffect(() => {
    fetchHospitals();
  }, [searchQuery, selectedRegion, selectedType, selectedOwnership]);

  const handleViewDetails = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowDetailsDialog(true);
  };

  const handleRateHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowRateDialog(true);
  };

  const handleHospitalAdded = () => {
    setShowAddDialog(false);
    fetchHospitals();
    toast({
      title: 'Success',
      description: 'Hospital added successfully!',
    });
  };

  const handleRatingAdded = () => {
    setShowRateDialog(false);
    fetchHospitals();
    toast({
      title: 'Success',
      description: 'Rating submitted successfully!',
    });
  };

  const getHospitalsByType = (type: string) => {
    if (type === 'all') return hospitals;
    return hospitals.filter(hospital => hospital.type === type);
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
    <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="h-10 w-10" />
                <h1 className="text-4xl font-bold">Hospitals Directory</h1>
              </div>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-6">
                Find quality healthcare facilities and emergency services across Cameroon
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{hospitals.length} Hospitals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ambulance className="h-4 w-4" />
                  <span>{hospitals.filter(h => h.emergency_services).length} Emergency Centers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{hospitals.filter(h => h.verification_status === 'verified').length} Verified</span>
                </div>
              </div>
            </div>

            {/* Emergency Map Locator Alert */}
            <Alert className="mb-6 bg-red-100 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Emergency?</strong> Call 119 for immediate assistance or use the emergency locator below to find the nearest hospital.
              </AlertDescription>
            </Alert>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search hospitals, emergency centers, clinics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  />
                </div>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-white text-red-600 hover:bg-white/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hospital
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {cameroonRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {hospitalTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <MapPin className="h-4 w-4 mr-2" />
                  Emergency Locator
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Emergency Services Quick Access */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Ambulance className="h-6 w-6 text-red-600" />
                Emergency Services
              </h2>
              <Button variant="outline" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {emergencyHospitals.slice(0, 8).map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-lg transition-shadow border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Ambulance className="h-4 w-4 text-red-600" />
                      <Badge variant="destructive" className="text-xs">24/7</Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{hospital.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {hospital.village_or_city}, {hospital.region}
                    </p>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(hospital.overall_rating)}
                    </div>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Hospital Type Tabs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              Browse by Hospital Type
            </h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">All</TabsTrigger>
                {hospitalTypes.map(type => (
                  <TabsTrigger key={type.value} value={type.value}>
                    <span className="hidden sm:inline">{type.icon}</span>
                    <span className="ml-1 text-xs">{type.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {hospitals.slice(0, 9).map((hospital) => (
                    <HospitalCard
                      key={hospital.id}
                      hospital={hospital}
                      onViewDetails={handleViewDetails}
                      onRate={handleRateHospital}
                    />
                  ))}
                </div>
              </TabsContent>
              
              {hospitalTypes.map(type => (
                <TabsContent key={type.value} value={type.value}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {getHospitalsByType(type.value).slice(0, 9).map((hospital) => (
                      <HospitalCard
                        key={hospital.id}
                        hospital={hospital}
                        onViewDetails={handleViewDetails}
                        onRate={handleRateHospital}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>

          {/* Featured Hospitals */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Featured Hospitals
              </h2>
              <Button variant="outline" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHospitals.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          {hospital.name}
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {hospital.village_or_city}, {hospital.region}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(hospital.overall_rating)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{hospital.type.replace('_', ' ')}</span>
                      <span className="capitalize">{hospital.ownership}</span>
                    </div>
                    {hospital.emergency_services && (
                      <Badge variant="destructive" className="mt-2 text-xs">
                        <Ambulance className="h-3 w-3 mr-1" />
                        Emergency Services
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Rating Explainer Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Understanding Hospital Ratings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">Cleanliness</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Hygiene standards and facility maintenance
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">Staff Quality</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Professional attitude and response time
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Ambulance className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Emergency Response</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Speed and efficiency of emergency care
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold">Facilities</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Equipment quality and availability
                </p>
              </Card>
            </div>
          </section>

          {/* Verified Legend Explained */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Verification System
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <Badge variant="default">Verified</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Official registration confirmed, licenses verified by health ministry
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Documentation under review by health authorities
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <Badge variant="outline">Community Added</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Added by community members, awaiting official verification
                </p>
              </Card>
            </div>
          </section>

          {/* Hospital News Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Healthcare News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hospitalNews.map((news) => (
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
                    <p className="text-sm font-medium">{news.hospital_name}</p>
                    <Button variant="link" className="p-0 h-auto mt-2">
                      Read More <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Add Hospital CTA */}
          <section className="text-center py-12 bg-red-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Add Your Hospital to the Directory</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Help patients find your healthcare facility. Join the largest medical directory in Cameroon 
              and connect with those who need your services.
            </p>
            <Button size="lg" onClick={() => setShowAddDialog(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-5 w-5 mr-2" />
              Add Your Hospital
            </Button>
          </section>
        </div>

        {/* Dialogs */}
        <AddHospitalDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onHospitalAdded={handleHospitalAdded}
        />

        {selectedHospital && (
          <>
            <HospitalRatingDialog
              open={showRateDialog}
              onOpenChange={setShowRateDialog}
              hospital={selectedHospital}
              onRatingAdded={handleRatingAdded}
            />

            <HospitalDetailsDialog
              open={showDetailsDialog}
              onOpenChange={setShowDetailsDialog}
              hospital={selectedHospital}
              onRate={() => {
                setShowDetailsDialog(false);
                setShowRateDialog(true);
              }}
            />
          </>
        )}
      </div>
  );
}