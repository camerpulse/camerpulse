import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditSubmissionForm, AdminAuditTools, AuditDetailView } from '@/components/audit-registry';

export default function AuditRegistryDemo() {
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'registry' | 'detail'>('registry');

  const handleViewAudit = (auditId: string) => {
    setSelectedAuditId(auditId);
    setCurrentView('detail');
  };

  const handleBackToRegistry = () => {
    setSelectedAuditId(null);
    setCurrentView('registry');
  };

  if (currentView === 'detail' && selectedAuditId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <AuditDetailView 
            auditId={selectedAuditId} 
            onBack={handleBackToRegistry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Public Audits & Data Leaks Registry</h1>
            <p className="text-xl text-muted-foreground">
              Centralized system for accountability disclosures and transparency
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Browse Audits</TabsTrigger>
              <TabsTrigger value="submit">Submit Document</TabsTrigger>
              <TabsTrigger value="admin">Admin Panel</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              {/* Use the existing AuditRegistryPage content but modify to handle audit viewing */}
              <div>Browse audit functionality will be integrated here</div>
            </TabsContent>

            <TabsContent value="submit">
              <AuditSubmissionForm />
            </TabsContent>

            <TabsContent value="admin">
              <AdminAuditTools />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}