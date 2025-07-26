import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Map as MapIcon, 
  Layers, 
  Filter, 
  Search,
  AlertTriangle,
  Shield,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface VillageMapData {
  id: string;
  village_name: string;
  slug: string;
  region: string;
  latitude?: number;
  longitude?: number;
  overall_reputation_score: number;
  reputation_badge: string;
  transparency_score: number;
  corruption_reports_count: number;
  citizen_satisfaction_score: number;
}

interface MapboxToken {
  token: string;
}

export function VillageTransparencyHeatmap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [villages, setVillages] = useState<VillageMapData[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<VillageMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [layersVisible, setLayersVisible] = useState({
    heatmap: true,
    markers: true,
    corruption: false
  });

  useEffect(() => {
    fetchMapboxToken();
    fetchVillageData();
  }, []);

  useEffect(() => {
    if (mapboxToken && villages.length > 0) {
      initializeMap();
    }
  }, [mapboxToken, villages]);

  useEffect(() => {
    filterVillages();
  }, [villages, searchTerm, selectedFilter]);

  const fetchMapboxToken = async () => {
    try {
      // First try to get from Supabase secrets
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (data?.token) {
        setMapboxToken(data.token);
      } else {
        // Show input for user to enter token
        setShowTokenInput(true);
      }
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      setShowTokenInput(true);
    }
  };

  const fetchVillageData = async () => {
    try {
      setLoading(true);
      
      // Fetch villages with their transparency metrics
      const { data, error } = await supabase
        .from('villages')
        .select(`
          id,
          village_name,
          slug,
          region,
          latitude,
          longitude,
          village_transparency_metrics(
            overall_reputation_score,
            reputation_badge,
            transparency_score,
            corruption_reports_count,
            citizen_satisfaction_score
          )
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      const processedVillages = data?.map(village => ({
        id: village.id,
        village_name: village.village_name,
        slug: village.slug,
        region: village.region,
        latitude: village.latitude,
        longitude: village.longitude,
        overall_reputation_score: village.village_transparency_metrics?.overall_reputation_score || 0,
        reputation_badge: village.village_transparency_metrics?.reputation_badge || 'under_assessment',
        transparency_score: village.village_transparency_metrics?.transparency_score || 0,
        corruption_reports_count: village.village_transparency_metrics?.corruption_reports_count || 0,
        citizen_satisfaction_score: village.village_transparency_metrics?.citizen_satisfaction_score || 0
      })).filter(v => v.latitude && v.longitude) || [];

      setVillages(processedVillages);
    } catch (error) {
      console.error('Error fetching village data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVillages = () => {
    let filtered = villages;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(village =>
        village.village_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        village.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'excellent':
        filtered = filtered.filter(v => v.reputation_badge === 'excellent');
        break;
      case 'transparent':
        filtered = filtered.filter(v => v.transparency_score >= 70);
        break;
      case 'problematic':
        filtered = filtered.filter(v => v.corruption_reports_count > 0);
        break;
      case 'low_rating':
        filtered = filtered.filter(v => v.overall_reputation_score < 50);
        break;
    }

    setFilteredVillages(filtered);
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [12.3547, 6.0000], // Center on Cameroon
      zoom: 6,
      maxZoom: 15,
      minZoom: 5
    });

    map.current.on('load', () => {
      addVillageDataToMap();
      addMapControls();
    });
  };

  const addVillageDataToMap = () => {
    if (!map.current) return;

    // Create GeoJSON from village data
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: filteredVillages.map(village => ({
        type: 'Feature' as const,
        properties: {
          id: village.id,
          village_name: village.village_name,
          slug: village.slug,
          region: village.region,
          overall_reputation_score: village.overall_reputation_score,
          reputation_badge: village.reputation_badge,
          transparency_score: village.transparency_score,
          corruption_reports_count: village.corruption_reports_count,
          citizen_satisfaction_score: village.citizen_satisfaction_score
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [village.longitude!, village.latitude!]
        }
      }))
    };

    // Add data source
    if (map.current.getSource('villages')) {
      (map.current.getSource('villages') as mapboxgl.GeoJSONSource).setData(geojsonData);
    } else {
      map.current.addSource('villages', {
        type: 'geojson',
        data: geojsonData
      });
    }

    // Add heatmap layer for reputation scores
    if (layersVisible.heatmap && !map.current.getLayer('villages-heatmap')) {
      map.current.addLayer({
        id: 'villages-heatmap',
        type: 'heatmap',
        source: 'villages',
        maxzoom: 12,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'overall_reputation_score'],
            0, 0,
            100, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            12, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            12, 20
          ]
        }
      });
    }

    // Add circle markers for individual villages
    if (layersVisible.markers && !map.current.getLayer('villages-circles')) {
      map.current.addLayer({
        id: 'villages-circles',
        type: 'circle',
        source: 'villages',
        minzoom: 8,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 4,
            15, 12
          ],
          'circle-color': [
            'case',
            ['>=', ['get', 'overall_reputation_score'], 85], '#10b981', // green for excellent
            ['>=', ['get', 'overall_reputation_score'], 70], '#3b82f6', // blue for good
            ['>=', ['get', 'overall_reputation_score'], 50], '#f59e0b', // yellow for average
            '#ef4444' // red for poor
          ],
          'circle-opacity': 0.8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });
    }

    // Add corruption reports layer
    if (layersVisible.corruption && !map.current.getLayer('villages-corruption')) {
      map.current.addLayer({
        id: 'villages-corruption',
        type: 'circle',
        source: 'villages',
        filter: ['>', ['get', 'corruption_reports_count'], 0],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'corruption_reports_count'],
            1, 6,
            10, 20
          ],
          'circle-color': 'rgba(239, 68, 68, 0.6)',
          'circle-stroke-color': '#dc2626',
          'circle-stroke-width': 2
        }
      });
    }

    // Add click handlers and popups
    addMapInteractions();
  };

  const addMapInteractions = () => {
    if (!map.current) return;

    // Create popup
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    // Mouse enter event
    map.current.on('mouseenter', 'villages-circles', (e) => {
      if (!map.current || !e.features?.[0]) return;

      map.current.getCanvas().style.cursor = 'pointer';
      
      const feature = e.features[0];
      const props = feature.properties;
      
      if (props) {
        const popupContent = `
          <div class="p-3">
            <h3 class="font-semibold text-sm">${props.village_name}</h3>
            <p class="text-xs text-gray-600 mb-2">${props.region} Region</p>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span>Overall Score:</span>
                <span class="font-medium">${props.overall_reputation_score?.toFixed(1)}%</span>
              </div>
              <div class="flex justify-between">
                <span>Transparency:</span>
                <span class="font-medium">${props.transparency_score?.toFixed(1)}%</span>
              </div>
              <div class="flex justify-between">
                <span>Reports:</span>
                <span class="font-medium ${props.corruption_reports_count > 0 ? 'text-red-600' : 'text-green-600'}">${props.corruption_reports_count}</span>
              </div>
            </div>
            <div class="mt-2 pt-2 border-t text-xs text-blue-600">
              Click to view details
            </div>
          </div>
        `;

        popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map.current);
      }
    });

    // Mouse leave event
    map.current.on('mouseleave', 'villages-circles', () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = '';
      popup.remove();
    });

    // Click event to navigate to village page
    map.current.on('click', 'villages-circles', (e) => {
      if (!e.features?.[0]?.properties) return;
      
      const props = e.features[0].properties;
      const slug = props.slug || props.id;
      
      window.open(`/village/${slug}`, '_blank');
    });
  };

  const addMapControls = () => {
    if (!map.current) return;

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
  };

  const toggleLayer = (layerName: keyof typeof layersVisible) => {
    setLayersVisible(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));

    if (!map.current) return;

    // Toggle layer visibility
    const layerId = layerName === 'heatmap' ? 'villages-heatmap' : 
                   layerName === 'markers' ? 'villages-circles' : 'villages-corruption';
    
    if (map.current.getLayer(layerId)) {
      const visibility = layersVisible[layerName] ? 'none' : 'visible';
      map.current.setLayoutProperty(layerId, 'visibility', visibility);
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'average': return 'bg-yellow-500 text-white';
      case 'poor': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (showTokenInput && !mapboxToken) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Mapbox Token Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To display the village transparency heatmap, please enter your Mapbox public token.
          </p>
          <p className="text-xs text-muted-foreground">
            Get your token from{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <Input
            placeholder="Enter Mapbox public token"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <Button 
            onClick={() => setShowTokenInput(false)}
            disabled={!mapboxToken}
            className="w-full"
          >
            Initialize Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            Village Transparency Heatmap
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Interactive map showing village reputation scores and transparency metrics across Cameroon
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search villages or regions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'excellent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('excellent')}
              >
                <Shield className="h-4 w-4 mr-1" />
                Excellent
              </Button>
              <Button
                variant={selectedFilter === 'transparent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('transparent')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Transparent
              </Button>
              <Button
                variant={selectedFilter === 'problematic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('problematic')}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Issues
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <div ref={mapContainer} className="h-[600px] w-full rounded-lg" />
                
                {/* Layer Controls */}
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Map Layers
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={layersVisible.heatmap}
                        onChange={() => toggleLayer('heatmap')}
                        className="rounded"
                      />
                      Reputation Heatmap
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={layersVisible.markers}
                        onChange={() => toggleLayer('markers')}
                        className="rounded"
                      />
                      Village Markers
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={layersVisible.corruption}
                        onChange={() => toggleLayer('corruption')}
                        className="rounded"
                      />
                      Corruption Reports
                    </label>
                  </div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                  <div className="text-sm font-medium mb-2">Reputation Score</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>85-100% (Excellent)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>70-84% (Good)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>50-69% (Average)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>0-49% (Poor)</span>
                    </div>
                  </div>
                </div>

                {loading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Village List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Villages ({filteredVillages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredVillages.slice(0, 20).map((village) => (
                  <Link 
                    key={village.id} 
                    to={`/village/${village.slug || village.id}`}
                    className="block"
                  >
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{village.village_name}</h4>
                        <Badge className={getBadgeColor(village.reputation_badge)}>
                          {village.overall_reputation_score.toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{village.region}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Transparency: {village.transparency_score.toFixed(0)}%</span>
                        {village.corruption_reports_count > 0 && (
                          <span className="text-red-600">
                            {village.corruption_reports_count} reports
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}