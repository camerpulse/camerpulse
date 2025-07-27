import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Users, 
  TrendingUp, 
  Navigation,
  Star,
  Eye,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  Globe
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Village {
  id: string;
  village_name: string;
  region: string;
  latitude: number;
  longitude: number;
  population?: number;
  overall_rating: number;
  
  verified: boolean;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
}

const InteractiveVillageMap: React.FC = () => {
  const [villages, setVillages] = useState<Village[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'standard'>('standard');
  const [showLayers, setShowLayers] = useState({
    population: true,
    infrastructure: true,
    education: false,
    health: false
  });

  // Cameroon regions
  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    fetchVillages();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    filterVillages();
  }, [villages, searchTerm, selectedRegion]);

  const fetchVillages = async () => {
    try {
      const { data, error } = await supabase
        .from('villages')
        .select(`
          id,
          village_name,
          region,
          latitude,
          longitude,
          overall_rating,
          verified,
          infrastructure_score,
          education_score,
          health_score
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      setVillages(data || []);
    } catch (error) {
      console.error('Error fetching villages:', error);
      toast({
        title: "Error",
        description: "Failed to load villages data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('villages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'villages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVillages(prev => [...prev, payload.new as Village]);
          } else if (payload.eventType === 'UPDATE') {
            setVillages(prev => 
              prev.map(v => v.id === payload.new.id ? payload.new as Village : v)
            );
          } else if (payload.eventType === 'DELETE') {
            setVillages(prev => prev.filter(v => v.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filterVillages = () => {
    let filtered = villages;

    if (searchTerm) {
      filtered = filtered.filter(village =>
        village.village_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        village.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion) {
      filtered = filtered.filter(village => village.region === selectedRegion);
    }

    setFilteredVillages(filtered);
  };

  const getVillageColor = (village: Village) => {
    if (village.overall_rating >= 8) return 'bg-green-500';
    if (village.overall_rating >= 6) return 'bg-yellow-500';
    if (village.overall_rating >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const openInMaps = (village: Village) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${village.latitude},${village.longitude}`;
    window.open(url, '_blank');
  };

  const calculateMapCenter = () => {
    if (filteredVillages.length === 0) return { lat: 7.3697, lng: 12.3547 }; // Cameroon center
    
    const avgLat = filteredVillages.reduce((sum, v) => sum + v.latitude, 0) / filteredVillages.length;
    const avgLng = filteredVillages.reduce((sum, v) => sum + v.longitude, 0) / filteredVillages.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Interactive Village Map</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl">
            Explore villages across Cameroon with GPS mapping, community data, and real-time updates
          </p>
          <div className="flex gap-4 mt-6">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {filteredVillages.length} Villages
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Real-time Updates
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Villages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search by name or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Map Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Map Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Map View</label>
                  <select
                    className="w-full p-2 border rounded-md mt-1"
                    value={mapView}
                    onChange={(e) => setMapView(e.target.value as any)}
                  >
                    <option value="standard">Standard</option>
                    <option value="satellite">Satellite</option>
                    <option value="terrain">Terrain</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Data Layers</label>
                  {Object.entries(showLayers).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setShowLayers(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                      />
                      <span className="text-sm capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Villages</span>
                  <Badge>{villages.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Verified</span>
                  <Badge variant="secondary">
                    {villages.filter(v => v.verified).length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Population</span>
                  <Badge>
                    {villages.reduce((sum, v) => sum + (v.population || 0), 0).toLocaleString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card className="h-96 lg:h-[600px]">
              <CardContent className="p-0 h-full relative">
                {/* Map Placeholder with village markers */}
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden rounded-lg">
                  {/* Map background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100"></div>
                  </div>

                  {/* Village markers */}
                  {filteredVillages.map((village, index) => {
                    // Simulate positioning based on region and index
                    const x = 10 + (index % 8) * 11 + Math.random() * 5;
                    const y = 10 + Math.floor(index / 8) * 15 + Math.random() * 8;
                    
                    return (
                      <div
                        key={village.id}
                        className="absolute cursor-pointer transform hover:scale-110 transition-all duration-200"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        onClick={() => setSelectedVillage(village)}
                      >
                        <div className={`w-4 h-4 rounded-full ${getVillageColor(village)} border-2 border-white shadow-lg`}>
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 whitespace-nowrap">
                            {village.village_name}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Map controls */}
                  <div className="absolute top-4 right-4 space-y-2">
                    <Button size="sm" variant="outline" className="bg-white">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-lg">
                    <h4 className="font-medium mb-2">Village Ratings</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Excellent (8-10)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Good (6-8)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Average (4-6)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Needs Improvement</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Village Details */}
            {selectedVillage && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {selectedVillage.village_name}
                        {selectedVillage.verified && (
                          <Badge variant="secondary">Verified</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{selectedVillage.region} Region</CardDescription>
                    </div>
                    <Button 
                      onClick={() => openInMaps(selectedVillage)}
                      className="flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Overall Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{selectedVillage.overall_rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Population</span>
                        <span className="font-medium">{selectedVillage.population?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Members</span>
                        <span className="font-medium">{selectedVillage.member_count}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Infrastructure</span>
                        <Badge variant="outline">{selectedVillage.infrastructure_score}/10</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Education</span>
                        <Badge variant="outline">{selectedVillage.education_score}/10</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Health</span>
                        <Badge variant="outline">{selectedVillage.health_score}/10</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Profile
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Join Community
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveVillageMap;