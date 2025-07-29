import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Database, Cpu, Monitor, HardDrive, Wifi, 
  Shield, AlertTriangle, CheckCircle, Activity
} from 'lucide-react';

interface InfrastructureManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const InfrastructureManagementModule: React.FC<InfrastructureManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('system');

  // Mock data - will be replaced with real monitoring data
  const systemMetrics = [
    { id: 1, component: 'Database', status: 'healthy', cpu: 45, memory: 67, uptime: '99.9%' },
    { id: 2, component: 'Edge Functions', status: 'healthy', cpu: 23, memory: 34, uptime: '99.8%' },
    { id: 3, component: 'Storage', status: 'warning', cpu: 78, memory: 89, uptime: '99.5%' },
    { id: 4, component: 'API Gateway', status: 'healthy', cpu: 34, memory: 45, uptime: '99.9%' }
  ];

  const performanceMetrics = [
    { id: 1, metric: 'Average Response Time', value: '245ms', status: 'good', threshold: '500ms' },
    { id: 2, metric: 'Database Connections', value: '127/200', status: 'good', threshold: '180' },
    { id: 3, metric: 'Memory Usage', value: '67%', status: 'warning', threshold: '80%' },
    { id: 4, metric: 'Disk Space', value: '45%', status: 'good', threshold: '85%' }
  ];

  const backupSystems = [
    { id: 1, name: 'Database Backup', last_backup: '2024-01-15 02:00', status: 'completed', size: '2.4GB' },
    { id: 2, name: 'User Files Backup', last_backup: '2024-01-15 03:00', status: 'completed', size: '890MB' },
    { id: 3, name: 'Configuration Backup', last_backup: '2024-01-15 01:00', status: 'completed', size: '45MB' },
    { id: 4, name: 'System Logs Backup', last_backup: '2024-01-15 01:30', status: 'failed', size: 'N/A' }
  ];

  const integrationServices = [
    { id: 1, name: 'OpenAI API', status: 'connected', last_sync: '2024-01-15 10:30', response_time: '890ms' },
    { id: 2, name: 'Email Service', status: 'connected', last_sync: '2024-01-15 10:25', response_time: '245ms' },
    { id: 3, name: 'SMS Gateway', status: 'disconnected', last_sync: '2024-01-14 18:45', response_time: 'N/A' },
    { id: 4, name: 'Payment Gateway', status: 'connected', last_sync: '2024-01-15 10:15', response_time: '567ms' }
  ];

  const handleRestartService = (serviceId: number) => {
    logActivity('service_restarted', { service_id: serviceId });
  };

  const handleRunBackup = (backupId: number) => {
    logActivity('backup_initiated', { backup_id: backupId });
  };

  const handleTestIntegration = (integrationId: number) => {
    logActivity('integration_tested', { integration_id: integrationId });
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Infrastructure & System Management"
        description="Monitor and manage platform infrastructure, performance, and integrations"
        icon={Settings}
        iconColor="text-gray-600"
        searchPlaceholder="Search services, metrics, logs..."
        onSearch={(query) => {
          console.log('Searching infrastructure:', query);
        }}
        onRefresh={() => {
          logActivity('infrastructure_refresh', { timestamp: new Date() });
        }}
      />

      {/* Infrastructure Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="System Health"
          value="98.7%"
          icon={CheckCircle}
          trend={{ value: 0.2, isPositive: true, period: "this week" }}
          description="Overall system uptime"
        />
        <StatCard
          title="Active Services"
          value="47/50"
          icon={Activity}
          description="Services running normally"
          badge={{ text: "Healthy", variant: "default" }}
        />
        <StatCard
          title="CPU Usage"
          value="45%"
          icon={Cpu}
          description="Average across all nodes"
          badge={{ text: "Normal", variant: "secondary" }}
        />
        <StatCard
          title="Storage Used"
          value="2.8TB"
          icon={HardDrive}
          trend={{ value: 12.4, isPositive: true, period: "this month" }}
          description="Of 10TB total capacity"
        />
      </div>

      {/* Infrastructure Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Component Health
              </CardTitle>
              <CardDescription>
                Monitor the health and status of all system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        metric.status === 'healthy' ? 'bg-green-100' :
                        metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Database className={`h-6 w-6 ${
                          metric.status === 'healthy' ? 'text-green-600' :
                          metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{metric.component}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>CPU: {metric.cpu}%</span>
                          <span>Memory: {metric.memory}%</span>
                          <span>Uptime: {metric.uptime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          metric.status === 'healthy' ? 'default' :
                          metric.status === 'warning' ? 'secondary' : 'destructive'
                        }
                      >
                        {metric.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRestartService(metric.id)}
                      >
                        Restart
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
                <Activity className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Monitor system performance and resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        metric.status === 'good' ? 'bg-green-100' :
                        metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Activity className={`h-6 w-6 ${
                          metric.status === 'good' ? 'text-green-600' :
                          metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{metric.metric}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Current: {metric.value}</span>
                          <span>Threshold: {metric.threshold}</span>
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

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Backup & Recovery Systems
              </CardTitle>
              <CardDescription>
                Manage automated backups and recovery procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupSystems.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        backup.status === 'completed' ? 'bg-green-100' :
                        backup.status === 'running' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        <HardDrive className={`h-6 w-6 ${
                          backup.status === 'completed' ? 'text-green-600' :
                          backup.status === 'running' ? 'text-blue-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{backup.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Last backup: {backup.last_backup}</span>
                          <span>Size: {backup.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          backup.status === 'completed' ? 'default' :
                          backup.status === 'running' ? 'secondary' : 'destructive'
                        }
                      >
                        {backup.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => handleRunBackup(backup.id)}
                      >
                        Run Backup
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                External Integrations
              </CardTitle>
              <CardDescription>
                Monitor and test connections to external services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        service.status === 'connected' ? 'bg-green-100' :
                        service.status === 'disconnected' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <Wifi className={`h-6 w-6 ${
                          service.status === 'connected' ? 'text-green-600' :
                          service.status === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Last sync: {service.last_sync}</span>
                          <span>Response: {service.response_time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          service.status === 'connected' ? 'default' :
                          service.status === 'disconnected' ? 'destructive' : 'secondary'
                        }
                      >
                        {service.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTestIntegration(service.id)}
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
      </Tabs>
    </div>
  );
};