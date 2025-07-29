import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Smartphone, MessageSquare, Phone } from 'lucide-react';

const NotificationFlowChart = () => {
  const [flows, setFlows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [userPreferences, setUserPreferences] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const channelIcons = {
    email: Mail,
    in_app: Bell,
    push: Smartphone,
    sms: Phone,
    whatsapp: MessageSquare,
  };

  const eventTypeLabels = {
    artist_profile_submitted: 'Artist Profile Submitted',
    artist_verified: 'Artist Verified',
    artist_denied: 'Artist Denied',
    artist_new_follower: 'New Follower',
    artist_award_nomination: 'Award Nomination',
    artist_award_win: 'Award Win',
    new_song_uploaded: 'New Song Uploaded',
    song_milestone_reached: 'Song Milestone',
    new_event_published: 'New Event Published',
    ticket_purchased: 'Ticket Purchased',
    event_reminder_24h: 'Event Reminder',
    event_cancelled: 'Event Cancelled',
    voting_opens: 'Voting Opens',
    voting_closes: 'Voting Closes',
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch flows
      const { data: flowsData, error: flowsError } = await supabase
        .from('notification_flows')
        .select('*, notification_templates(*)')
        .order('priority', { ascending: false });

      if (flowsError) throw flowsError;

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('notification_templates')
        .select('*')
        .order('template_name');

      if (templatesError) throw templatesError;

      // Fetch user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_notification_preferences')
        .select('*');

      if (preferencesError) throw preferencesError;

      // Fetch recent logs
      const { data: logsData, error: logsError } = await supabase
        .from('notification_logs')
        .select('*, notification_flows(flow_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setFlows(flowsData || []);
      setTemplates(templatesData || []);
      setUserPreferences(preferencesData || []);
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notification data"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFlow = async (flowId, isActive) => {
    try {
      const { error } = await supabase
        .from('notification_flows')
        .update({ is_active: isActive })
        .eq('id', flowId);

      if (error) throw error;

      setFlows(flows.map(flow => 
        flow.id === flowId ? { ...flow, is_active: isActive } : flow
      ));

      toast({
        title: "Success",
        description: `Flow ${isActive ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      console.error('Error updating flow:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update flow"
      });
    }
  };

  const getChannelIcon = (channel) => {
    const Icon = channelIcons[channel] || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'secondary',
      sent: 'default',
      delivered: 'default',
      failed: 'destructive',
      retrying: 'secondary'
    };
    return colors[status] || 'default';
  };

  const FlowDiagram = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">CamerPlay Notification Flow Map</h3>
        <p className="text-muted-foreground">Visual representation of all notification triggers and flows</p>
      </div>
      
      {/* Mermaid Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Flow Chart</CardTitle>
          <CardDescription>Shows all notification flows from triggers to delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-6 rounded-lg">
            <pre className="text-sm overflow-x-auto">
{`graph TD
    A[Artist Uploads Song] --> B{Check Artist Followers}
    B --> C[Send Email to Fans]
    B --> D[Send In-App Notification]
    B --> E[Send Push Notification]
    
    F[Artist Profile Submitted] --> G[Send Welcome Email]
    
    H[Ticket Purchased] --> I[Send Confirmation Email]
    H --> J[Generate QR Code]
    
    K[Artist Nominated] --> L[Send Award Email]
    K --> M[Notify Followers]
    
    N[Event Published] --> O[Notify Artist Followers]
    
    P[User Preferences] --> Q{Check Opt-in Status}
    Q -->|Enabled| C
    Q -->|Disabled| R[Skip Notification]
    
    S[Delivery Status] --> T[Log Results]
    T --> U[Update Metrics]
    
    classDef email fill:#e3f2fd
    classDef app fill:#f3e5f5  
    classDef system fill:#fff3e0
    
    class C,G,I,L email
    class D,M,O app
    class A,F,H,K,N system`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading notification flows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">CamerPlay Notification Flow Chart</h1>
        <p className="text-muted-foreground">
          Centralized notification management system for artists, fans, and events
        </p>
      </div>

      <Tabs defaultValue="flowchart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="flowchart">Flow Chart</TabsTrigger>
          <TabsTrigger value="flows">Active Flows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="flowchart">
          <FlowDiagram />
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => (
              <Card key={flow.id} className={`${!flow.is_active ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{flow.flow_name}</CardTitle>
                    <Switch
                      checked={flow.is_active}
                      onCheckedChange={(checked) => toggleFlow(flow.id, checked)}
                    />
                  </div>
                  <CardDescription>
                    {eventTypeLabels[flow.event_type]} → {flow.recipient_type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(flow.channel)}
                      <span className="text-sm capitalize">{flow.channel}</span>
                      <Badge variant="outline">Priority {flow.priority}</Badge>
                    </div>
                    {flow.delay_minutes > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Delay: {flow.delay_minutes} minutes
                      </p>
                    )}
                    {flow.notification_templates && (
                      <p className="text-xs text-muted-foreground">
                        Template: {flow.notification_templates.template_name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.template_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(template.channel)}
                      <Badge variant="outline" className="capitalize">
                        {template.channel}
                      </Badge>
                    </div>
                  </div>
                  {template.subject && (
                    <CardDescription className="font-medium">
                      {template.subject}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.content}
                    </p>
                    {template.variables && template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(template.variables).map((variable, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notification Logs</CardTitle>
              <CardDescription>Latest notification delivery attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(log.channel)}
                      <div>
                        <p className="font-medium">{log.notification_flows?.flow_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {eventTypeLabels[log.event_type]} • {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                      {log.retry_count > 0 && (
                        <Badge variant="secondary">
                          Retry {log.retry_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No notification logs found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Flows</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{flows.length}</p>
                <p className="text-sm text-muted-foreground">
                  {flows.filter(f => f.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-sm text-muted-foreground">
                  {templates.filter(t => t.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-sm text-muted-foreground">
                  {logs.filter(l => l.status === 'sent').length} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">
                  Email, In-app, Push, SMS, WhatsApp
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationFlowChart;