import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Filter, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RegionalSentiment {
  region: string;
  overall_sentiment: number;
  sentiment_breakdown: any;
  dominant_emotions: string[];
  threat_level: string;
  date_recorded: string;
  content_volume: number;
  trending_hashtags: string[];
  top_concerns: string[];
  notable_events: string[];
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const RegionalSentimentHeatmap = () => {
  const [regionalData, setRegionalData] = useState<RegionalSentiment[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7');
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRegionalData();
  }, [selectedTimeframe, selectedEmotion]);

  const loadRegionalData = async () => {
    setIsLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(selectedTimeframe));

      const { data } = await supabase
        .from('camerpulse_intelligence_regional_sentiment')
        .select('*')
        .gte('date_recorded', daysAgo.toISOString().split('T')[0])
        .order('date_recorded', { ascending: false });

      // Group by region and get latest data for each
      const latestByRegion = CAMEROON_REGIONS.map(region => {
        const regionData = data?.filter(d => d.region === region) || [];
        const latest = regionData[0] || {
          region,
          overall_sentiment: 0,
          sentiment_breakdown: {},
          dominant_emotions: [],
          threat_level: 'none',
          date_recorded: new Date().toISOString().split('T')[0],
          content_volume: 0,
          trending_hashtags: [],
          top_concerns: [],
          notable_events: []
        };
        return latest;
      });

      setRegionalData(latestByRegion);
    } catch (error) {
      console.error('Error loading regional data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'bg-green-500';
    if (sentiment > 0.1) return 'bg-green-300';
    if (sentiment > -0.1) return 'bg-yellow-400';
    if (sentiment > -0.3) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getSentimentIntensity = (sentiment: number) => {
    const intensity = Math.abs(sentiment);
    if (intensity > 0.7) return 'opacity-100';
    if (intensity > 0.5) return 'opacity-80';
    if (intensity > 0.3) return 'opacity-60';
    if (intensity > 0.1) return 'opacity-40';
    return 'opacity-20';
  };

  const getRegionData = (regionName: string) => {
    return regionalData.find(r => r.region === regionName) || {
      region: regionName,
      overall_sentiment: 0,
      sentiment_breakdown: {},
      dominant_emotions: [],
      threat_level: 'none',
      date_recorded: new Date().toISOString().split('T')[0],
      content_volume: 0,
      trending_hashtags: [],
      top_concerns: [],
      notable_events: []
    };
  };

  const RegionTile = ({ regionName }: { regionName: string }) => {
    const data = getRegionData(regionName);
    const colorClass = getSentimentColor(data.overall_sentiment);
    const intensityClass = getSentimentIntensity(data.overall_sentiment);

    return (
      <div
        className={`
          relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
          ${colorClass} ${intensityClass}
          ${hoveredRegion === regionName ? 'border-primary scale-105 shadow-lg' : 'border-transparent'}
          hover:border-primary hover:scale-105 hover:shadow-lg
        `}
        onMouseEnter={() => setHoveredRegion(regionName)}
        onMouseLeave={() => setHoveredRegion(null)}
      >
        <div className="text-center">
          <h3 className="font-semibold text-white drop-shadow-lg">{regionName}</h3>
          <div className="text-sm text-white/90 mt-1">
            {data.overall_sentiment.toFixed(2)}
          </div>
          {data.threat_level !== 'none' && (
            <AlertTriangle className="h-4 w-4 text-red-800 absolute top-1 right-1" />
          )}
        </div>

        {/* Volume indicator */}
        <div className="absolute bottom-1 left-1">
          <div className={`
            w-2 h-2 rounded-full
            ${data.content_volume > 100 ? 'bg-white' : 
              data.content_volume > 50 ? 'bg-white/70' : 
              data.content_volume > 10 ? 'bg-white/40' : 'bg-white/20'}
          `} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Regional Sentiment Heatmap</span>
          </CardTitle>
          <CardDescription>
            Real-time sentiment analysis across all 10 regions of Cameroon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Today</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emotions</SelectItem>
                  <SelectItem value="anger">Anger</SelectItem>
                  <SelectItem value="joy">Joy</SelectItem>
                  <SelectItem value="fear">Fear</SelectItem>
                  <SelectItem value="sadness">Sadness</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="disgust">Disgust</SelectItem>
                  <SelectItem value="surprise">Surprise</SelectItem>
                  <SelectItem value="anticipation">Anticipation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              onClick={loadRegionalData}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Negative</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm">Mixed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Positive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm">High Volume</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {CAMEROON_REGIONS.map((region) => (
          <RegionTile key={region} regionName={region} />
        ))}
      </div>

      {/* Detailed View for Hovered Region */}
      {hoveredRegion && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>{hoveredRegion} Region Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sentiment Breakdown */}
              <div>
                <h4 className="font-semibold mb-3">Sentiment Score</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overall:</span>
                    <span className={`font-bold ${
                      getRegionData(hoveredRegion).overall_sentiment > 0.3 ? 'text-green-600' :
                      getRegionData(hoveredRegion).overall_sentiment < -0.3 ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {getRegionData(hoveredRegion).overall_sentiment.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Volume:</span>
                    <span className="font-medium">{getRegionData(hoveredRegion).content_volume}</span>
                  </div>
                  {getRegionData(hoveredRegion).threat_level !== 'none' && (
                    <div className="flex justify-between">
                      <span>Threat Level:</span>
                      <Badge variant="destructive">{getRegionData(hoveredRegion).threat_level}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Dominant Emotions */}
              <div>
                <h4 className="font-semibold mb-3">Dominant Emotions</h4>
                <div className="flex flex-wrap gap-1">
                  {getRegionData(hoveredRegion).dominant_emotions?.slice(0, 6).map((emotion, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trending</span>
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Hashtags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getRegionData(hoveredRegion).trending_hashtags?.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Top Concerns:</span>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getRegionData(hoveredRegion).top_concerns?.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {regionalData.filter(r => r.overall_sentiment > 0.1).length}
              </div>
              <div className="text-sm text-muted-foreground">Positive Regions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {regionalData.filter(r => r.overall_sentiment >= -0.1 && r.overall_sentiment <= 0.1).length}
              </div>
              <div className="text-sm text-muted-foreground">Neutral Regions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {regionalData.filter(r => r.overall_sentiment < -0.1).length}
              </div>
              <div className="text-sm text-muted-foreground">Negative Regions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {regionalData.filter(r => r.threat_level !== 'none').length}
              </div>
              <div className="text-sm text-muted-foreground">Alert Regions</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegionalSentimentHeatmap;