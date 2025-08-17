import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User, Settings } from 'lucide-react';
import { ROUTES } from '@/config/routes';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
  requiredRoles?: string[];
  requireAdmin?: boolean;
  fallbackMessage?: string;
  showLoginPrompt?: boolean;
}

/**
 * Enhanced Route Guard with better UX
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredAuth = true,
  requiredRoles = [],
  requireAdmin = false,
  fallbackMessage,
  showLoginPrompt = true,
}) => {
  const { user, loading, hasRole, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requiredAuth && !user) {
    if (showLoginPrompt) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                <p className="text-muted-foreground mb-6">
                  {fallbackMessage || "Please sign in to access this page."}
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <a href={`${ROUTES.AUTH}?redirect=${encodeURIComponent(location.pathname)}`}>
                      Sign In
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <a href="/">
                      Return Home
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return <Navigate to={ROUTES.AUTH} state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !(isAdmin && isAdmin())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-6">
                You need administrator privileges to access this page.
              </p>
              <div className="space-y-3">
                <Button variant="outline" asChild className="w-full">
                  <a href="/civic-dashboard">
                    Go to Dashboard
                  </a>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <a href="/">
                    Return Home
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole && hasRole(role));
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-warning" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Insufficient Permissions</h2>
                <p className="text-muted-foreground mb-6">
                  You need one of the following roles: {requiredRoles.join(', ')}
                </p>
                <div className="space-y-3">
                  <Button variant="outline" asChild className="w-full">
                    <a href="/civic-dashboard">
                      Go to Dashboard
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <a href="/">
                      Return Home
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};