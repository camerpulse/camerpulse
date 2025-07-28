import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plug, 
  Plus, 
  Settings, 
  Globe,
  Key,
  Activity,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useEnterpriseFeaturesLogistics } from '@/hooks/useEnterpriseFeaturesLogistics';
import { toast } from 'sonner';

export const ApiGateway = () => {
  const { 
    apiIntegrations, 
    loading, 
    createApiIntegration, 
    updateApiIntegration, 
    deleteApiIntegration,
    fetchApiIntegrations 
  } = useEnterpriseFeaturesLogistics();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    integration_name: '',
    integration_type: 'webhook',
    api_endpoint: '',
    webhook_url: '',
    configuration: {},
    is_active: true
  });

  useEffect(() => {
    fetchApiIntegrations();
  }, [fetchApiIntegrations]);

  const handleCreateIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createApiIntegration(formData);
      setFormData({
        integration_name: '',
        integration_type: 'webhook',
        api_endpoint: '',
        webhook_url: '',
        configuration: {},
        is_active: true
      });
      setShowCreateForm(false);
      toast.success('API integration created successfully!');
    } catch (error) {
      toast.error('Failed to create API integration');
    }
  };

  const handleToggleStatus = async (integrationId: string, currentStatus: boolean) => {
    try {
      await updateApiIntegration(integrationId, { is_active: !currentStatus });
      toast.success('Integration status updated');
    } catch (error) {
      toast.error('Failed to update integration status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Plug className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading API integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plug className="h-6 w-6" />
            API Gateway
          </h2>
          <p className="text-muted-foreground">
            Manage third-party integrations and webhook endpoints
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Plug className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{apiIntegrations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{apiIntegrations?.filter(i => i.is_active).length || 0}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Webhooks/Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Integration Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Integration</CardTitle>
            <CardDescription>
              Add a new API integration or webhook endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateIntegration} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="integration_name">Integration Name</Label>
                  <Input
                    id="integration_name"
                    value={formData.integration_name}
                    onChange={(e) => setFormData({ ...formData, integration_name: e.target.value })}
                    placeholder="Shopify Integration"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="integration_type">Type</Label>
                  <select
                    id="integration_type"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={formData.integration_type}
                    onChange={(e) => setFormData({ ...formData, integration_type: e.target.value })}
                  >
                    <option value="webhook">Webhook</option>
                    <option value="rest_api">REST API</option>
                    <option value="graphql">GraphQL</option>
                    <option value="ecommerce">E-commerce</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input
                  id="api_endpoint"
                  value={formData.api_endpoint}
                  onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                  placeholder="https://api.example.com/v1"
                />
              </div>
              <div>
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  placeholder="https://webhook.example.com/endpoint"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Integration</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Integrations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apiIntegrations?.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{integration.integration_name}</CardTitle>
                <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                  {integration.is_active ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {integration.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription>
                <Badge variant="outline" className="text-xs">
                  {integration.integration_type}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {integration.api_endpoint && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{integration.api_endpoint}</span>
                  </div>
                )}
                {integration.webhook_url && (
                  <div className="flex items-center gap-2">
                    <Key className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{integration.webhook_url}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created: {new Date(integration.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleToggleStatus(integration.id, integration.is_active)}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  {integration.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {apiIntegrations?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Plug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Integrations Found</h3>
            <p className="text-muted-foreground mb-4">
              Connect your first third-party service or API
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Integration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};