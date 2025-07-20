import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePluginAccess, useRouteGuard } from '@/hooks/usePluginSystem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Lock } from 'lucide-react';

interface PluginGuardProps {
  pluginName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permission?: string;
  redirectTo?: string;
  showFallback?: boolean;
}

export const PluginGuard: React.FC<PluginGuardProps> = ({
  pluginName,
  children,
  fallback,
  permission = 'can_access',
  redirectTo = '/',
  showFallback = true
}) => {
  const { data: hasAccess, isLoading } = usePluginAccess(pluginName, permission);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    
    if (!showFallback) return null;

    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            This feature is currently disabled or you don't have permission to access it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

// Route guard component for protecting entire routes
export const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isRouteAllowed } = useRouteGuard();

  if (!isRouteAllowed(location.pathname)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This page is not available because the required plugin is disabled.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

// Higher-order component for plugin protection
export const withPluginGuard = (
  Component: React.ComponentType<any>,
  pluginName: string,
  permission = 'can_access'
) => {
  return (props: any) => (
    <PluginGuard pluginName={pluginName} permission={permission}>
      <Component {...props} />
    </PluginGuard>
  );
};