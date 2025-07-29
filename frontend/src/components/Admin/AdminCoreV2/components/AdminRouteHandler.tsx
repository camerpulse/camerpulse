import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminCoreV2 } from '../AdminCoreV2';

/**
 * Admin Route Handler Component
 * 
 * This component handles all admin routing and redirects legacy admin routes
 * to the new unified AdminCoreV2 interface.
 */
export const AdminRouteHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    
    // Map of legacy routes to new module IDs
    const routeMapping: Record<string, string> = {
      '/admin/moderation': 'moderation',
      '/admin/marketplace': 'marketplace-admin', 
      '/admin/data-import': 'data-import',
      '/admin/village': 'village-admin',
      '/admin/logistics': 'logistics-admin'
    };

    // Check if this is a legacy route that needs redirecting
    const moduleId = routeMapping[path];
    if (moduleId) {
      // Redirect to unified admin with module parameter
      const newUrl = `/admin/core?module=${moduleId}&migrated=true`;
      navigate(newUrl, { replace: true });
      return;
    }

    // Handle direct admin core access
    if (path === '/admin/core') {
      // If no module specified, check for legacy redirect
      const fromLegacy = searchParams.get('migrated');
      if (fromLegacy && !searchParams.get('module')) {
        // Set to welcome screen for migrated users
        const welcomeUrl = `/admin/core?module=welcome&from=legacy`;
        navigate(welcomeUrl, { replace: true });
      }
    }
  }, [location, navigate]);

  return <AdminCoreV2 />;
};