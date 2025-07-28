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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  PenTool,
  Library,
  Package,
  QrCode,
  History,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
    description: 'Overview and analytics'
  },
  {
    title: 'Label Designer',
    url: '/designer',
    icon: PenTool,
    description: 'Create and edit labels'
  },
  {
    title: 'Templates',
    url: '/templates',
    icon: Library,
    description: 'Manage label templates'
  },
  {
    title: 'Bulk Generator',
    url: '/bulk-generator',
    icon: Package,
    description: 'Generate multiple labels'
  }
];

const toolsItems = [
  {
    title: 'Scanner',
    url: '/scanner',
    icon: QrCode,
    description: 'Scan barcodes and QR codes'
  },
  {
    title: 'Print History',
    url: '/history',
    icon: History,
    description: 'View printing history'
  }
];

const systemItems = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    description: 'Application settings'
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? 'bg-primary text-primary-foreground font-medium' 
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';
  };

  return (
    <Sidebar className={state === 'collapsed' ? 'w-14' : 'w-64'} collapsible="icon">
      {/* Logo/Brand Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          {state !== 'collapsed' && (
            <div>
              <h2 className="font-bold text-lg">LabelCraft</h2>
              <p className="text-xs text-muted-foreground">Label Management</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className={getNavClassName(item.url)}
                       title={state === 'collapsed' ? item.description : undefined}
                    >
                      <item.icon className="w-4 h-4" />
                      {state !== 'collapsed' && (
                        <div className="flex-1">
                          <span>{item.title}</span>
                          {item.url === '/designer' && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={getNavClassName(item.url)}
                       title={state === 'collapsed' ? item.description : undefined}
                    >
                      <item.icon className="w-4 h-4" />
                      {state !== 'collapsed' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Section */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={getNavClassName(item.url)}
                      title={state === 'collapsed' ? item.description : undefined}
                    >
                      <item.icon className="w-4 h-4" />
                      {state !== 'collapsed' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with analytics if not collapsed */}
      {state !== 'collapsed' && (
        <div className="p-4 border-t mt-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="w-3 h-3" />
              <span>Today's Activity</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-medium">12</div>
                <div className="text-muted-foreground">Labels</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-medium">3</div>
                <div className="text-muted-foreground">Scans</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}