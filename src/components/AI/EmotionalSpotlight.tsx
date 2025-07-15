import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Eye, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  Filter,
  AlertTriangle,
  Heart,
  Frown,
  Smile,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface EmotionData {
  emotion: string;
  value: number;
  color: string;
  description: string;
  icon: React.ReactNode;
  percentage: number;
}

interface EmotionalAnalysis {
  id: string;
  content_text: string;
  emotional_tone: string[];
  sentiment_score: number;
  platform: string;
  region_detected: string;
  created_at: string;
  author_handle: string;
  threat_level: string;
  confidence_score: number;
}

interface RegionalEmotions {
  region: string;
  emotions: EmotionData[];
  total_content: number;
  dominant_emotion: string;
}

interface PersonEmotions {
  person: string;
  emotions: EmotionData[];
  total_mentions: number;
  primary_emotion: string;
}

const EMOTION_CONFIG = {
  anger: { 
    color: '#ef4444', 
    description: 'Frustration, outrage, indignation',
    icon: <Frown className="h-4 w-4" />,
    alertLevel: 'high'
  },
  fear: { 
    color: '#f59e0b', 
    description: 'Anxiety, worry, concern about future',
    icon: <AlertTriangle className="h-4 w-4" />,
    alertLevel: 'medium'
  },
  joy: { 
    color: '#10b981', 
    description: 'Happiness, celebration, satisfaction',
    icon: <Smile className="h-4 w-4" />,
    alertLevel: 'low'
  },
  sadness: { 
    color: '#6b7280', 
    description: 'Disappointment, grief, melancholy',
    icon: <Heart className="h-4 w-4" />,
    alertLevel: 'medium'
  },
  sarcasm: { 
    color: '#8b5cf6', 
    description: 'Irony, mockery, cynical remarks',
    icon: <Eye className="h-4 w-4" />,
    alertLevel: 'medium'
  },
  hope: { 
    color: '#3b82f6', 
    description: 'Optimism, faith, positive expectations',
    icon: <TrendingUp className="h-4 w-4" />,
    alertLevel: 'low'
  }
};

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const EmotionalSpotlight = () => {
  const [emotionalData, setEmotionalData] = useState<EmotionalAnalysis[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    loadEmotionalData();
  }, [selectedTimeframe, selectedRegion, selectedEmotion, selectedPerson]);

  const loadEmotionalData = async () => {
    setIsLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(selectedTimeframe));

      const { data } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      // Process and filter the data
      let processedData = data || [];
      
      if (selectedRegion !== 'all') {
        processedData = processedData.filter(item => item.region_detected === selectedRegion);
      }
      
      if (selectedEmotion !== 'all') {
        processedData = processedData.filter(item => 
          item.emotional_tone?.includes(selectedEmotion)
        );
      }

      setEmotionalData(processedData);
    } catch (error) {
      console.error('Error loading emotional data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmotionDistribution = (): EmotionData[] => {
    const emotionCounts: Record<string, number> = {};
    const totalPosts = emotionalData.length;

    // Initialize emotion counts
    Object.keys(EMOTION_CONFIG).forEach(emotion => {
      emotionCounts[emotion] = 0;
    });

    // Count emotions from data
    emotionalData.forEach(item => {
      item.emotional_tone?.forEach(emotion => {
        if (emotionCounts.hasOwnProperty(emotion)) {
          emotionCounts[emotion]++;
        }
      });
    });

    return Object.entries(EMOTION_CONFIG).map(([emotion, config]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: emotionCounts[emotion],
      color: config.color,
      description: config.description,
      icon: config.icon,
      percentage: totalPosts > 0 ? (emotionCounts[emotion] / totalPosts) * 100 : 0
    }));
  };

  const getRegionalEmotions = (): RegionalEmotions[] => {
    return CAMEROON_REGIONS.map(region => {
      const regionData = emotionalData.filter(item => item.region_detected === region);
      const emotionCounts: Record<string, number> = {};
      
      Object.keys(EMOTION_CONFIG).forEach(emotion => {
        emotionCounts[emotion] = 0;
      });

      regionData.forEach(item => {
        item.emotional_tone?.forEach(emotion => {
          if (emotionCounts.hasOwnProperty(emotion)) {
            emotionCounts[emotion]++;
          }
        });
      });

      const emotions = Object.entries(EMOTION_CONFIG).map(([emotion, config]) => ({
        emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: emotionCounts[emotion],
        color: config.color,
        description: config.description,
        icon: config.icon,
        percentage: regionData.length > 0 ? (emotionCounts[emotion] / regionData.length) * 100 : 0
      }));

      const dominantEmotion = emotions.reduce((prev, current) => 
        prev.value > current.value ? prev : current
      );

      return {
        region,
        emotions,
        total_content: regionData.length,
        dominant_emotion: dominantEmotion.emotion
      };
    });
  };

  const getEmotionalAlerts = () => {
    const alerts = [];
    const emotionDistribution = getEmotionDistribution();
    
    // Check for high anger levels
    const anger = emotionDistribution.find(e => e.emotion === 'Anger');
    if (anger && anger.percentage > 25) {
      alerts.push({
        type: 'danger',
        title: 'High Anger Levels Detected',
        message: `${anger.percentage.toFixed(1)}% of content shows anger - monitor for potential unrest`,
        emotion: 'anger'
      });
    }

    // Check for high fear levels
    const fear = emotionDistribution.find(e => e.emotion === 'Fear');
    if (fear && fear.percentage > 20) {
      alerts.push({
        type: 'warning',
        title: 'Elevated Fear Levels',
        message: `${fear.percentage.toFixed(1)}% of content expresses fear - investigate causes`,
        emotion: 'fear'
      });
    }

    // Check for sarcasm levels
    const sarcasm = emotionDistribution.find(e => e.emotion === 'Sarcasm');
    if (sarcasm && sarcasm.percentage > 15) {
      alerts.push({
        type: 'info',
        title: 'High Sarcasm Detected',
        message: `${sarcasm.percentage.toFixed(1)}% sarcastic content may indicate cynicism`,
        emotion: 'sarcasm'
      });
    }

    return alerts;
  };

  const emotionDistribution = getEmotionDistribution();
  const regionalEmotions = getRegionalEmotions();
  const emotionalAlerts = getEmotionalAlerts();

  const totalEmotionalContent = emotionalData.length;
  const dominantEmotion = emotionDistribution.reduce((prev, current) => 
    prev.value > current.value ? prev : current
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>Emotional Spotlight</span>
            <Badge variant="outline">Advanced Emotion Detection</Badge>
          </CardTitle>
          <CardDescription>
            Deep emotional analysis across platforms, regions, and political entities
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
              <MapPin className="h-4 w-4" />
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {CAMEROON_REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emotions</SelectItem>
                  {Object.keys(EMOTION_CONFIG).map(emotion => (
                    <SelectItem key={emotion} value={emotion}>
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              onClick={loadEmotionalData}
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Content Analyzed</p>
                <p className="text-2xl font-bold">{totalEmotionalContent.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dominant Emotion</p>
                <p className="text-2xl font-bold" style={{ color: dominantEmotion.color }}>
                  {dominantEmotion.emotion}
                </p>
              </div>
              {dominantEmotion.icon}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emotional Alerts</p>
                <p className="text-2xl font-bold text-red-600">{emotionalAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Regions</p>
                <p className="text-2xl font-bold">{regionalEmotions.filter(r => r.total_content > 0).length}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emotional Alerts */}
      {emotionalAlerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              <span>Emotional Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emotionalAlerts.map((alert, idx) => (
                <Alert key={idx} className={
                  alert.type === 'danger' ? 'border-red-500' :
                  alert.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regional">By Region</TabsTrigger>
          <TabsTrigger value="radar">Emotion Radar</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotion Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={emotionDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ emotion, percentage }) => `${emotion}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {emotionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Emotion Details */}
            <Card>
              <CardHeader>
                <CardTitle>Emotion Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emotionDistribution.map((emotion, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {emotion.icon}
                          <span className="font-medium">{emotion.emotion}</span>
                        </div>
                        <span className="text-sm font-bold">
                          {emotion.value} ({emotion.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress 
                        value={emotion.percentage} 
                        className="h-2"
                        style={{ 
                          backgroundColor: `${emotion.color}20`,
                        }}
                      />
                      <p className="text-xs text-muted-foreground">{emotion.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionalEmotions.map((region, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{region.region}</span>
                    <Badge 
                      style={{ backgroundColor: region.emotions.find(e => e.emotion === region.dominant_emotion)?.color }}
                      className="text-white"
                    >
                      {region.dominant_emotion}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {region.total_content} posts analyzed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {region.emotions.slice(0, 3).map((emotion, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {emotion.icon}
                          <span>{emotion.emotion}</span>
                        </div>
                        <span className="font-medium">{emotion.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emotional Radar Analysis</CardTitle>
              <CardDescription>
                Multi-dimensional view of emotional patterns across different contexts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={emotionDistribution}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="emotion" />
                  <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                  <Radar
                    name="Emotional Intensity"
                    dataKey="percentage"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emotional Timeline</CardTitle>
              <CardDescription>
                Track emotional trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Timeline analysis coming soon...</p>
                <p className="text-sm">This will show emotional patterns over time</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmotionalSpotlight;