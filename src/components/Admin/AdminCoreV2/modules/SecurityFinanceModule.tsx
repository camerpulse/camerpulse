import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { CivicAlertBot } from '@/components/AI/CivicAlertBot';
import { DailyReportGenerator } from '@/components/AI/DailyReportGenerator';
import { CivicAlertSystem } from '@/components/Security/CivicAlertSystem';
import { RoleControlSystem } from '@/components/Security/RoleControlSystem';
import { CreditorBreakdown } from '@/components/AI/CreditorBreakdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Bot, DollarSign, Activity, AlertTriangle } from 'lucide-react';

interface SecurityFinanceModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const SecurityFinanceModule: React.FC<SecurityFinanceModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('security');

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Security & Financial Management"
        description="Advanced security controls, financial monitoring, and automated alert systems"
        icon={Shield}
        iconColor="text-red-600"
        badge={{
          text: "Critical Systems",
          variant: "destructive"
        }}
        onRefresh={() => {
          logActivity('security_finance_refresh', { timestamp: new Date() });
        }}
      />

      {/* Security & Finance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Security Alerts"
          value="3"
          icon={AlertTriangle}
          badge={{ text: "Active", variant: "destructive" }}
          description="Requiring immediate attention"
        />
        <StatCard
          title="Total Revenue"
          value="2.4M FCFA"
          icon={DollarSign}
          trend={{ value: 15.2, isPositive: true, period: "this month" }}
        />
        <StatCard
          title="Pending Claims"
          value="12"
          icon={Activity}
          description="Financial claims processing"
        />
        <StatCard
          title="AI Bots Active"
          value="5"
          icon={Bot}
          badge={{ text: "Monitoring", variant: "default" }}
        />
      </div>

      {/* Security & Finance Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="security">Security Center</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="alerts">Alert Systems</TabsTrigger>
          <TabsTrigger value="finance">Finance Monitoring</TabsTrigger>
          <TabsTrigger value="reports">Automated Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <CivicAlertSystem />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RoleControlSystem />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <CivicAlertBot />
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <CreditorBreakdown />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <DailyReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};