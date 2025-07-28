import React from 'react';
import { LogisticsAdminPortal } from '@/pages/logistics/LogisticsAdminPortal';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Truck } from 'lucide-react';

interface LogisticsAdminModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const LogisticsAdminModule: React.FC<LogisticsAdminModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Logistics Administration"
        description="Manage logistics operations, shipments, and delivery companies"
        icon={Truck}
        iconColor="text-purple-600"
        searchPlaceholder="Search shipments, companies, tracking..."
        onSearch={(query) => {
          console.log('Searching logistics:', query);
        }}
        onRefresh={() => {
          logActivity('logistics_admin_refresh', { timestamp: new Date() });
        }}
      />
      
      <LogisticsAdminPortal />
    </div>
  );
};