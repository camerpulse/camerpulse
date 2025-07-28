import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NotificationFeed } from '@/components/Notifications/NotificationFeed';
import { NotificationStatusTracker } from '@/components/Notifications/NotificationStatusTracker';
import { InteractiveNotificationManager } from '@/components/Notifications/InteractiveNotificationManager';
import { PushNotificationManager } from '@/components/Mobile/PushNotificationManager';
import { PWAInstallPrompt } from '@/components/Mobile/PWAInstallPrompt';
import { MobileNotificationFeed } from '@/components/Mobile/MobileNotificationFeed';
import { AdvancedNotificationCenter } from '@/components/Notifications/AdvancedNotificationCenter';
import { AnalyticsCenter } from '@/components/Analytics/AnalyticsCenter';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Activity, Bell } from 'lucide-react';

const NotificationDashboard: React.FC = () => {
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Real-time Notification Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your notifications, track delivery status, and configure preferences in real-time
            </p>
          </div>

          {/* PWA Install Prompt */}
          <div className="mb-6">
            <PWAInstallPrompt />
          </div>

          <div className="space-y-6">
            {/* Main Analytics Dashboard */}
            <AnalyticsCenter />
            
            {/* Advanced Features Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Feed & Mobile */}
              <div className="xl:col-span-1 space-y-6">
                <NotificationFeed />
                <MobileNotificationFeed />
              </div>

              {/* Right Column - Advanced Management */}
              <div className="xl:col-span-2 space-y-6">
                <AdvancedNotificationCenter />
                <NotificationStatusTracker />
                <PushNotificationManager />
                <InteractiveNotificationManager />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationDashboard;