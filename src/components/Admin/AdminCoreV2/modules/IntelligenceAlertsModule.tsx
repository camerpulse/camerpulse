import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  AlertTriangle, Shield, Activity, CheckCircle, Clock, 
  MapPin, Users, TrendingUp, Eye, Bell, Settings
} from 'lucide-react';

interface IntelligenceAlertsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const IntelligenceAlertsModule: React.FC<IntelligenceAlertsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('active');
  const queryClient = useQueryClient();

  // Fetch intelligence alerts
  const { data: intelligenceAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['intelligence_alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intelligence_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch sentiment spikes
  const { data: sentimentSpikes = [], isLoading: spikesLoading } = useQuery({
    queryKey: ['sentiment_spikes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sentiment_spikes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch AI insights
  const { data: aiInsights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['ai_insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('priority_level', 'high')
        .order('created_at', { ascending: false })
        .limit(15);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('intelligence_alerts')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Alert acknowledged successfully");
      queryClient.invalidateQueries({ queryKey: ['intelligence_alerts'] });
    }
  });

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlertMutation.mutate(alertId);
    logActivity('intelligence_alert_acknowledged', { alert_id: alertId });
  };

  const activeAlerts = intelligenceAlerts.filter(alert => !alert.is_resolved);
  const criticalAlerts = intelligenceAlerts.filter(alert => alert.severity === 'critical');
  const highPriorityInsights = aiInsights.filter(insight => insight.priority_level === 'high');

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Intelligence Alerts & Monitoring"
        description="Real-time intelligence alerts, sentiment spikes, and critical insights"
        icon={AlertTriangle}
        iconColor="text-red-600"
        badge={{
          text: `${activeAlerts.length} Active`,
          variant: activeAlerts.length > 0 ? "destructive" : "default"
        }}
        searchPlaceholder="Search alerts, insights..."
        onSearch={(query) => console.log('Searching alerts:', query)}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['intelligence_alerts'] });
          logActivity('intelligence_alerts_refresh', { timestamp: new Date() });
        }}
      />

      {/* Intelligence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Alerts"
          value={activeAlerts.length.toString()}
          icon={AlertTriangle}
          description="Requiring attention"
          badge={{ 
            text: criticalAlerts.length > 0 ? "Critical" : "Normal", 
            variant: criticalAlerts.length > 0 ? "destructive" : "default" 
          }}
        />
        <StatCard
          title="Sentiment Spikes"
          value={sentimentSpikes.length.toString()}
          icon={TrendingUp}
          description="Detected today"
          trend={{ value: 15.3, isPositive: false, period: "vs yesterday" }}
        />
        <StatCard
          title="AI Insights"
          value={highPriorityInsights.length.toString()}
          icon={Eye}
          description="High priority insights"
          badge={{ text: "Processing", variant: "secondary" }}
        />
        <StatCard
          title="Response Time"
          value="2.3m"
          icon={Clock}
          description="Avg acknowledgment time"
          trend={{ value: 8.7, isPositive: true, period: "this week" }}
        />
      </div>

      {/* Intelligence Alerts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="spikes">Sentiment Spikes</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="routing">Alert Routing</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Active Intelligence Alerts
              </CardTitle>
              <CardDescription>
                Monitor and respond to critical intelligence alerts requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="text-center py-8">Loading alerts...</div>
              ) : activeAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active alerts. System monitoring normally.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'high' ? 'bg-orange-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <h4 className="font-semibold">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            alert.severity === 'critical' ? 'destructive' :
                            alert.severity === 'high' ? 'secondary' : 'outline'
                          }>
                            {alert.severity}
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <span className="ml-2 font-medium">{alert.alert_type}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Region:</span>
                          <span className="ml-2">{alert.region || 'National'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="ml-2">{(alert.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2">{new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spikes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sentiment Spikes Detection
              </CardTitle>
              <CardDescription>
                Monitor unusual sentiment changes and social indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {spikesLoading ? (
                <div className="text-center py-8">Loading sentiment spikes...</div>
              ) : sentimentSpikes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sentiment spikes detected recently.
                </div>
              ) : (
                <div className="space-y-4">
                  {sentimentSpikes.map((spike) => (
                    <div key={spike.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{spike.event_title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {spike.spike_type} spike detected
                          </p>
                        </div>
                        <Badge variant={spike.spike_type === 'positive' ? 'default' : 'destructive'}>
                          {spike.spike_type} {(spike.spike_intensity * 10).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Baseline:</span>
                          <span className="ml-2">{(spike.confidence_score * 50).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current:</span>
                          <span className="ml-2">{(spike.spike_intensity * 10).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Intensity:</span>
                          <span className="ml-2">{spike.spike_intensity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                High Priority AI Insights
              </CardTitle>
              <CardDescription>
                Review AI-generated insights requiring attention or verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="text-center py-8">Loading AI insights...</div>
              ) : aiInsights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No high priority insights at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {insight.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={insight.priority_level === 'critical' ? 'destructive' : 'secondary'}>
                            {insight.priority_level}
                          </Badge>
                          <Badge variant="outline">
                            {(insight.confidence_score * 100).toFixed(0)}% confident
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h5 className="text-sm font-medium mb-2">Recommended Actions:</h5>
                        <ul className="text-sm space-y-1">
                          {insight.actionable_recommendations?.map((action: string, index: number) => (
                            <li key={index} className="text-muted-foreground">• {action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Alert Routing Configuration
              </CardTitle>
              <CardDescription>
                Configure how alerts are routed to different agencies and teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Civic Unrest Alerts</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Route to security agencies and local administrators
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Police</Badge>
                      <Badge variant="secondary">Local Admin</Badge>
                      <Badge variant="outline">Emergency Services</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Health Emergency</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Route to health ministry and regional health offices
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Health Ministry</Badge>
                      <Badge variant="secondary">Regional Health</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Economic Issues</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Route to economic ministries and financial authorities
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Finance Ministry</Badge>
                      <Badge variant="secondary">Central Bank</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Environmental Alerts</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Route to environment ministry and local councils
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Environment Ministry</Badge>
                      <Badge variant="secondary">Local Councils</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};