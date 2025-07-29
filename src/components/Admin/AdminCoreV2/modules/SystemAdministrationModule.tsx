import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Database, Users, Shield, Key, FileText, 
  Server, GitBranch, Package, AlertTriangle, CheckCircle
} from 'lucide-react';

interface SystemAdministrationModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const SystemAdministrationModule: React.FC<SystemAdministrationModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('plugins');

  // Mock data for system administration
  const pluginRegistry = [
    { id: 1, name: 'Advanced Analytics', version: '2.1.0', status: 'active', downloads: 1250, rating: 4.8 },
    { id: 2, name: 'Sentiment Monitor', version: '1.5.2', status: 'active', downloads: 890, rating: 4.6 },
    { id: 3, name: 'Village Tracker', version: '3.0.1', status: 'disabled', downloads: 2100, rating: 4.9 },
    { id: 4, name: 'Economic Dashboard', version: '1.8.0', status: 'pending', downloads: 567, rating: 4.3 }
  ];

  const apiConfigurations = [
    { id: 1, service: 'OpenAI API', endpoint: 'https://api.openai.com', status: 'configured', rate_limit: '1000/min' },
    { id: 2, service: 'Email Service', endpoint: 'https://api.sendgrid.com', status: 'configured', rate_limit: '10000/day' },
    { id: 3, service: 'SMS Gateway', endpoint: 'https://api.twilio.com', status: 'pending', rate_limit: '1000/day' },
    { id: 4, service: 'Payment API', endpoint: 'https://api.stripe.com', status: 'configured', rate_limit: '100/min' }
  ];

  const performanceData = [
    { id: 1, metric: 'Database Queries/min', current: 2450, average: 2100, status: 'good' },
    { id: 2, metric: 'API Requests/min', current: 890, average: 750, status: 'good' },
    { id: 3, metric: 'Memory Usage', current: 78, average: 65, status: 'warning' },
    { id: 4, metric: 'CPU Usage', current: 45, average: 40, status: 'good' }
  ];

  const maintenanceTasks = [
    { id: 1, task: 'Database Optimization', scheduled: '2024-01-16 02:00', duration: '2 hours', status: 'scheduled' },
    { id: 2, task: 'Security Audit', scheduled: '2024-01-17 01:00', duration: '4 hours', status: 'scheduled' },
    { id: 3, task: 'Backup Verification', scheduled: '2024-01-15 23:00', duration: '1 hour', status: 'completed' },
    { id: 4, task: 'Log Rotation', scheduled: '2024-01-15 00:00', duration: '30 minutes', status: 'completed' }
  ];

  const handlePluginAction = (pluginId: number, action: string) => {
    logActivity('plugin_action', { plugin_id: pluginId, action });
  };

  const handleAPITest = (apiId: number) => {
    logActivity('api_test', { api_id: apiId });
  };

  const handleMaintenanceTask = (taskId: number) => {
    logActivity('maintenance_task', { task_id: taskId });
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="System Administration"
        description="Plugin management, API configurations, and system maintenance"
        icon={Settings}
        iconColor="text-blue-600"
        searchPlaceholder="Search plugins, APIs, tasks..."
        onSearch={(query) => {
          console.log('Searching system admin:', query);
        }}
        onRefresh={() => {
          logActivity('system_admin_refresh', { timestamp: new Date() });
        }}
      />

      {/* System Administration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Plugins"
          value="24/30"
          icon={Package}
          description="Plugins currently running"
          badge={{ text: "Healthy", variant: "default" }}
        />
        <StatCard
          title="API Integrations"
          value="12"
          icon={Key}
          trend={{ value: 2, isPositive: true, period: "this month" }}
          description="External services connected"
        />
        <StatCard
          title="System Load"
          value="45%"
          icon={Server}
          description="Current system utilization"
          badge={{ text: "Normal", variant: "secondary" }}
        />
        <StatCard
          title="Uptime"
          value="99.9%"
          icon={CheckCircle}
          trend={{ value: 0.1, isPositive: true, period: "this month" }}
          description="System availability"
        />
      </div>

      {/* System Administration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plugins">Plugin Registry</TabsTrigger>
          <TabsTrigger value="apis">API Management</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="plugins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Plugin Registry & Management
              </CardTitle>
              <CardDescription>
                Install, configure, and manage platform plugins and extensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pluginRegistry.map((plugin) => (
                  <div key={plugin.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        plugin.status === 'active' ? 'bg-green-100' :
                        plugin.status === 'disabled' ? 'bg-gray-100' : 'bg-yellow-100'
                      }`}>
                        <Package className={`h-6 w-6 ${
                          plugin.status === 'active' ? 'text-green-600' :
                          plugin.status === 'disabled' ? 'text-gray-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{plugin.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>v{plugin.version}</span>
                          <span>{plugin.downloads.toLocaleString()} downloads</span>
                          <span>★ {plugin.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          plugin.status === 'active' ? 'default' :
                          plugin.status === 'disabled' ? 'secondary' : 'outline'
                        }
                      >
                        {plugin.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant={plugin.status === 'active' ? 'outline' : 'default'}
                        onClick={() => handlePluginAction(plugin.id, plugin.status === 'active' ? 'disable' : 'enable')}
                      >
                        {plugin.status === 'active' ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration & Management
              </CardTitle>
              <CardDescription>
                Configure and test external API integrations and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiConfigurations.map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        api.status === 'configured' ? 'bg-green-100' :
                        api.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Key className={`h-6 w-6 ${
                          api.status === 'configured' ? 'text-green-600' :
                          api.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{api.service}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{api.endpoint}</span>
                          <span>Rate limit: {api.rate_limit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          api.status === 'configured' ? 'default' :
                          api.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {api.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAPITest(api.id)}
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Performance Monitoring
              </CardTitle>
              <CardDescription>
                Monitor system performance metrics and resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        metric.status === 'good' ? 'bg-green-100' :
                        metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Server className={`h-6 w-6 ${
                          metric.status === 'good' ? 'text-green-600' :
                          metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{metric.metric}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Current: {metric.current}</span>
                          <span>Average: {metric.average}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          metric.status === 'good' ? 'default' :
                          metric.status === 'warning' ? 'secondary' : 'destructive'
                        }
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Maintenance & Tasks
              </CardTitle>
              <CardDescription>
                Schedule and monitor system maintenance tasks and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        task.status === 'completed' ? 'bg-green-100' :
                        task.status === 'scheduled' ? 'bg-blue-100' : 'bg-yellow-100'
                      }`}>
                        <FileText className={`h-6 w-6 ${
                          task.status === 'completed' ? 'text-green-600' :
                          task.status === 'scheduled' ? 'text-blue-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{task.task}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Scheduled: {task.scheduled}</span>
                          <span>Duration: {task.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'scheduled' ? 'secondary' : 'outline'
                        }
                      >
                        {task.status}
                      </Badge>
                      {task.status === 'scheduled' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMaintenanceTask(task.id)}
                        >
                          Reschedule
                        </Button>
                      )}
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