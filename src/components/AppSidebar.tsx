import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Home,
  MapPin,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Vote,
  User,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Crown
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

// Main navigation items
const mainNavItems = [
  {
    title: 'Dashboard',
    url: '/civic-dashboard',
    icon: Home,
  },
  {
    title: 'Feed',
    url: '/feed',
    icon: MessageSquare,
  },
  {
    title: 'Petitions',
    url: '/petitions',
    icon: FileText,
  },
  {
    title: 'Polls & Voting',
    url: '/polls',
    icon: Vote,
  },
];

// Government & Politics
const governmentItems = [
  {
    title: 'Politicians',
    url: '/politicians',
    icon: Users,
    subItems: [
      { title: 'All Politicians', url: '/politicians' },
      { title: 'Senators', url: '/senators' },
      { title: 'MPs', url: '/mps' },
      { title: 'Ministers', url: '/ministers' },
    ]
  },
  {
    title: 'Royal Heritage Directory',
    url: '/fons',
    icon: Crown,
  },
  {
    title: 'Political Parties',
    url: '/political-parties',
    icon: Shield,
  },
  {
    title: 'Villages',
    url: '/villages',
    icon: MapPin,
  },
];

// Services & Economy - REMOVED: These services don't exist yet
// - Marketplace (/marketplace) - No marketplace implementation found
// - Jobs (/jobs) - Job board exists but basic functionality
// - Companies (/companies) - Companies directory exists but limited

// Tools & Analytics - Keep only implemented features
const toolsItems = [
  {
    title: 'Search',
    url: '/search',
    icon: Search,
  },
  {
    title: 'Notifications',
    url: '/notifications',
    icon: Bell,
  },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');
  const isGroupActive = (items: any[]) => items.some(item => 
    isActive(item.url) || (item.subItems && item.subItems.some((sub: any) => isActive(sub.url)))
  );

  const getNavClassName = (isActive: boolean) => 
    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : '';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">CamerPulse</span>
              <span className="text-xs text-muted-foreground">Civic Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(isActive(item.url))}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Government & Politics */}
        <SidebarGroup>
          <SidebarGroupLabel>Government</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {governmentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    <>
                      <SidebarMenuButton className={getNavClassName(isGroupActive([item]))}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && (
                          <>
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto h-4 w-4" />
                          </>
                        )}
                      </SidebarMenuButton>
                      {!collapsed && (
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild className={getNavClassName(isActive(subItem.url))}>
                                <NavLink to={subItem.url}>
                                  {subItem.title}
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild className={getNavClassName(isActive(item.url))}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(isActive(item.url))}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || 'User'} />
                      <AvatarFallback>
                        {profile?.display_name?.[0] || user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium leading-none">
                          {profile?.display_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <NavLink to={`/profile/${profile?.username || profile?.user_id || user.id}`}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/notifications">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}