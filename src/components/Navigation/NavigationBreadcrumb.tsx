import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/politicians': 'Politicians',
  '/senators': 'Senators',
  '/mps': 'MPs',
  '/ministers': 'Ministers',
  '/admin': 'Admin',
  '/admin/dashboard': 'Admin Dashboard',
  '/auth': 'Authentication',
  '/feed': 'Feed',
  '/polls': 'Polls',
  '/marketplace': 'Marketplace',
  '/news': 'News',
  '/social': 'Social',
  '/security': 'Security'
};

export const NavigationBreadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const generateBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', href: '/', isLast: false }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Check if it's a dynamic route (ID parameter)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(segment);
      
      if (isUUID) {
        // For UUID segments, use a generic label
        const parentRoute = pathSegments[index - 1];
        const entityLabels: Record<string, string> = {
          'politicians': 'Profile',
          'senators': 'Senator Profile',
          'mps': 'MP Profile',
          'ministers': 'Minister Profile'
        };
        
        breadcrumbs.push({
          label: entityLabels[parentRoute] || 'Detail',
          href: currentPath,
          isLast
        });
      } else {
        // Regular route segment
        const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({
          label,
          href: currentPath,
          isLast
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.href}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
          {breadcrumb.isLast ? (
            <span className="font-medium text-foreground">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              to={breadcrumb.href}
              className={cn(
                "hover:text-foreground transition-colors",
                index === 0 && "flex items-center"
              )}
            >
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              {breadcrumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};