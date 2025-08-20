import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export default function FeedTest() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Show loading state while auth is initializing
  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading authentication...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">Feed Test - Basic Auth Check</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="space-y-2">
                <p><strong>User:</strong> {user ? `${user.email} (ID: ${user.id})` : 'Not logged in'}</p>
                <p><strong>Auth Status:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              </div>
              
              <div className="mt-4 space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/')}
                >
                  Go to Home
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/auth')}
                >
                  Go to Login
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-semibold mb-2">Feed Test Page</h2>
              <p className="text-muted-foreground">
                This is a simplified test page to verify authentication is working.
                Once this loads successfully, we can add back the feed functionality.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}