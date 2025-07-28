import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NotificationSettings } from '@/components/Notifications/NotificationSettings';
import { IntegrationCenter } from '@/components/Integrations/IntegrationCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Settings, Plug } from 'lucide-react';

const NotificationSettingsPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Notification Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your notification preferences and integrations
            </p>
          </div>

          <Tabs defaultValue="preferences" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Plug className="h-4 w-4" />
                Integrations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preferences">
              <NotificationSettings />
            </TabsContent>
            
        <TabsContent value="integrations">
          <IntegrationCenter />
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsCenter />
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationSettingsPage;