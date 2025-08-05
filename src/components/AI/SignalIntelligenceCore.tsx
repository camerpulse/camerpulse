import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Activity, 
  Target,
  BarChart3,
  Signal,
  Cpu,
  Filter,
  ArrowUpDown,
  Clock,
  Flame,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignalItem {
  id: string;
  content_text: string;
  platform: string;
  author_handle?: string;
  created_at: string;
  priority_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  change_from_baseline: number;
  topic_relevance: number;
  sentiment_score?: number;
  threat_level?: string;
  region_detected?: string;
  emotional_tone?: string[];
  pattern_type?: string;
  spike_indicator?: boolean;
}

interface PatternShift {
  id: string;
  pattern_type: 'sentiment_spike' | 'emotion_surge' | 'topic_emergence' | 'regional_anomaly';
  region?: string;
  emotion?: string;
  topic?: string;
  baseline_value: number;
  current_value: number;
  change_magnitude: number;
  confidence: number;
  detected_at: string;
}

interface IntelligenceMetrics {
  total_signals_processed: number;
  high_priority_signals: number;
  pattern_shifts_detected: number;
  baseline_sentiment: number;
  current_sentiment_drift: number;
  urgency_threshold: number;
  relevance_threshold: number;
}

export const SignalIntelligenceCore: React.FC = () => {
  const [topSignals, setTopSignals] = useState<SignalItem[]>([]);
  const [patternShifts, setPatternShifts] = useState<PatternShift[]>([]);
  const [metrics, setMetrics] = useState<IntelligenceMetrics>({
    total_signals_processed: 0,
    high_priority_signals: 0,
    pattern_shifts_detected: 0,
    baseline_sentiment: 0,
    current_sentiment_drift: 0,
    urgency_threshold: 0.7,
    relevance_threshold: 0.6
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { toast } = useToast();

  // Load intelligence data
  const loadIntelligenceData = async () => {
    setIsProcessing(true);
    try {
      const response = await supabase.functions.invoke('signal-intelligence-core', {
        body: { action: 'analyze_signals' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { top_signals, pattern_shifts, intelligence_metrics } = response.data;
      
      setTopSignals(top_signals || []);
      setPatternShifts(pattern_shifts || []);
      setMetrics(intelligence_metrics || metrics);
      setLastUpdate(new Date());

      // Push high-priority signals to civic feed and alerts
      await pushHighPrioritySignals(top_signals?.slice(0, 3) || []);

    } catch (error: any) {
      toast({
        title: 'Intelligence Processing Error',
        description: error.message || 'Failed to process intelligence signals',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Push high-priority signals to civic feed and alert system
  const pushHighPrioritySignals = async (highPrioritySignals: SignalItem[]) => {
    for (const signal of highPrioritySignals) {
      if (signal.urgency_level === 'critical' || signal.urgency_level === 'high') {
        try {
          await supabase.functions.invoke('signal-intelligence-core', {
            body: { 
              action: 'push_to_alerts', 
              signal: signal 
            }
          });
        } catch (error) {
          console.error('Failed to push signal to alerts:', error);
        }
      }
    }
  };

  // Update thresholds based on national sentiment drift
  const updateThresholds = async () => {
    try {
      await supabase.functions.invoke('signal-intelligence-core', {
        body: { 
          action: 'update_thresholds',
          current_drift: metrics.current_sentiment_drift
        }
      });
      
      toast({
        title: 'Thresholds Updated',
        description: 'Intelligence thresholds automatically adjusted based on sentiment drift.'
      });
    } catch (error: any) {
      toast({
        title: 'Threshold Update Failed',
        description: error.message || 'Failed to update intelligence thresholds',
        variant: 'destructive'
      });
    }
  };

  // Auto-refresh intelligence data
  useEffect(() => {
    loadIntelligenceData();
    
    const interval = setInterval(() => {
      loadIntelligenceData();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  // Auto-update thresholds based on sentiment drift
  useEffect(() => {
    if (Math.abs(metrics.current_sentiment_drift) > 0.3) {
      updateThresholds();
    }
  }, [metrics.current_sentiment_drift]);

  const getPriorityColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPatternIcon = (patternType: string) => {
    switch (patternType) {
      case 'sentiment_spike': return <TrendingUp className="h-4 w-4" />;
      case 'emotion_surge': return <Zap className="h-4 w-4" />;
      case 'topic_emergence': return <Target className="h-4 w-4" />;
      case 'regional_anomaly': return <AlertTriangle className="h-4 w-4" />;
      default: return <Signal className="h-4 w-4" />;
    }
  };

  const formatPatternDescription = (shift: PatternShift) => {
    const change = shift.change_magnitude > 0 ? 'increase' : 'decrease';
    const magnitude = Math.abs(shift.change_magnitude);
    
    switch (shift.pattern_type) {
      case 'sentiment_spike':
        return `${magnitude.toFixed(1)}x sentiment ${change} detected`;
      case 'emotion_surge':
        return `${shift.emotion} emotion surge: ${magnitude.toFixed(1)}x ${change}`;
      case 'topic_emergence':
        return `Emerging topic "${shift.topic}": ${magnitude.toFixed(1)}x activity`;
      case 'regional_anomaly':
        return `${shift.region} region: ${magnitude.toFixed(1)}x activity anomaly`;
      default:
        return `Pattern shift detected: ${magnitude.toFixed(1)}x change`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Signal Intelligence Core</h2>
            <p className="text-muted-foreground">
              Autonomous analysis and prioritization of data streams
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button 
            onClick={loadIntelligenceData}
            disabled={isProcessing}
            size="sm"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Intelligence Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signals Processed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_signals_processed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.high_priority_signals} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pattern Shifts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pattern_shifts_detected}</div>
            <p className="text-xs text-muted-foreground">
              Active anomalies detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Drift</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metrics.current_sentiment_drift > 0 ? '+' : ''}
                {(metrics.current_sentiment_drift * 100).toFixed(1)}%
              </div>
              <Progress 
                value={Math.abs(metrics.current_sentiment_drift * 100)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">ACTIVE</div>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-adapting thresholds
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signals">Top Signals</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Shifts</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* Top Signals Tab */}
        <TabsContent value="signals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Top 10 Priority Signals
              </CardTitle>
              <CardDescription>
                Real-time ranking of most important data streams based on urgency, relevance, and change magnitude
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSignals.length > 0 ? (
                  topSignals.map((signal, index) => (
                    <div key={signal.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-muted-foreground">
                          #{index + 1}
                        </div>
                        {signal.spike_indicator && (
                          <Flame className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(signal.urgency_level)}>
                            {signal.urgency_level.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            Priority: {signal.priority_score.toFixed(2)}
                          </Badge>
                          <Badge variant="outline">
                            Change: {signal.change_from_baseline > 0 ? '+' : ''}
                            {(signal.change_from_baseline * 100).toFixed(1)}%
                          </Badge>
                          <Badge variant="outline">
                            Relevance: {(signal.topic_relevance * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        
                        <p className="text-sm">{signal.content_text}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>📱 {signal.platform}</span>
                          {signal.author_handle && <span>👤 @{signal.author_handle}</span>}
                          {signal.region_detected && <span>📍 {signal.region_detected}</span>}
                          <span>🕒 {new Date(signal.created_at).toLocaleTimeString()}</span>
                        </div>
                        
                        {signal.emotional_tone && signal.emotional_tone.length > 0 && (
                          <div className="flex gap-1">
                            {signal.emotional_tone.slice(0, 3).map((emotion, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Signal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No signals detected yet</p>
                    <p className="text-sm text-muted-foreground">
                      The intelligence core is monitoring incoming data streams
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pattern Shifts Tab */}
        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pattern Shifts & Anomalies
              </CardTitle>
              <CardDescription>
                Detected changes from baseline patterns, sentiment spikes, and emerging trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patternShifts.length > 0 ? (
                  patternShifts.map((shift) => (
                    <div key={shift.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="p-2 rounded-lg bg-orange-50">
                        {getPatternIcon(shift.pattern_type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {shift.pattern_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            Confidence: {(shift.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        
                        <p className="font-medium">{formatPatternDescription(shift)}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Baseline: </span>
                            <span>{shift.baseline_value.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Current: </span>
                            <span>{shift.current_value.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Detected at {new Date(shift.detected_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pattern shifts detected</p>
                    <p className="text-sm text-muted-foreground">
                      All signals are within normal baseline parameters
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Intelligence Thresholds
                </CardTitle>
                <CardDescription>
                  Auto-adjusting thresholds based on national sentiment patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Urgency Threshold</span>
                    <span>{(metrics.urgency_threshold * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.urgency_threshold * 100} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Relevance Threshold</span>
                    <span>{(metrics.relevance_threshold * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.relevance_threshold * 100} />
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Thresholds automatically adjust based on sentiment drift to maintain optimal signal detection.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Ranking Algorithm
                </CardTitle>
                <CardDescription>
                  Multi-factor scoring system for signal prioritization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span>Urgency Weight</span>
                    <span className="font-mono">40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change Magnitude</span>
                    <span className="font-mono">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Topic Relevance</span>
                    <span className="font-mono">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emotion Intensity</span>
                    <span className="font-mono">10%</span>
                  </div>
                </div>
                
                <Alert>
                  <Cpu className="h-4 w-4" />
                  <AlertDescription>
                    Algorithm uses moving averages and spike detection to identify anomalies and prioritize signals.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignalIntelligenceCore;