import React from 'react';
import { MarketplaceAdmin } from '@/components/Admin/MarketplaceAdmin';

interface MarketplaceAdminModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const MarketplaceAdminModule: React.FC<MarketplaceAdminModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Marketplace Administration</h2>
        <p className="text-muted-foreground">Manage marketplace listings, vendors, and transactions</p>
      </div>
      
      <MarketplaceAdmin />
    </div>
  );
};