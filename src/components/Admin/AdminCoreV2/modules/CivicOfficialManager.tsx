import React from 'react';
import { CivicOfficialsAdminUI } from '@/components/AI/CivicOfficialsAdminUI';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { UserCheck } from 'lucide-react';

interface CivicOfficialManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const CivicOfficialManager: React.FC<CivicOfficialManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Civic Officials Management"
        description="Complete management and control of all civic officials and political parties"
        icon={UserCheck}
        iconColor="text-cm-red"
        searchPlaceholder="Search officials, parties, sync logs..."
        onSearch={(query) => {
          console.log('Searching civic officials:', query);
        }}
        onRefresh={() => {
          logActivity('civic_officials_refresh', { timestamp: new Date() });
        }}
      />
      
      <CivicOfficialsAdminUI />
    </div>
  );
};