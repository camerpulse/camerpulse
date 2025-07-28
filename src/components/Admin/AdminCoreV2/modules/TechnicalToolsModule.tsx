import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import AshenDebugCore from '@/components/Admin/AshenDebugCore';
import CodeHealthLog from '@/components/Admin/CodeHealthLog';
import UXSimulationLog from '@/components/Admin/UXSimulationLog';
import CamerPulseActivityTimeline from '@/components/Admin/CamerPulseActivityTimeline';
import { DesignSystemDashboard } from '@/components/Admin/DesignSystemDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Bug, Palette, Activity, Monitor } from 'lucide-react';

interface TechnicalToolsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const TechnicalToolsModule: React.FC<TechnicalToolsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('debug');

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Technical Tools & Debug Center"
        description="Advanced debugging, code health monitoring, and design system management"
        icon={Code}
        iconColor="text-purple-600"
        badge={{
          text: "Developer Tools",
          variant: "outline"
        }}
        onRefresh={() => {
          logActivity('technical_tools_refresh', { timestamp: new Date() });
        }}
      />

      {/* Technical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Code Health"
          value="92%"
          icon={Code}
          trend={{ value: 3.2, isPositive: true, period: "improving" }}
          badge={{ text: "Good", variant: "default" }}
        />
        <StatCard
          title="Active Bugs"
          value="3"
          icon={Bug}
          badge={{ text: "Low Priority", variant: "secondary" }}
        />
        <StatCard
          title="UX Score"
          value="4.7/5"
          icon={Monitor}
          trend={{ value: 0.2, isPositive: true, period: "user feedback" }}
        />
        <StatCard
          title="Design Tokens"
          value="156"
          icon={Palette}
          description="Active design system tokens"
        />
      </div>

      {/* Technical Tools Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="debug">Debug Core</TabsTrigger>
          <TabsTrigger value="health">Code Health</TabsTrigger>
          <TabsTrigger value="ux">UX Simulation</TabsTrigger>
          <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
          <TabsTrigger value="design">Design System</TabsTrigger>
        </TabsList>

        <TabsContent value="debug" className="space-y-4">
          <AshenDebugCore />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <CodeHealthLog />
        </TabsContent>

        <TabsContent value="ux" className="space-y-4">
          <UXSimulationLog />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <CamerPulseActivityTimeline />
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <DesignSystemDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};