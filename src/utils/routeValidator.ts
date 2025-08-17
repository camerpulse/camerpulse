/**
 * Route validation and health checking utilities
 */

import { ROUTES } from '@/config/routes';

export interface RouteHealth {
  path: string;
  isValid: boolean;
  statusCode?: number;
  errors?: string[];
  lastChecked: Date;
}

/**
 * Validates if a route path is correctly formatted
 */
export function validateRoutePath(path: string): boolean {
  // Basic path validation
  if (!path || typeof path !== 'string') return false;
  
  // Must start with /
  if (!path.startsWith('/')) return false;
  
  // Cannot end with / unless it's root
  if (path.length > 1 && path.endsWith('/')) return false;
  
  // Cannot contain double slashes
  if (path.includes('//')) return false;
  
  // Cannot contain invalid characters
  const invalidChars = /[<>:"|?*\s]/;
  if (invalidChars.test(path)) return false;
  
  return true;
}

/**
 * Extracts all route paths from the routes configuration
 */
export function getAllRoutePaths(): string[] {
  const paths: string[] = [];
  
  function extractPaths(obj: any, prefix = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.startsWith('/')) {
        paths.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractPaths(value, `${prefix}${key}.`);
      }
    }
  }
  
  extractPaths(ROUTES);
  return [...new Set(paths)]; // Remove duplicates
}

/**
 * Checks if a route exists in the application
 */
export function routeExists(path: string): boolean {
  const allPaths = getAllRoutePaths();
  return allPaths.includes(path);
}

/**
 * Validates route parameters
 */
export function validateRouteParams(path: string, params: Record<string, string>): {
  isValid: boolean;
  missingParams: string[];
  invalidParams: string[];
} {
  const paramPattern = /:([a-zA-Z][a-zA-Z0-9]*)/g;
  const requiredParams: string[] = [];
  let match;
  
  while ((match = paramPattern.exec(path)) !== null) {
    requiredParams.push(match[1]);
  }
  
  const providedParams = Object.keys(params);
  const missingParams = requiredParams.filter(param => !providedParams.includes(param));
  const invalidParams = providedParams.filter(param => !requiredParams.includes(param));
  
  return {
    isValid: missingParams.length === 0,
    missingParams,
    invalidParams
  };
}

/**
 * Checks for duplicate routes
 */
export function findDuplicateRoutes(): string[] {
  const allPaths = getAllRoutePaths();
  const duplicates: string[] = [];
  const seen = new Set<string>();
  
  for (const path of allPaths) {
    if (seen.has(path)) {
      duplicates.push(path);
    } else {
      seen.add(path);
    }
  }
  
  return duplicates;
}

/**
 * Validates slug format for SEO compliance
 */
export function validateSlugFormat(slug: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!slug) {
    errors.push('Slug cannot be empty');
    return { isValid: false, errors };
  }
  
  // Must be lowercase
  if (slug !== slug.toLowerCase()) {
    errors.push('Slug must be lowercase');
  }
  
  // Only alphanumeric and hyphens
  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
  }
  
  // Cannot start or end with hyphen
  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Slug cannot start or end with a hyphen');
  }
  
  // Cannot have consecutive hyphens
  if (slug.includes('--')) {
    errors.push('Slug cannot contain consecutive hyphens');
  }
  
  // Length restrictions
  if (slug.length > 100) {
    errors.push('Slug cannot be longer than 100 characters');
  }
  
  if (slug.length < 3) {
    errors.push('Slug must be at least 3 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Route health checker class
 */
export class RouteHealthChecker {
  private healthCache = new Map<string, RouteHealth>();
  private checkInterval = 5 * 60 * 1000; // 5 minutes
  
  constructor() {
    // Start periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);
  }
  
  async checkRoute(path: string): Promise<RouteHealth> {
    const startTime = Date.now();
    const health: RouteHealth = {
      path,
      isValid: true,
      lastChecked: new Date(),
      errors: []
    };
    
    try {
      // Validate path format
      if (!validateRoutePath(path)) {
        health.isValid = false;
        health.errors?.push('Invalid route path format');
      }
      
      // Check if route exists in configuration
      if (!routeExists(path)) {
        health.isValid = false;
        health.errors?.push('Route not found in configuration');
      }
      
      // In a real application, you might also:
      // - Check if the component exists
      // - Validate route permissions
      // - Check database dependencies
      
    } catch (error) {
      health.isValid = false;
      health.errors?.push(`Health check failed: ${error}`);
    }
    
    this.healthCache.set(path, health);
    return health;
  }
  
  async performHealthCheck(): Promise<Map<string, RouteHealth>> {
    const allPaths = getAllRoutePaths();
    const checks = allPaths.map(path => this.checkRoute(path));
    
    await Promise.all(checks);
    return this.healthCache;
  }
  
  getHealthStatus(path: string): RouteHealth | null {
    return this.healthCache.get(path) || null;
  }
  
  getAllHealthStatuses(): RouteHealth[] {
    return Array.from(this.healthCache.values());
  }
  
  getUnhealthyRoutes(): RouteHealth[] {
    return this.getAllHealthStatuses().filter(health => !health.isValid);
  }
}

// Global health checker instance
export const routeHealthChecker = new RouteHealthChecker();