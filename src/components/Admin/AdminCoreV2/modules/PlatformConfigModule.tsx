import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { LocalizationSettings } from '@/components/Admin/LocalizationSettings';
import { AdminModeratorDashboard } from '@/components/moderators/AdminModeratorDashboard';
import { AdminConfigPanel } from '@/components/CivicPortal/AdminConfigPanel';
import { PollModerationTab } from '@/components/Admin/PollModerationTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Globe, Vote } from 'lucide-react';

interface PlatformConfigModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const PlatformConfigModule: React.FC<PlatformConfigModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('localization');

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Platform Configuration"
        description="Configure platform settings, localization, and specialized admin tools"
        icon={Settings}
        iconColor="text-blue-600"
        badge={{
          text: "Platform Settings",
          variant: "outline"
        }}
        onRefresh={() => {
          logActivity('platform_config_refresh', { timestamp: new Date() });
        }}
      />

      {/* Configuration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Languages"
          value="5"
          icon={Globe}
          description="Supported languages"
        />
        <StatCard
          title="Active Moderators"
          value="12"
          icon={Users}
          badge={{ text: "Online", variant: "default" }}
        />
        <StatCard
          title="Poll Reviews"
          value="89"
          icon={Vote}
          description="Pending moderation"
        />
        <StatCard
          title="Config Updates"
          value="24"
          icon={Settings}
          description="This month"
        />
      </div>

      {/* Platform Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="localization">Localization</TabsTrigger>
          <TabsTrigger value="moderators">Moderator Admin</TabsTrigger>
          <TabsTrigger value="civic">Civic Portal Config</TabsTrigger>
          <TabsTrigger value="polls">Poll Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="localization" className="space-y-4">
          <LocalizationSettings />
        </TabsContent>

        <TabsContent value="moderators" className="space-y-4">
          <AdminModeratorDashboard />
        </TabsContent>

        <TabsContent value="civic" className="space-y-4">
          <AdminConfigPanel />
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          <PollModerationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};