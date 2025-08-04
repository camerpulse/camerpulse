import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import PanAfricaAdminPanel from '@/components/AI/PanAfricaAdminPanel';
import CivicViewControlPanel from '@/components/AI/CivicViewControlPanel';
import { CivicIntegrityMonitor } from '@/components/AI/CivicIntegrityMonitor';
import { CivicShieldAdmin } from '@/components/civic-shield/CivicShieldAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Globe, Shield, Eye } from 'lucide-react';

interface AICivicToolsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const AICivicToolsModule: React.FC<AICivicToolsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('panafrica');

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="AI Civic Tools & Monitoring"
        description="Advanced AI-powered civic engagement and monitoring systems"
        icon={Brain}
        iconColor="text-indigo-600"
        badge={{
          text: "AI Powered",
          variant: "default"
        }}
        onRefresh={() => {
          logActivity('ai_civic_tools_refresh', { timestamp: new Date() });
        }}
      />

      {/* AI Tools Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Monitors"
          value="8"
          icon={Eye}
          description="AI monitoring systems online"
          badge={{ text: "Active", variant: "default" }}
        />
        <StatCard
          title="Integrity Score"
          value="94.2%"
          icon={Shield}
          trend={{ value: 1.8, isPositive: true, period: "this week" }}
        />
        <StatCard
          title="Pan-Africa Regions"
          value="12"
          icon={Globe}
          description="Monitored regions"
        />
        <StatCard
          title="AI Alerts"
          value="23"
          icon={Brain}
          badge={{ text: "Reviewed", variant: "secondary" }}
        />
      </div>

      {/* AI Civic Tools Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="panafrica">Pan-Africa Admin</TabsTrigger>
          <TabsTrigger value="civic">Civic Control Panel</TabsTrigger>
          <TabsTrigger value="integrity">Integrity Monitor</TabsTrigger>
          <TabsTrigger value="shield">Civic Shield</TabsTrigger>
        </TabsList>

        <TabsContent value="panafrica" className="space-y-4">
          <PanAfricaAdminPanel />
        </TabsContent>

        <TabsContent value="civic" className="space-y-4">
          <CivicViewControlPanel />
        </TabsContent>

        <TabsContent value="integrity" className="space-y-4">
          <CivicIntegrityMonitor />
        </TabsContent>

        <TabsContent value="shield" className="space-y-4">
          <CivicShieldAdmin 
            userRole="admin"
            systemConfig={{}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};