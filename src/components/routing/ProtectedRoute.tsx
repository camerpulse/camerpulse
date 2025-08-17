import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import { ROUTES } from '@/config/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRole?: string;
  requireAdmin?: boolean;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = ROUTES.AUTH,
  requiredRole,
  requireAdmin = false,
  requiredRoles,
  fallbackPath,
}) => {
  const { user, loading, hasRole, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !(isAdmin && isAdmin())) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    return <UnauthorizedPage requiredAccess="administrator privileges" />;
  }

  // Check role requirements (supports single or multiple)
  const rolesToCheck = requiredRoles ?? (requiredRole ? [requiredRole] : []);
  if (rolesToCheck.length > 0) {
    const hasRequiredRole = rolesToCheck.some((r) => hasRole && hasRole(r));
    if (!hasRequiredRole) {
      if (fallbackPath) {
        return <Navigate to={fallbackPath} replace />;
      }
      return <UnauthorizedPage requiredAccess={rolesToCheck.join(' or ')} />;
    }
  }

  return <>{children}</>;
};
