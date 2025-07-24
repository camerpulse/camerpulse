import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<any>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if no items provided
  const getBreadcrumbsFromPath = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/', icon: Home }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Map path segments to readable labels
      const label = getSegmentLabel(segment, pathSegments, index);
      
      if (index === pathSegments.length - 1) {
        // Last item - no link
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, path: currentPath });
      }
    });

    return breadcrumbs;
  };

  const getSegmentLabel = (segment: string, allSegments: string[], index: number): string => {
    // Special cases for dynamic routes
    
    // Common path mappings
    const pathMappings: Record<string, string> = {
      
      'create': 'Create New',
      'analytics': 'Analytics',
      'dashboard': 'Dashboard',
      'my-bids': 'My Bids',
      'search': 'Search',
      'auth': 'Authentication',
      'verification': 'Verification',
      'admin': 'Administration',
      'government': 'Government',
      'diaspora-connect': 'Diaspora Connect',
      'hospitals': 'Hospitals',
      'legislation': 'Legislation'
    };

    return pathMappings[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const breadcrumbItems = items || getBreadcrumbsFromPath();
  
  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for home page only
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/60" />
          )}
          
          {item.path ? (
            <Link 
              to={item.path} 
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-1 text-foreground font-medium">
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

// Predefined breadcrumb configurations for common pages
export const CommonBreadcrumbs = {
  
  myBids: (): BreadcrumbItem[] => [
    { label: 'Home', path: '/', icon: Home },
    { label: 'My Bids' }
  ],
  
  analytics: (): BreadcrumbItem[] => [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Analytics' }
  ],
  
  search: (): BreadcrumbItem[] => [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Advanced Search' }
  ]
};