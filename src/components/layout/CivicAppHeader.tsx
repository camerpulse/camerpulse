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

const civicPageInfo = {
  '/': {
    title: 'Civic Dashboard',
    description: 'Your civic engagement overview'
  },
  '/villages': {
    title: 'Village Registry',
    description: 'Connect with your ancestral village'
  },
  '/petitions': {
    title: 'Petitions',
    description: 'Create and support community petitions'
  },
  '/civic-education': {
    title: 'Civic Education',
    description: 'Learn about your rights and duties'
  },
  '/transparency': {
    title: 'Transparency Portal',
    description: 'Government accountability and data'
  },
  '/feed': {
    title: 'Community Feed',
    description: 'Civic discussions and updates'
  },
  '/services': {
    title: 'Public Services',
    description: 'Find hospitals, schools, and services'
  },
  '/settings': {
    title: 'Settings',
    description: 'Manage your account and preferences'
  }
};

export function CivicAppHeader() {
  const location = useLocation();
  const { user } = useAuth();
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
            <h1 className="font-semibold text-lg">{currentPage.title}</h1>
            <p className="text-sm text-muted-foreground">{currentPage.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className={notification.unread ? 'bg-primary/5' : ''}>
                <div className="space-y-1 w-full">
                  <div className="flex items-center gap-2">
                    {notification.type === 'petition' && <Vote className="h-4 w-4 text-blue-500" />}
                    {notification.type === 'village' && <MapPin className="h-4 w-4 text-green-500" />}
                    {notification.type === 'education' && <Globe className="h-4 w-4 text-purple-500" />}
                    <p className="text-sm font-medium">{notification.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">
              <span className="text-sm text-muted-foreground">View all notifications</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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