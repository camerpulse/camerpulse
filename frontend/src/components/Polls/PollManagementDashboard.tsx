import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Eye,
  Bookmark,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PollStats {
  totalVotes: number;
  uniqueVoters: number;
  fraudAlerts: number;
  botDetections: number;
  viewCount: number;
  bookmarkCount: number;
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
}

export const PollManagementDashboard = () => {
  const { toast } = useToast();
  const [polls, setPolls] = useState<any[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  const [pollStats, setPollStats] = useState<PollStats | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPolls();
  }, []);

  useEffect(() => {
    if (selectedPoll) {
      loadPollStats(selectedPoll);
      loadSecurityEvents(selectedPoll);
    }
  }, [selectedPoll]);

  const loadUserPolls = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_categories(name),
          poll_fraud_settings(*),
          poll_advanced_config(*)
        `)
        .eq('creator_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls(data || []);
      
      if (data && data.length > 0 && !selectedPoll) {
        setSelectedPoll(data[0].id);
      }
    } catch (error) {
      console.error('Error loading polls:', error);
      toast({
        title: "Error",
        description: "Failed to load your polls",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPollStats = async (pollId: string) => {
    try {
      // Get basic poll stats
      const { data: poll } = await supabase
        .from('polls')
        .select('votes_count, view_count, bookmark_count')
        .eq('id', pollId)
        .single();

      // Get unique voters from vote log
      const { data: voteLog } = await supabase
        .from('poll_vote_log')
        .select('user_id, session_id')
        .eq('poll_id', pollId);

      // Get fraud alerts
      const { data: fraudAlerts } = await supabase
        .from('poll_fraud_alerts')
        .select('id')
        .eq('poll_id', pollId)
        .eq('acknowledged', false);

      // Get bot detections
      const { data: botDetections } = await supabase
        .from('poll_bot_detection_logs')
        .select('id')
        .eq('poll_id', pollId)
        .eq('is_bot', true);

      const uniqueVoters = new Set(
        voteLog?.map(log => log.user_id || log.session_id) || []
      ).size;

      setPollStats({
        totalVotes: poll?.votes_count || 0,
        uniqueVoters,
        fraudAlerts: fraudAlerts?.length || 0,
        botDetections: botDetections?.length || 0,
        viewCount: poll?.view_count || 0,
        bookmarkCount: poll?.bookmark_count || 0
      });

    } catch (error) {
      console.error('Error loading poll stats:', error);
    }
  };

  const loadSecurityEvents = async (pollId: string) => {
    try {
      // Combine fraud alerts and bot detections
      const { data: fraudAlerts } = await supabase
        .from('poll_fraud_alerts')
        .select('*')
        .eq('poll_id', pollId)
        .order('detected_at', { ascending: false });

      const { data: botDetections } = await supabase
        .from('poll_bot_detection_logs')
        .select('*')
        .eq('poll_id', pollId)
        .eq('is_bot', true)
        .order('created_at', { ascending: false });

      const events: SecurityEvent[] = [
        ...(fraudAlerts?.map(alert => ({
          id: alert.id,
          type: 'fraud_alert',
          severity: alert.alert_severity as any,
          description: alert.alert_message,
          timestamp: alert.detected_at,
          resolved: alert.acknowledged
        })) || []),
        ...(botDetections?.map(detection => ({
          id: detection.id,
          type: 'bot_detection',
          severity: detection.confidence_score > 80 ? 'high' : 'medium' as any,
          description: `Bot detected with ${detection.confidence_score}% confidence`,
          timestamp: detection.created_at,
          resolved: false
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setSecurityEvents(events);
    } catch (error) {
      console.error('Error loading security events:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('poll_fraud_alerts')
        .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;

      setSecurityEvents(prev => 
        prev.map(event => 
          event.id === alertId ? { ...event, resolved: true } : event
        )
      );

      toast({
        title: "Alert Acknowledged",
        description: "Security alert has been marked as resolved"
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Polls Created</h3>
          <p className="text-muted-foreground mb-4">
            Create your first poll to see analytics and management options.
          </p>
          <Button>Create Your First Poll</Button>
        </CardContent>
      </Card>
    );
  }

  const selectedPollData = polls.find(p => p.id === selectedPoll);

  return (
    <div className="space-y-6">
      {/* Poll Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Your Polls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPoll === poll.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedPoll(poll.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{poll.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(poll.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {poll.poll_fraud_settings?.enable_captcha && (
                      <Badge variant="outline">CAPTCHA</Badge>
                    )}
                    {poll.poll_advanced_config?.poll_type !== 'single_choice' && (
                      <Badge variant="secondary">
                        {poll.poll_advanced_config?.poll_type?.replace('_', ' ')}
                      </Badge>
                    )}
                    <Badge variant={poll.is_active ? 'default' : 'secondary'}>
                      {poll.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Poll Analytics */}
      {selectedPollData && pollStats && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
                      <p className="text-2xl font-bold">{pollStats.totalVotes}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Unique Voters</p>
                      <p className="text-2xl font-bold">{pollStats.uniqueVoters}</p>
                    </div>
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Views</p>
                      <p className="text-2xl font-bold">{pollStats.viewCount}</p>
                    </div>
                    <Eye className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bookmarks</p>
                      <p className="text-2xl font-bold">{pollStats.bookmarkCount}</p>
                    </div>
                    <Bookmark className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                      <p className="text-2xl font-bold">
                        {Math.max(0, 100 - (pollStats.fraudAlerts * 20) - (pollStats.botDetections * 10))}%
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Vote Conversion Rate</span>
                      <span>
                        {pollStats.viewCount > 0 
                          ? Math.round((pollStats.totalVotes / pollStats.viewCount) * 100)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={pollStats.viewCount > 0 
                        ? (pollStats.totalVotes / pollStats.viewCount) * 100
                        : 0
                      } 
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Bookmark Rate</span>
                      <span>
                        {pollStats.viewCount > 0 
                          ? Math.round((pollStats.bookmarkCount / pollStats.viewCount) * 100)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={pollStats.viewCount > 0 
                        ? (pollStats.bookmarkCount / pollStats.viewCount) * 100
                        : 0
                      } 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            {/* Security Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fraud Alerts</p>
                      <p className="text-2xl font-bold text-amber-600">{pollStats.fraudAlerts}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bot Detections</p>
                      <p className="text-2xl font-bold text-red-600">{pollStats.botDetections}</p>
                    </div>
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                {securityEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
                    <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                    <p className="text-muted-foreground">
                      No security events detected for this poll.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {securityEvents.map((event) => (
                      <Alert 
                        key={event.id}
                        className={
                          event.severity === 'critical' ? 'border-red-500' :
                          event.severity === 'high' ? 'border-orange-500' :
                          event.severity === 'medium' ? 'border-yellow-500' :
                          'border-blue-500'
                        }
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant={
                                    event.severity === 'critical' ? 'destructive' :
                                    event.severity === 'high' ? 'destructive' :
                                    'secondary'
                                  }
                                >
                                  {event.severity}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(event.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p>{event.description}</p>
                            </div>
                            {event.type === 'fraud_alert' && !event.resolved && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acknowledgeAlert(event.id)}
                              >
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Poll Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Poll Type</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedPollData.poll_advanced_config?.[0]?.poll_type?.replace('_', ' ') || 'Single Choice'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Privacy Mode</Label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedPollData.privacy_mode}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">CAPTCHA Protection</Label>
                      <Badge variant={selectedPollData.poll_fraud_settings?.[0]?.enable_captcha ? 'default' : 'secondary'}>
                        {selectedPollData.poll_fraud_settings?.[0]?.enable_captcha ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Rate Limiting</Label>
                      <Badge variant={selectedPollData.poll_fraud_settings?.[0]?.enable_rate_limiting ? 'default' : 'secondary'}>
                        {selectedPollData.poll_fraud_settings?.[0]?.enable_rate_limiting ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};