import React, { useState } from 'react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Key,
  Calendar,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

export const ApiKeyManager: React.FC = () => {
  const { apiKeys, loading, createApiKey, deleteApiKey } = useIntegrations();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['read']);
  const [expiresAt, setExpiresAt] = useState('');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [newApiKey, setNewApiKey] = useState<string>('');

  const availablePermissions = [
    { id: 'read', label: 'Read', description: 'View notifications and analytics' },
    { id: 'send', label: 'Send', description: 'Send notifications via API' },
    { id: 'write', label: 'Write', description: 'Create and manage notification templates' },
    { id: 'admin', label: 'Admin', description: 'Full access to all features' }
  ];

  const handleCreateApiKey = async () => {
    if (!keyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    if (permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      const result = await createApiKey(
        keyName, 
        permissions, 
        expiresAt || undefined
      );
      
      if (result?.api_key) {
        setNewApiKey(result.api_key);
      }
      
      setKeyName('');
      setPermissions(['read']);
      setExpiresAt('');
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setPermissions(prev => [...prev, permissionId]);
    } else {
      setPermissions(prev => prev.filter(p => p !== permissionId));
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const formatPermissions = (perms: string[]) => {
    return perms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
  };

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setNewApiKey('');
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
          <h3 className="text-lg font-semibold">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Manage API keys for programmatic access to notification features
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for programmatic access
              </DialogDescription>
            </DialogHeader>
            
            {newApiKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 mb-2">
                    API key created successfully! Make sure to copy it now - you won't be able to see it again.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={newApiKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(newApiKey, 'API Key')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={closeCreateDialog}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="Production API Key"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={permission.id}
                        checked={permissions.includes(permission.id)}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires-at">Expiration Date (Optional)</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={closeCreateDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateApiKey}>
                    Create API Key
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No API keys created yet. Create your first API key to start using the notification API.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-base">{apiKey.key_name}</CardTitle>
                      <CardDescription>
                        Created {new Date(apiKey.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpired(apiKey.expires_at) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                        {apiKey.is_active ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* API Key */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showSecrets[apiKey.id] ? "text" : "password"}
                      value={apiKey.api_key}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSecretVisibility(apiKey.id)}
                    >
                      {showSecrets[apiKey.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(apiKey.api_key, 'API Key')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="flex flex-wrap gap-1">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="outline">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats and Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Usage: {apiKey.usage_count} requests</span>
                  </div>
                  {apiKey.expires_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Expires: {new Date(apiKey.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {apiKey.last_used_at && (
                  <div className="text-sm text-muted-foreground">
                    Last used: {new Date(apiKey.last_used_at).toLocaleString()}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteApiKey(apiKey.id)}
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

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Documentation</CardTitle>
          <CardDescription>
            Use your API keys to access the notification API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Base URL</Label>
            <code className="block p-2 bg-muted rounded text-sm">
              {window.location.origin}/notification-api
            </code>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Authentication</Label>
            <code className="block p-2 bg-muted rounded text-sm">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Available Endpoints</Label>
            <div className="space-y-1 text-sm">
              <div><code>POST /send</code> - Send a notification</div>
              <div><code>GET /templates</code> - List notification templates</div>
              <div><code>GET /status?id=ID</code> - Get notification status</div>
              <div><code>GET /analytics?days=7</code> - Get analytics data</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};