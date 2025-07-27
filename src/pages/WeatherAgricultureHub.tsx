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
  Leaf,
  RefreshCw
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
  village_id?: string;
  villages?: {
    village_name: string;
    region: string;
  };
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
  challenges: string[];
  opportunities: string[];
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
  const [isUpdatingWeather, setIsUpdatingWeather] = useState(false);

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
    setLoading(true);
    try {
      await Promise.all([
        fetchWeatherData(),
        fetchAgricultureData()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const { data, error } = await supabase
        .from('weather_data')
        .select(`
          *,
          villages (
            village_name,
            region
          )
        `)
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Type cast and handle the villages relation properly
      const weatherWithVillages = (data || []).map(item => ({
        ...item,
        villages: item.villages && typeof item.villages === 'object' && item.villages !== null && !Array.isArray(item.villages)
          ? item.villages as { village_name: string; region: string }
          : undefined
      }));
      
      setWeatherData(weatherWithVillages);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast({
        title: "Error",
        description: "Failed to load weather data",
        variant: "destructive"
      });
    }
  };

  const fetchAgricultureData = async () => {
    try {
      const { data, error } = await supabase
        .from('agriculture_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgricultureData((data || []).map(item => ({
        ...item,
        challenges: Array.isArray(item.challenges) 
          ? item.challenges 
          : typeof item.challenges === 'string' 
            ? JSON.parse(item.challenges) 
            : [],
        opportunities: Array.isArray(item.opportunities) 
          ? item.opportunities 
          : typeof item.opportunities === 'string' 
            ? JSON.parse(item.opportunities) 
            : []
      })));
    } catch (error) {
      console.error('Error fetching agriculture data:', error);
      toast({
        title: "Error",
        description: "Failed to load agriculture data",
        variant: "destructive"
      });
    }
  };

  const setupRealtimeSubscriptions = () => {
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
          } else if (payload.eventType === 'UPDATE') {
            setWeatherData(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new as WeatherData : item)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(weatherChannel);
    };
  };

  const updateWeatherData = async () => {
    setIsUpdatingWeather(true);
    try {
      const { data, error } = await supabase.functions.invoke('weather-update');
      
      if (error) throw error;
      
      toast({
        title: "Weather Update",
        description: data.message || "Weather data updated successfully",
      });
      
      await fetchWeatherData();
    } catch (error) {
      console.error('Error updating weather:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update weather data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingWeather(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return CloudRain;
    }
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
      return Cloud;
    }
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
      return Sun;
    }
    return Cloud;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 35) return 'text-red-500';
    if (temp >= 25) return 'text-orange-500';
    if (temp >= 15) return 'text-blue-500';
    return 'text-blue-600';
  };

  const filteredWeatherData = selectedRegion 
    ? weatherData.filter(item => item.region === selectedRegion)
    : weatherData;

  const filteredAgricultureData = selectedRegion 
    ? agricultureData.filter(item => item.region === selectedRegion)
    : agricultureData;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Weather & Agriculture Hub</h1>
          </div>
          <p className="text-xl opacity-90 max-w-3xl">
            Real-time weather data and agricultural insights for farmers across Cameroon
          </p>
          <div className="flex gap-4 mt-6">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {weatherData.length} Weather Reports
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {agricultureData.length} Crop Data
            </Badge>
            <Button 
              onClick={updateWeatherData}
              disabled={isUpdatingWeather}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {isUpdatingWeather ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Update Weather
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Weather Alerts & Advisories
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {weatherAlerts.map((alert, index) => (
              <Card key={index} className="border-l-4 border-l-current">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <alert.icon className={`h-6 w-6 ${alert.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge 
                          variant={alert.type === 'warning' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              className="px-4 py-2 border rounded-md"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <Badge variant="outline" className="px-4 py-2">
              {selectedRegion || 'All Regions'} - {filteredWeatherData.length} Records
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weather">Weather Data</TabsTrigger>
            <TabsTrigger value="agriculture">Agriculture</TabsTrigger>
            <TabsTrigger value="insights">Smart Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="weather" className="space-y-6">
            {/* Weather Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWeatherData.slice(0, 9).map((weather) => {
                const WeatherIcon = getWeatherIcon(weather.weather_condition);
                return (
                  <Card key={weather.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {weather.villages?.village_name || weather.region}
                          </CardTitle>
                          <CardDescription>{weather.region} Region</CardDescription>
                        </div>
                        <WeatherIcon className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getTemperatureColor(weather.temperature_celsius)}`}>
                            {weather.temperature_celsius}°C
                          </div>
                          <div className="text-sm text-muted-foreground">Temperature</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">
                            {weather.humidity_percentage}%
                          </div>
                          <div className="text-sm text-muted-foreground">Humidity</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Droplets className="h-4 w-4" />
                            Rainfall
                          </span>
                          <span className="font-medium">{weather.rainfall_mm} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Wind className="h-4 w-4" />
                            Wind Speed
                          </span>
                          <span className="font-medium">{weather.wind_speed_kmh} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Date
                          </span>
                          <span className="font-medium">{new Date(weather.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Badge variant="outline" className="w-full justify-center">
                        {weather.weather_condition}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="agriculture" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {filteredAgricultureData.map((agri) => (
                <Card key={agri.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="h-5 w-5" />
                      {agri.crop_type} - {agri.region}
                    </CardTitle>
                    <CardDescription>{agri.soil_type} soil, {agri.land_area_hectares} hectares</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Yield per Hectare</div>
                        <div className="text-xl font-bold text-green-600">
                          {agri.yield_per_hectare} tons
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Irrigation</div>
                        <div className="font-medium">{agri.irrigation_method}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Planting Season</span>
                        <Badge variant="outline">{agri.planting_season}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Harvest Season</span>
                        <Badge variant="outline">{agri.harvest_season}</Badge>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Key Challenges</div>
                      <div className="flex flex-wrap gap-1">
                        {agri.challenges.slice(0, 3).map((challenge, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {challenge}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Opportunities</div>
                      <div className="flex flex-wrap gap-1">
                        {agri.opportunities.slice(0, 3).map((opportunity, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {opportunity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Regional Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Hottest Region Today</div>
                      <div className="font-semibold">
                        {filteredWeatherData.length > 0 
                          ? filteredWeatherData.reduce((prev, current) => 
                              prev.temperature_celsius > current.temperature_celsius ? prev : current
                            ).region
                          : 'No data'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Highest Rainfall</div>
                      <div className="font-semibold">
                        {filteredWeatherData.length > 0 
                          ? filteredWeatherData.reduce((prev, current) => 
                              prev.rainfall_mm > current.rainfall_mm ? prev : current
                            ).region
                          : 'No data'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Smart Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-green-50 rounded-md">
                      <div className="font-medium text-green-800">Planting Advice</div>
                      <div className="text-green-700">Ideal conditions for cocoa planting in Southwest region</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-md">
                      <div className="font-medium text-yellow-800">Water Management</div>
                      <div className="text-yellow-700">Consider irrigation for cotton crops in North</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Average Temperature</span>
                      <span className="font-medium">
                        {filteredWeatherData.length > 0 
                          ? (filteredWeatherData.reduce((sum, item) => sum + item.temperature_celsius, 0) / filteredWeatherData.length).toFixed(1)
                          : '0'
                        }°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Rainfall</span>
                      <span className="font-medium">
                        {filteredWeatherData.reduce((sum, item) => sum + item.rainfall_mm, 0).toFixed(1)} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Regions</span>
                      <span className="font-medium">
                        {new Set(filteredWeatherData.map(item => item.region)).size}
                      </span>
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