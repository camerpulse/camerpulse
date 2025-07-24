import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import {
  Pill,
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
  Search,
  Filter,
  Building2,
  Heart,
  Shield,
  TrendingUp,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  location: string;
  region: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  email?: string;
  address: string;
  openingHours: string;
  services: string[];
  isVerified: boolean;
  is24Hours: boolean;
  hasEmergencyService: boolean;
  description: string;
  lastUpdated: string;
}

const PharmaciesPage: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [loading, setLoading] = useState(true);

  const mockPharmacies: Pharmacy[] = [
    {
      id: '1',
      name: 'Pharmacie Centrale',
      location: 'Yaoundé',
      region: 'Centre',
      rating: 4.5,
      reviewCount: 128,
      phone: '+237 222 234 567',
      email: 'info@pharmaciecentrale.cm',
      address: 'Avenue Kennedy, Yaoundé',
      openingHours: '8:00 AM - 8:00 PM',
      services: ['Prescription Filling', 'Health Consultation', 'Blood Pressure Check', 'First Aid'],
      isVerified: true,
      is24Hours: false,
      hasEmergencyService: true,
      description: 'Leading pharmacy with comprehensive healthcare services and qualified pharmacists.',
      lastUpdated: '2024-01-20'
    },
    {
      id: '2',
      name: 'Pharmacie du Marché',
      location: 'Douala',
      region: 'Littoral',
      rating: 4.2,
      reviewCount: 89,
      phone: '+237 233 456 789',
      address: 'Marché Central, Douala',
      openingHours: '24 Hours',
      services: ['Prescription Filling', 'Emergency Medicines', 'Blood Glucose Test'],
      isVerified: true,
      is24Hours: true,
      hasEmergencyService: true,
      description: '24-hour pharmacy serving the central market area with emergency services.',
      lastUpdated: '2024-01-19'
    },
    {
      id: '3',
      name: 'Pharmacie de la Paix',
      location: 'Bamenda',
      region: 'Northwest',
      rating: 4.0,
      reviewCount: 67,
      phone: '+237 233 789 123',
      address: 'Commercial Avenue, Bamenda',
      openingHours: '7:00 AM - 9:00 PM',
      services: ['Prescription Filling', 'Vaccination', 'Health Screening'],
      isVerified: true,
      is24Hours: false,
      hasEmergencyService: false,
      description: 'Community pharmacy providing quality medicines and health services.',
      lastUpdated: '2024-01-18'
    },
    {
      id: '4',
      name: 'Pharmacie Moderne',
      location: 'Bafoussam',
      region: 'West',
      rating: 4.3,
      reviewCount: 45,
      phone: '+237 233 654 321',
      address: 'Rue de la République, Bafoussam',
      openingHours: '8:00 AM - 7:00 PM',
      services: ['Prescription Filling', 'Medical Equipment', 'Health Consultation'],
      isVerified: false,
      is24Hours: false,
      hasEmergencyService: true,
      description: 'Modern pharmacy with latest medical equipment and professional staff.',
      lastUpdated: '2024-01-17'
    },
    {
      id: '5',
      name: 'Pharmacie Universitaire',
      location: 'Buea',
      region: 'Southwest',
      rating: 4.1,
      reviewCount: 92,
      phone: '+237 233 987 654',
      address: 'University of Buea Campus, Buea',
      openingHours: '8:00 AM - 6:00 PM',
      services: ['Prescription Filling', 'Student Health', 'First Aid Training'],
      isVerified: true,
      is24Hours: false,
      hasEmergencyService: false,
      description: 'Campus pharmacy serving university community with student-focused services.',
      lastUpdated: '2024-01-16'
    }
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

  const services = [
    { value: 'all', label: 'All Services' },
    { value: 'prescription', label: 'Prescription Filling' },
    { value: 'consultation', label: 'Health Consultation' },
    { value: 'emergency', label: 'Emergency Services' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'screening', label: 'Health Screening' }
  ];

  useEffect(() => {
    setTimeout(() => {
      setPharmacies(mockPharmacies);
      setFilteredPharmacies(mockPharmacies);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = pharmacies;

    if (searchQuery) {
      filtered = filtered.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(pharmacy => 
        pharmacy.region.toLowerCase() === selectedRegion
      );
    }

    if (selectedService !== 'all') {
      filtered = filtered.filter(pharmacy =>
        pharmacy.services.some(service => 
          service.toLowerCase().includes(selectedService.toLowerCase())
        )
      );
    }

    setFilteredPharmacies(filtered);
  }, [pharmacies, searchQuery, selectedRegion, selectedService]);

  const stats = [
    { label: 'Total Pharmacies', value: '2,400+', icon: Pill },
    { label: '24/7 Services', value: '180+', icon: Clock },
    { label: 'Verified', value: '1,950+', icon: Shield },
    { label: 'Average Rating', value: '4.3', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Pharmacies Directory
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Find trusted pharmacies across Cameroon. Access quality medicines, 
              health services, and emergency care in your community.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search pharmacies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white text-gray-900"
              />
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
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
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
            <TabsTrigger value="directory">Pharmacy Directory</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Services</TabsTrigger>
            <TabsTrigger value="services">Health Services</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Find Pharmacies</h2>
                <p className="text-muted-foreground">
                  {loading ? 'Loading...' : `${filteredPharmacies.length} pharmacies found`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
                <Link to="/pharmacies/add">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pharmacy
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
                {filteredPharmacies.map((pharmacy) => (
                  <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2 flex items-center gap-2">
                            {pharmacy.name}
                            {pharmacy.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                ✓ Verified
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {pharmacy.address}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{pharmacy.rating}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {pharmacy.reviewCount} reviews
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{pharmacy.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {pharmacy.is24Hours && (
                          <Badge className="bg-green-100 text-green-800">
                            <Clock className="h-3 w-3 mr-1" />
                            24/7
                          </Badge>
                        )}
                        {pharmacy.hasEmergencyService && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Emergency
                          </Badge>
                        )}
                        <Badge variant="outline">
                          <Building2 className="h-3 w-3 mr-1" />
                          {pharmacy.region}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{pharmacy.openingHours}</span>
                        </div>
                        {pharmacy.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>{pharmacy.phone}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {pharmacy.services.slice(0, 3).map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {pharmacy.services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{pharmacy.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {Math.floor(Math.random() * 300) + 50} views
                          </span>
                          <span>Updated {new Date(pharmacy.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/pharmacies/${pharmacy.id}`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                          <Button size="sm">
                            Rate Pharmacy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && filteredPharmacies.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No pharmacies found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or browse all pharmacies.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRegion('all');
                      setSelectedService('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Emergency Pharmacy Services
                </CardTitle>
                <CardDescription>
                  24/7 pharmacies and emergency medicine availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPharmacies
                    .filter(p => p.hasEmergencyService || p.is24Hours)
                    .map(pharmacy => (
                      <div key={pharmacy.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{pharmacy.name}</h3>
                          <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
                          <p className="text-sm">{pharmacy.phone}</p>
                        </div>
                        <div className="text-right">
                          {pharmacy.is24Hours && (
                            <Badge className="bg-green-100 text-green-800 mb-1">24/7</Badge>
                          )}
                          {pharmacy.hasEmergencyService && (
                            <Badge className="bg-red-100 text-red-800">Emergency</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Health Services Available</CardTitle>
                <CardDescription>
                  Comprehensive health services offered by pharmacies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <Pill className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">Prescription Services</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional prescription filling and medication counseling
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Heart className="h-8 w-8 mx-auto mb-3 text-red-500" />
                    <h3 className="font-semibold mb-2">Health Screening</h3>
                    <p className="text-sm text-muted-foreground">
                      Blood pressure, glucose testing, and basic health checks
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-3 text-green-500" />
                    <h3 className="font-semibold mb-2">Vaccination</h3>
                    <p className="text-sm text-muted-foreground">
                      Immunization services and vaccine administration
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PharmaciesPage;