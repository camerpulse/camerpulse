import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRole?: string;
  requireAdmin?: boolean;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/auth',
  requiredRole,
  requireAdmin = false,
  requiredRoles,
}) => {
  const { user, loading, hasRole, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !(isAdmin && isAdmin())) {
    return <Navigate to="/" replace />;
  }

  // Check role requirements (supports single or multiple)
  const rolesToCheck = requiredRoles ?? (requiredRole ? [requiredRole] : []);
  if (rolesToCheck.length > 0) {
    const ok = rolesToCheck.some((r) => hasRole && hasRole(r));
    if (!ok) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
