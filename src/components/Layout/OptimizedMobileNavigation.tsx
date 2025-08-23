import React, { useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Radio, 
  Users, 
  ShoppingBag, 
  Bell,
  User,
  Settings,
  Vote,
  Activity,
  Calendar,
  BookOpen,
  Shield,
  Globe
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

// Memoized navigation items configuration
const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'feed', label: 'Feed', icon: Activity, path: '/feed' },
  { id: 'pulse', label: 'Pulse', icon: Radio, path: '/pulse', badge: 3 },
  { id: 'politicians', label: 'Politics', icon: Users, path: '/politicians' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
  { id: 'education', label: 'Civics', icon: BookOpen, path: '/civic-education' },
  { id: 'polls', label: 'Polls', icon: Vote, path: '/polls' },
  { id: 'civic-shield', label: 'Shield', icon: Shield, path: '/civic-shield' },
  { id: 'diaspora', label: 'Diaspora', icon: Globe, path: '/diaspora-connect' },
  
  { id: 'profile', label: 'Profile', icon: User, path: '/social' },
  { id: 'admin', label: 'Admin', icon: Settings, path: '/admin/core' },
] as const;

/**
 * Optimized Mobile Navigation Component
 * 
 * Performance improvements:
 * - Memoized navigation items and handlers
 * - Optimized active state calculation
 * - Reduced component re-renders
 * - Better touch interactions
 */
export const OptimizedMobileNavigation: React.FC = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();

  // Memoized active state checker
  const isActive = useCallback((path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Memoized navigation handler
  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // Memoized navigation items with active states
  const navigationItems = useMemo(() => 
    NAV_ITEMS.map(item => ({
      ...item,
      isActive: isActive(item.path)
    })), [isActive]
  );

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/50 pb-safe-bottom md:hidden">
        <nav className="flex items-center justify-around px-1 py-1">
          {navigationItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              onClick={() => handleNavigate(item.path)}
            />
          ))}
        </nav>
      </div>

      {/* Spacer for mobile navigation */}
      <div className="h-16 md:hidden" />
    </>
  );
});

OptimizedMobileNavigation.displayName = 'OptimizedMobileNavigation';

// Memoized navigation button component
const NavButton: React.FC<{
  item: NavItem & { isActive: boolean };
  onClick: () => void;
}> = React.memo(({ item, onClick }) => {
  const { icon: Icon, label, badge, isActive } = item;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[48px] min-h-[48px] touch-manipulation",
        isActive 
          ? "bg-primary/10 text-primary scale-105" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <div className="relative">
        <Icon className={cn(
          "w-5 h-5 transition-all duration-200",
          isActive && "scale-110"
        )} />
        
        {/* Badge for notifications */}
        {badge && badge > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 w-4 h-4 p-0 text-[10px] bg-destructive text-white border-0 flex items-center justify-center"
          >
            {badge > 9 ? '9+' : badge}
          </Badge>
        )}
      </div>
      
      <span className={cn(
        "text-[9px] font-medium mt-1 transition-all duration-200 leading-tight",
        isActive ? "text-primary font-semibold" : "text-muted-foreground"
      )}>
        {label}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );
});

NavButton.displayName = 'NavButton';