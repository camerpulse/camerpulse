import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationTemplateManager } from './NotificationTemplateManager';
import { ScheduledNotificationManager } from './ScheduledNotificationManager';
import { Bell, Calendar, Settings } from 'lucide-react';

export const AdvancedNotificationCenter: React.FC = () => {
  return (
    <Tabs defaultValue="templates" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="templates" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Templates & Sending
        </TabsTrigger>
        <TabsTrigger value="scheduled" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Scheduled
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="templates">
        <NotificationTemplateManager />
      </TabsContent>
      
      <TabsContent value="scheduled">
        <ScheduledNotificationManager />
      </TabsContent>
    </Tabs>
  );
};