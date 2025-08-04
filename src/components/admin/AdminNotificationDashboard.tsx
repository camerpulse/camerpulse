import React from 'react';
import { NotificationAdminDashboard } from './NotificationAdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

export const AdminNotificationDashboard: React.FC = () => {
  const { user } = useAuth();

  // Check if user has admin access (this should be replaced with proper role checking)
  const hasAdminAccess = user?.email?.includes('admin') || user?.email?.includes('support');

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need administrator privileges to access this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <NotificationAdminDashboard />
    </div>
  );
};