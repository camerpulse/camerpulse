import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, Cloud, Database, Globe, Smartphone, 
  CheckCircle, AlertTriangle, Clock, RefreshCw, Settings
} from 'lucide-react';

interface IntegrationManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const IntegrationManagementModule: React.FC<IntegrationManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('services');

  const externalServices = [
    {
      id: 1,
      name: 'OpenAI API',
      type: 'AI Service',
      status: 'connected',
      health: 98.5,
      lastSync: '2024-01-15 14:50',
      requests24h: 1240,
      rateLimit: '3000/hour',
      latency: '450ms',
      errorRate: 0.2,
      endpoint: 'https://api.openai.com/v1'
    },
    {
      id: 2,
      name: 'SendGrid Email',
      type: 'Email Service',
      status: 'connected',
      health: 99.2,
      lastSync: '2024-01-15 14:55',
      requests24h: 890,
      rateLimit: '10000/day',
      latency: '120ms',
      errorRate: 0.1,
      endpoint: 'https://api.sendgrid.com/v3'
    },
    {
      id: 3,
      name: 'Twilio SMS',
      type: 'SMS Gateway',
      status: 'warning',
      health: 87.3,
      lastSync: '2024-01-15 13:20',
      requests24h: 145,
      rateLimit: '1000/day',
      latency: '890ms',
      errorRate: 2.1,
      endpoint: 'https://api.twilio.com/2010-04-01'
    },
    {
      id: 4,
      name: 'Stripe Payment',
      type: 'Payment Gateway',
      status: 'connected',
      health: 99.9,
      lastSync: '2024-01-15 14:52',
      requests24h: 234,
      rateLimit: '100/minute',
      latency: '280ms',
      errorRate: 0.0,
      endpoint: 'https://api.stripe.com/v1'
    }
  ];

  const webhookEndpoints = [
    {
      id: 1,
      name: 'Payment Webhook',
      url: 'https://camerpulse.com/webhooks/payment',
      status: 'active',
      lastTrigger: '2024-01-15 14:45',
      success24h: 98.5,
      retries: 2,
      avgLatency: '150ms',
      events: ['payment.succeeded', 'payment.failed']
    },
    {
      id: 2,
      name: 'User Registration Webhook',
      url: 'https://camerpulse.com/webhooks/user',
      status: 'active',
      lastTrigger: '2024-01-15 14:30',
      success24h: 99.2,
      retries: 0,
      avgLatency: '89ms',
      events: ['user.created', 'user.updated']
    },
    {
      id: 3,
      name: 'Email Delivery Webhook',
      url: 'https://camerpulse.com/webhooks/email',
      status: 'error',
      lastTrigger: '2024-01-15 12:15',
      success24h: 76.8,
      retries: 15,
      avgLatency: '450ms',
      events: ['email.delivered', 'email.bounced']
    }
  ];

  const dataSync = [
    {
      id: 1,
      source: 'User Analytics Database',
      destination: 'Data Warehouse',
      status: 'syncing',
      progress: 78,
      lastSync: '2024-01-15 14:40',
      frequency: 'Every 6 hours',
      recordsProcessed: 45230,
      totalRecords: 58000,
      syncDuration: '1h 25m'
    },
    {
      id: 2,
      source: 'Content Management System',
      destination: 'Search Index',
      status: 'completed',
      progress: 100,
      lastSync: '2024-01-15 13:00',
      frequency: 'Every 2 hours',
      recordsProcessed: 12450,
      totalRecords: 12450,
      syncDuration: '15m'
    },
    {
      id: 3,
      source: 'Financial Transactions',
      destination: 'Audit Database',
      status: 'failed',
      progress: 45,
      lastSync: '2024-01-15 11:30',
      frequency: 'Every hour',
      recordsProcessed: 2340,
      totalRecords: 5200,
      syncDuration: 'N/A'
    }
  ];

  const apiHealthChecks = [
    {
      id: 1,
      endpoint: '/api/v1/health',
      method: 'GET',
      status: 'healthy',
      responseTime: '45ms',
      uptime: 99.9,
      lastCheck: '2024-01-15 14:55',
      statusCode: 200
    },
    {
      id: 2,
      endpoint: '/api/v1/auth/verify',
      method: 'POST',
      status: 'healthy',
      responseTime: '120ms',
      uptime: 99.7,
      lastCheck: '2024-01-15 14:55',
      statusCode: 200
    },
    {
      id: 3,
      endpoint: '/api/v1/data/sync',
      method: 'POST',
      status: 'degraded',
      responseTime: '890ms',
      uptime: 98.2,
      lastCheck: '2024-01-15 14:54',
      statusCode: 500
    },
    {
      id: 4,
      endpoint: '/api/v1/files/upload',
      method: 'POST',
      status: 'healthy',
      responseTime: '340ms',
      uptime: 99.5,
      lastCheck: '2024-01-15 14:55',
      statusCode: 200
    }
  ];

  const handleServiceAction = (serviceId: number, action: string) => {
    logActivity('service_action', { service_id: serviceId, action });
  };

  const handleWebhookAction = (webhookId: number, action: string) => {
    logActivity('webhook_action', { webhook_id: webhookId, action });
  };

  const handleSyncAction = (syncId: number, action: string) => {
    logActivity('sync_action', { sync_id: syncId, action });
  };

  const handleHealthCheck = (endpointId: number) => {
    logActivity('health_check', { endpoint_id: endpointId });
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600';
    if (health >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'completed':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Integration Management"
        description="Manage external services, webhooks, data synchronization, and API health"
        icon={Zap}
        iconColor="text-purple-600"
        onRefresh={() => {
          logActivity('integration_refresh', { timestamp: new Date() });
        }}
      />

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Services"
          value="12"
          icon={Cloud}
          description="External integrations"
          badge={{ text: "Operational", variant: "default" }}
        />
        <StatCard
          title="API Health"
          value="98.7%"
          icon={Globe}
          trend={{ value: 0.3, isPositive: true, period: "this week" }}
          description="Average uptime"
        />
        <StatCard
          title="Webhook Success"
          value="94.2%"
          icon={Zap}
          description="24h success rate"
          badge={{ text: "Good", variant: "secondary" }}
        />
        <StatCard
          title="Sync Status"
          value="78%"
          icon={RefreshCw}
          trend={{ value: 5.2, isPositive: true, period: "today" }}
          description="Data sync completion"
        />
      </div>

      {/* Integration Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">External Services</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="health">API Health</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                External Service Integrations
              </CardTitle>
              <CardDescription>
                Monitor and manage connections to external services and APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {externalServices.map((service) => (
                  <div key={service.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            service.status === 'connected' ? 'default' :
                            service.status === 'warning' ? 'secondary' : 'destructive'
                          }
                        >
                          {service.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleServiceAction(service.id, 'test')}
                        >
                          Test
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Health:</span>
                        <p className={`font-medium ${getHealthColor(service.health)}`}>
                          {service.health}%
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requests (24h):</span>
                        <p className="font-medium">{service.requests24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Latency:</span>
                        <p className="font-medium">{service.latency}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Error Rate:</span>
                        <p className="font-medium">{service.errorRate}%</p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Endpoint: {service.endpoint} • Rate limit: {service.rateLimit} • Last sync: {service.lastSync}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Webhook Management
              </CardTitle>
              <CardDescription>
                Monitor webhook endpoints and delivery success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhookEndpoints.map((webhook) => (
                  <div key={webhook.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(webhook.status)}
                        <div>
                          <h4 className="font-semibold">{webhook.name}</h4>
                          <p className="text-sm text-muted-foreground font-mono">
                            {webhook.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            webhook.status === 'active' ? 'default' : 'destructive'
                          }
                        >
                          {webhook.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWebhookAction(webhook.id, 'test')}
                        >
                          Test
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <p className="font-medium">{webhook.success24h}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Retries:</span>
                        <p className="font-medium">{webhook.retries}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Latency:</span>
                        <p className="font-medium">{webhook.avgLatency}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Trigger:</span>
                        <p className="font-medium">{webhook.lastTrigger}</p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Events: {webhook.events.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Synchronization
              </CardTitle>
              <CardDescription>
                Monitor data synchronization processes and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSync.map((sync) => (
                  <div key={sync.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(sync.status)}
                        <div>
                          <h4 className="font-semibold">{sync.source}</h4>
                          <p className="text-sm text-muted-foreground">
                            → {sync.destination}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            sync.status === 'completed' ? 'default' :
                            sync.status === 'syncing' ? 'secondary' : 'destructive'
                          }
                        >
                          {sync.status}
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => handleSyncAction(sync.id, 'restart')}
                        >
                          Restart
                        </Button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{sync.recordsProcessed.toLocaleString()} / {sync.totalRecords.toLocaleString()}</span>
                      </div>
                      <Progress value={sync.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Frequency:</span>
                        <p className="font-medium">{sync.frequency}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{sync.syncDuration}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Sync:</span>
                        <p className="font-medium">{sync.lastSync}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Health Monitoring
              </CardTitle>
              <CardDescription>
                Monitor API endpoint health and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiHealthChecks.map((endpoint) => (
                  <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        endpoint.status === 'healthy' ? 'bg-green-100' :
                        endpoint.status === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {getStatusIcon(endpoint.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold font-mono">{endpoint.endpoint}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline">{endpoint.method}</Badge>
                          <span>Response: {endpoint.responseTime}</span>
                          <span>Uptime: {endpoint.uptime}%</span>
                          <span>Status: {endpoint.statusCode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          endpoint.status === 'healthy' ? 'default' :
                          endpoint.status === 'degraded' ? 'secondary' : 'destructive'
                        }
                      >
                        {endpoint.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleHealthCheck(endpoint.id)}
                      >
                        Check Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};