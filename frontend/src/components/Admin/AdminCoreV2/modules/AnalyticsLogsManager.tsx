import React from 'react';
import { AnalyticsCenter } from '@/components/Analytics/AnalyticsCenter';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Database } from 'lucide-react';

interface AnalyticsLogsManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const AnalyticsLogsManager: React.FC<AnalyticsLogsManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Analytics & Logs Management"
        description="System analytics, logs, monitoring and performance tracking"
        icon={Database}
        iconColor="text-gray-600"
        badge={{
          text: "System Intelligence",
          variant: "outline"
        }}
        searchPlaceholder="Search analytics, logs, events..."
        onSearch={(query) => {
          console.log('Searching analytics:', query);
        }}
        onRefresh={() => {
          logActivity('analytics_refresh', { timestamp: new Date() });
        }}
      />
      
      <AnalyticsCenter />
    </div>
  );
};