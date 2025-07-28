import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Bell,
  HelpCircle,
  User,
  Settings,
  LogOut,
  Palette
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const pageInfo = {
  '/': {
    title: 'Dashboard',
    description: 'Overview of your label operations'
  },
  '/designer': {
    title: 'Label Designer',
    description: 'Create and customize shipping labels'
  },
  '/templates': {
    title: 'Template Manager',
    description: 'Manage your label templates'
  },
  '/bulk-generator': {
    title: 'Bulk Generator',
    description: 'Generate multiple labels from data'
  },
  '/scanner': {
    title: 'Scanner',
    description: 'Scan barcodes and QR codes'
  },
  '/history': {
    title: 'Print History',
    description: 'View your printing history'
  },
  '/settings': {
    title: 'Settings',
    description: 'Configure application settings'
  }
};

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
  
  const currentPage = pageInfo[location.pathname as keyof typeof pageInfo] || {
    title: 'LabelCraft',
    description: 'Label Management System'
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold">{currentPage.title}</h1>
            <p className="text-sm text-muted-foreground">{currentPage.description}</p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates, labels, or history..."
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Palette className="h-4 w-4" />
          </Button>

          {/* Help */}
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Print job completed</p>
                  <p className="text-xs text-muted-foreground">Bulk label generation for 25 items finished successfully</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Template updated</p>
                  <p className="text-xs text-muted-foreground">Shipping label template has been modified</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Scanner activity</p>
                  <p className="text-xs text-muted-foreground">12 QR codes scanned in the last hour</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} alt="User" />
                  <AvatarFallback>{getInitials(profile?.display_name || user?.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.display_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
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
      </div>
    </header>
  );
}