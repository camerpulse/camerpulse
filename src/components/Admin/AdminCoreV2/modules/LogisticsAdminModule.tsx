import React from 'react';
import { LogisticsAdminPortal } from '@/pages/logistics/LogisticsAdminPortal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Truck className="h-6 w-6 mr-2 text-purple-600" />
          Logistics Administration
        </h2>
        <p className="text-muted-foreground">Manage logistics operations, shipments, and delivery companies</p>
      </div>
      
      <LogisticsAdminPortal />
    </div>
  );
};