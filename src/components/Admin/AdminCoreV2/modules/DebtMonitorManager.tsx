import React from 'react';
import { NationalDebtIntelligenceCore } from '@/components/AI/NationalDebtIntelligenceCore';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { TrendingUp } from 'lucide-react';

interface DebtMonitorManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const DebtMonitorManager: React.FC<DebtMonitorManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="National Debt Monitor"
        description="AI-powered debt monitoring, prediction, and civic impact analysis"
        icon={TrendingUp}
        iconColor="text-red-600"
        badge={{
          text: "AI Intelligence",
          variant: "destructive"
        }}
        searchPlaceholder="Search debt records, alerts, predictions..."
        onSearch={(query) => {
          console.log('Searching debt data:', query);
        }}
        onRefresh={() => {
          logActivity('debt_monitor_refresh', { timestamp: new Date() });
        }}
      />
      
      <NationalDebtIntelligenceCore />
    </div>
  );
};