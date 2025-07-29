import React from 'react';
import { ModerationDashboard } from '@/components/moderation/ModerationDashboard';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Shield } from 'lucide-react';

interface ModerationModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const ModerationModule: React.FC<ModerationModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Content Moderation"
        description="Monitor and moderate platform content and user activities"
        icon={Shield}
        iconColor="text-orange-600"
        searchPlaceholder="Search reports, users, content..."
        onSearch={(query) => {
          // Handle search functionality
          console.log('Searching moderation:', query);
        }}
        onRefresh={() => {
          logActivity('moderation_refresh', { timestamp: new Date() });
        }}
      />
      
      <ModerationDashboard />
    </div>
  );
};