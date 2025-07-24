import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { EnhancedMessenger } from '@/components/Messenger/EnhancedMessenger';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const MessengerPage: React.FC = () => {
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pulse Messenger
            </h1>
            <p className="text-muted-foreground">
              Secure, encrypted messaging for civic engagement and community building
            </p>
          </div>

          <EnhancedMessenger className="mx-auto" />
        </div>
      </div>
    </AppLayout>
  );
};

export default MessengerPage;