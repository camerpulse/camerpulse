import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  useSidebar 
} from '@/components/ui/sidebar';
import { 
  Settings, 
  Bell,
  Users,
  BarChart3,
  ArrowLeft,
  Home
} from 'lucide-react';

const adminMenuItems = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    route: '/admin',
    icon: Home,
    description: 'Admin overview'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    route: '/admin/notifications',
    icon: Bell,
    description: 'Unified notifications'
  },
  {
    id: 'users',
    name: 'Users',
    route: '/admin/users',
    icon: Users,
    description: 'User management'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    route: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform analytics'
  },
  {
    id: 'settings',
    name: 'Settings',
    route: '/admin/settings',
    icon: Settings,
    description: 'System settings'
  }
];

export const SimplifiedAdminSidebar: React.FC = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getNavCls = (path: string) => 
    isActive(path) ? "bg-accent text-accent-foreground" : "hover:bg-accent/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible>
      <SidebarContent>
        {/* Admin Modules */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Admin Panel
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.route} className={getNavCls(item.route)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className="hover:bg-accent/50">
                    <ArrowLeft className="h-4 w-4" />
                    {!collapsed && <span>Back to Platform</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};