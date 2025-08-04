import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageSquare, 
  MapPin, 
  Vote, 
  Settings 
} from 'lucide-react';

const mobileNavItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Feed', url: '/feed', icon: MessageSquare },
  { title: 'Villages', url: '/villages', icon: MapPin },
  { title: 'Petitions', url: '/petitions', icon: Vote },
  { title: 'Settings', url: '/settings', icon: Settings }
];

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 lg:hidden">
      <div className="flex items-center justify-around p-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          
          return (
            <Button
              key={item.title}
              variant="ghost"
              className={`flex-1 flex flex-col items-center gap-1 h-14 max-w-[80px] ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
              asChild
            >
              <NavLink to={item.url} end={item.url === '/'}>
                <Icon className="h-5 w-5" />
                <span className="text-xs truncate">{item.title}</span>
              </NavLink>
            </Button>
          );
        })}
      </div>
    </div>
  );
};