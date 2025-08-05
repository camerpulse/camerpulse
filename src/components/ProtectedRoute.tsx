import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requiredRoles = [],
  fallbackPath = '/auth'
}) => {
  const { user, loading, hasRole, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return <UnauthorizedAccess requiredLevel="admin" />;
  }

  // Check specific role requirements
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return <UnauthorizedAccess requiredLevel={requiredRoles.join(' or ')} />;
    }
  }

  return <>{children}</>;
};

interface UnauthorizedAccessProps {
  requiredLevel: string;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({ requiredLevel }) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            You need {requiredLevel} access to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This area requires special permissions. Please contact an administrator if you believe you should have access.
          </p>
          
          <div className="flex gap-2">
            <Button onClick={handleLogin} className="flex-1">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Higher-order component for protecting components
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Hook for checking route permissions
export const useRoutePermissions = () => {
  const { user, hasRole, isAdmin, loading } = useAuth();

  const canAccess = (requirements: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    requiredRoles?: string[];
  }) => {
    const { requireAuth = false, requireAdmin = false, requiredRoles = [] } = requirements;

    if (loading) return null; // Still checking
    
    if (requireAuth && !user) return false;
    if (requireAdmin && !isAdmin()) return false;
    if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) return false;
    
    return true;
  };

  return { canAccess, loading };
};