import React from 'react';
import VillageReputationAdmin from '@/pages/admin/VillageReputationAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <MapPin className="h-6 w-6 mr-2 text-green-600" />
          Village & Community Management
        </h2>
        <p className="text-muted-foreground">Manage village reputation systems and community features</p>
      </div>
      
      <VillageReputationAdmin />
    </div>
  );
};