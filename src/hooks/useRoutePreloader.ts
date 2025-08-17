import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route preloader for performance optimization
 * Preloads likely next pages based on current route
 */
export const useRoutePreloader = () => {
  const location = useLocation();

  useEffect(() => {
    const preloadRoutes = getPreloadRoutes(location.pathname);
    
    // Preload routes after a short delay to not interfere with current page load
    const timeout = setTimeout(() => {
      preloadRoutes.forEach(route => {
        preloadRoute(route);
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return null;
};

/**
 * Determines which routes to preload based on current route
 */
function getPreloadRoutes(currentPath: string): string[] {
  const routes: string[] = [];

  // Homepage - preload main sections
  if (currentPath === '/' || currentPath === '/en' || currentPath === '/fr') {
    routes.push('/civic-dashboard', '/politicians', '/villages', '/marketplace');
  }

  // Politicians list - preload common politician pages
  if (currentPath.includes('/politicians') && !currentPath.includes('/politicians/')) {
    routes.push('/senators', '/mps', '/ministers');
  }

  // Village detail - preload related villages and politicians
  if (currentPath.includes('/villages/')) {
    routes.push('/politicians', '/fons');
  }

  // Marketplace - preload product and vendor pages
  if (currentPath === '/marketplace') {
    routes.push('/marketplace/products', '/marketplace/vendors');
  }

  // Dashboard - preload feeds and contributions
  if (currentPath.includes('/civic-dashboard')) {
    routes.push('/civic-feed', '/civic-contributions', '/petitions');
  }

  return routes;
}

/**
 * Preloads a route by creating a link element
 */
function preloadRoute(route: string): void {
  // Check if already preloaded
  const existing = document.querySelector(`link[href="${route}"]`);
  if (existing) return;

  // Create prefetch link
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  
  // Add to document head
  document.head.appendChild(link);
  
  // Remove after 30 seconds to avoid memory leaks
  setTimeout(() => {
    try {
      document.head.removeChild(link);
    } catch (e) {
      // Link may have already been removed
    }
  }, 30000);
}

/**
 * Hook for manual route preloading
 */
export const useManualPreloader = () => {
  const preload = (routes: string | string[]) => {
    const routeArray = Array.isArray(routes) ? routes : [routes];
    routeArray.forEach(route => preloadRoute(route));
  };

  return { preload };
};