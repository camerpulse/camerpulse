import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { PoliticalImportDashboard } from '@/components/Politics/PoliticalImportDashboard';
import { BulkImportButton } from '@/components/AI/BulkImportButton';
import { PoliticaAIDashboard } from '@/components/AI/PoliticaAIDashboard';
import PartyDirectorySync from '@/components/AI/PartyDirectorySync';
import MinisterDirectorySync from '@/components/AI/MinisterDirectorySync';
import SenateDirectorySync from '@/components/AI/SenateDirectorySync';
import { MPDirectorySync } from '@/components/AI/MPDirectorySync';
import { PartyAffiliationResolver } from '@/components/AI/PartyAffiliationResolver';
import TermOfOfficeValidator from '@/components/AI/TermOfOfficeValidator';
import GovWebsiteScraper from '@/components/AI/GovWebsiteScraper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Building2, Calendar, Globe, Bot } from 'lucide-react';

interface PoliticalManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const PoliticalManagementModule: React.FC<PoliticalManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('politicians');

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Political Management & AI Tools"
        description="Comprehensive political data management, AI-powered import tools, and verification systems"
        icon={UserCheck}
        iconColor="text-cm-red"
        badge={{
          text: "AI Enhanced",
          variant: "default"
        }}
        onRefresh={() => {
          logActivity('political_management_refresh', { timestamp: new Date() });
        }}
      />

      {/* Political Management Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Politicians"
          value="300+"
          icon={UserCheck}
          description="Verified political figures"
          badge={{ text: "14 Claimed", variant: "secondary" }}
        />
        <StatCard
          title="Political Parties"
          value="19"
          icon={Building2}
          description="vs 330 in MINAT database"
          badge={{ text: "Incomplete", variant: "destructive" }}
        />
        <StatCard
          title="AI Import Status"
          value="Active"
          icon={Bot}
          trend={{ value: 98, isPositive: true, period: "accuracy rate" }}
          badge={{ text: "Running", variant: "default" }}
        />
        <StatCard
          title="Term Validations"
          value="156"
          icon={Calendar}
          description="Verified terms of office"
        />
      </div>

      {/* Political Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="politicians">Politicians</TabsTrigger>
          <TabsTrigger value="ministers">Ministers</TabsTrigger>
          <TabsTrigger value="senators">Senators</TabsTrigger>
          <TabsTrigger value="mps">MPs</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
          <TabsTrigger value="affiliations">Affiliations</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="politicians" className="space-y-4">
          <PoliticalImportDashboard />
        </TabsContent>

        <TabsContent value="ministers" className="space-y-4">
          <MinisterDirectorySync />
        </TabsContent>

        <TabsContent value="senators" className="space-y-4">
          <SenateDirectorySync />
        </TabsContent>

        <TabsContent value="mps" className="space-y-4">
          <MPDirectorySync />
        </TabsContent>

        <TabsContent value="parties" className="space-y-4">
          <PartyDirectorySync />
        </TabsContent>

        <TabsContent value="affiliations" className="space-y-4">
          <PartyAffiliationResolver />
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-4">
          <div className="grid gap-6">
            <PoliticaAIDashboard />
            <TermOfOfficeValidator />
            <GovWebsiteScraper />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};