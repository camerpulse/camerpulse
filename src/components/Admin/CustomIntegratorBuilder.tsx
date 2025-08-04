import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  TestTube,
  Activity,
  BarChart3,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from "lucide-react";

interface Integration {
  id: string;
  integration_name: string;
  integration_type: string;
  endpoint_url: string;
  auth_type: string;
  auth_config: any;
  request_method: string;
  request_headers: any;
  request_body: any;
  purpose: string;
  output_target: string;
  pull_interval: string;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  last_executed_at: string;
  execution_count: number;
  success_count: number;
  error_count: number;
}

interface NewIntegration {
  integration_name: string;
  integration_type: string;
  endpoint_url: string;
  auth_type: string;
  auth_config: any;
  request_method: string;
  request_headers: any;
  request_body: any;
  purpose: string;
  output_target: string;
  pull_interval: string;
  is_active: boolean;
  is_public: boolean;
  auth_secrets: Array<{key: string, value: string}>;
}

export function CustomIntegratorBuilder() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const { toast } = useToast();

  const [newIntegration, setNewIntegration] = useState<NewIntegration>({
    integration_name: '',
    integration_type: 'rest_api',
    endpoint_url: '',
    auth_type: 'none',
    auth_config: {},
    request_method: 'GET',
    request_headers: {},
    request_body: {},
    purpose: '',
    output_target: '',
    pull_interval: 'manual',
    is_active: true,
    is_public: false,
    auth_secrets: []
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('custom-integrator-builder/list');
      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('custom-integrator-builder/create', {
        body: newIntegration
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Integration created successfully"
      });
      
      setShowCreateDialog(false);
      setNewIntegration({
        integration_name: '',
        integration_type: 'rest_api',
        endpoint_url: '',
        auth_type: 'none',
        auth_config: {},
        request_method: 'GET',
        request_headers: {},
        request_body: {},
        purpose: '',
        output_target: '',
        pull_interval: 'manual',
        is_active: true,
        is_public: false,
        auth_secrets: []
      });
      
      loadIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: "Error",
        description: "Failed to create integration",
        variant: "destructive"
      });
    }
  };

  const executeIntegration = async (integrationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('custom-integrator-builder/execute', {
        body: { integration_id: integrationId }
      });
      
      if (error) throw error;
      
      setExecutionResults(data);
      
      toast({
        title: data.success ? "Success" : "Execution Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
      
      loadIntegrations();
    } catch (error) {
      console.error('Error executing integration:', error);
      toast({
        title: "Error",
        description: "Failed to execute integration",
        variant: "destructive"
      });
    }
  };

  const testEndpoint = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('custom-integrator-builder/test', {
        body: {
          endpoint_url: newIntegration.endpoint_url,
          request_method: newIntegration.request_method,
          request_headers: newIntegration.request_headers
        }
      });
      
      if (error) throw error;
      
      toast({
        title: data.success ? "Test Successful" : "Test Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error testing endpoint:', error);
      toast({
        title: "Error",
        description: "Failed to test endpoint",
        variant: "destructive"
      });
    }
  };

  const loadLogs = async (integrationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('custom-integrator-builder/logs', {
        body: { integration_id: integrationId }
      });
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const loadStats = async (integrationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('custom-integrator-builder/stats', {
        body: { integration_id: integrationId }
      });
      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const toggleIntegrationStatus = async (integrationId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('custom-integrator-builder/update', {
        body: { integration_id: integrationId, is_active: !isActive }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Integration ${!isActive ? 'enabled' : 'disabled'}`
      });
      
      loadIntegrations();
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (integration: Integration) => {
    if (!integration.is_active) return <Pause className="h-4 w-4 text-muted-foreground" />;
    if (integration.error_count > integration.success_count) return <XCircle className="h-4 w-4 text-destructive" />;
    if (integration.success_count > 0) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getSuccessRate = (integration: Integration) => {
    const total = integration.execution_count;
    if (total === 0) return 'N/A';
    return `${Math.round((integration.success_count / total) * 100)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Integrator Builder</h2>
          <p className="text-muted-foreground">
            Build and manage integrations with external APIs and services
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Integration</DialogTitle>
              <DialogDescription>
                Configure a new integration with an external API or service
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="integration_name">Integration Name</Label>
                  <Input
                    id="integration_name"
                    value={newIntegration.integration_name}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, integration_name: e.target.value }))}
                    placeholder="e.g., WhatsApp Business API"
                  />
                </div>
                <div>
                  <Label htmlFor="integration_type">Integration Type</Label>
                  <Select
                    value={newIntegration.integration_type}
                    onValueChange={(value) => setNewIntegration(prev => ({ ...prev, integration_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rest_api">REST API</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="messaging">Messaging Service</SelectItem>
                      <SelectItem value="data_sheet">Data Sheet</SelectItem>
                      <SelectItem value="oauth2">OAuth2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="endpoint_url">Endpoint URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="endpoint_url"
                    value={newIntegration.endpoint_url}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, endpoint_url: e.target.value }))}
                    placeholder="https://api.example.com/v1/endpoint"
                  />
                  <Button variant="outline" onClick={testEndpoint} disabled={!newIntegration.endpoint_url}>
                    <TestTube className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="request_method">Method</Label>
                  <Select
                    value={newIntegration.request_method}
                    onValueChange={(value) => setNewIntegration(prev => ({ ...prev, request_method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="auth_type">Authentication</Label>
                  <Select
                    value={newIntegration.auth_type}
                    onValueChange={(value) => setNewIntegration(prev => ({ ...prev, auth_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="oauth2">OAuth2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    value={newIntegration.purpose}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="e.g., Send civic alerts via WhatsApp"
                  />
                </div>
                <div>
                  <Label htmlFor="output_target">Output Target</Label>
                  <Input
                    id="output_target"
                    value={newIntegration.output_target}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, output_target: e.target.value }))}
                    placeholder="e.g., Civic Dashboard"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={newIntegration.is_active}
                    onCheckedChange={(checked) => setNewIntegration(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={newIntegration.is_public}
                    onCheckedChange={(checked) => setNewIntegration(prev => ({ ...prev, is_public: checked }))}
                  />
                  <Label htmlFor="is_public">Public Access</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={createIntegration} className="flex-1">
                  Create Integration
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {integrations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Integrations Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first integration to connect with external APIs and services
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Integration
              </Button>
            </CardContent>
          </Card>
        ) : (
          integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration)}
                    <div>
                      <CardTitle className="text-lg">{integration.integration_name}</CardTitle>
                      <CardDescription>{integration.purpose}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={integration.is_active ? "default" : "secondary"}>
                      {integration.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {integration.is_public && (
                      <Badge variant="outline">Public</Badge>
                    )}
                    <Badge variant="outline">{integration.integration_type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Executions</p>
                    <p className="font-semibold">{integration.execution_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="font-semibold">{getSuccessRate(integration)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-semibold">{integration.request_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Run</p>
                    <p className="font-semibold">
                      {integration.last_executed_at 
                        ? new Date(integration.last_executed_at).toLocaleDateString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => executeIntegration(integration.id)}
                    disabled={!integration.is_active}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Execute
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleIntegrationStatus(integration.id, integration.is_active)}
                  >
                    {integration.is_active ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedIntegration(integration);
                      loadLogs(integration.id);
                      loadStats(integration.id);
                    }}
                  >
                    <Activity className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  {integration.endpoint_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={integration.endpoint_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        API
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedIntegration && (
        <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedIntegration.integration_name} - Details</DialogTitle>
              <DialogDescription>
                Integration logs and performance statistics
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="logs" className="w-full">
              <TabsList>
                <TabsTrigger value="logs">
                  <FileText className="h-4 w-4 mr-2" />
                  Execution Logs
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="space-y-4">
                {logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No execution logs yet</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {logs.map((log) => (
                      <Card key={log.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {log.execution_status === 'success' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                              <Badge variant={log.execution_status === 'success' ? 'default' : 'destructive'}>
                                {log.execution_status}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(log.executed_at).toLocaleString()}
                            </span>
                          </div>
                          {log.error_message && (
                            <p className="text-sm text-destructive">{log.error_message}</p>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Status: {log.response_status_code} | Time: {log.execution_time_ms}ms
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                {stats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No statistics available yet</p>
                ) : (
                  <div className="grid gap-4">
                    {stats.map((stat) => (
                      <Card key={stat.id}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Date</p>
                              <p className="font-semibold">{new Date(stat.stat_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Requests</p>
                              <p className="font-semibold">{stat.total_requests}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Success Rate</p>
                              <p className="font-semibold">
                                {stat.total_requests > 0 
                                  ? Math.round((stat.successful_requests / stat.total_requests) * 100) + '%'
                                  : 'N/A'
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Avg Response Time</p>
                              <p className="font-semibold">{stat.average_response_time_ms}ms</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {executionResults && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Execution Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {executionResults.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className={executionResults.success ? "text-green-500" : "text-destructive"}>
                  {executionResults.message}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Status: {executionResults.status} | Execution Time: {executionResults.execution_time}ms
              </p>
              {executionResults.data && (
                <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(executionResults.data, null, 2)}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}