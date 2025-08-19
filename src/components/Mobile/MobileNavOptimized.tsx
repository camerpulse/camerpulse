import React, { memo, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  MessageSquare, 
  User, 
  Vote,
  Building2,
  MapPin,
  Briefcase
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
    color: 'text-cm-red'
  },
  {
    id: 'politicians',
    label: 'Leaders',
    icon: Users,
    path: '/politicians',
    color: 'text-blue-600'
  },
  {
    id: 'civic',
    label: 'Civic',
    icon: Vote,
    path: '/civic',
    badge: 3,
    color: 'text-green-600'
  },
  {
    id: 'villages',
    label: 'Villages',
    icon: MapPin,
    path: '/villages',
    color: 'text-purple-600'
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    path: '/jobs',
    badge: 12,
    color: 'text-orange-600'
  },
  {
    id: 'companies',
    label: 'Business',
    icon: Building2,
    path: '/companies',
    color: 'text-indigo-600'
  },
  {
    id: 'messenger',
    label: 'Chat',
    icon: MessageSquare,
    path: '/messenger',
    badge: 5,
    color: 'text-emerald-600'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    color: 'text-gray-600'
  }
];

interface NavButtonProps {
  item: NavItem & { isActive: boolean };
  onClick: (path: string) => void;
}

const NavButton = memo<NavButtonProps>(({ item, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(item.path);
  }, [onClick, item.path]);

  return (
    <button
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200
        ${item.isActive 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        }
      `}
      aria-label={item.label}
    >
      {/* Active indicator */}
      {item.isActive && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
      )}
      
      <div className="relative">
        <item.icon className={`h-5 w-5 ${item.isActive ? 'text-primary' : item.color}`} />
        {item.badge && item.badge > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center bg-red-500 text-white"
          >
            {item.badge > 99 ? '99+' : item.badge}
          </Badge>
        )}
      </div>
      
      <span className={`text-xs mt-1 font-medium ${item.isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        {item.label}
      </span>
    </button>
  );
});

NavButton.displayName = 'NavButton';

export const MobileNavOptimized = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = useCallback((path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const handleNavigate = useCallback((path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  }, [navigate, location.pathname]);

  const navigationItems = useMemo(() => 
    NAV_ITEMS.map(item => ({
      ...item,
      isActive: isActive(item.path)
    })), 
    [isActive]
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
      <div className="grid grid-cols-4 gap-1 p-2 max-w-md mx-auto">
        {navigationItems.slice(0, 4).map((item) => (
          <NavButton
            key={item.id}
            item={item}
            onClick={handleNavigate}
          />
        ))}
      </div>
      
      {/* Secondary navigation row for additional items */}
      <div className="grid grid-cols-4 gap-1 px-2 pb-2 max-w-md mx-auto">
        {navigationItems.slice(4).map((item) => (
          <NavButton
            key={item.id}
            item={item}
            onClick={handleNavigate}
          />
        ))}
      </div>
    </nav>
  );
});

MobileNavOptimized.displayName = 'MobileNavOptimized';