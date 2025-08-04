import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowBuilder } from './WorkflowBuilder';
import { WorkflowDashboard } from './WorkflowDashboard';
import { Settings, BarChart3, Zap } from 'lucide-react';

export const WorkflowAutomationCenter: React.FC = () => {
  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="builder" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Builder
        </TabsTrigger>
        <TabsTrigger value="automation" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Automation
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard">
        <WorkflowDashboard />
      </TabsContent>
      
      <TabsContent value="builder">
        <WorkflowBuilder />
      </TabsContent>
      
      <TabsContent value="automation" className="space-y-6">
        <div className="text-center py-12">
          <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Advanced Automation Coming Soon</h3>
          <p className="text-muted-foreground">
            AI-powered workflow optimization and intelligent routing will be available here.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};