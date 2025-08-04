import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User,
  Globe,
  Vote,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useLanguage } from '@/contexts/LanguageContext';

const civicPageInfo = {
  '/': {
    title: 'nav.dashboard',
    description: 'dashboard.description'
  },
  '/villages': {
    title: 'nav.villages',
    description: 'Connect with your ancestral village'
  },
  '/petitions': {
    title: 'nav.petitions',
    description: 'Create and support community petitions'
  },
  '/civic-education': {
    title: 'nav.education',
    description: 'Learn about your rights and duties'
  },
  '/transparency': {
    title: 'nav.transparency',
    description: 'Government accountability and data'
  },
  '/feed': {
    title: 'nav.feed',
    description: 'Civic discussions and updates'
  },
  '/services': {
    title: 'Public Services',
    description: 'Find hospitals, schools, and services'
  },
  '/settings': {
    title: 'nav.settings',
    description: 'Manage your account and preferences'
  }
};

export function CivicAppHeader() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [notifications] = useState([
    {
      id: '1',
      type: 'petition',
      message: 'New petition in your region: "Clean Water Initiative"',
      time: '30 min ago',
      unread: true
    },
    {
      id: '2',
      type: 'village',
      message: 'Your village page has 5 new members',
      time: '2 hours ago',
      unread: true
    },
    {
      id: '3',
      type: 'education',
      message: 'Weekly civic quiz is now available',
      time: '1 day ago',
      unread: false
    }
  ]);

  const currentPage = civicPageInfo[location.pathname as keyof typeof civicPageInfo] || {
    title: 'CamerPulse',
    description: 'Civic engagement platform'
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="flex h-16 items-center border-b bg-background px-6">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger />
        
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-semibold text-lg">{t(currentPage.title)}</h1>
            <p className="text-sm text-muted-foreground">{currentPage.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Search */}
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || 'User'} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.user_metadata?.full_name || 'Civic User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}