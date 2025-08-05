import React from 'react';
import { Link } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Globe,
  Command,
  MessageSquare,
  Zap
} from 'lucide-react';

export function ModernHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center gap-6">
          <SidebarTrigger className="lg:hidden" />
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div className="hidden md:block">
              <span className="font-bold text-lg bg-gradient-patriotic bg-clip-text text-transparent">
                CamerPulse
              </span>
              <div className="text-xs text-muted-foreground -mt-1">
                Civic Engagement
              </div>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden lg:flex relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search petitions, villages, officials..."
              className="pl-10 bg-muted/50 border-0 focus:bg-background"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary" className="text-xs">
                <Command className="h-3 w-3 mr-1" />
                K
              </Badge>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Mobile search */}
          <EnhancedButton variant="ghost" size="icon" className="lg:hidden">
            <Search className="h-4 w-4" />
          </EnhancedButton>

          {/* Quick actions */}
          <div className="hidden md:flex items-center gap-2">
            <EnhancedButton variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">Messages</span>
            </EnhancedButton>
            
            <EnhancedButton variant="ghost" size="sm">
              <Zap className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">Quick Action</span>
            </EnhancedButton>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <EnhancedButton variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-accent text-accent-foreground">
                  3
                </Badge>
              </EnhancedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 z-50 bg-background border shadow-xl">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Badge variant="secondary" className="text-xs">3 new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[400px] overflow-y-auto">
                <DropdownMenuItem className="p-4">
                  <div className="flex items-start gap-3 w-full">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New petition in your region</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        "Clean Water Initiative" - Support needed
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">30 minutes ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4">
                  <div className="flex items-start gap-3 w-full">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Village page updated</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        5 new members joined your village
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4">
                  <div className="flex items-start gap-3 w-full">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Weekly quiz available</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Test your civic knowledge
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3">
                <EnhancedButton variant="ghost" size="sm" fullWidth>
                  View all notifications
                </EnhancedButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <EnhancedButton variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </EnhancedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 z-50 bg-background border shadow-xl" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User Account</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Civic Level 3
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-3 p-3">
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-3 p-3">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="p-3 text-destructive">
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}