import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

interface PermissionGuardProps {
  permission?: string;
  role?: 'admin' | 'moderator' | 'user';
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  role,
  requireAll = false,
  children,
  fallback
}) => {
  const { hasPermission, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  let hasAccess = true;

  // Check role-based access
  if (role) {
    const roleHierarchy = { admin: 3, moderator: 2, user: 1 };
    const userLevel = hasRole('admin') ? 3 : hasRole('moderator') ? 2 : hasRole('user') ? 1 : 0;
    const requiredLevel = roleHierarchy[role];
    
    hasAccess = userLevel >= requiredLevel;
  }

  // Check permission-based access
  if (permission && hasAccess) {
    hasAccess = hasPermission(permission);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have the required permissions to access this content.
          </p>
          {permission && (
            <p className="text-sm text-muted-foreground mt-2">
              Required permission: <code className="bg-muted px-1 rounded">{permission}</code>
            </p>
          )}
          {role && (
            <p className="text-sm text-muted-foreground mt-1">
              Required role: <code className="bg-muted px-1 rounded">{role}</code>
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback }) => (
  <PermissionGuard role="admin" fallback={fallback}>
    {children}
  </PermissionGuard>
);

interface ModeratorOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ModeratorOnly: React.FC<ModeratorOnlyProps> = ({ children, fallback }) => (
  <PermissionGuard role="moderator" fallback={fallback}>
    {children}
  </PermissionGuard>
);