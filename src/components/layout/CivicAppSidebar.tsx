import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Home,
  Vote,
  Users,
  MapPin,
  BookOpen,
  Shield,
  Settings,
  Bell,
  TrendingUp,
  Building2,
  Menu
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home
  },
  {
    title: 'Feed',
    url: '/feed',
    icon: TrendingUp
  },
  {
    title: 'Politicians',
    url: '/politicians',
    icon: Users
  },
  {
    title: 'Political Parties',
    url: '/political-parties',
    icon: Building2
  },
  {
    title: 'Rankings',
    url: '/political-rankings',
    icon: Vote
  },
  {
    title: 'Villages',
    url: '/villages',
    icon: MapPin
  },
  {
    title: 'Education',
    url: '/civic-education',
    icon: BookOpen
  },
  {
    title: 'Transparency',
    url: '/transparency',
    icon: Shield
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings
  }
];

export function CivicAppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          {!collapsed && (
            <div>
              <h2 className="font-bold">CamerPulse</h2>
              <p className="text-xs text-muted-foreground">Civic Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="space-y-2">
            <Badge variant="outline" className="justify-center">
              <Bell className="h-3 w-3 mr-1" />
              3 Updates
            </Badge>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}