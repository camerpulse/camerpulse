import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Clock, Star, Shield, Pill, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Pharmacy {
  id: string;
  name: string;
  region: string;
  division: string;
  village_or_city: string;
  type: 'chain' | 'independent' | 'hospital' | 'herbal';
  ownership: 'private' | 'public' | 'ngo';
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  working_hours?: string;
  services_offered?: string[];
  specialties?: string[];
  accepts_insurance: boolean;
  emergency_services: boolean;
  delivery_available: boolean;
  overall_rating: number;
  total_ratings: number;
  verification_status: string;
  pharmacist_name?: string;
  created_at: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  pharmacy_name: string;
  category: string;
  date: string;
}

interface MedicineAvailability {
  medicine: string;
  available_pharmacies: number;
  last_updated: string;
}

export default function PharmaciesDirectoryV2() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [featuredPharmacies, setFeaturedPharmacies] = useState<Pharmacy[]>([]);
  const [topRatedPharmacies, setTopRatedPharmacies] = useState<Pharmacy[]>([]);
  const [featuredHerbalShops, setFeaturedHerbalShops] = useState<Pharmacy[]>([]);
  const [healthNews, setHealthNews] = useState<NewsItem[]>([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineAvailability, setMedicineAvailability] = useState<MedicineAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const { toast } = useToast();

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const pharmacyTypes = [
    { value: 'chain', label: 'Chain Pharmacy' },
    { value: 'independent', label: 'Independent' },
    { value: 'hospital', label: 'Hospital Pharmacy' },
    { value: 'herbal', label: 'Herbal Medicine' }
  ];

  useEffect(() => {
    fetchPharmacies();
    loadSampleData();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('overall_rating', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setPharmacies(data);
        setFeaturedPharmacies(data.slice(0, 6));
        setTopRatedPharmacies(data.filter(p => p.overall_rating >= 4.0).slice(0, 8));
        setFeaturedHerbalShops(data.filter(p => p.type === 'herbal').slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      toast({
        title: "Error",
        description: "Failed to load pharmacies data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    setHealthNews([
      {
        id: '1',
        title: 'New COVID-19 Vaccines Available',
        summary: 'Updated COVID-19 vaccines now available at major pharmacies across Cameroon.',
        pharmacy_name: 'CamPharma Chain',
        category: 'Vaccination',
        date: '2024-01-15'
      },
      {
        id: '2',
        title: 'Essential Medicines Price Reduction',
        summary: 'Government announces 15% price reduction on essential medicines.',
        pharmacy_name: 'Ministry of Health',
        category: 'Policy',
        date: '2024-01-10'
      }
    ]);

    setMedicineAvailability([
      { medicine: 'Paracetamol', available_pharmacies: 234, last_updated: '2024-01-16' },
      { medicine: 'Amoxicillin', available_pharmacies: 189, last_updated: '2024-01-16' },
      { medicine: 'Artesunate', available_pharmacies: 156, last_updated: '2024-01-15' },
      { medicine: 'Metformin', available_pharmacies: 203, last_updated: '2024-01-16' }
    ]);
  };

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = searchQuery === '' || 
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.village_or_city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = selectedRegion === '' || pharmacy.region === selectedRegion;
    const matchesType = selectedType === '' || pharmacy.type === selectedType;
    
    return matchesSearch && matchesRegion && matchesType;
  });

  const renderPharmacyCard = (pharmacy: Pharmacy) => (
    <Card key={pharmacy.id} className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {pharmacy.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {pharmacy.village_or_city}, {pharmacy.region}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{pharmacy.overall_rating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-muted-foreground">({pharmacy.total_ratings} reviews)</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {pharmacy.type.replace('_', ' ')}
          </Badge>
          {pharmacy.emergency_services && (
            <Badge variant="destructive">24/7 Emergency</Badge>
          )}
          {pharmacy.delivery_available && (
            <Badge variant="outline">Delivery Available</Badge>
          )}
          {pharmacy.accepts_insurance && (
            <Badge variant="outline">
              <Shield className="h-3 w-3 mr-1" />
              Insurance
            </Badge>
          )}
        </div>

        {pharmacy.specialties && pharmacy.specialties.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Specialties:</p>
            <div className="flex flex-wrap gap-1">
              {pharmacy.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {pharmacy.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{pharmacy.specialties.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {pharmacy.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{pharmacy.phone}</span>
              </div>
            )}
            {pharmacy.working_hours && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{pharmacy.working_hours}</span>
              </div>
            )}
          </div>
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Pharmacies Directory
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find verified pharmacies, check medicine availability, and access healthcare services across Cameroon
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pharmacies or medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Pharmacy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {pharmacyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="directory">All Pharmacies</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="medicine">Medicine Finder</TabsTrigger>
            <TabsTrigger value="news">Health News</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Pharmacies ({filteredPharmacies.length})</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Verified pharmacies only</span>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPharmacies.map(renderPharmacyCard)}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-8">
            {/* Top Rated Pharmacies */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">Top Rated Pharmacies</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {topRatedPharmacies.map(renderPharmacyCard)}
              </div>
            </section>

            {/* Featured Herbal Medicine Shops */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Pill className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold">Traditional & Herbal Medicine</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {featuredHerbalShops.map(renderPharmacyCard)}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="medicine" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6">Medicine Availability Checker</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a medicine..."
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {medicineAvailability.map((medicine, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{medicine.medicine}</CardTitle>
                    <CardDescription>Available at {medicine.available_pharmacies} pharmacies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          Updated {medicine.last_updated}
                        </span>
                      </div>
                      <Button size="sm" variant="outline">
                        Find Locations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <h2 className="text-2xl font-bold">Health & Pharmacy News</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {healthNews.map((news) => (
                <Card key={news.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{news.title}</CardTitle>
                        <CardDescription className="mt-2">{news.summary}</CardDescription>
                      </div>
                      <Badge variant="outline">{news.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{news.pharmacy_name}</span>
                      <span>{news.date}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}