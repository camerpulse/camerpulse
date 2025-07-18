/**
 * MobileBottomNav Component
 * 
 * Fixed bottom navigation for mobile CamerPulse Feed
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Vote, 
  MessageCircle, 
  Users, 
  Plus,
  Bell,
  Search,
  UserCircle
} from 'lucide-react';

interface NavItem {
  key: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  color?: string;
}

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadMessages?: number;
  unreadNotifications?: number;
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { key: 'home', icon: Home, label: 'Home' },
  { key: 'polls', icon: Vote, label: 'Polls', color: 'text-cm-yellow' },
  { key: 'create', icon: Plus, label: 'Create', color: 'text-cm-red' },
  { key: 'messages', icon: MessageCircle, label: 'Messages', color: 'text-cm-green' },
  { key: 'profile', icon: UserCircle, label: 'Profile' }
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadMessages = 0,
  unreadNotifications = 0,
  className = ''
}) => {
  const navItems = defaultNavItems.map(item => ({
    ...item,
    badge: item.key === 'messages' ? unreadMessages : 
           item.key === 'notifications' ? unreadNotifications : 
           undefined
  }));

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50 lg:hidden ${className}`}>
      <div className="safe-bottom">
        <div className="flex justify-around items-center py-2 px-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const IconComponent = item.icon;
            
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200 min-w-[60px] relative ${
                  isActive 
                    ? 'text-cm-red bg-cm-red/10' 
                    : item.color || 'text-muted-foreground'
                } hover:bg-muted/50`}
              >
                <div className="relative">
                  <IconComponent 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`} 
                  />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-cm-red text-white border-0 flex items-center justify-center min-w-[16px]"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span 
                  className={`text-xs mt-0.5 transition-all duration-200 ${
                    isActive ? 'font-medium' : 'font-normal'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cm-red rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Alternative compact version for different layouts
export const MobileBottomNavCompact: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadMessages = 0,
  className = ''
}) => {
  const compactItems = [
    { key: 'home', icon: Home },
    { key: 'search', icon: Search },
    { key: 'create', icon: Plus },
    { key: 'notifications', icon: Bell },
    { key: 'profile', icon: UserCircle }
  ];

  return (
    <div className={`fixed bottom-4 left-4 right-4 bg-background/90 backdrop-blur border border-border rounded-full shadow-lg z-50 lg:hidden ${className}`}>
      <div className="flex justify-around items-center py-3 px-2">
        {compactItems.map((item, index) => {
          const isActive = activeTab === item.key;
          const IconComponent = item.icon;
          const isCenter = index === Math.floor(compactItems.length / 2);
          
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`relative p-2 rounded-full transition-all duration-200 ${
                isCenter 
                  ? 'bg-cm-red text-white shadow-lg scale-110' 
                  : isActive
                    ? 'bg-cm-red/10 text-cm-red'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              {item.key === 'notifications' && unreadMessages > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cm-yellow rounded-full border border-background" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};