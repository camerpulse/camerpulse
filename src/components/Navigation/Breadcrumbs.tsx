import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { createBreadcrumbs } from '@/utils/slug';

interface BreadcrumbsProps {
  customItems?: Array<{ label: string; href: string }>;
  showHome?: boolean;
  className?: string;
}

/**
 * Intelligent breadcrumb navigation component
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  customItems,
  showHome = true,
  className = '',
}) => {
  const location = useLocation();
  
  const breadcrumbItems = customItems || createBreadcrumbs(location.pathname);
  
  // Don't show breadcrumbs on homepage
  if (location.pathname === '/' || breadcrumbItems.length <= 1) {
    return null;
  }

  const enhancedItems = showHome 
    ? breadcrumbItems 
    : breadcrumbItems.slice(1); // Remove home if showHome is false

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`py-3 px-4 bg-muted/20 border-b border-border/40 ${className}`}
    >
      <ol className="flex items-center space-x-2 text-sm">
        {enhancedItems.map((item, index) => {
          const isLast = index === enhancedItems.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
              )}
              
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {index === 0 && showHome ? (
                    <div className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

/**
 * Hook to generate breadcrumbs for specific entity types
 */
export const useBreadcrumbs = (entityType?: string, entityName?: string) => {
  const location = useLocation();
  
  const generateEntityBreadcrumbs = (): Array<{ label: string; href: string }> => {
    const base = [{ label: 'Home', href: '/' }];
    
    switch (entityType) {
      case 'politician':
        return [
          ...base,
          { label: 'Politicians', href: '/politicians' },
          { label: entityName || 'Profile', href: location.pathname }
        ];
      
      case 'senator':
        return [
          ...base,
          { label: 'Senators', href: '/senators' },
          { label: entityName || 'Profile', href: location.pathname }
        ];
      
      case 'village':
        return [
          ...base,
          { label: 'Villages', href: '/villages' },
          { label: entityName || 'Village', href: location.pathname }
        ];
      
      case 'petition':
        return [
          ...base,
          { label: 'Petitions', href: '/petitions' },
          { label: entityName || 'Petition', href: location.pathname }
        ];
      
      default:
        return createBreadcrumbs(location.pathname);
    }
  };

  return generateEntityBreadcrumbs();
};