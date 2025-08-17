/**
 * User role management system following Supabase best practices
 */

export type AppRole = 'admin' | 'moderator' | 'user' | 'vendor' | 'verified_user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface RolePermissions {
  role: AppRole;
  permissions: string[];
  description: string;
  inherits?: AppRole[];
}

/**
 * Role hierarchy and permissions configuration
 */
export const ROLE_PERMISSIONS: Record<AppRole, RolePermissions> = {
  admin: {
    role: 'admin',
    permissions: [
      'admin:all',
      'moderate:all',
      'manage:users',
      'manage:content',
      'manage:system',
      'view:analytics',
      'manage:roles',
      'access:admin_panel'
    ],
    description: 'Full system access'
  },
  moderator: {
    role: 'moderator',
    permissions: [
      'moderate:content',
      'moderate:users',
      'view:reports',
      'manage:flagged_content',
      'access:moderation_tools'
    ],
    description: 'Content and user moderation'
  },
  verified_user: {
    role: 'verified_user',
    permissions: [
      'create:content',
      'edit:own_content',
      'delete:own_content',
      'comment:all',
      'vote:all',
      'create:petitions',
      'access:verified_features'
    ],
    description: 'Verified community member',
    inherits: ['user']
  },
  vendor: {
    role: 'vendor',
    permissions: [
      'create:products',
      'manage:own_products',
      'view:marketplace_analytics',
      'respond:reviews',
      'access:vendor_dashboard'
    ],
    description: 'Marketplace vendor',
    inherits: ['verified_user']
  },
  user: {
    role: 'user',
    permissions: [
      'view:public_content',
      'create:basic_content',
      'edit:own_profile',
      'vote:polls',
      'sign:petitions'
    ],
    description: 'Basic user access'
  }
};

/**
 * Role management utilities
 */
export class RoleManager {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userRoles: AppRole[], permission: string): boolean {
    for (const role of userRoles) {
      const roleConfig = ROLE_PERMISSIONS[role];
      if (!roleConfig) continue;

      // Check direct permissions
      if (roleConfig.permissions.includes(permission)) {
        return true;
      }

      // Check admin wildcard
      if (roleConfig.permissions.includes('admin:all')) {
        return true;
      }

      // Check inherited permissions
      if (roleConfig.inherits) {
        for (const inheritedRole of roleConfig.inherits) {
          if (this.hasPermission([inheritedRole], permission)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if a user has a specific role
   */
  static hasRole(userRoles: AppRole[], requiredRole: AppRole): boolean {
    return userRoles.includes(requiredRole);
  }

  /**
   * Check if a user has any of the specified roles
   */
  static hasAnyRole(userRoles: AppRole[], requiredRoles: AppRole[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
  }

  /**
   * Check if a user is an admin
   */
  static isAdmin(userRoles: AppRole[]): boolean {
    return userRoles.includes('admin');
  }

  /**
   * Check if a user is a moderator or admin
   */
  static canModerate(userRoles: AppRole[]): boolean {
    return userRoles.includes('admin') || userRoles.includes('moderator');
  }

  /**
   * Get all permissions for a user's roles
   */
  static getAllPermissions(userRoles: AppRole[]): string[] {
    const permissions = new Set<string>();

    for (const role of userRoles) {
      const roleConfig = ROLE_PERMISSIONS[role];
      if (!roleConfig) continue;

      // Add direct permissions
      roleConfig.permissions.forEach(p => permissions.add(p));

      // Add inherited permissions
      if (roleConfig.inherits) {
        const inheritedPermissions = this.getAllPermissions(roleConfig.inherits);
        inheritedPermissions.forEach(p => permissions.add(p));
      }
    }

    return Array.from(permissions);
  }

  /**
   * Check if a role can be assigned by another role
   */
  static canAssignRole(assignerRoles: AppRole[], targetRole: AppRole): boolean {
    // Only admins can assign admin role
    if (targetRole === 'admin') {
      return this.isAdmin(assignerRoles);
    }

    // Admins can assign any role
    if (this.isAdmin(assignerRoles)) {
      return true;
    }

    // Moderators can assign basic user roles
    if (this.hasRole(assignerRoles, 'moderator')) {
      return ['user', 'verified_user'].includes(targetRole);
    }

    return false;
  }

  /**
   * Validate role assignment
   */
  static validateRoleAssignment(
    assignerRoles: AppRole[],
    targetUserId: string,
    targetRole: AppRole,
    assignerUserId: string
  ): { valid: boolean; error?: string } {
    // Check if assigner can assign this role
    if (!this.canAssignRole(assignerRoles, targetRole)) {
      return {
        valid: false,
        error: `Insufficient permissions to assign role: ${targetRole}`
      };
    }

    // Prevent self-assignment of admin role (security measure)
    if (targetRole === 'admin' && assignerUserId === targetUserId) {
      return {
        valid: false,
        error: 'Cannot self-assign admin role'
      };
    }

    return { valid: true };
  }
}

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
  ADMIN: {
    ALL: 'admin:all',
    MANAGE_USERS: 'manage:users',
    MANAGE_CONTENT: 'manage:content',
    MANAGE_SYSTEM: 'manage:system',
    MANAGE_ROLES: 'manage:roles',
    ACCESS_ADMIN_PANEL: 'access:admin_panel'
  },
  MODERATION: {
    ALL: 'moderate:all',
    CONTENT: 'moderate:content',
    USERS: 'moderate:users',
    VIEW_REPORTS: 'view:reports',
    MANAGE_FLAGGED: 'manage:flagged_content',
    ACCESS_TOOLS: 'access:moderation_tools'
  },
  CONTENT: {
    CREATE: 'create:content',
    EDIT_OWN: 'edit:own_content',
    DELETE_OWN: 'delete:own_content',
    CREATE_BASIC: 'create:basic_content'
  },
  MARKETPLACE: {
    CREATE_PRODUCTS: 'create:products',
    MANAGE_OWN_PRODUCTS: 'manage:own_products',
    VIEW_ANALYTICS: 'view:marketplace_analytics',
    RESPOND_REVIEWS: 'respond:reviews',
    ACCESS_VENDOR_DASHBOARD: 'access:vendor_dashboard'
  },
  CIVIC: {
    CREATE_PETITIONS: 'create:petitions',
    SIGN_PETITIONS: 'sign:petitions',
    VOTE_POLLS: 'vote:polls',
    VOTE_ALL: 'vote:all'
  },
  SOCIAL: {
    COMMENT_ALL: 'comment:all'
  },
  FEATURES: {
    ACCESS_VERIFIED: 'access:verified_features'
  }
} as const;