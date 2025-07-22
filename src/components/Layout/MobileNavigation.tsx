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
  MapPin,
  Shield,
  BookOpen,
  Globe,
  FileText
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
  },
  {
    id: 'feed',
    label: 'Feed',
    icon: Activity,
    path: '/feed'
  },
  {
    id: 'pulse',
    label: 'Pulse',
    icon: Radio,
    path: '/pulse',
    badge: 3,
  },
  {
    id: 'politicians',
    label: 'Politics',
    icon: Users,
    path: '/politicians',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    path: '/calendar',
  },
  {
    id: 'education',
    label: 'Civics',
    icon: BookOpen,
    path: '/civic-education',
  },
  {
    id: 'polls',
    label: 'Polls',
    icon: Vote,
    path: '/polls',
  },
  {
    id: 'civic-shield',
    label: 'Shield',
    icon: Shield,
    path: '/civic-shield',
  },
  {
    id: 'tenders',
    label: 'Tenders',
    icon: FileText,
    path: '/tenders',
  },
  {
    id: 'diaspora',
    label: 'Diaspora',
    icon: Globe,
    path: '/diaspora-connect',
  },
  {
    id: 'marketplace',
    label: 'Shop',
    icon: ShoppingBag,
    path: '/marketplace',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/social',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    path: '/admin/core',
  },
];

export const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/50 pb-safe-bottom md:hidden">
        <nav className="flex items-center justify-around px-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[48px] min-h-[48px] touch-manipulation",
                  active 
                    ? "bg-primary/10 text-primary scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    active && "scale-110"
                  )} />
                  
                  {/* Badge for notifications */}
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 w-4 h-4 p-0 text-[10px] bg-destructive text-white border-0 flex items-center justify-center"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                
                <span className={cn(
                  "text-[9px] font-medium mt-1 transition-all duration-200 leading-tight",
                  active ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {active && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Spacer for mobile navigation */}
      <div className="h-16 md:hidden" />
    </>
  );
};