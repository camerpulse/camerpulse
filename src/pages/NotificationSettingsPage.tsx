import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NotificationSettings } from '@/components/Notifications/NotificationSettings';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Notification Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your message and notification preferences
            </p>
          </div>

          <NotificationSettings />
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationSettingsPage;