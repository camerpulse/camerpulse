import React from 'react';
import VillageReputationAdmin from '@/pages/admin/VillageReputationAdmin';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { MapPin } from 'lucide-react';

interface VillageAdminModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const VillageAdminModule: React.FC<VillageAdminModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Village & Community Management"
        description="Manage village reputation systems and community features"
        icon={MapPin}
        iconColor="text-green-600"
        searchPlaceholder="Search villages, reports, rankings..."
        onSearch={(query) => {
          console.log('Searching villages:', query);
        }}
        onRefresh={() => {
          logActivity('village_admin_refresh', { timestamp: new Date() });
        }}
      />
      
      <VillageReputationAdmin />
    </div>
  );
};