import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, Settings, Activity, AlertCircle, 
  CheckCircle, Zap, Database, Key 
} from 'lucide-react';

interface APIConnection {
  id: string;
  connection_name: string;
  api_provider: string;
  health_status: string;
  is_active: boolean;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  last_health_check: string | null;
}

interface APILog {
  id: string;
  request_method: string;
  request_url: string;
  response_status: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  created_at: string;
}

const APIIntegrations: React.FC = () => {
  const { toast } = useToast();
  const [connections, setConnections] = useState<APIConnection[]>([]);
  const [logs, setLogs] = useState<APILog[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: '',
    provider: '',
    baseUrl: '',
    apiKey: ''
  });

  useEffect(() => {
    fetchConnections();
    fetchLogs();
  }, []);

  const fetchConnections = () => {
    // Mock connections data
    const mockConnections = [
      {
        id: '1',
        connection_name: 'OpenAI GPT',
        api_provider: 'openai',
        health_status: 'healthy',
        is_active: true,
        total_requests: 15420,
        successful_requests: 15380,
        failed_requests: 40,
        last_health_check: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: '2',
        connection_name: 'Twitter Integration',
        api_provider: 'twitter',
        health_status: 'degraded',
        is_active: true,
        total_requests: 8950,
        successful_requests: 8440,
        failed_requests: 510,
        last_health_check: new Date(Date.now() - 180000).toISOString()
      },
      {
        id: '3',
        connection_name: 'Slack Notifications',
        api_provider: 'slack',
        health_status: 'healthy',
        is_active: true,
        total_requests: 2340,
        successful_requests: 2335,
        failed_requests: 5,
        last_health_check: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: '4',
        connection_name: 'Zapier Automation',
        api_provider: 'zapier',
        health_status: 'down',
        is_active: false,
        total_requests: 450,
        successful_requests: 320,
        failed_requests: 130,
        last_health_check: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    setConnections(mockConnections);
  };

  const fetchLogs = () => {
    // Mock API logs
    const mockLogs = Array.from({ length: 20 }, (_, i) => ({
      id: `log-${i}`,
      request_method: ['GET', 'POST', 'PUT'][i % 3],
      request_url: `https://api.example.com/v1/endpoint/${i}`,
      response_status: [200, 201, 400, 500][i % 4],
      response_time_ms: Math.floor(Math.random() * 2000) + 50,
      error_message: i % 7 === 0 ? 'Rate limit exceeded' : null,
      created_at: new Date(Date.now() - i * 300000).toISOString()
    }));
    setLogs(mockLogs);
  };

  const createConnection = () => {
    if (!newConnection.name || !newConnection.provider) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const connection: APIConnection = {
      id: Date.now().toString(),
      connection_name: newConnection.name,
      api_provider: newConnection.provider,
      health_status: 'unknown',
      is_active: true,
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      last_health_check: null
    };

    setConnections(prev => [connection, ...prev]);
    setNewConnection({ name: '', provider: '', baseUrl: '', apiKey: '' });
    setShowCreateForm(false);

    toast({
      title: "Success",
      description: "API connection created successfully"
    });
  };

  const testConnection = (connectionId: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { 
              ...conn, 
              health_status: 'healthy',
              last_health_check: new Date().toISOString(),
              total_requests: conn.total_requests + 1,
              successful_requests: conn.successful_requests + 1
            }
          : conn
      )
    );

    toast({
      title: "Connection Test",
      description: "API connection test successful"
    });
  };

  const toggleConnection = (connectionId: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, is_active: !conn.is_active }
          : conn
      )
    );
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      case 'unknown': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertCircle className="h-4 w-4" />;
      case 'down': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return <Zap className="h-5 w-5" />;
      case 'twitter': return <Globe className="h-5 w-5" />;
      case 'slack': return <Activity className="h-5 w-5" />;
      case 'zapier': return <Settings className="h-5 w-5" />;
      default: return <Database className="h-5 w-5" />;
    }
  };

  const getSuccessRate = (connection: APIConnection) => {
    return connection.total_requests > 0 
      ? Math.round((connection.successful_requests / connection.total_requests) * 100)
      : 0;
  };

  const getStatusColor = (status: number | null) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">API Integrations</h1>
            <p className="text-muted-foreground">Manage external API connections and monitor their health</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Database className="h-4 w-4" />
            Add Integration
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                Total Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connections.length}</div>
              <p className="text-xs text-muted-foreground">
                {connections.filter(c => c.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Healthy APIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {connections.filter(c => c.health_status === 'healthy').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((connections.filter(c => c.health_status === 'healthy').length / connections.length) * 100)}% uptime
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {connections.reduce((sum, c) => sum + c.total_requests, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95%</div>
              <p className="text-xs text-muted-foreground">Average across all APIs</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="logs">Request Logs</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-6">
            {/* Create Connection Form */}
            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Connection Name</label>
                      <Input
                        placeholder="Enter connection name"
                        value={newConnection.name}
                        onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">API Provider</label>
                      <Select 
                        value={newConnection.provider} 
                        onValueChange={(value) => setNewConnection(prev => ({ ...prev, provider: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="slack">Slack</SelectItem>
                          <SelectItem value="zapier">Zapier</SelectItem>
                          <SelectItem value="webhook">Custom Webhook</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Base URL</label>
                    <Input
                      placeholder="https://api.example.com"
                      value={newConnection.baseUrl}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, baseUrl: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">API Key</label>
                    <Input
                      type="password"
                      placeholder="Enter API key"
                      value={newConnection.apiKey}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={createConnection}>Create Integration</Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connections List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {connections.map((connection) => (
                <Card key={connection.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getProviderIcon(connection.api_provider)}
                        <div>
                          <CardTitle className="text-lg">{connection.connection_name}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">
                            {connection.api_provider}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getHealthStatusColor(connection.health_status)}>
                          {getHealthIcon(connection.health_status)}
                          {connection.health_status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {connection.total_requests.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Requests</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {getSuccessRate(connection)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {connection.failed_requests}
                        </div>
                        <div className="text-xs text-muted-foreground">Failed</div>
                      </div>
                    </div>

                    {connection.last_health_check && (
                      <div className="text-xs text-muted-foreground">
                        Last checked: {new Date(connection.last_health_check).toLocaleString()}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => testConnection(connection.id)}
                        className="gap-2"
                      >
                        <Activity className="h-3 w-3" />
                        Test
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleConnection(connection.id)}
                      >
                        {connection.is_active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent API Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{log.request_method}</Badge>
                        <div>
                          <div className="font-medium text-sm">{log.request_url}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {log.response_time_ms && (
                          <span className="text-sm text-muted-foreground">
                            {log.response_time_ms}ms
                          </span>
                        )}
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(log.response_status)}
                        >
                          {log.response_status || 'N/A'}
                        </Badge>
                        {log.error_message && (
                          <span className="text-xs text-red-600">{log.error_message}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Webhook URL</label>
                    <Input 
                      placeholder="https://your-domain.com/webhook"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Secret Key</label>
                    <Input 
                      type="password"
                      placeholder="Enter webhook secret"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Events to Subscribe</label>
                    <div className="space-y-2 mt-2">
                      {['user.created', 'poll.completed', 'alert.triggered', 'report.generated'].map((event) => (
                        <label key={event} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button className="gap-2">
                    <Key className="h-4 w-4" />
                    Save Webhook Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default APIIntegrations;