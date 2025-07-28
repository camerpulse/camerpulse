import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NotificationFeed } from '@/components/Notifications/NotificationFeed';
import { NotificationStatusTracker } from '@/components/Notifications/NotificationStatusTracker';
import { InteractiveNotificationManager } from '@/components/Notifications/InteractiveNotificationManager';
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Feed */}
            <div className="xl:col-span-1">
              <NotificationFeed />
            </div>

            {/* Right Column - Status & Management */}
            <div className="xl:col-span-2 space-y-6">
              <NotificationStatusTracker />
              <InteractiveNotificationManager />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationDashboard;