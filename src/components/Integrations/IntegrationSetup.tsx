import React, { useState } from 'react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Settings, 
  TestTube, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink,
  MessageSquare,
  Slack,
  Hash,
  Plug
} from 'lucide-react';
import { toast } from 'sonner';

export const IntegrationSetup: React.FC = () => {
  const { 
    services, 
    integrations, 
    loading, 
    createIntegration, 
    updateIntegration, 
    testIntegration, 
    deleteIntegration,
    sendTestNotification 
  } = useIntegrations();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [connectionName, setConnectionName] = useState('');
  const [configuration, setConfiguration] = useState<Record<string, any>>({});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'slack':
        return <Slack className="h-5 w-5" />;
      case 'discord':
        return <MessageSquare className="h-5 w-5" />;
      case 'webhook':
        return <ExternalLink className="h-5 w-5" />;
      default:
        return <Hash className="h-5 w-5" />;
    }
  };

  const handleCreateIntegration = async () => {
    if (!selectedService || !connectionName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createIntegration(selectedService, connectionName, configuration);
      setIsCreateDialogOpen(false);
      setSelectedService('');
      setConnectionName('');
      setConfiguration({});
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleConfigurationChange = (field: string, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderConfigurationFields = () => {
    const service = services.find(s => s.id === selectedService);
    if (!service?.configuration_schema) return null;

    const schema = service.configuration_schema;
    
    return Object.entries(schema).map(([field, config]: [string, any]) => {
      const fieldConfig = config as any;
      
      switch (fieldConfig.type) {
        case 'string':
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>
                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {fieldConfig.enum ? (
                <Select onValueChange={(value) => handleConfigurationChange(field, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldConfig.enum.map((option: string) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field}
                  placeholder={fieldConfig.default || `Enter ${field}`}
                  value={configuration[field] || ''}
                  onChange={(e) => handleConfigurationChange(field, e.target.value)}
                />
              )}
            </div>
          );
        case 'object':
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>
                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea
                id={field}
                placeholder="Enter JSON configuration"
                value={JSON.stringify(configuration[field] || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleConfigurationChange(field, parsed);
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">External Service Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect with external services to extend notification capabilities
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Integration</DialogTitle>
              <DialogDescription>
                Connect to an external service to receive notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center gap-2">
                          {getServiceIcon(service.service_type)}
                          {service.display_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input
                  id="name"
                  placeholder="My Slack Integration"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                />
              </div>

              {renderConfigurationFields()}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateIntegration}>
                  Create Integration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Available Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getServiceIcon(service.service_type)}
                  <CardTitle className="text-base">{service.display_name}</CardTitle>
                </div>
                <Badge variant="secondary">{service.service_type}</Badge>
              </div>
              <CardDescription className="text-sm">
                {service.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-3">
                {service.supported_events.map((event) => (
                  <Badge key={event} variant="outline" className="text-xs">
                    {event}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Integrations */}
      <div className="space-y-4">
        <h4 className="font-medium">Your Integrations</h4>
        
        {integrations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Plug className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No integrations configured yet. Add your first integration to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(integration.integration_services?.service_type || '')}
                      <div>
                        <CardTitle className="text-base">{integration.connection_name}</CardTitle>
                        <CardDescription>
                          {integration.integration_services?.display_name}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.connection_status)}
                      <Badge variant={integration.is_active ? "default" : "secondary"}>
                        {integration.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Status: {integration.connection_status}</span>
                      {integration.last_test_at && (
                        <span>• Last tested: {new Date(integration.last_test_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testIntegration(integration.id)}
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendTestNotification(integration.id)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Send Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteIntegration(integration.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {integration.last_error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{integration.last_error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};