import React from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { DataTableCard } from '../components/DataTableCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Package, Users, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';

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
      <AdminModuleHeader
        title="Marketplace Administration"
        description="Manage marketplace listings, vendors, and transactions"
        icon={Store}
        iconColor="text-blue-600"
        searchPlaceholder="Search listings, vendors, transactions..."
        onSearch={(query) => {
          console.log('Searching marketplace:', query);
        }}
        onRefresh={() => {
          logActivity('marketplace_admin_refresh', { timestamp: new Date() });
        }}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Listings"
          value="1,234"
          icon={Package}
          trend={{ value: 12, isPositive: true, period: "this month" }}
        />
        <StatCard
          title="Active Vendors"
          value="89"
          icon={Users}
          trend={{ value: 5, isPositive: true, period: "this week" }}
        />
        <StatCard
          title="Pending Reviews"
          value="23"
          icon={Eye}
          badge={{ text: "Action Needed", variant: "destructive" }}
        />
        <StatCard
          title="Revenue"
          value="₱45,230"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true, period: "vs last month" }}
        />
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Marketplace Activity</h3>
        
        <DataTableCard
          title="New Product Listing"
          subtitle="Electronics - Smartphone by Tech Store Cameroon"
          status={{ label: "Pending Review", variant: "secondary" }}
          metadata={[
            { icon: Users, label: "Vendor", value: "Tech Store Cameroon" },
            { icon: Package, label: "Category", value: "Electronics" },
            { icon: TrendingUp, label: "Price", value: "₱25,000" }
          ]}
          tags={["New", "Electronics"]}
          actions={[
            { label: "Review", icon: Eye, onClick: () => {} },
            { label: "Edit", icon: Edit, onClick: () => {} },
            { label: "Remove", icon: Trash2, onClick: () => {}, variant: "destructive" }
          ]}
        />

        <DataTableCard
          title="Vendor Application"
          subtitle="Local Crafts Co. requesting marketplace access"
          status={{ label: "Under Review", variant: "outline" }}
          metadata={[
            { icon: Users, label: "Business Type", value: "Local Crafts" },
            { icon: Package, label: "Products", value: "Handmade Items" }
          ]}
          tags={["Vendor Application", "Crafts"]}
          actions={[
            { label: "Approve", icon: Eye, onClick: () => {} },
            { label: "Reject", icon: Trash2, onClick: () => {}, variant: "destructive" }
          ]}
        />
      </div>

      {/* Placeholder for full marketplace admin */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Marketplace Tools</CardTitle>
          <CardDescription>Comprehensive marketplace management system coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Full marketplace administration interface is being integrated
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};