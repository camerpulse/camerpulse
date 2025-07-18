import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Brain,
  Plus,
  Clock,
  MapPin,
  Users,
  Activity,
  BarChart3,
  LineChart,
  Eye,
  Settings,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Heart,
  Frown,
  Smile,
  Angry,
  Meh,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';

interface CivicEvent {
  id: string;
  event_title: string;
  event_description?: string;
  event_type: string;
  event_category: string;
  event_date: string;
  event_duration_hours: number;
  regions_affected: string[];
  participants: string[];
  government_level: string;
  severity_level: string;
  source_url?: string;
  source_type: string;
  verification_status: string;
  tags: string[];
  created_at: string;
}

interface EventCorrelation {
  id: string;
  civic_event_id: string;
  correlation_timeframe: string;
  baseline_emotion_score: number;
  peak_emotion_score: number;
  dominant_emotion: string;
  emotion_shift_intensity: number;
  correlation_strength: number;
  sentiment_volume: number;
  confidence_score: number;
  regions_analyzed: string[];
  key_phrases: string[];
  trending_hashtags: string[];
  emotion_timeline: any;
  anomaly_detected: boolean;
  anomaly_severity?: string;
  analysis_insights: any;
  analysis_date: string;
  civic_fusion_events?: CivicEvent;
}

interface FusionAlert {
  id: string;
  civic_event_id: string;
  alert_type: string;
  alert_severity: string;
  alert_title: string;
  alert_message: string;
  threshold_exceeded?: number;
  baseline_comparison?: number;
  affected_regions: string[];
  recommended_actions: string[];
  acknowledged: boolean;
  created_at: string;
  civic_fusion_events?: CivicEvent;
}

