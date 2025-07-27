import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer,
  Droplets,
  Sprout,
  TrendingUp,
  Calendar,
  MapPin,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Leaf
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  id: string;
  region: string;
  date: string;
  temperature_celsius: number;
  humidity_percentage: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  weather_condition: string;
}

interface AgricultureData {
  id: string;
  region: string;
  crop_type: string;
  planting_season: string;
  harvest_season: string;
  yield_per_hectare: number;
  land_area_hectares: number;
  irrigation_method: string;
  soil_type: string;
  challenges: any;
  opportunities: any;
}

interface WeatherAlert {
  type: 'warning' | 'watch' | 'advisory';
  title: string;
  description: string;
  icon: any;
  color: string;
}

const WeatherAgricultureHub: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [agricultureData, setAgricultureData] = useState<AgricultureData[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weather');

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const weatherAlerts: WeatherAlert[] = [
    {
      type: 'warning',
      title: 'Heavy Rainfall Expected',
      description: 'Torrential rains forecasted for Centre and South regions. Farmers should protect crops.',
      icon: CloudRain,
      color: 'text-red-500'
    },
    {
      type: 'advisory',
      title: 'Optimal Planting Conditions',
      description: 'Perfect humidity and temperature for cocoa planting in Southwest region.',
      icon: Sprout,
      color: 'text-green-500'
    },
    {
      type: 'watch',
      title: 'Drought Monitoring',
      description: 'Low rainfall patterns detected in Far North. Water conservation recommended.',
      icon: Sun,
      color: 'text-yellow-500'
    }
  ];

  useEffect(() => {
    fetchData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch weather data
      const { data: weather, error: weatherError } = await supabase
        .from('weather_data')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);

      if (weatherError) throw weatherError;

      // Fetch agriculture data
      const { data: agriculture, error: agricultureError } = await supabase
        .from('agriculture_data')
        .select('*');

      if (agricultureError) throw agricultureError;

      setWeatherData(weather || []);
      setAgricultureData(agriculture || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load weather and agriculture data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Weather data subscription
    const weatherChannel = supabase
      .channel('weather-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weather_data'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWeatherData(prev => [payload.new as WeatherData, ...prev]);
            toast({
              title: "Weather Update",
              description: `New weather data available for ${payload.new.region}`,
            });
          }
        }
      )
      .subscribe();

    // Agriculture data subscription
    const agricultureChannel = supabase
      .channel('agriculture-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agriculture_data'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAgricultureData(prev => [...prev, payload.new as AgricultureData]);
          } else if (payload.eventType === 'UPDATE') {
            setAgricultureData(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new as AgricultureData : item)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(weatherChannel);
      supabase.removeChannel(agricultureChannel);
    };
  };

  const getFilteredWeatherData = () => {
    if (!selectedRegion) return weatherData.slice(0, 10);
    return weatherData.filter(item => item.region === selectedRegion).slice(0, 10);
  };

  const getFilteredAgricultureData = () => {
    if (!selectedRegion) return agricultureData;
    return agricultureData.filter(item => item.region === selectedRegion);
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return CloudRain;
    if (lowerCondition.includes('cloud')) return Cloud;
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return Sun;
    return Cloud;
  };

  const getCurrentWeather = () => {
    const filteredData = getFilteredWeatherData();
    return filteredData[0] || null;
  };

  const getWeatherTrend = () => {
    const filtered = getFilteredWeatherData();
    if (filtered.length < 2) return { trend: 'stable', change: 0 };
    
    const current = filtered[0];
    const previous = filtered[1];
    const change = current.temperature_celsius - previous.temperature_celsius;
    
    return {
      trend: change > 1 ? 'rising' : change < -1 ? 'falling' : 'stable',
      change: Math.abs(change)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentWeather = getCurrentWeather();
  const weatherTrend = getWeatherTrend();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Weather & Agriculture Hub</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl">
            Real-time weather data, agricultural insights, and farming guidance for Cameroon
          </p>
          <div className="flex gap-4 mt-6">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Live Weather Data
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Agricultural Intelligence
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Weather Alerts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Active Alerts</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {weatherAlerts.map((alert, index) => (
              <Card key={index} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <alert.icon className={`h-6 w-6 ${alert.color} mt-1`} />
                    <div>
                      <h3 className="font-semibold">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {alert.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div className="mb-6">
          <select
            className="p-2 border rounded-md w-full max-w-xs"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:grid-cols-3">
            <TabsTrigger value="weather">Weather Data</TabsTrigger>
            <TabsTrigger value="agriculture">Agriculture</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="weather" className="space-y-6">
            {/* Current Weather Overview */}
            {currentWeather && (
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Thermometer className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-2xl font-bold">{currentWeather.temperature_celsius}°C</p>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{currentWeather.humidity_percentage}%</p>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <CloudRain className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{currentWeather.rainfall_mm}mm</p>
                    <p className="text-sm text-muted-foreground">Rainfall</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Wind className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-2xl font-bold">{currentWeather.wind_speed_kmh} km/h</p>
                    <p className="text-sm text-muted-foreground">Wind Speed</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Weather History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Weather Data</CardTitle>
                <CardDescription>
                  Latest weather readings {selectedRegion && `for ${selectedRegion} region`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredWeatherData().map((weather) => {
                    const WeatherIcon = getWeatherIcon(weather.weather_condition);
                    return (
                      <div key={weather.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <WeatherIcon className="h-6 w-6 text-blue-500" />
                          <div>
                            <p className="font-medium">{weather.region}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(weather.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{weather.temperature_celsius}°C</p>
                          <p className="text-sm text-muted-foreground">{weather.weather_condition}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agriculture" className="space-y-6">
            {/* Agriculture Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5" />
                    Active Crops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {[...new Set(getFilteredAgricultureData().map(item => item.crop_type))].length}
                  </p>
                  <p className="text-sm text-muted-foreground">Different crop types</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Total Land Area
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {getFilteredAgricultureData()
                      .reduce((sum, item) => sum + item.land_area_hectares, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Hectares under cultivation</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Avg. Yield
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {(getFilteredAgricultureData()
                      .reduce((sum, item) => sum + item.yield_per_hectare, 0) / 
                      Math.max(getFilteredAgricultureData().length, 1)
                    ).toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Tons per hectare</p>
                </CardContent>
              </Card>
            </div>

            {/* Crop Data */}
            <Card>
              <CardHeader>
                <CardTitle>Agricultural Data</CardTitle>
                <CardDescription>
                  Crop information and farming practices {selectedRegion && `for ${selectedRegion} region`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredAgricultureData().map((agriculture) => (
                    <div key={agriculture.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold capitalize">{agriculture.crop_type}</h3>
                          <p className="text-sm text-muted-foreground">{agriculture.region} Region</p>
                        </div>
                        <Badge variant="outline">
                          {agriculture.yield_per_hectare} tons/ha
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Planting:</strong> {agriculture.planting_season}</p>
                          <p><strong>Harvest:</strong> {agriculture.harvest_season}</p>
                          <p><strong>Soil Type:</strong> {agriculture.soil_type}</p>
                        </div>
                        <div>
                          <p><strong>Land Area:</strong> {agriculture.land_area_hectares} hectares</p>
                          <p><strong>Irrigation:</strong> {agriculture.irrigation_method}</p>
                        </div>
                      </div>

                      {agriculture.challenges.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-sm mb-1">Challenges:</p>
                          <div className="flex flex-wrap gap-1">
                            {agriculture.challenges.map((challenge, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {challenge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {agriculture.opportunities.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium text-sm mb-1">Opportunities:</p>
                          <div className="flex flex-wrap gap-1">
                            {agriculture.opportunities.map((opportunity, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {opportunity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Farming Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800">Optimal Planting Time</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Current weather conditions are ideal for maize planting in Centre region. 
                      Soil moisture levels are optimal.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800">Irrigation Advisory</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Expected dry spell in Far North region. Consider supplemental irrigation 
                      for groundnut crops.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Pest Alert</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      High humidity in Southwest region may increase risk of cocoa black pod disease. 
                      Monitor crops closely.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Seasonal Outlook
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Rainfall Forecast</span>
                      <Badge variant="secondary">Above Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Temperature Trend</span>
                      <Badge variant="outline">Stable</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Growing Season</span>
                      <Badge className="bg-green-500">Favorable</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Market Conditions</span>
                      <Badge variant="secondary">Strong Demand</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WeatherAgricultureHub;