import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin, Navigation, Maximize2, Layers, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import 'mapbox-gl/dist/mapbox-gl.css';

interface VillageLocation {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  gps_latitude: number;
  gps_longitude: number;
  overall_rating: number;
  is_verified: boolean;
  sons_daughters_count: number;
  population_estimate?: number;
  infrastructure_score: number;
}

interface InteractiveVillageMapProps {
  selectedRegion?: string;
  className?: string;
  height?: string;
}

export const InteractiveVillageMap: React.FC<InteractiveVillageMapProps> = ({ 
  selectedRegion = 'all', 
  className = '',
  height = '500px'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [villages, setVillages] = useState<VillageLocation[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<VillageLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/light-v11');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVillages, setFilteredVillages] = useState<VillageLocation[]>([]);

  const mapStyles = [
    { id: 'light-v11', name: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
    { id: 'dark-v11', name: 'Dark', url: 'mapbox://styles/mapbox/dark-v11' },
    { id: 'satellite-v9', name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-v9' },
    { id: 'outdoors-v12', name: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v12' }
  ];

  useEffect(() => {
    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (mapboxToken) {
      fetchVillageLocations();
    }
  }, [selectedRegion, mapboxToken]);

  useEffect(() => {
    if (villages.length > 0 && mapboxToken) {
      initializeMap();
    }
  }, [villages, mapboxToken]);

  useEffect(() => {
    const filtered = villages.filter(village =>
      village.village_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      village.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      village.division.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVillages(filtered);
  }, [searchTerm, villages]);

  const fetchMapboxToken = async () => {
    try {
      // Try to get token from Supabase Edge Functions secrets
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (!error && data?.token) {
        setMapboxToken(data.token);
      }
    } catch (error) {
      console.log('No Mapbox token configured in Supabase');
    }
  };

  const fetchVillageLocations = async () => {
    try {
      let query = supabase
        .from('villages')
        .select('id, village_name, region, division, subdivision, gps_latitude, gps_longitude, overall_rating, is_verified, sons_daughters_count, population_estimate, infrastructure_score')
        .not('gps_latitude', 'is', null)
        .not('gps_longitude', 'is', null);

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      const { data, error } = await query;
      if (error) throw error;

      setVillages(data || []);
      setFilteredVillages(data || []);
    } catch (error) {
      console.error('Error fetching village locations:', error);
      toast.error('Failed to load village locations');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    // Calculate bounds for all villages
    const bounds = new mapboxgl.LngLatBounds();
    villages.forEach(village => {
      bounds.extend([village.gps_longitude, village.gps_latitude]);
    });

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      bounds: bounds,
      fitBoundsOptions: { padding: 50 }
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    map.current.on('load', () => {
      addVillageMarkers();
      addClustering();
    });
  };

  const addVillageMarkers = () => {
    if (!map.current) return;

    // Add village data source
    map.current.addSource('villages', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: villages.map(village => ({
          type: 'Feature',
          properties: {
            id: village.id,
            name: village.village_name,
            region: village.region,
            rating: village.overall_rating,
            verified: village.is_verified,
            members: village.sons_daughters_count,
            population: village.population_estimate || 0,
            infrastructure: village.infrastructure_score
          },
          geometry: {
            type: 'Point',
            coordinates: [village.gps_longitude, village.gps_latitude]
          }
        }))
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add cluster circles
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'villages',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          10,
          '#f1f075',
          25,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          30,
          25,
          40
        ]
      }
    });

    // Add cluster count
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'villages',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    // Add individual village points
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'villages',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['get', 'verified'],
          '#fbbf24', // Gold for verified
          '#3b82f6'  // Blue for unverified
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'rating'],
          0, 8,
          5, 15
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Add click handlers
    map.current.on('click', 'clusters', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties!.cluster_id;
      (map.current!.getSource('villages') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;
          map.current!.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        }
      );
    });

    map.current.on('click', 'unclustered-point', (e) => {
      const coordinates = (e.features![0].geometry as any).coordinates.slice();
      const properties = e.features![0].properties!;
      
      const village = villages.find(v => v.id === properties.id);
      if (village) {
        setSelectedVillage(village);
        
        // Create popup
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-4 min-w-64">
              <h3 class="font-bold text-lg mb-2">${village.village_name}</h3>
              <p class="text-sm text-gray-600 mb-2">${village.subdivision}, ${village.division}, ${village.region}</p>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-yellow-500">⭐</span>
                <span class="font-medium">${village.overall_rating.toFixed(1)}</span>
                ${village.is_verified ? '<span class="text-yellow-500">👑</span>' : ''}
              </div>
              <p class="text-sm mb-3">👥 ${village.sons_daughters_count} members</p>
              <a href="/villages/${village.id}" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                View Profile
              </a>
            </div>
          `)
          .addTo(map.current!);
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'clusters', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      map.current!.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'unclustered-point', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point', () => {
      map.current!.getCanvas().style.cursor = '';
    });
  };

  const addClustering = () => {
    // Clustering is already handled in addVillageMarkers
  };

  const flyToVillage = (village: VillageLocation) => {
    if (!map.current) return;
    
    map.current.flyTo({
      center: [village.gps_longitude, village.gps_latitude],
      zoom: 15,
      essential: true
    });
    setSelectedVillage(village);
  };

  const changeMapStyle = (style: string) => {
    if (!map.current) return;
    setMapStyle(style);
    map.current.setStyle(style);
    
    // Re-add sources and layers after style change
    map.current.once('style.load', () => {
      addVillageMarkers();
    });
  };

  const openInMaps = (latitude: number, longitude: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  if (!mapboxToken) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Village Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center p-8 bg-muted/30 rounded">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Mapbox Token Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To use the interactive map, please get your Mapbox public token from{' '}
                <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  mapbox.com
                </a>{' '}
                and enter it below.
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input
                  placeholder="pk.eyJ1..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                />
                <Button 
                  onClick={() => setMapboxToken(tokenInput)}
                  disabled={!tokenInput.startsWith('pk.')}
                >
                  Load Map
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Village Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`bg-muted rounded animate-pulse flex items-center justify-center`} style={{ height }}>
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
            Interactive Village Map
            {selectedRegion !== 'all' && (
              <Badge variant="secondary">{selectedRegion}</Badge>
            )}
            <Badge variant="outline">{villages.length} villages</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={mapStyle} onValueChange={changeMapStyle}>
              <SelectTrigger className="w-32">
                <Layers className="h-4 w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mapStyles.map((style) => (
                  <SelectItem key={style.id} value={style.url}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search villages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Map Container */}
          <div className="relative">
            <div 
              ref={mapContainer} 
              className="w-full rounded border"
              style={{ height }}
            />
          </div>

          {/* Villages List */}
          {searchTerm && (
            <div className="max-h-48 overflow-y-auto space-y-2 border-t pt-4">
              <h4 className="font-medium">Search Results</h4>
              {filteredVillages.slice(0, 10).map((village) => (
                <div
                  key={village.id}
                  className="flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-muted/50"
                  onClick={() => flyToVillage(village)}
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
                        <Badge variant="secondary" className="text-xs">👑</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {village.subdivision}, {village.region}
                    </p>
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
          )}

          {/* Selected Village Info */}
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
                  <span className="text-muted-foreground">Infrastructure:</span>
                  <p className="font-medium">{selectedVillage.infrastructure_score}/20</p>
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
      </CardContent>
    </Card>
  );
};