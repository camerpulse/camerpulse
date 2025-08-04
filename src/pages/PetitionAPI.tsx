import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Code, 
  Key, 
  Globe, 
  Webhook, 
  Activity, 
  Shield, 
  Clock, 
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Database,
  Server,
  Zap,
  Settings
} from 'lucide-react';

export default function PetitionAPI() {
  const [apiEnabled, setApiEnabled] = React.useState(true);
  const [webhooksEnabled, setWebhooksEnabled] = React.useState(true);
  const [rateLimitEnabled, setRateLimitEnabled] = React.useState(true);
  const [selectedKey, setSelectedKey] = React.useState('');

  const apiStats = {
    totalRequests: 45672,
    successRate: 99.7,
    avgResponseTime: 145,
    activeKeys: 12,
    dailyLimit: 10000,
    usageToday: 3847
  };

  const apiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'pk_live_a1b2c3d4e5f6...',
      permissions: ['read', 'write'],
      lastUsed: '2 hours ago',
      requests: 1247,
      status: 'active'
    },
    {
      id: 2,
      name: 'Mobile App Key',
      key: 'pk_live_x9y8z7w6v5u4...',
      permissions: ['read'],
      lastUsed: '15 minutes ago',
      requests: 2156,
      status: 'active'
    },
    {
      id: 3,
      name: 'Analytics Integration',
      key: 'pk_live_m3n2o1p0q9r8...',
      permissions: ['read'],
      lastUsed: '1 day ago',
      requests: 89,
      status: 'restricted'
    }
  ];

  const webhooks = [
    {
      id: 1,
      name: 'Petition Created',
      url: 'https://api.example.com/webhooks/petition-created',
      events: ['petition.created', 'petition.published'],
      status: 'active',
      lastTriggered: '5 minutes ago'
    },
    {
      id: 2,
      name: 'Signature Received',
      url: 'https://analytics.example.com/petition-signature',
      events: ['signature.created', 'signature.verified'],
      status: 'active',
      lastTriggered: '2 minutes ago'
    },
    {
      id: 3,
      name: 'Milestone Reached',
      url: 'https://notifications.example.com/milestone',
      events: ['petition.milestone'],
      status: 'paused',
      lastTriggered: '2 hours ago'
    }
  ];

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/petitions',
      description: 'List all public petitions',
      rateLimit: '100/hour',
      auth: 'Optional'
    },
    {
      method: 'GET',
      path: '/api/v1/petitions/{id}',
      description: 'Get petition details',
      rateLimit: '1000/hour',
      auth: 'Optional'
    },
    {
      method: 'POST',
      path: '/api/v1/petitions',
      description: 'Create new petition',
      rateLimit: '10/hour',
      auth: 'Required'
    },
    {
      method: 'POST',
      path: '/api/v1/petitions/{id}/signatures',
      description: 'Sign petition',
      rateLimit: '5/hour',
      auth: 'Required'
    },
    {
      method: 'GET',
      path: '/api/v1/signatures',
      description: 'Get user signatures',
      rateLimit: '100/hour',
      auth: 'Required'
    },
    {
      method: 'GET',
      path: '/api/v1/analytics',
      description: 'Get petition analytics',
      rateLimit: '50/hour',
      auth: 'Required'
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'restricted': return 'destructive';
      default: return 'outline';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Code className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">API Management & Integration</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive API access, webhook management, and third-party integrations
          </p>
        </div>

        {/* API Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiStats.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{apiStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">API reliability</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiStats.avgResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">Average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiStats.usageToday.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">of {apiStats.dailyLimit.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* API Keys */}
          <TabsContent value="keys" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Keys Management
                  </CardTitle>
                  <CardDescription>Manage access keys for external integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Key className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{key.name}</h3>
                            <Badge variant={getStatusColor(key.status)}>
                              {key.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-sm bg-muted px-2 py-1 rounded">{key.key}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key.key)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {key.requests.toLocaleString()} requests • Last used {key.lastUsed}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {key.permissions.map((perm) => (
                              <Badge key={perm} variant="outline" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Revoke</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create New API Key</CardTitle>
                  <CardDescription>Generate a new API key for integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input id="key-name" placeholder="e.g., Mobile App Integration" />
                  </div>

                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="read" defaultChecked />
                        <Label htmlFor="read">Read access</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="write" />
                        <Label htmlFor="write">Write access</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="admin" />
                        <Label htmlFor="admin">Admin access</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate-limit">Rate Limit (requests/hour)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 requests/hour</SelectItem>
                        <SelectItem value="1000">1,000 requests/hour</SelectItem>
                        <SelectItem value="10000">10,000 requests/hour</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">Generate API Key</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Endpoints */}
          <TabsContent value="endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Endpoints Documentation
                </CardTitle>
                <CardDescription>
                  Available endpoints for petition platform integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <div>
                          <code className="font-medium">{endpoint.path}</code>
                          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{endpoint.rateLimit}</div>
                        <div className="text-xs text-muted-foreground">Auth: {endpoint.auth}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Base URL</h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-background rounded border">
                      https://api.camerpulse.org/v1
                    </code>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard('https://api.camerpulse.org/v1')}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SDK & Libraries</CardTitle>
                <CardDescription>Official SDKs and community libraries</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">JavaScript SDK</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Official JavaScript/TypeScript SDK
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-3 w-3 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Python SDK</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Python library for server integration
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-3 w-3 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">REST Client</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Postman collection for testing
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-3 w-3 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Active Webhooks
                  </CardTitle>
                  <CardDescription>Real-time event notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{webhook.name}</h3>
                        <Badge variant={getStatusColor(webhook.status)}>
                          {webhook.status}
                        </Badge>
                      </div>
                      <code className="text-sm bg-muted px-2 py-1 rounded block mb-2">
                        {webhook.url}
                      </code>
                      <div className="flex gap-1 mb-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last triggered: {webhook.lastTriggered}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">Test</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Logs</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create Webhook</CardTitle>
                  <CardDescription>Set up real-time event notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-name">Webhook Name</Label>
                    <Input id="webhook-name" placeholder="e.g., Petition Analytics" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Endpoint URL</Label>
                    <Input id="webhook-url" placeholder="https://your-app.com/webhook" />
                  </div>

                  <div className="space-y-2">
                    <Label>Events to Subscribe</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {[
                        'petition.created', 'petition.published', 'petition.updated',
                        'signature.created', 'signature.verified', 'signature.deleted',
                        'comment.created', 'comment.approved', 'comment.deleted',
                        'petition.milestone', 'petition.expired', 'petition.completed'
                      ].map((event) => (
                        <div key={event} className="flex items-center space-x-2">
                          <input type="checkbox" id={event} />
                          <Label htmlFor={event} className="text-sm">{event}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secret">Webhook Secret (Optional)</Label>
                    <Input id="secret" type="password" placeholder="For signature verification" />
                  </div>

                  <Button className="w-full">Create Webhook</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>Global API settings and security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>API Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable external API access
                      </p>
                    </div>
                    <Switch checked={apiEnabled} onCheckedChange={setApiEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">
                        Enforce API rate limits
                      </p>
                    </div>
                    <Switch checked={rateLimitEnabled} onCheckedChange={setRateLimitEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Webhook Delivery</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable webhook notifications
                      </p>
                    </div>
                    <Switch checked={webhooksEnabled} onCheckedChange={setWebhooksEnabled} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cors-origins">CORS Origins</Label>
                    <Textarea 
                      id="cors-origins" 
                      placeholder="https://yourdomain.com&#10;https://app.yourdomain.com"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-rate-limit">Default Rate Limit</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select default limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 requests/hour</SelectItem>
                        <SelectItem value="1000">1,000 requests/hour</SelectItem>
                        <SelectItem value="5000">5,000 requests/hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security & Monitoring</CardTitle>
                  <CardDescription>API security and usage monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">HTTPS Only</h4>
                        <p className="text-sm text-muted-foreground">All API calls encrypted</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Key className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">API Key Authentication</h4>
                        <p className="text-sm text-muted-foreground">Secure key-based access</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Request Logging</h4>
                        <p className="text-sm text-muted-foreground">Complete audit trail</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-medium">Anomaly Detection</h4>
                        <p className="text-sm text-muted-foreground">Automated threat detection</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full">View API Logs</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button size="lg" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Documentation
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            View Code Examples
          </Button>
        </div>
      </div>
    </div>
  );
}