import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Key, Webhook, Globe, Settings, Code, Copy, Trash2, Plus } from 'lucide-react';

interface APIKey {
  id: string;
  key_name: string;
  api_key: string;
  permissions: string[];
  rate_limit_per_hour: number;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

interface Webhook {
  id: string;
  poll_id?: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  last_triggered_at?: string;
  created_at: string;
}

interface Integration {
  id: string;
  integration_type: string;
  configuration: any;
  is_active: boolean;
  last_sync_at?: string;
  sync_status: string;
  created_at: string;
}

export const APIIntegrationManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  // New API Key form
  const [newApiKey, setNewApiKey] = useState({
    key_name: '',
    permissions: ['read'],
    rate_limit_per_hour: 1000
  });

  // New Webhook form
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: ['poll.created', 'poll.voted'],
    poll_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch API keys
      const { data: keysData, error: keysError } = await supabase
        .from('poll_api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (keysError) throw keysError;
      setApiKeys(keysData || []);

      // Fetch webhooks
      const { data: webhooksData, error: webhooksError } = await supabase
        .from('poll_webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (webhooksError) throw webhooksError;
      setWebhooks(webhooksData || []);

      // Fetch integrations
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('poll_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (integrationsError) throw integrationsError;
      setIntegrations(integrationsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load API data');
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    try {
      // Generate API key
      const { data: keyData, error: keyError } = await supabase.rpc('generate_poll_api_key');
      if (keyError) throw keyError;

      // Insert API key record
      const { data, error } = await supabase
        .from('poll_api_keys')
        .insert([{
          key_name: newApiKey.key_name,
          api_key: keyData,
          permissions: newApiKey.permissions,
          rate_limit_per_hour: newApiKey.rate_limit_per_hour,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setApiKeys([data, ...apiKeys]);
      setNewApiKey({ key_name: '', permissions: ['read'], rate_limit_per_hour: 1000 });
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const createWebhook = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_webhooks')
        .insert([{
          url: newWebhook.url,
          events: newWebhook.events,
          poll_id: newWebhook.poll_id || null,
          secret: crypto.randomUUID(),
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setWebhooks([data, ...webhooks]);
      setNewWebhook({ url: '', events: ['poll.created', 'poll.voted'], poll_id: '' });
      toast.success('Webhook created successfully');
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error('Failed to create webhook');
    }
  };

  const toggleAPIKeyStatus = async (keyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('poll_api_keys')
        .update({ is_active: isActive })
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, is_active: isActive } : key
      ));
      toast.success(`API key ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error('Failed to update API key');
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('poll_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast.success('API key deleted');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">API & Integration Management</h2>
        <p className="text-muted-foreground">
          Manage API keys, webhooks, and third-party integrations for your polling platform
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="documentation">API Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          {/* Create API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Create New API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={newApiKey.key_name}
                    onChange={(e) => setNewApiKey({...newApiKey, key_name: e.target.value})}
                    placeholder="My App API Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <Select
                    value={newApiKey.permissions[0]}
                    onValueChange={(value) => setNewApiKey({...newApiKey, permissions: [value]})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="write">Read & Write</SelectItem>
                      <SelectItem value="admin">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Rate Limit (per hour)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={newApiKey.rate_limit_per_hour}
                    onChange={(e) => setNewApiKey({...newApiKey, rate_limit_per_hour: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <Button onClick={createAPIKey} disabled={!newApiKey.key_name}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </CardContent>
          </Card>

          {/* API Keys List */}
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>Manage your API keys and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{key.key_name}</h4>
                        <Badge variant={key.is_active ? "default" : "destructive"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <code className="bg-muted px-2 py-1 rounded">{key.api_key.slice(0, 12)}...</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.api_key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {key.permissions.join(', ')} • {key.rate_limit_per_hour}/hour
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={key.is_active}
                        onCheckedChange={(checked) => toggleAPIKeyStatus(key.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAPIKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No API keys created yet. Create your first API key above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          {/* Create Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Create New Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                    placeholder="https://your-app.com/webhook"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Events</Label>
                  <Select
                    value={newWebhook.events[0]}
                    onValueChange={(value) => setNewWebhook({...newWebhook, events: [value]})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poll.created">Poll Created</SelectItem>
                      <SelectItem value="poll.voted">Poll Voted</SelectItem>
                      <SelectItem value="poll.completed">Poll Completed</SelectItem>
                      <SelectItem value="*">All Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={createWebhook} disabled={!newWebhook.url}>
                <Plus className="h-4 w-4 mr-2" />
                Create Webhook
              </Button>
            </CardContent>
          </Card>

          {/* Webhooks List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Webhooks</CardTitle>
              <CardDescription>Receive real-time notifications for poll events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{webhook.url}</h4>
                      <div className="flex items-center gap-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline">{event}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last triggered: {webhook.last_triggered_at ? new Date(webhook.last_triggered_at).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <Badge variant={webhook.is_active ? "default" : "destructive"}>
                      {webhook.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
                {webhooks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No webhooks configured. Create your first webhook above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Slack', description: 'Send poll notifications to Slack channels', status: 'available' },
              { name: 'Microsoft Teams', description: 'Integration with Teams channels', status: 'available' },
              { name: 'Zapier', description: 'Connect to 1000+ apps via Zapier', status: 'available' },
              { name: 'Google Sheets', description: 'Export results to Google Sheets', status: 'available' }
            ].map((integration) => (
              <Card key={integration.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Integration
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                  <code className="bg-muted p-2 rounded block">
                    https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/poll-api-gateway
                  </code>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Include your API key in the Authorization header:
                  </p>
                  <code className="bg-muted p-2 rounded block">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Available Endpoints</h3>
                  <div className="space-y-3">
                    <div className="border rounded p-3">
                      <code className="text-green-600">GET /polls</code>
                      <p className="text-sm mt-1">List all polls or get a specific poll by ID</p>
                    </div>
                    <div className="border rounded p-3">
                      <code className="text-blue-600">POST /polls</code>
                      <p className="text-sm mt-1">Create a new poll</p>
                    </div>
                    <div className="border rounded p-3">
                      <code className="text-green-600">GET /analytics</code>
                      <p className="text-sm mt-1">Get poll analytics and performance metrics</p>
                    </div>
                    <div className="border rounded p-3">
                      <code className="text-purple-600">POST /webhooks</code>
                      <p className="text-sm mt-1">Create and manage webhooks</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Rate Limits</h3>
                  <p className="text-sm text-muted-foreground">
                    API calls are limited based on your API key configuration. Default: 1000 requests per hour.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};