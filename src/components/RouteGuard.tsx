import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface RouteGuardProps {
  children: React.ReactNode;
  condition: boolean | null; // null = loading
  fallback: React.ReactNode | string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  condition,
  fallback
}) => {
  // Still loading
  if (condition === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Condition not met
  if (!condition) {
    if (typeof fallback === 'string') {
      return <Navigate to={fallback} replace />;
    }
    return <>{fallback}</>;
  }

  // Condition met - render children
  return <>{children}</>;
};

// Admin route guard
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, isAdmin } = useAuth();

  return (
    <RouteGuard
      condition={loading ? null : isAdmin()}
      fallback="/unauthorized"
    >
      {children}
    </RouteGuard>
  );
};

// Auth route guard (redirects authenticated users away from auth pages)
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  return (
    <RouteGuard
      condition={loading ? null : !user}
      fallback="/"
    >
      {children}
    </RouteGuard>
  );
};

// Role-based guard
interface RoleGuardProps {
  children: React.ReactNode;
  roles: string[];
  requireAll?: boolean; // true = user must have ALL roles, false = user must have ANY role
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  roles, 
  requireAll = false 
}) => {
  const { loading, hasRole } = useAuth();

  const hasAccess = loading ? null : requireAll 
    ? roles.every(role => hasRole(role))
    : roles.some(role => hasRole(role));

  return (
    <RouteGuard
      condition={hasAccess}
      fallback="/unauthorized"
    >
      {children}
    </RouteGuard>
  );
};