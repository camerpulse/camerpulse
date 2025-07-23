import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenderCreationForm } from '@/components/Tender/TenderCreationForm';
import { TenderDiscovery } from '@/components/Tender/TenderDiscovery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TenderManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discovery');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tender Management</h1>
        <p className="text-muted-foreground">
          Manage tender opportunities, create new tenders, and submit bids
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discovery">Browse Tenders</TabsTrigger>
          <TabsTrigger value="create">Create Tender</TabsTrigger>
        </TabsList>

        <TabsContent value="discovery" className="space-y-6">
          <TenderDiscovery limit={20} showCreateButton={false} />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <TenderCreationForm 
            onSuccess={() => setActiveTab('discovery')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenderManagementPage;