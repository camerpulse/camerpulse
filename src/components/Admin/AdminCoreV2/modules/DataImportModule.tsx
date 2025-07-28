import React from 'react';
import { DataImportDashboard } from '@/components/Admin/DataImportDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Upload className="h-6 w-6 mr-2 text-blue-600" />
          Data Import & Management
        </h2>
        <p className="text-muted-foreground">Import and manage data for the Legislative Directory system</p>
      </div>
      
      <DataImportDashboard />
    </div>
  );
};