import React from 'react';
import { PluginGuard } from '@/hooks/usePluginSystem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PluginWrapperProps {
  pluginName: string;
  children: React.ReactNode;
  showAdminLink?: boolean;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

/**
 * Universal plugin wrapper that wraps any feature/component
 * and automatically handles plugin status checking
 */
export const PluginWrapper: React.FC<PluginWrapperProps> = ({
  pluginName,
  children,
  showAdminLink = false,
  fallbackTitle = "Feature Disabled",
  fallbackDescription = "This feature is currently disabled or you don't have permission to access it."
}) => {
  const navigate = useNavigate();

  const DisabledFallback = () => (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <h4 className="font-medium mb-1">{fallbackTitle}</h4>
            <p className="text-sm">{fallbackDescription}</p>
            {pluginName && (
              <p className="text-xs mt-2 opacity-75">Plugin: {pluginName}</p>
            )}
          </div>
          {showAdminLink && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/plugins')}
              className="ml-4"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Plugins
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <PluginGuard
      pluginName={pluginName}
      fallback={<DisabledFallback />}
    >
      {children}
    </PluginGuard>
  );
};

/**
 * Higher-order component that wraps pages with plugin protection
 */
export const withPluginWrapper = (
  Component: React.ComponentType<any>,
  pluginName: string,
  options?: {
    showAdminLink?: boolean;
    fallbackTitle?: string;
    fallbackDescription?: string;
  }
) => {
  return (props: any) => (
    <PluginWrapper
      pluginName={pluginName}
      showAdminLink={options?.showAdminLink}
      fallbackTitle={options?.fallbackTitle}
      fallbackDescription={options?.fallbackDescription}
    >
      <Component {...props} />
    </PluginWrapper>
  );
};

/**
 * Plugin-aware route component
 */
export const PluginRoute: React.FC<{
  pluginName: string;
  children: React.ReactNode;
  adminAccess?: boolean;
}> = ({ pluginName, children, adminAccess = false }) => {
  return (
    <PluginWrapper
      pluginName={pluginName}
      showAdminLink={adminAccess}
      fallbackTitle="Page Not Available"
      fallbackDescription="This page requires a disabled plugin to function."
    >
      {children}
    </PluginWrapper>
  );
};