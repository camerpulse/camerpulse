import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export const useRoleAccess = () => {
  const { user, userRoles, loading, hasRole, isAdmin } = useAuth();

  const roleAccess = useMemo(() => ({
    // Basic access checks
    isAuthenticated: !!user,
    isLoading: loading,
    
    // Role-based access
    isUser: hasRole('user'),
    isAdmin: isAdmin(),
    isModerator: hasRole('moderator'),
    isCompany: hasRole('company'),
    isExpert: hasRole('expert'),
    isGovernment: hasRole('government'),
    
    // Combined role checks
    isAdminOrModerator: isAdmin() || hasRole('moderator'),
    isCompanyOrExpert: hasRole('company') || hasRole('expert'),
    
    // Permission helpers
    canModerate: isAdmin() || hasRole('moderator'),
    canManageUsers: isAdmin(),
    canCreateCompanyProfile: hasRole('company') || isAdmin(),
    canCreateExpertProfile: hasRole('expert') || isAdmin(),
    canAccessGovernmentFeatures: hasRole('government') || isAdmin(),
    
    // Get all user roles
    getAllRoles: () => userRoles.map(role => role.role),
    
    // Check if user has any of the specified roles
    hasAnyRole: (roles: string[]) => roles.some(role => hasRole(role)),
    
    // Check if user has all of the specified roles
    hasAllRoles: (roles: string[]) => roles.every(role => hasRole(role))
  }), [user, userRoles, loading, hasRole, isAdmin]);

  return roleAccess;
};

// Higher-order component for role-based route protection
export const withRoleAccess = (
  WrappedComponent: React.ComponentType<any>,
  requiredRoles: string[] = [],
  fallbackComponent?: React.ComponentType<any>
) => {
  return function RoleProtectedComponent(props: any) {
    const { hasAnyRole, isAuthenticated, isLoading } = useRoleAccess();
    
    if (isLoading) {
      return React.createElement('div', {
        className: 'min-h-screen flex items-center justify-center'
      }, React.createElement('div', {
        className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary'
      }));
    }
    
    if (!isAuthenticated) {
      if (fallbackComponent) {
        return React.createElement(fallbackComponent, props);
      }
      return React.createElement('div', {
        className: 'min-h-screen flex items-center justify-center'
      }, React.createElement('div', {
        className: 'text-center'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: 'text-2xl font-bold mb-2'
        }, 'Authentication Required'),
        React.createElement('p', {
          key: 'message',
          className: 'text-muted-foreground'
        }, 'Please log in to access this page.')
      ]));
    }
    
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      if (fallbackComponent) {
        return React.createElement(fallbackComponent, props);
      }
      return React.createElement('div', {
        className: 'min-h-screen flex items-center justify-center'
      }, React.createElement('div', {
        className: 'text-center'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: 'text-2xl font-bold mb-2'
        }, 'Access Denied'),
        React.createElement('p', {
          key: 'message',
          className: 'text-muted-foreground'
        }, 'You do not have permission to access this page.')
      ]));
    }
    
    return React.createElement(WrappedComponent, props);
  };
};