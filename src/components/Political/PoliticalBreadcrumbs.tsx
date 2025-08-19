import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface PoliticalBreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

export function PoliticalBreadcrumbs({ items, showHome = true }: PoliticalBreadcrumbsProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from URL if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Skip language prefix if present
    const startIndex = ['en', 'fr'].includes(pathSegments[0]) ? 1 : 0;
    
    for (let i = startIndex; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const path = '/' + pathSegments.slice(0, i + 1).join('/');
      
      let label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Special handling for known routes
      switch (segment) {
        case 'politicians':
          label = 'Politicians';
          break;
        case 'political-parties':
          label = 'Political Parties';
          break;
        case 'senators':
          label = 'Senators';
          break;
        case 'mps':
          label = 'Members of Parliament';
          break;
        case 'ministers':
          label = 'Ministers';
          break;
        case 'admin':
          label = 'Administration';
          break;
        case 'political-management':
          label = 'Political Management';
          break;
      }
      
      breadcrumbs.push({
        label,
        href: i === pathSegments.length - 1 ? undefined : path // Last item has no href
      });
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = items || generateBreadcrumbs();
  
  if (breadcrumbItems.length === 0 && !showHome) return null;
  
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {showHome && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.length > 0 && <BreadcrumbSeparator />}
          </>
        )}
        
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href} className="flex items-center gap-1">
                    {item.icon}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1">
                  {item.icon}
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}