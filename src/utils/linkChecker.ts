import { ROUTES } from '@/config/routes';

/**
 * Link Checker Utility for CamerPulse
 * Validates internal links and provides debugging tools
 */

/**
 * Extract all routes from ROUTES configuration
 */
const getAllValidRoutes = (): string[] => {
  const routes: string[] = [];
  
  const extractRoutes = (obj: any, prefix = '') => {
    Object.values(obj).forEach((value) => {
      if (typeof value === 'string') {
        // Remove parameters from route patterns
        const cleanRoute = value.replace(/:\w+/g, 'ID');
        routes.push(cleanRoute);
      } else if (typeof value === 'object' && value !== null) {
        extractRoutes(value, prefix);
      }
    });
  };
  
  extractRoutes(ROUTES);
  return routes;
};

/**
 * Check if a route pattern is valid
 */
export const isValidRoute = (route: string): boolean => {
  const validRoutes = getAllValidRoutes();
  
  // Direct match
  if (validRoutes.includes(route)) {
    return true;
  }
  
  // Check against patterns (for dynamic routes)
  for (const validRoute of validRoutes) {
    if (validRoute.includes('ID')) {
      const pattern = validRoute.replace(/ID/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(route)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Validate a collection of links
 */
export const validateLinks = (links: string[]): {
  valid: string[];
  invalid: string[];
  external: string[];
} => {
  const valid: string[] = [];
  const invalid: string[] = [];
  const external: string[] = [];
  
  links.forEach(link => {
    // Skip empty or hash-only links
    if (!link || link === '#' || link === '') {
      invalid.push(link);
      return;
    }
    
    // External links
    if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:')) {
      external.push(link);
      return;
    }
    
    // Internal links
    const cleanLink = link.split('?')[0].split('#')[0]; // Remove query params and hash
    if (isValidRoute(cleanLink)) {
      valid.push(link);
    } else {
      invalid.push(link);
    }
  });
  
  return { valid, invalid, external };
};

/**
 * Extract links from React component code (basic regex-based)
 */
export const extractLinksFromCode = (code: string): string[] => {
  const links: string[] = [];
  
  // Match Link to="/path" patterns
  const linkMatches = code.match(/(?:to|href)=["']([^"']+)["']/g);
  if (linkMatches) {
    linkMatches.forEach(match => {
      const link = match.match(/["']([^"']+)["']/)?.[1];
      if (link) {
        links.push(link);
      }
    });
  }
  
  return [...new Set(links)]; // Remove duplicates
};

/**
 * Generate link validation report
 */
export const generateLinkReport = (componentCode: string[]): {
  totalLinks: number;
  validLinks: number;
  invalidLinks: number;
  externalLinks: number;
  issues: string[];
} => {
  const allLinks: string[] = [];
  
  componentCode.forEach(code => {
    allLinks.push(...extractLinksFromCode(code));
  });
  
  const { valid, invalid, external } = validateLinks(allLinks);
  
  const issues = invalid.map(link => `Invalid internal link: ${link}`);
  
  return {
    totalLinks: allLinks.length,
    validLinks: valid.length,
    invalidLinks: invalid.length,
    externalLinks: external.length,
    issues,
  };
};

/**
 * Development helper: Log all available routes
 */
export const logAllRoutes = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔗 CamerPulse Route Map');
    const validRoutes = getAllValidRoutes();
    validRoutes.sort().forEach(route => {
      console.log(`✓ ${route}`);
    });
    console.groupEnd();
  }
};