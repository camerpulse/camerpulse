import React from 'react';
import { PluginManagerDashboard } from '@/components/Admin/PluginManager/PluginManagerDashboard';
import { NaturalLanguagePluginBuilder } from '@/components/Admin/NaturalLanguagePluginBuilder';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plug, Bot, Settings, Code } from 'lucide-react';

interface PluginManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const PluginManagementModule: React.FC<PluginManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Plugin Management System"
        description="Manage, create, and monitor all CamerPulse plugins and extensions"
        icon={Plug}
        iconColor="text-purple-600"
        searchPlaceholder="Search plugins, builders, monitoring..."
        onSearch={(query) => {
          console.log('Searching plugins:', query);
        }}
        onRefresh={() => {
          logActivity('plugin_management_refresh', { timestamp: new Date() });
        }}
      />
      
      <Tabs defaultValue="registry" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registry" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Plugin Registry & Control
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Plugin Builder
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Development Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registry">
          <PluginManagerDashboard />
        </TabsContent>

        <TabsContent value="builder">
          <NaturalLanguagePluginBuilder />
        </TabsContent>

        <TabsContent value="development">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Plugin Sandbox</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Test plugins in isolated environment
                </p>
                <button className="text-sm text-primary hover:underline">
                  Open Sandbox →
                </button>
              </div>
              
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Plugin Templates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start with pre-built plugin templates
                </p>
                <button className="text-sm text-primary hover:underline">
                  Browse Templates →
                </button>
              </div>
              
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Plugin Analytics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Monitor plugin performance and usage
                </p>
                <button className="text-sm text-primary hover:underline">
                  View Analytics →
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};