import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntegrationSetup } from './IntegrationSetup';
import { WebhookManager } from './WebhookManager';
import { ApiKeyManager } from './ApiKeyManager';
import { IntegrationAnalytics } from './IntegrationAnalytics';
import { Plug, Webhook, Key, BarChart3 } from 'lucide-react';

export const IntegrationCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integration Center</h2>
        <p className="text-muted-foreground">
          Connect external services, manage webhooks, and monitor integration performance
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations">
          <IntegrationSetup />
        </TabsContent>
        
        <TabsContent value="webhooks">
          <WebhookManager />
        </TabsContent>
        
        <TabsContent value="api-keys">
          <ApiKeyManager />
        </TabsContent>
        
        <TabsContent value="analytics">
          <IntegrationAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};