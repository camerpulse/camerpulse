import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Search, 
  Filter, 
  Building2,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  Eye,
  Globe,
  Target,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LocalSentiment {
  id: string;
  region: string;
  division: string;
  city_town: string;
  subdivision: string;
  locality: string;
  overall_sentiment: number;
  sentiment_breakdown: any;
  dominant_emotions: string[];
  threat_level: string;
  content_volume: number;
  population_estimate: number;
  is_major_city: boolean;
  urban_rural: string;
  latitude: number;
  longitude: number;
  date_recorded: string;
  top_concerns: string[];
  trending_hashtags: string[];
}

interface LocationInfo {
  city_town: string;
  region: string;
  division: string;
  population: number;
  is_major_city: boolean;
  latitude: number;
  longitude: number;
}

const LocalSentimentMapper = () => {
  const [localData, setLocalData] = useState<LocalSentiment[]>([]);
  const [availableLocations, setAvailableLocations] = useState<LocationInfo[]>([]);
  const [filteredData, setFilteredData] = useState<LocalSentiment[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCityType, setSelectedCityType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7');
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLocalSentimentData();
    loadAvailableLocations();
  }, [selectedTimeframe]);

  useEffect(() => {
    filterData();
  }, [localData, selectedRegion, selectedCityType, searchQuery]);

  const loadAvailableLocations = async () => {
    try {
      const { data } = await supabase
        .from('cameroon_locations')
        .select('city_town, region, division, population, is_major_city, latitude, longitude')
        .order('population', { ascending: false });

      setAvailableLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadLocalSentimentData = async () => {
    setIsLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(selectedTimeframe));

      // Load existing local sentiment data
      const { data: existingData } = await supabase
        .from('camerpulse_intelligence_local_sentiment')
        .select('*')
        .gte('date_recorded', daysAgo.toISOString().split('T')[0])
        .order('date_recorded', { ascending: false });

      // If no local sentiment data exists, generate from regional data
      if (!existingData || existingData.length === 0) {
        await generateLocalSentimentFromLogs();
        // Reload after generation
        const { data: newData } = await supabase
          .from('camerpulse_intelligence_local_sentiment')
          .select('*')
          .gte('date_recorded', daysAgo.toISOString().split('T')[0])
          .order('date_recorded', { ascending: false });
        
        setLocalData(newData || []);
      } else {
        setLocalData(existingData);
      }
    } catch (error) {
      console.error('Error loading local sentiment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalSentimentFromLogs = async () => {
    try {
      // Aggregate sentiment data by city from existing logs
      const { data: sentimentLogs } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('content_text, sentiment_score, sentiment_polarity, emotional_tone, region_detected, city_detected, created_at')
        .not('city_detected', 'is', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!sentimentLogs || sentimentLogs.length === 0) return;

      // Group by city and calculate aggregated sentiment
      const cityStats = new Map<string, any>();

      sentimentLogs.forEach(log => {
        const key = `${log.city_detected}_${log.region_detected}`;
        if (!cityStats.has(key)) {
          cityStats.set(key, {
            city: log.city_detected,
            region: log.region_detected,
            sentiments: [],
            emotions: [],
            volume: 0
          });
        }

        const stats = cityStats.get(key);
        stats.sentiments.push(log.sentiment_score || 0);
        if (log.emotional_tone) {
          stats.emotions.push(...log.emotional_tone);
        }
        stats.volume++;
      });

      const localSentimentEntries = Array.from(cityStats.entries()).map(([key, stats]) => ({
        region: stats.region,
        city_town: stats.city,
        overall_sentiment: stats.sentiments.reduce((a: number, b: number) => a + b, 0) / stats.sentiments.length,
        content_volume: stats.volume,
        dominant_emotions: [...new Set(stats.emotions)].slice(0, 5) as string[],
        threat_level: (stats.sentiments.reduce((a: number, b: number) => a + b, 0) / stats.sentiments.length) < -0.5 ? 'high' : 
                     (stats.sentiments.reduce((a: number, b: number) => a + b, 0) / stats.sentiments.length) < -0.2 ? 'medium' : 'low',
        sentiment_breakdown: {
          positive: stats.sentiments.filter((s: number) => s > 0.1).length,
          negative: stats.sentiments.filter((s: number) => s < -0.1).length,
          neutral: stats.sentiments.filter((s: number) => s >= -0.1 && s <= 0.1).length
        },
        date_recorded: new Date().toISOString().split('T')[0]
      }));

      if (localSentimentEntries.length > 0) {
        await supabase
          .from('camerpulse_intelligence_local_sentiment')
          .upsert(localSentimentEntries, {
            onConflict: 'city_town,region,date_recorded'
          });
      }
    } catch (error) {
      console.error('Error generating local sentiment:', error);
    }
  };

  const filterData = () => {
    let filtered = localData;

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(item => item.region === selectedRegion);
    }

    if (selectedCityType !== 'all') {
      filtered = filtered.filter(item => 
        selectedCityType === 'major' ? item.is_major_city : !item.is_major_city
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.city_town.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'bg-green-500';
    if (sentiment > 0.1) return 'bg-green-300';
    if (sentiment > -0.1) return 'bg-yellow-400';
    if (sentiment > -0.3) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getSentimentIntensity = (sentiment: number, volume: number) => {
    const baseIntensity = Math.abs(sentiment);
    const volumeBoost = Math.min(volume / 100, 0.3); // Max 30% boost from volume
    const finalIntensity = Math.min(baseIntensity + volumeBoost, 1);
    
    if (finalIntensity > 0.8) return 'opacity-100';
    if (finalIntensity > 0.6) return 'opacity-80';
    if (finalIntensity > 0.4) return 'opacity-60';
    if (finalIntensity > 0.2) return 'opacity-40';
    return 'opacity-20';
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-blue-400';
      default: return 'bg-gray-400';
    }
  };

  const CityTile = ({ cityData }: { cityData: LocalSentiment }) => {
    const colorClass = getSentimentColor(cityData.overall_sentiment);
    const intensityClass = getSentimentIntensity(cityData.overall_sentiment, cityData.content_volume);

    return (
      <div
        className={`
          relative p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer min-h-[120px]
          ${colorClass} ${intensityClass}
          ${hoveredCity === cityData.city_town ? 'border-primary scale-105 shadow-lg' : 'border-transparent'}
          hover:border-primary hover:scale-105 hover:shadow-lg
        `}
        onMouseEnter={() => setHoveredCity(cityData.city_town)}
        onMouseLeave={() => setHoveredCity(null)}
      >
        <div className="text-center text-white">
          <h4 className="font-semibold text-sm drop-shadow-lg">{cityData.city_town}</h4>
          <div className="text-xs opacity-90 mb-1">{cityData.region}</div>
          <div className="text-sm font-bold mb-1">
            {cityData.overall_sentiment.toFixed(2)}
          </div>
          <div className="text-xs">
            {cityData.content_volume} posts
          </div>
          
          {cityData.is_major_city && (
            <Building2 className="h-3 w-3 text-white absolute top-1 left-1" />
          )}
          
          {cityData.threat_level !== 'low' && cityData.threat_level !== 'none' && (
            <AlertTriangle className="h-3 w-3 text-red-200 absolute top-1 right-1" />
          )}
        </div>

        {/* Population indicator */}
        <div className="absolute bottom-1 right-1">
          <div className={`
            w-2 h-2 rounded-full
            ${cityData.population_estimate > 500000 ? 'bg-white' : 
              cityData.population_estimate > 100000 ? 'bg-white/70' : 
              cityData.population_estimate > 50000 ? 'bg-white/40' : 'bg-white/20'}
          `} />
        </div>
      </div>
    );
  };

  const regions = [...new Set(availableLocations.map(loc => loc.region))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span>Local Sentiment Mapper</span>
            <Badge variant="secondary">City-Level Analysis</Badge>
          </CardTitle>
          <CardDescription>
            Precision sentiment monitoring at city, town and subdivision level across Cameroon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
              <div className="text-sm text-muted-foreground">Cities Monitored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredData.filter(d => d.is_major_city).length}
              </div>
              <div className="text-sm text-muted-foreground">Major Cities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredData.filter(d => d.threat_level === 'high' || d.threat_level === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">High Alert Cities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredData.reduce((acc, d) => acc + d.content_volume, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Local Posts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCityType} onValueChange={setSelectedCityType}>
              <SelectTrigger>
                <SelectValue placeholder="City Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="major">Major Cities</SelectItem>
                <SelectItem value="towns">Towns & Villages</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Today</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={loadLocalSentimentData}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Negative</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Mixed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Positive</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-3 w-3" />
              <span>Major City</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span>High Population</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grid">City Grid</TabsTrigger>
          <TabsTrigger value="list">Detailed List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-[120px] bg-muted animate-pulse rounded-lg"></div>
              ))
            ) : filteredData.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No local sentiment data found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              filteredData.map((cityData) => (
                <CityTile key={`${cityData.city_town}_${cityData.region}`} cityData={cityData} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-3">
            {filteredData.map((cityData) => (
              <Card key={`${cityData.city_town}_${cityData.region}`} className="border-l-4" 
                    style={{borderLeftColor: cityData.overall_sentiment > 0.1 ? '#10b981' : 
                                          cityData.overall_sentiment < -0.1 ? '#ef4444' : '#eab308'}}>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg flex items-center space-x-2">
                        <span>{cityData.city_town}</span>
                        {cityData.is_major_city && <Building2 className="h-4 w-4 text-blue-600" />}
                      </h4>
                      <p className="text-sm text-muted-foreground">{cityData.region} Region</p>
                      {cityData.division && (
                        <p className="text-xs text-muted-foreground">{cityData.division} Division</p>
                      )}
                    </div>

                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        cityData.overall_sentiment > 0.3 ? 'text-green-600' :
                        cityData.overall_sentiment < -0.3 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {cityData.overall_sentiment.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">Sentiment Score</p>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-semibold">{cityData.content_volume}</div>
                      <p className="text-xs text-muted-foreground">Posts Analyzed</p>
                      <Badge className={getThreatLevelColor(cityData.threat_level)} variant="outline">
                        {cityData.threat_level}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs font-medium mb-1">Dominant Emotions:</p>
                      <div className="flex flex-wrap gap-1">
                        {cityData.dominant_emotions?.slice(0, 3).map((emotion, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sentiment Distribution by City Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Major Cities</span>
                      <span className="text-sm font-medium">
                        {filteredData.filter(d => d.is_major_city).length} cities
                      </span>
                    </div>
                    <Progress 
                      value={filteredData.filter(d => d.is_major_city && d.overall_sentiment > 0).length / 
                            Math.max(filteredData.filter(d => d.is_major_city).length, 1) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Towns & Villages</span>
                      <span className="text-sm font-medium">
                        {filteredData.filter(d => !d.is_major_city).length} locations
                      </span>
                    </div>
                    <Progress 
                      value={filteredData.filter(d => !d.is_major_city && d.overall_sentiment > 0).length / 
                            Math.max(filteredData.filter(d => !d.is_major_city).length, 1) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Positive Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredData
                    .sort((a, b) => b.overall_sentiment - a.overall_sentiment)
                    .slice(0, 5)
                    .map((city, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{city.city_town}</span>
                          <span className="text-xs text-muted-foreground ml-2">{city.region}</span>
                        </div>
                        <Badge variant="default">
                          +{city.overall_sentiment.toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed View for Hovered City */}
      {hoveredCity && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>{hoveredCity} - Local Sentiment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const cityData = filteredData.find(d => d.city_town === hoveredCity);
              if (!cityData) return null;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Location Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Region:</strong> {cityData.region}</div>
                      {cityData.division && <div><strong>Division:</strong> {cityData.division}</div>}
                      {cityData.subdivision && <div><strong>Subdivision:</strong> {cityData.subdivision}</div>}
                      <div><strong>Type:</strong> {cityData.is_major_city ? 'Major City' : 'Town/Village'}</div>
                      <div><strong>Setting:</strong> {cityData.urban_rural}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Sentiment Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Overall Score:</span>
                        <span className={`font-bold ${
                          cityData.overall_sentiment > 0.3 ? 'text-green-600' :
                          cityData.overall_sentiment < -0.3 ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {cityData.overall_sentiment.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Content Volume:</span>
                        <span className="font-medium">{cityData.content_volume}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Threat Level:</span>
                        <Badge className={getThreatLevelColor(cityData.threat_level)} variant="outline">
                          {cityData.threat_level}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Local Insights</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Emotions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cityData.dominant_emotions?.slice(0, 4).map((emotion, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {cityData.top_concerns && cityData.top_concerns.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Top Concerns:</span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {cityData.top_concerns.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocalSentimentMapper;