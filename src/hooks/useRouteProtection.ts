import { useAuth } from '@/contexts/AuthContext';
import { ROUTE_PROTECTION, ROUTES } from '@/config/routes';

/**
 * Hook for checking route access permissions
 */
export const useRouteProtection = () => {
  const { user, hasRole, isAdmin, loading } = useAuth();

  /**
   * Check if user can access a specific route
   */
  const canAccess = (route: string, requirements?: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    requiredRoles?: string[];
  }) => {
    if (loading) return null; // Still checking auth state

    // Check if route is explicitly public
    if (ROUTE_PROTECTION.PUBLIC.includes(route)) {
      return true;
    }

    // If no specific requirements and not public, require auth by default
    const requireAuth = requirements?.requireAuth ?? true;
    const requireAdmin = requirements?.requireAdmin ?? false;
    const requiredRoles = requirements?.requiredRoles ?? [];

    // Check authentication requirement
    if (requireAuth && !user) {
      return false;
    }

    // Check admin requirement
    if (requireAdmin && !(isAdmin && isAdmin())) {
      return false;
    }

    // Check role requirements
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole && hasRole(role));
      if (!hasRequiredRole) {
        return false;
      }
    }

    return true;
  };

  /**
   * Check if current user can access admin routes
   */
  const canAccessAdmin = () => {
    return canAccess(ROUTES.ADMIN.DASHBOARD, { requireAdmin: true });
  };

  /**
   * Get redirect path for unauthorized access
   */
  const getRedirectPath = (route: string) => {
    if (!user) {
      return ROUTES.AUTH;
    }
    
    // If user is authenticated but lacks permissions, redirect to home
    return ROUTES.HOME;
  };

  return {
    canAccess,
    canAccessAdmin,
    getRedirectPath,
    loading,
    user,
  };
};