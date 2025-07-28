import React from 'react';
import { ModerationDashboard } from '@/components/moderation/ModerationDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Shield className="h-6 w-6 mr-2 text-orange-600" />
          Content Moderation
        </h2>
        <p className="text-muted-foreground">Monitor and moderate platform content and user activities</p>
      </div>
      
      <ModerationDashboard />
    </div>
  );
};