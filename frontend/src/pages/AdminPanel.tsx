import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  MessageSquare, 
  Key, 
  Users, 
  Activity,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Smartphone
} from 'lucide-react';

interface ApiConfig {
  id: string;
  service_name: string;
  api_key: string | null;
  base_url: string | null;
  additional_config: any;
  is_active: boolean;
}

interface WhatsAppTemplate {
  id: string;
  template_name: string;
  template_id: string | null;
  event_type: string;
  content: string;
  variables: any;
  approval_status: string;
  is_active: boolean;
}

interface WhatsAppStats {
  total_users: number;
  opted_in_users: number;
  messages_sent_today: number;
  delivery_rate: number;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [stats, setStats] = useState<WhatsAppStats>({
    total_users: 0,
    opted_in_users: 0,
    messages_sent_today: 0,
    delivery_rate: 0
  });

  // Form states
  const [apiKey, setApiKey] = useState('');
  const [serviceActive, setServiceActive] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load API configuration
      const { data: config } = await supabase
        .from('api_configurations')
        .select('*')
        .eq('service_name', 'sendchamp_whatsapp')
        .single();
      
      if (config) {
        setApiConfig(config);
        setApiKey(config.api_key || '');
        setServiceActive(config.is_active);
      }

      // Load WhatsApp templates
      const { data: templatesData } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (templatesData) {
        setTemplates(templatesData);
      }

      // Load stats
      await loadStats();
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    }
  };

  const loadStats = async () => {
    try {
      // Get total users with WhatsApp preferences
      const { count: totalUsers } = await supabase
        .from('user_whatsapp_preferences')
        .select('*', { count: 'exact', head: true });

      // Get opted-in users
      const { count: optedInUsers } = await supabase
        .from('user_whatsapp_preferences')
        .select('*', { count: 'exact', head: true })
        .eq('whatsapp_enabled', true)
        .not('verified_at', 'is', null);

      // Get messages sent today
      const today = new Date().toISOString().split('T')[0];
      const { count: messagesToday } = await supabase
        .from('whatsapp_message_logs')
        .select('*', { count: 'exact', head: true })
        .gte('sent_at', `${today}T00:00:00`);

      // Calculate delivery rate (simplified)
      const { data: recentMessages } = await supabase
        .from('whatsapp_message_logs')
        .select('status')
        .gte('sent_at', `${today}T00:00:00`);

      const deliveredCount = recentMessages?.filter(m => m.status === 'sent').length || 0;
      const totalMessages = recentMessages?.length || 0;
      const deliveryRate = totalMessages > 0 ? (deliveredCount / totalMessages) * 100 : 0;

      setStats({
        total_users: totalUsers || 0,
        opted_in_users: optedInUsers || 0,
        messages_sent_today: messagesToday || 0,
        delivery_rate: Math.round(deliveryRate)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveApiConfiguration = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('api_configurations')
        .update({
          api_key: apiKey,
          is_active: serviceActive,
          updated_at: new Date().toISOString()
        })
        .eq('service_name', 'sendchamp_whatsapp');

      if (error) throw error;

      toast({
        title: "Success",
        description: "WhatsApp API configuration saved successfully"
      });

      await loadAdminData();
    } catch (error) {
      console.error('Error saving API config:', error);
      toast({
        title: "Error",
        description: "Failed to save API configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTemplateStatus = async (templateId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .update({ is_active: !isActive })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Template ${!isActive ? 'activated' : 'deactivated'} successfully`
      });

      await loadAdminData();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update template status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Admin Panel - WhatsApp Notifications</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Opted In</p>
                <p className="text-2xl font-bold text-green-600">{stats.opted_in_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Messages Today</p>
                <p className="text-2xl font-bold text-blue-600">{stats.messages_sent_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.delivery_rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="api-config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api-config">API Configuration</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="logs">Message Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="api-config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>SendChamp WhatsApp API Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">SendChamp API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your SendChamp API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Get your API key from the SendChamp dashboard
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={serviceActive}
                  onCheckedChange={setServiceActive}
                />
                <Label>Enable WhatsApp Service</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={saveApiConfiguration} disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={loadAdminData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {apiConfig && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Current Status:</h4>
                  <p className="text-sm">
                    Service: {apiConfig.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                    )}
                  </p>
                  <p className="text-sm">
                    API Key: {apiConfig.api_key ? 'Configured' : 'Not configured'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Message Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.template_name}</h4>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(template.approval_status)}
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={() => toggleTemplateStatus(template.id, template.is_active)}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{template.event_type}</p>
                    <p className="text-sm bg-muted p-2 rounded">{template.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent WhatsApp Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Message logs will appear here once WhatsApp notifications are sent.
                This will help you track delivery status and troubleshoot issues.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;