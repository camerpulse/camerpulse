import React, { useState } from 'react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Activity,
  Webhook,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export const WebhookManager: React.FC = () => {
  const { webhooks, loading, createWebhook } = useIntegrations();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [endpointName, setEndpointName] = useState('');
  const [eventFilters, setEventFilters] = useState('{}');
  const [transformationRules, setTransformationRules] = useState('{}');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const handleCreateWebhook = async () => {
    if (!endpointName.trim()) {
      toast.error('Please enter an endpoint name');
      return;
    }

    try {
      let parsedFilters = {};
      let parsedRules = {};

      try {
        parsedFilters = JSON.parse(eventFilters);
      } catch {
        toast.error('Invalid JSON in event filters');
        return;
      }

      try {
        parsedRules = JSON.parse(transformationRules);
      } catch {
        toast.error('Invalid JSON in transformation rules');
        return;
      }

      await createWebhook(endpointName, parsedFilters, parsedRules);
      setIsCreateDialogOpen(false);
      setEndpointName('');
      setEventFilters('{}');
      setTransformationRules('{}');
    } catch (error) {
      // Error already handled in hook
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const toggleSecretVisibility = (webhookId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [webhookId]: !prev[webhookId]
    }));
  };

  const getWebhookUrl = (endpointUrl: string) => {
    return `${window.location.origin}/webhook-handler/${endpointUrl}`;
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
          <h3 className="text-lg font-semibold">Webhook Endpoints</h3>
          <p className="text-sm text-muted-foreground">
            Create webhook endpoints to receive external notifications
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Webhook Endpoint</DialogTitle>
              <DialogDescription>
                Create a new webhook endpoint to receive notifications from external services
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint-name">Endpoint Name</Label>
                <Input
                  id="endpoint-name"
                  placeholder="My External Service Webhook"
                  value={endpointName}
                  onChange={(e) => setEndpointName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-filters">Event Filters (JSON)</Label>
                <Textarea
                  id="event-filters"
                  placeholder='{"event_type": "user_signup"}'
                  value={eventFilters}
                  onChange={(e) => setEventFilters(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Filter incoming events based on their properties
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transformation-rules">Transformation Rules (JSON)</Label>
                <Textarea
                  id="transformation-rules"
                  placeholder='{"field_mappings": {"user_id": "id", "email": "user_email"}}'
                  value={transformationRules}
                  onChange={(e) => setTransformationRules(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Transform incoming data before processing
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWebhook}>
                  Create Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No webhook endpoints created yet. Create your first webhook to start receiving external notifications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Webhook className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-base">{webhook.endpoint_name}</CardTitle>
                      <CardDescription>
                        Created {new Date(webhook.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={webhook.is_active ? "default" : "secondary"}>
                      {webhook.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {webhook.total_triggers > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {webhook.total_triggers} triggers
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Webhook URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={getWebhookUrl(webhook.endpoint_url)}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(getWebhookUrl(webhook.endpoint_url), 'Webhook URL')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(getWebhookUrl(webhook.endpoint_url), '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Webhook Secret */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Webhook Secret</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showSecrets[webhook.id] ? "text" : "password"}
                      value={webhook.webhook_secret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSecretVisibility(webhook.id)}
                    >
                      {showSecrets[webhook.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(webhook.webhook_secret, 'Webhook Secret')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Include this secret in the x-webhook-secret header when calling the webhook
                  </p>
                </div>

                {/* Stats */}
                {webhook.last_triggered_at && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Last triggered: {new Date(webhook.last_triggered_at).toLocaleString()}</span>
                    <span>Total triggers: {webhook.total_triggers}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};