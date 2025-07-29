import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { DataTableCard } from '../components/DataTableCard';
import { APIConfigurationManager } from '@/components/Admin/APIConfigurationManager';
import { CacheManagementDashboard } from '@/components/Admin/CacheManagementDashboard';
import { CacheStatusMonitor } from '@/components/Admin/CacheStatusMonitor';
import { SystemHealthCheck } from '@/components/Admin/SystemHealthCheck';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Server, Activity, Key } from 'lucide-react';

interface SystemManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const SystemManagementModule: React.FC<SystemManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('health');

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="System Management"
        description="Monitor system health, manage APIs, and configure platform settings"
        icon={Settings}
        iconColor="text-gray-600"
        badge={{
          text: "Critical System Tools",
          variant: "secondary"
        }}
        onRefresh={() => {
          logActivity('system_management_refresh', { timestamp: new Date() });
        }}
      />

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="System Health"
          value="98.5%"
          icon={Activity}
          trend={{ value: 0.2, isPositive: true, period: "vs last hour" }}
          badge={{ text: "Healthy", variant: "default" }}
        />
        <StatCard
          title="API Endpoints"
          value="12"
          icon={Key}
          description="Active API configurations"
        />
        <StatCard
          title="Cache Hit Rate"
          value="94.2%"
          icon={Server}
          trend={{ value: 2.1, isPositive: true, period: "vs yesterday" }}
        />
        <StatCard
          title="Server Load"
          value="23%"
          icon={Server}
          badge={{ text: "Normal", variant: "outline" }}
        />
      </div>

      {/* System Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="apis">API Configuration</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="monitoring">Cache Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <SystemHealthCheck />
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <APIConfigurationManager />
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <CacheManagementDashboard />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <CacheStatusMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};