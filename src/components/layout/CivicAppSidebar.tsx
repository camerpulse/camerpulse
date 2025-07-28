import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  MapPin,
  Vote,
  BookOpen,
  Shield,
  Users,
  Settings,
  Globe,
  Heart,
  TrendingUp,
  MessageSquare,
  Award
} from 'lucide-react';

const civicNavigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
    description: 'Your civic engagement overview'
  },
  {
    title: 'Villages',
    url: '/villages',
    icon: MapPin,
    description: 'Connect with your heritage'
  },
  {
    title: 'Petitions',
    url: '/petitions',
    icon: Vote,
    description: 'Create and support petitions'
  },
  {
    title: 'Civic Education',
    url: '/civic-education',
    icon: BookOpen,
    description: 'Learn about your rights'
  }
];

const civicToolsItems = [
  {
    title: 'Transparency Portal',
    url: '/transparency',
    icon: Shield,
    description: 'Government accountability'
  },
  {
    title: 'Community Feed',
    url: '/feed',
    icon: MessageSquare,
    description: 'Civic discussions'
  },
  {
    title: 'Public Services',
    url: '/services',
    icon: Users,
    description: 'Find local services'
  }
];

const civicPlatformItems = [
  {
    title: 'CamerLogistics',
    url: '/logistics',
    icon: Globe,
    description: 'Shipping & Delivery Platform'
  },
  {
    title: 'Job Portal',
    url: '/jobs',
    icon: TrendingUp,
    description: 'Employment opportunities'
  }
];

const systemItems = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    description: 'Account preferences'
  }
];

export function CivicAppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const baseClasses = "w-full justify-start h-auto p-3 text-left";
    if (isActive(path)) {
      return `${baseClasses} bg-primary/10 text-primary border-r-2 border-primary`;
    }
    return `${baseClasses} hover:bg-muted/50`;
  };

  return (
    <Sidebar className={`border-r ${state === 'collapsed' ? 'w-16' : 'w-64'}`}>
      {/* Logo/Brand Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          {state !== 'collapsed' && (
            <div>
              <h2 className="font-bold text-lg">CamerPulse</h2>
              <p className="text-xs text-muted-foreground">Civic Engagement Platform</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="px-2">
        {/* Main Civic Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Civic Engagement</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {civicNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                    <NavLink to={item.url} end={item.url === '/'}>
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {state !== 'collapsed' && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Civic Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Civic Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {civicToolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {state !== 'collapsed' && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Other Platforms */}
        <SidebarGroup>
          <SidebarGroupLabel>Other Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {civicPlatformItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {state !== 'collapsed' && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {state !== 'collapsed' && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Activity Summary - Only show when expanded */}
        {state !== 'collapsed' && (
          <div className="mt-auto p-4 border-t">
            <div className="text-xs text-muted-foreground mb-2">Recent Activity</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">Village connection: 2 new</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs">Petitions: 1 signed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs">Learning: Chapter completed</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
