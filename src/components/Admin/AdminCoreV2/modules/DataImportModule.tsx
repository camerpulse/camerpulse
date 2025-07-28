import React from 'react';
import { DataImportDashboard } from '@/components/Admin/DataImportDashboard';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Upload } from 'lucide-react';

interface DataImportModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const DataImportModule: React.FC<DataImportModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Data Import & Management"
        description="Import and manage data for the Legislative Directory system"
        icon={Upload}
        iconColor="text-blue-600"
        badge={{
          text: "Legislative Directory",
          variant: "secondary"
        }}
        searchPlaceholder="Search import records, logs..."
        onSearch={(query) => {
          console.log('Searching imports:', query);
        }}
        onRefresh={() => {
          logActivity('data_import_refresh', { timestamp: new Date() });
        }}
      />
      
      <DataImportDashboard />
    </div>
  );
};