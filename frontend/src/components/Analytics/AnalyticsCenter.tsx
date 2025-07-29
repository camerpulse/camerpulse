import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ReportsManager } from './ReportsManager';
import { DataExport } from './DataExport';
import { PerformanceMonitor } from './PerformanceMonitor';
import { BarChart3, FileText, Download, Activity } from 'lucide-react';

export const AnalyticsCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics Center</h2>
        <p className="text-muted-foreground">
          Monitor performance, generate reports, and export data insights
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <AnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="reports">
          <ReportsManager />
        </TabsContent>
        
        <TabsContent value="export">
          <DataExport />
        </TabsContent>
        
        <TabsContent value="performance">
          <PerformanceMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};