const CivicFusionCore: React.FC = () => {
  const [events, setEvents] = useState<CivicEvent[]>([]);
  const [correlations, setCorrelations] = useState<EventCorrelation[]>([]);
  const [alerts, setAlerts] = useState<FusionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CivicEvent | null>(null);
  const [timelineFilter, setTimelineFilter] = useState('7d');
  const [regionFilter, setRegionFilter] = useState('all');
  const { toast } = useToast();

  // New event form state
  const [newEvent, setNewEvent] = useState({
    event_title: '',
    event_description: '',
    event_type: '',
    event_category: '',
    event_date: '',
    event_duration_hours: 1,
    regions_affected: [] as string[],
    participants: [] as string[],
    government_level: 'national',
    severity_level: 'medium',
    source_url: '',
    tags: [] as string[]
  });

  const eventTypes = [
    { value: 'election', label: '🗳️ Election', category: 'political' },
    { value: 'policy', label: '📋 Policy', category: 'political' },
    { value: 'economic', label: '💰 Economic', category: 'economic' },
    { value: 'security', label: '🛡️ Security', category: 'security' },
    { value: 'judicial', label: '⚖️ Judicial', category: 'judicial' },
    { value: 'scandal', label: '📰 Scandal', category: 'political' },
    { value: 'disaster', label: '🌪️ Disaster', category: 'environmental' },
    { value: 'celebration', label: '🎉 Celebration', category: 'cultural' },
    { value: 'protest', label: '✊ Protest', category: 'social' },
    { value: 'speech', label: '🎤 Speech', category: 'political' },
    { value: 'announcement', label: '📢 Announcement', category: 'political' }
  ];

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const emotions = {
    anger: { icon: <Angry className="h-4 w-4" />, color: '#ef4444' },
    fear: { icon: <Frown className="h-4 w-4" />, color: '#f97316' },
    sadness: { icon: <Frown className="h-4 w-4" />, color: '#3b82f6' },
    joy: { icon: <Smile className="h-4 w-4" />, color: '#22c55e' },
    hope: { icon: <Heart className="h-4 w-4" />, color: '#8b5cf6' },
    neutral: { icon: <Meh className="h-4 w-4" />, color: '#6b7280' }
  };

  useEffect(() => {
    fetchData();
  }, [timelineFilter, regionFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchEvents(),
        fetchCorrelations(),
        fetchAlerts()
      ]);
    } catch (error) {
      console.error('Error fetching fusion data:', error);
      toast({
        title: "Error",
        description: "Failed to load fusion data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    let query = supabase
      .from('civic_fusion_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (regionFilter !== 'all') {
      query = query.contains('regions_affected', [regionFilter]);
    }

    if (timelineFilter !== 'all') {
      const days = parseInt(timelineFilter.replace('d', ''));
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      query = query.gte('event_date', cutoff.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    setEvents(data || []);
  };

  const fetchCorrelations = async () => {
    const { data, error } = await supabase
      .from('civic_fusion_correlations')
      .select(`
        *,
        civic_fusion_events (*)
      `)
      .order('analysis_date', { ascending: false })
      .limit(50);

    if (error) throw error;
    setCorrelations(data || []);
  };

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('civic_fusion_alerts')
      .select(`
        *,
        civic_fusion_events (*)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    setAlerts(data || []);
  };

  const createEvent = async () => {
    try {
      const { error } = await supabase
        .from('civic_fusion_events')
        .insert([{
          ...newEvent,
          verification_status: 'verified',
          source_type: 'manual'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Civic event added successfully"
      });

      setShowNewEventDialog(false);
      setNewEvent({
        event_title: '',
        event_description: '',
        event_type: '',
        event_category: '',
        event_date: '',
        event_duration_hours: 1,
        regions_affected: [],
        participants: [],
        government_level: 'national',
        severity_level: 'medium',
        source_url: '',
        tags: []
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('civic_fusion_alerts')
        .update({ 
          acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const generateTimelineData = () => {
    const now = new Date();
    const days = parseInt(timelineFilter.replace('d', '')) || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const timelineData: any[] = [];
    const dateMap = new Map();

    // Initialize date range
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        date: dateStr,
        events: 0,
        emotionShift: 0,
        correlationStrength: 0,
        eventSeverity: 0
      });
    }

    // Add events data
    events.forEach(event => {
      const eventDate = new Date(event.event_date).toISOString().split('T')[0];
      if (dateMap.has(eventDate)) {
        const day = dateMap.get(eventDate);
        day.events += 1;
        day.eventSeverity += getSeverityScore(event.severity_level);
      }
    });

    // Add correlation data
    correlations.forEach(corr => {
      const corrDate = new Date(corr.analysis_date).toISOString().split('T')[0];
      if (dateMap.has(corrDate)) {
        const day = dateMap.get(corrDate);
        day.emotionShift += corr.emotion_shift_intensity;
        day.correlationStrength += corr.correlation_strength;
      }
    });

    return Array.from(dateMap.values());
  };

  const getSeverityScore = (severity: string) => {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const getEmotionStats = () => {
    const emotionCounts: Record<string, number> = {};
    const totalCorrelations = correlations.length;

    correlations.forEach(corr => {
      emotionCounts[corr.dominant_emotion] = (emotionCounts[corr.dominant_emotion] || 0) + 1;
    });

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: totalCorrelations > 0 ? (count / totalCorrelations) * 100 : 0
    }));
  };

  const getCorrelationStrengthStats = () => {
    if (correlations.length === 0) return { strong: 0, moderate: 0, weak: 0 };
    
    const strong = correlations.filter(c => c.correlation_strength >= 0.7).length;
    const moderate = correlations.filter(c => c.correlation_strength >= 0.4 && c.correlation_strength < 0.7).length;
    const weak = correlations.filter(c => c.correlation_strength < 0.4).length;

    return { strong, moderate, weak };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const timelineData = generateTimelineData();
  const emotionStats = getEmotionStats();
  const correlationStats = getCorrelationStrengthStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            Civic Fusion Core
          </h2>
          <p className="text-muted-foreground">
            Central AI engine fusing public emotion with civic events
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timelineFilter} onValueChange={setTimelineFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {cameroonRegions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Civic Event</DialogTitle>
                <DialogDescription>
                  Register a new civic event for emotion correlation analysis
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event_title">Event Title</Label>
                  <Input
                    id="event_title"
                    value={newEvent.event_title}
                    onChange={(e) => setNewEvent({...newEvent, event_title: e.target.value})}
                    placeholder="e.g., President Biya's Independence Day Speech"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_type">Event Type</Label>
                    <Select 
                      value={newEvent.event_type} 
                      onValueChange={(value) => {
                        const selectedType = eventTypes.find(t => t.value === value);
                        setNewEvent({
                          ...newEvent, 
                          event_type: value,
                          event_category: selectedType?.category || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="severity_level">Severity Level</Label>
                    <Select 
                      value={newEvent.severity_level} 
                      onValueChange={(value) => setNewEvent({...newEvent, severity_level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_date">Event Date & Time</Label>
                    <Input
                      id="event_date"
                      type="datetime-local"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={newEvent.event_duration_hours}
                      onChange={(e) => setNewEvent({...newEvent, event_duration_hours: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.event_description}
                    onChange={(e) => setNewEvent({...newEvent, event_description: e.target.value})}
                    placeholder="Detailed description of the civic event..."
                  />
                </div>

                <Button onClick={createEvent} className="w-full">
                  Add Civic Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-xs text-muted-foreground">Civic Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{correlations.length}</p>
                <p className="text-xs text-muted-foreground">Correlations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{alerts.filter(a => !a.acknowledged).length}</p>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{correlationStats.strong}</p>
                <p className="text-xs text-muted-foreground">Strong Correlations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{correlations.filter(c => c.anomaly_detected).length}</p>
                <p className="text-xs text-muted-foreground">Anomalies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Fusion Timeline</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="events">Events Parser</TabsTrigger>
          <TabsTrigger value="alerts">Fusion Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
                <CardDescription>Dominant emotions from event correlations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emotionStats.map((stat) => (
                    <div key={stat.emotion} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {emotions[stat.emotion as keyof typeof emotions]?.icon}
                          <span className="capitalize">{stat.emotion}</span>
                        </div>
                        <span>{stat.count}</span>
                      </div>
                      <Progress value={stat.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Correlation Strength</CardTitle>
                <CardDescription>Distribution of emotion-event correlation strength</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Strong (&gt;70%)</span>
                      <span>{correlationStats.strong}</span>
                    </div>
                    <Progress value={(correlationStats.strong / correlations.length) * 100} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Moderate (40-70%)</span>
                      <span>{correlationStats.moderate}</span>
                    </div>
                    <Progress value={(correlationStats.moderate / correlations.length) * 100} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Weak (&lt;40%)</span>
                      <span>{correlationStats.weak}</span>
                    </div>
                    <Progress value={(correlationStats.weak / correlations.length) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event-Emotion Fusion Timeline</CardTitle>
              <CardDescription>
                Correlation between civic events and emotional responses over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="emotionShift" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="Emotion Shift"
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="events" 
                      stroke="#ff7300"
                      strokeWidth={2}
                      name="Events Count"
                    />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="correlationStrength" 
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Correlation Strength"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {correlations.map((correlation) => (
              <Card key={correlation.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                          {correlation.civic_fusion_events?.event_title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(correlation.civic_fusion_events?.event_date || '').toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{correlation.regions_analyzed.join(', ')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{correlation.sentiment_volume} posts</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={correlation.correlation_strength > 0.7 ? 'default' : 
                                     correlation.correlation_strength > 0.4 ? 'secondary' : 'outline'}>
                          {(correlation.correlation_strength * 100).toFixed(0)}% correlation
                        </Badge>
                        {correlation.anomaly_detected && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Anomaly
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          {emotions[correlation.dominant_emotion as keyof typeof emotions]?.icon}
                        </div>
                        <p className="text-sm font-medium capitalize">{correlation.dominant_emotion}</p>
                        <p className="text-xs text-muted-foreground">Dominant</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-lg font-bold">{correlation.emotion_shift_intensity.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Intensity Shift</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-lg font-bold">{(correlation.confidence_score * 100).toFixed(0)}%</p>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-lg font-bold">{correlation.correlation_timeframe}</p>
                        <p className="text-xs text-muted-foreground">Timeframe</p>
                      </div>
                    </div>

                    {correlation.key_phrases.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Key Phrases:</p>
                        <div className="flex flex-wrap gap-2">
                          {correlation.key_phrases.map((phrase, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {phrase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{event.event_title}</h3>
                        <Badge variant="outline">{event.event_type}</Badge>
                        <Badge variant={
                          event.severity_level === 'critical' ? 'destructive' :
                          event.severity_level === 'high' ? 'default' :
                          event.severity_level === 'medium' ? 'secondary' : 'outline'
                        }>
                          {event.severity_level}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{event.event_duration_hours}h duration</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.regions_affected.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span className="capitalize">{event.government_level}</span>
                        </div>
                      </div>

                      {event.event_description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {event.event_description}
                        </p>
                      )}

                      {event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {event.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Badge variant={event.verification_status === 'verified' ? 'default' : 'secondary'}>
                      {event.verification_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{alert.alert_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {alert.civic_fusion_events?.event_title}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          alert.alert_severity === 'critical' ? 'destructive' :
                          alert.alert_severity === 'high' ? 'default' :
                          alert.alert_severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {alert.alert_severity}
                        </Badge>
                        <Badge variant="outline">{alert.alert_type}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm">{alert.alert_message}</p>
                    
                    {alert.affected_regions.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Affected: {alert.affected_regions.join(', ')}</span>
                      </div>
                    )}

                    {alert.recommended_actions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          {alert.recommended_actions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                      {!alert.acknowledged && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicFusionCore;