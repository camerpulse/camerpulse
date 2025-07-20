import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditSubmissionForm, AuditDashboard, AdminAuditTools } from '@/components/audit-registry';

export default function AuditRegistryDemo() {
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
              <AuditDashboard />
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