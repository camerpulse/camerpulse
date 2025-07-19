import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface VillageLocation {
  id: string;
  village_name: string;
  region: string;
  gps_latitude: number;
  gps_longitude: number;
  overall_rating: number;
  is_verified: boolean;
  sons_daughters_count: number;
}

interface VillageMapProps {
  selectedRegion?: string;
  className?: string;
}

export const VillageMap: React.FC<VillageMapProps> = ({ selectedRegion = 'all', className = '' }) => {
  const [villages, setVillages] = useState<VillageLocation[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<VillageLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVillageLocations();
  }, [selectedRegion]);

  const fetchVillageLocations = async () => {
    try {
      let query = supabase
        .from('villages')
        .select('id, village_name, region, gps_latitude, gps_longitude, overall_rating, is_verified, sons_daughters_count')
        .not('gps_latitude', 'is', null)
        .not('gps_longitude', 'is', null);

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      const { data, error } = await query;
      if (error) throw error;

      setVillages(data || []);
    } catch (error) {
      console.error('Error fetching village locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (latitude: number, longitude: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  const centerLat = villages.length > 0 
    ? villages.reduce((sum, v) => sum + v.gps_latitude, 0) / villages.length 
    : 3.848033; // Cameroon center
  
  const centerLng = villages.length > 0 
    ? villages.reduce((sum, v) => sum + v.gps_longitude, 0) / villages.length 
    : 11.502075; // Cameroon center

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Village Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse flex items-center justify-center">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Village Locations
            {selectedRegion !== 'all' && (
              <Badge variant="secondary">{selectedRegion}</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openInMaps(centerLat, centerLng, 'Cameroon Villages')}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Open in Maps
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {villages.length === 0 ? (
          <div className="h-64 bg-muted rounded flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No villages with GPS coordinates found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Interactive Map Placeholder */}
            <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded border-2 border-dashed border-muted-foreground/20 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-sm font-medium">Interactive Map</p>
                  <p className="text-xs text-muted-foreground">{villages.length} villages with GPS coordinates</p>
                </div>
              </div>
              
              {/* Village Markers Simulation */}
              {villages.slice(0, 8).map((village, index) => (
                <div
                  key={village.id}
                  className="absolute cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    left: `${20 + (index % 4) * 20}%`,
                    top: `${20 + Math.floor(index / 4) * 40}%`,
                  }}
                  onClick={() => setSelectedVillage(village)}
                >
                  <div className="relative">
                    <MapPin className="h-6 w-6 text-primary drop-shadow-lg" />
                    {village.is_verified && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full border border-white"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Village List */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {villages.map((village) => (
                <div
                  key={village.id}
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedVillage?.id === village.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => setSelectedVillage(village)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/villages/${village.id}`}
                        className="font-medium hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {village.village_name}
                      </Link>
                      {village.is_verified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{village.region}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      ⭐ {village.overall_rating.toFixed(1)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInMaps(village.gps_latitude, village.gps_longitude, village.village_name);
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {selectedVillage && (
              <div className="p-4 bg-muted/30 rounded border">
                <h4 className="font-semibold mb-2">{selectedVillage.village_name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Region:</span>
                    <p className="font-medium">{selectedVillage.region}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rating:</span>
                    <p className="font-medium">⭐ {selectedVillage.overall_rating.toFixed(1)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Members:</span>
                    <p className="font-medium">{selectedVillage.sons_daughters_count}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coordinates:</span>
                    <p className="font-medium text-xs">
                      {selectedVillage.gps_latitude.toFixed(4)}, {selectedVillage.gps_longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link to={`/villages/${selectedVillage.id}`}>
                    <Button size="sm" variant="outline">View Profile</Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => openInMaps(selectedVillage.gps_latitude, selectedVillage.gps_longitude, selectedVillage.village_name)}
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Directions
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};