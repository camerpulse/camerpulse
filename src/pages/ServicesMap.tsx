import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin, Filter, School, Hospital, Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/hooks/useNavigation';
import { createSecureMarker } from '@/utils/secureDOM';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Institution {
  id: string;
  name: string;
  type: string;
  ownership?: string;
  region: string;
  division: string;
  village_or_city: string;
  verification_status?: string;
  category: 'school' | 'hospital' | 'pharmacy';
  lat?: number;
  lng?: number;
}

// Mock coordinates for Cameroon cities (in a real app, you'd geocode addresses)
const cityCoordinates: Record<string, [number, number]> = {
  'Yaoundé': [11.5174, 3.8480],
  'Douala': [9.7043, 4.0483],
  'Bamenda': [10.1593, 5.9631],
  'Bafoussam': [10.4179, 5.4736],
  'Garoua': [13.3978, 9.3265],
  'Maroua': [14.3178, 10.5906],
  'Ngaoundéré': [13.5844, 7.3167],
  'Bertoua': [13.6848, 4.5775],
  'Ebolowa': [11.1543, 2.9059],
  'Kribi': [9.9073, 2.9373]
};

export default function ServicesMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { toast } = useToast();
  const { navigateTo } = useNavigation();

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    fetchMapboxToken();
    fetchInstitutions();
  }, []);

  useEffect(() => {
    if (mapboxToken && institutions.length > 0 && mapContainer.current && !map.current) {
      initializeMap();
    }
  }, [mapboxToken, institutions]);

  useEffect(() => {
    applyFilters();
  }, [institutions, selectedCategory, selectedRegion]);

  const fetchMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      setMapboxToken(data.token);
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      toast({
        title: 'Map Error',
        description: 'Could not load map. Please refresh the page.',
        variant: 'destructive'
      });
    }
  };

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      
      // Fetch from all three tables
      const [schoolsRes, hospitalsRes, pharmaciesRes] = await Promise.all([
        supabase.from('schools').select('*'),
        supabase.from('hospitals').select('*'),
        supabase.from('pharmacies').select('*')
      ]);

      const allInstitutions: Institution[] = [];

      // Process schools
      if (schoolsRes.data) {
        schoolsRes.data.forEach((school: any) => {
          const coords = cityCoordinates[school.village_or_city] || [11.5174, 3.8480];
          allInstitutions.push({
            id: school.id,
            name: school.name,
            type: school.type || 'unknown',
            ownership: school.ownership,
            region: school.region,
            division: school.division,
            village_or_city: school.village_or_city,
            verification_status: school.verification_status || 'unverified',
            category: 'school',
            lat: coords[1],
            lng: coords[0]
          });
        });
      }

      // Process hospitals
      if (hospitalsRes.data) {
        hospitalsRes.data.forEach((hospital: any) => {
          const coords = cityCoordinates[hospital.village_or_city] || [11.5174, 3.8480];
          allInstitutions.push({
            id: hospital.id,
            name: hospital.name,
            type: hospital.type || 'unknown',
            ownership: hospital.ownership,
            region: hospital.region,
            division: hospital.division,
            village_or_city: hospital.village_or_city,
            verification_status: hospital.verification_status || 'unverified',
            category: 'hospital',
            lat: coords[1],
            lng: coords[0]
          });
        });
      }

      // Process pharmacies
      if (pharmaciesRes.data) {
        pharmaciesRes.data.forEach((pharmacy: any) => {
          const coords = cityCoordinates[pharmacy.village_or_city] || [11.5174, 3.8480];
          allInstitutions.push({
            id: pharmacy.id,
            name: pharmacy.name,
            type: pharmacy.type || 'unknown',
            ownership: pharmacy.ownership || undefined,
            region: pharmacy.region,
            division: pharmacy.division,
            village_or_city: pharmacy.village_or_city,
            verification_status: pharmacy.verification_status || 'unverified',
            category: 'pharmacy',
            lat: coords[1],
            lng: coords[0]
          });
        });
      }

      setInstitutions(allInstitutions);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load institutions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...institutions];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(inst => inst.category === selectedCategory);
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(inst => inst.region === selectedRegion);
    }

    setFilteredInstitutions(filtered);
    updateMapMarkers(filtered);
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [11.5174, 3.8480], // Center of Cameroon
      zoom: 6
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add markers when map loads
    map.current.on('load', () => {
      updateMapMarkers(institutions);
    });
  };

  const updateMapMarkers = (institutionsToShow: Institution[]) => {
    if (!map.current) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.custom-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    institutionsToShow.forEach(institution => {
      if (!institution.lat || !institution.lng) return;

      const markerColor = getInstitutionColor(institution);
      const iconSvg = getInstitutionIconSvg(institution.category);

      // Create marker element securely
      const markerEl = createSecureMarker({
        backgroundColor: markerColor,
        iconSvg
      });

      // Add click event
      markerEl.addEventListener('click', () => {
        setSelectedInstitution(institution);
      });

      // Add marker to map
      new mapboxgl.Marker(markerEl)
        .setLngLat([institution.lng, institution.lat])
        .addTo(map.current!);
    });
  };

  const getInstitutionColor = (institution: Institution) => {
    if (institution.verification_status === 'verified') {
      switch (institution.category) {
        case 'school': return '#10b981'; // green
        case 'hospital': return '#ef4444'; // red
        case 'pharmacy': return '#3b82f6'; // blue
        default: return '#6b7280'; // gray
      }
    } else {
      return '#f59e0b'; // amber for unverified
    }
  };

  const getInstitutionIconSvg = (category: string) => {
    const iconColor = 'white';
    switch (category) {
      case 'school': 
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="${iconColor}">
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
        </svg>`;
      case 'hospital':
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="${iconColor}">
          <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6v2h2v2h2V8h2V6H8V4H6v2H4zm0 4v8c0 1.1.9 2 2 2h8.31c-.79-.79-1.17-1.9-1.17-3.04C13.14 12.94 15.94 10.14 20 10.14c1.14 0 2.25.38 3.04 1.17V10c0-1.1-.9-2-2-2H4z"/>
        </svg>`;
      case 'pharmacy':
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="${iconColor}">
          <path d="M19 8v3h3v2h-3v3h-2v-3h-3v-2h3V8h2zM4 2v2h2L8 16h10l2.5-9H8.5l-.5-2H4V2z"/>
        </svg>`;
      default:
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="${iconColor}">
          <circle cx="12" cy="12" r="3"/>
        </svg>`;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'school': return School;
      case 'hospital': return Hospital;
      case 'pharmacy': return Pill;
      default: return MapPin;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Services Map
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover schools, hospitals, and pharmacies near you across Cameroon.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="school">Schools</SelectItem>
                  <SelectItem value="hospital">Hospitals</SelectItem>
                  <SelectItem value="pharmacy">Pharmacies</SelectItem>
                </SelectContent>
              </Select>

              {/* Region Filter */}
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {cameroonRegions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Statistics */}
              <div className="md:col-span-2 flex gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <School className="h-3 w-3" />
                  {institutions.filter(i => i.category === 'school').length} Schools
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Hospital className="h-3 w-3" />
                  {institutions.filter(i => i.category === 'hospital').length} Hospitals
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Pill className="h-3 w-3" />
                  {institutions.filter(i => i.category === 'pharmacy').length} Pharmacies
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                ) : (
                  <div ref={mapContainer} className="w-full h-full rounded-lg"></div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Institution Details Panel */}
          <div className="space-y-4">
            {selectedInstitution ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {React.createElement(getCategoryIcon(selectedInstitution.category), { 
                      className: "h-5 w-5" 
                    })}
                    {selectedInstitution.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {selectedInstitution.type}
                    </Badge>
                    {selectedInstitution.ownership && (
                      <Badge variant="outline">
                        {selectedInstitution.ownership}
                      </Badge>
                    )}
                    {selectedInstitution.verification_status && (
                      <Badge
                        variant={selectedInstitution.verification_status === 'verified' ? 'default' : 'destructive'}
                      >
                        {selectedInstitution.verification_status}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Location:</span> {selectedInstitution.village_or_city}, {selectedInstitution.division}
                    </div>
                    <div>
                      <span className="font-medium">Region:</span> {selectedInstitution.region}
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => {
                      // Navigate to specific directory based on category
                      const routes = {
                        school: '/schools',
                        hospital: '/hospitals', 
                        pharmacy: '/pharmacies'
                      };
                      navigateTo(routes[selectedInstitution.category as keyof typeof routes]);
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click on a marker to view institution details</p>
                </CardContent>
              </Card>
            )}

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Map Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Verified Institutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-sm">Unverified Institutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  <span className="text-sm">Clustered Locations</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}