import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Search, 
  Filter, 
  Star,
  Phone,
  Clock,
  Navigation,
  Building2,
  Hospital,
  Pill,
  GraduationCap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/Layout/AppLayout';

interface Institution {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'pharmacy';
  region: string;
  division: string;
  village_or_city: string;
  contact_phone?: string;
  working_hours?: string;
  is_verified: boolean;
  is_claimed: boolean;
  latitude?: number;
  longitude?: number;
  average_rating?: number;
  total_ratings?: number;
}

interface MapFilters {
  type: string;
  region: string;
  verified: string;
  claimed: string;
  search: string;
}

const INSTITUTION_TYPES = [
  { value: 'school', label: 'Schools', icon: GraduationCap, color: 'text-green-600' },
  { value: 'hospital', label: 'Hospitals', icon: Hospital, color: 'text-red-600' },
  { value: 'pharmacy', label: 'Pharmacies', icon: Pill, color: 'text-blue-600' }
];

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export default function InteractiveMap() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MapFilters>({
    type: 'all',
    region: 'all',
    verified: 'all',
    claimed: 'all',
    search: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [institutions, filters]);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      // Fetch from all three tables and combine
      const [schoolsData, hospitalsData, pharmaciesData] = await Promise.all([
        supabase.from('schools').select('*'),
        supabase.from('hospitals').select('*'),
        supabase.from('pharmacies').select('*')
      ]);

      const allInstitutions: Institution[] = [
        ...(schoolsData.data || []).map((school: any) => ({
          id: school.id,
          name: school.name,
          type: 'school' as const,
          region: school.region || '',
          division: school.division || '',
          village_or_city: school.village_or_city || '',
          contact_phone: school.contact_phone,
          working_hours: school.working_hours,
          is_verified: school.is_verified || false,
          is_claimed: school.is_claimed || false,
          latitude: Math.random() * 2 + 3.5, // Mock coordinates for Cameroon
          longitude: Math.random() * 4 + 11.5,
          average_rating: school.average_rating || 0,
          total_ratings: school.total_ratings || 0
        })),
        ...(hospitalsData.data || []).map((hospital: any) => ({
          id: hospital.id,
          name: hospital.name,
          type: 'hospital' as const,
          region: hospital.region || '',
          division: hospital.division || '',
          village_or_city: hospital.village_or_city || '',
          contact_phone: hospital.contact_phone,
          working_hours: hospital.working_hours,
          is_verified: hospital.is_verified || false,
          is_claimed: hospital.is_claimed || false,
          latitude: Math.random() * 2 + 3.5,
          longitude: Math.random() * 4 + 11.5,
          average_rating: hospital.average_rating || 0,
          total_ratings: hospital.total_ratings || 0
        })),
        ...(pharmaciesData.data || []).map((pharmacy: any) => ({
          id: pharmacy.id,
          name: pharmacy.name,
          type: 'pharmacy' as const,
          region: pharmacy.region || '',
          division: pharmacy.division || '',
          village_or_city: pharmacy.village_or_city || '',
          contact_phone: pharmacy.contact_phone,
          working_hours: pharmacy.working_hours,
          is_verified: pharmacy.is_verified || false,
          is_claimed: pharmacy.is_claimed || false,
          latitude: Math.random() * 2 + 3.5,
          longitude: Math.random() * 4 + 11.5,
          average_rating: pharmacy.average_rating || 0,
          total_ratings: pharmacy.total_ratings || 0
        }))
      ];

      setInstitutions(allInstitutions);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast({
        title: "Error",
        description: "Failed to load institutions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = institutions;

    if (filters.type !== 'all') {
      filtered = filtered.filter(inst => inst.type === filters.type);
    }

    if (filters.region !== 'all') {
      filtered = filtered.filter(inst => inst.region === filters.region);
    }

    if (filters.verified !== 'all') {
      const isVerified = filters.verified === 'verified';
      filtered = filtered.filter(inst => inst.is_verified === isVerified);
    }

    if (filters.claimed !== 'all') {
      const isClaimed = filters.claimed === 'claimed';
      filtered = filtered.filter(inst => inst.is_claimed === isClaimed);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(inst => 
        inst.name.toLowerCase().includes(searchTerm) ||
        inst.village_or_city.toLowerCase().includes(searchTerm) ||
        inst.division.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredInstitutions(filtered);
  };

  const getInstitutionIcon = (type: string) => {
    const typeConfig = INSTITUTION_TYPES.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : MapPin;
  };

  const getInstitutionColor = (type: string) => {
    const typeConfig = INSTITUTION_TYPES.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'text-gray-600';
  };

  const getStatusBadge = (institution: Institution) => {
    if (institution.is_verified && institution.is_claimed) {
      return <Badge className="bg-green-100 text-green-800">Verified & Claimed</Badge>;
    } else if (institution.is_verified) {
      return <Badge className="bg-blue-100 text-blue-800">Verified</Badge>;
    } else if (institution.is_claimed) {
      return <Badge className="bg-yellow-100 text-yellow-800">Claimed</Badge>;
    } else {
      return <Badge variant="outline">Unverified</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Civic Map
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Interactive map of schools, hospitals, and pharmacies across Cameroon
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchInstitutions}>
                <Navigation className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search by name or location..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Institution Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {INSTITUTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.region}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {CAMEROON_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.verified}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, verified: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.claimed}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, claimed: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ownership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="unclaimed">Unclaimed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Placeholder */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Interactive Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-muted/50 to-muted border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">Interactive Map Coming Soon</p>
                    <p className="text-sm text-muted-foreground">
                      {filteredInstitutions.length} institutions found
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Institution Details */}
            <Card>
              <CardHeader>
                <CardTitle>Institution Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedInstitution ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedInstitution.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {React.createElement(getInstitutionIcon(selectedInstitution.type), {
                          className: `h-4 w-4 ${getInstitutionColor(selectedInstitution.type)}`
                        })}
                        <span className="text-sm text-muted-foreground capitalize">
                          {selectedInstitution.type}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedInstitution.village_or_city}, {selectedInstitution.division}, {selectedInstitution.region}
                        </span>
                      </div>

                      {selectedInstitution.contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedInstitution.contact_phone}</span>
                        </div>
                      )}

                      {selectedInstitution.working_hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedInstitution.working_hours}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(selectedInstitution)}
                      {selectedInstitution.average_rating && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {selectedInstitution.average_rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>

                    <Button className="w-full">
                      View Full Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Click on an institution from the list to view details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Institution List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Institutions ({filteredInstitutions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading institutions...</p>
                </div>
              ) : filteredInstitutions.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No institutions found</p>
                  <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInstitutions.map((institution) => (
                    <Card 
                      key={institution.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedInstitution?.id === institution.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedInstitution(institution)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-sm">{institution.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {React.createElement(getInstitutionIcon(institution.type), {
                                className: `h-3 w-3 ${getInstitutionColor(institution.type)}`
                              })}
                              <span className="text-xs text-muted-foreground capitalize">
                                {institution.type}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {institution.village_or_city}, {institution.region}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {institution.is_verified && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-2 w-2 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {institution.is_claimed && (
                              <Badge variant="outline" className="text-xs">
                                Claimed
                              </Badge>
                            )}
                            {institution.average_rating && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-2 w-2 mr-1 fill-yellow-400 text-yellow-400" />
                                {institution.average_rating.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}