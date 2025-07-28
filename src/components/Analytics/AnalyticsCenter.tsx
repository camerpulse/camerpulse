import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationAnalyticsDashboard } from './NotificationAnalyticsDashboard';
import { RealtimeAnalytics } from './RealtimeAnalytics';
import { BarChart3, Activity, TrendingUp } from 'lucide-react';

export const AnalyticsCenter: React.FC = () => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="realtime" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Real-time
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Insights
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <NotificationAnalyticsDashboard />
      </TabsContent>
      
      <TabsContent value="realtime">
        <RealtimeAnalytics />
      </TabsContent>
      
      <TabsContent value="insights" className="space-y-6">
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">AI Insights Coming Soon</h3>
          <p className="text-muted-foreground">
            Advanced AI-powered insights and recommendations will be available here.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};