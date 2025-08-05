import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  GraduationCap, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  MapPin,
  BarChart3,
  Activity,
  Calendar,
  Eye,
  Target,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ServiceEvent {
  id: string;
  country_code: string;
  region: string;
  city_town: string | null;
  event_type: string;
  event_category: string;
  event_title: string;
  event_description: string | null;
  severity: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  affected_population: number | null;
  impact_areas: string[] | null;
  data_source: string;
  source_url: string | null;
  coordinates: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface ServiceCorrelation {
  id: string;
  service_event_id: string;
  region: string;
  emotion_type: string;
  emotion_intensity: number;
  sentiment_volume: number;
  correlation_strength: number;
  analysis_confidence: number;
  insights: any;
  date_analyzed: string;
  created_at: string;
  service_event?: ServiceEvent;
}

interface TimelineData {
  date: string;
  health: number;
  education: number;
  security: number;
  emotions: number;
}

const SERVICE_TYPES = {
  health: {
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    label: 'Health',
    emoji: '🔴'
  },
  education: {
    icon: GraduationCap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    label: 'Education',
    emoji: '📚'
  },
  security: {
    icon: Shield,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    label: 'Security',
    emoji: '🛡️'
  }
};

const CivicServiceDataPanel = () => {
  const [serviceEvents, setServiceEvents] = useState<ServiceEvent[]>([]);
  const [correlations, setCorrelations] = useState<ServiceCorrelation[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadServiceData();
  }, []);

  const loadServiceData = async () => {
    setIsLoading(true);
    try {
      // Load service events
      const { data: events } = await supabase
        .from('civic_service_events')
        .select('*')
        .eq('country_code', 'CM')
        .order('start_date', { ascending: false });

      // Load correlations with service events
      const { data: correlationData } = await supabase
        .from('service_emotion_correlations')
        .select(`
          *,
          service_event:civic_service_events(*)
        `)
        .order('date_analyzed', { ascending: false });

      setServiceEvents(events || []);
      setCorrelations(correlationData || []);

      // Generate timeline data
      if (events && events.length > 0) {
        generateTimelineData(events);
      }

    } catch (error) {
      console.error('Error loading service data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load civic service data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimelineData = (events: ServiceEvent[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const timeline = last30Days.map(date => {
      const dayEvents = events.filter(event => 
        event.start_date.split('T')[0] === date
      );

      return {
        date,
        health: dayEvents.filter(e => e.event_type === 'health').length,
        education: dayEvents.filter(e => e.event_type === 'education').length,
        security: dayEvents.filter(e => e.event_type === 'security').length,
        emotions: dayEvents.reduce((acc, e) => acc + (e.affected_population || 0), 0) / 1000 // Scale down for chart
      };
    });

    setTimelineData(timeline);
  };

  const getFilteredEvents = () => {
    return serviceEvents.filter(event => {
      const typeMatch = selectedType === 'all' || event.event_type === selectedType;
      const regionMatch = selectedRegion === 'all' || event.region === selectedRegion;
      return typeMatch && regionMatch;
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-400 text-white';
      case 'medium': return 'bg-yellow-400 text-black';
      case 'low': return 'bg-green-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getRegions = () => {
    const regions = [...new Set(serviceEvents.map(e => e.region))];
    return regions.sort();
  };

  const getCorrelationInsight = (event: ServiceEvent) => {
    const correlation = correlations.find(c => c.service_event?.id === event.id);
    if (!correlation) return null;

    return {
      emotion: correlation.emotion_type,
      intensity: correlation.emotion_intensity,
      strength: correlation.correlation_strength,
      confidence: correlation.analysis_confidence,
      volume: correlation.sentiment_volume
    };
  };

  const getServiceStats = () => {
    const filtered = getFilteredEvents();
    const activeEvents = filtered.filter(e => e.is_active);
    
    return {
      total: filtered.length,
      active: activeEvents.length,
      critical: filtered.filter(e => e.severity === 'critical').length,
      affectedPopulation: filtered.reduce((acc, e) => acc + (e.affected_population || 0), 0)
    };
  };

  const stats = getServiceStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading civic service data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Civic Service Intelligence</h1>
              <p className="text-blue-100">Real-time correlation between service delivery & public emotions</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
            <Zap className="h-3 w-3 mr-1" />
            Live Data Bridge
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="health">🔴 Health</SelectItem>
            <SelectItem value="education">📚 Education</SelectItem>
            <SelectItem value="security">🛡️ Security</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {getRegions().map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={loadServiceData} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              <span>Total Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Service disruptions tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              <span>Active Issues</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.active}</div>
            <p className="text-sm text-muted-foreground">Currently ongoing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Shield className="h-5 w-5" />
              <span>Critical Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-sm text-muted-foreground">Requiring urgent attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Users className="h-5 w-5" />
              <span>Population Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {(stats.affectedPopulation / 1000000).toFixed(1)}M
            </div>
            <p className="text-sm text-muted-foreground">People affected</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Service Events</TabsTrigger>
          <TabsTrigger value="timeline">Timeline Analysis</TabsTrigger>
          <TabsTrigger value="correlations">Emotion Correlations</TabsTrigger>
          <TabsTrigger value="heatmap">Regional Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Current Service Disruptions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
        {getFilteredEvents().map((event) => {
                  const serviceType = SERVICE_TYPES[event.event_type as keyof typeof SERVICE_TYPES] || SERVICE_TYPES.health;
                  const Icon = serviceType.icon;
                  const correlation = getCorrelationInsight(event);

                  return (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${serviceType.bgColor} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{event.event_title}</h3>
                            <p className="text-sm text-muted-foreground">{event.event_description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          {event.is_active && (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Region</p>
                          <p className="font-medium flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.region}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Affected Population</p>
                          <p className="font-medium">{event.affected_population?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">{new Date(event.start_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Data Source</p>
                          <p className="font-medium capitalize">{event.data_source.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {correlation && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Emotional Impact Analysis</h4>
                            <Badge variant="outline" className="text-xs">
                              {(correlation.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Dominant Emotion</p>
                              <p className="font-medium capitalize">{correlation.emotion}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Intensity</p>
                              <Progress value={correlation.intensity * 100} className="mt-1 h-2" />
                            </div>
                            <div>
                              <p className="text-muted-foreground">Sentiment Volume</p>
                              <p className="font-medium">{correlation.volume} posts</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Service Events Timeline (Last 30 Days)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="health" stroke="#ef4444" strokeWidth={2} name="Health" />
                    <Line type="monotone" dataKey="education" stroke="#3b82f6" strokeWidth={2} name="Education" />
                    <Line type="monotone" dataKey="security" stroke="#f97316" strokeWidth={2} name="Security" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Service-Emotion Correlation Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlations.slice(0, 6).map((correlation) => (
                  <div key={correlation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {SERVICE_TYPES[correlation.service_event?.event_type as keyof typeof SERVICE_TYPES]?.emoji}
                        </div>
                        <div>
                          <h3 className="font-semibold">{correlation.service_event?.event_title}</h3>
                          <p className="text-sm text-muted-foreground">{correlation.region}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Correlation: {(correlation.correlation_strength * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Emotion Type</p>
                        <p className="font-medium capitalize">{correlation.emotion_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Intensity</p>
                        <Progress value={Math.abs(correlation.emotion_intensity) * 100} className="mt-1 h-2" />
                      </div>
                      <div>
                        <p className="text-muted-foreground">Volume</p>
                        <p className="font-medium">{correlation.sentiment_volume} reports</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-medium">{(correlation.analysis_confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>

                    {correlation.insights?.key_phrases && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Key Phrases:</p>
                        <div className="flex flex-wrap gap-1">
                          {correlation.insights.key_phrases.map((phrase: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              "{phrase}"
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

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Regional Service Disruption Heatmap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getRegions().map((region) => {
                  const regionEvents = getFilteredEvents().filter(e => e.region === region);
                  const activeEvents = regionEvents.filter(e => e.is_active);
                  const criticalEvents = regionEvents.filter(e => e.severity === 'critical');
                  const affectedPop = regionEvents.reduce((acc, e) => acc + (e.affected_population || 0), 0);

                  const riskLevel = criticalEvents.length > 0 ? 'high' : 
                                   activeEvents.length > 2 ? 'medium' : 'low';

                  const riskColor = riskLevel === 'high' ? 'bg-red-500' :
                                    riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500';

                  return (
                    <div key={region} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{region}</h3>
                        <div className={`w-3 h-3 rounded-full ${riskColor}`} title={`${riskLevel} risk`} />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Events:</span>
                          <span className="font-medium">{regionEvents.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active:</span>
                          <span className="font-medium text-orange-600">{activeEvents.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Critical:</span>
                          <span className="font-medium text-red-600">{criticalEvents.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Population:</span>
                          <span className="font-medium">{(affectedPop / 1000).toFixed(0)}K</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex space-x-1">
                          {['health', 'education', 'security'].map((type) => {
                            const typeEvents = regionEvents.filter(e => e.event_type === type);
                            return (
                              <div key={type} className="flex items-center space-x-1">
                                <span className="text-lg">{SERVICE_TYPES[type as keyof typeof SERVICE_TYPES].emoji}</span>
                                <span className="text-xs">{typeEvents.length}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert for high correlation events */}
      {correlations.some(c => c.correlation_strength > 0.8) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>High-Impact Correlation Detected:</strong> Service disruptions are showing strong correlation with negative public sentiment. 
            Immediate intervention recommended for regions with correlation strength above 80%.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CivicServiceDataPanel;