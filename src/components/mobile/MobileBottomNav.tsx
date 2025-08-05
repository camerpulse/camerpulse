import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Vote,
  Users,
  MapPin,
  BookOpen,
  Bell
} from 'lucide-react';

const navItems = [
  {
    title: 'Home',
    url: '/',
    icon: Home
  },
  {
    title: 'Politicians',
    url: '/politicians',
    icon: Users
  },
  {
    title: 'Parties',
    url: '/political-parties',
    icon: Vote
  },
  {
    title: 'Villages',
    url: '/villages',
    icon: MapPin
  },
  {
    title: 'Learn',
    url: '/civic-education',
    icon: BookOpen
  }
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} to={item.url} className="flex-1">
              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 h-12 w-full ${
                  isActive(item.url) 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs truncate">{item.title}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}