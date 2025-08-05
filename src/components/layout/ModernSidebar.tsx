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
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Home,
  Vote,
  Users,
  MapPin,
  BookOpen,
  Shield,
  TrendingUp,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  Globe,
  Award,
  Activity,
  Calendar,
  FileText,
  BarChart3,
  Zap
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', url: '/', icon: Home },
      { title: 'My Activity', url: '/activity', icon: Activity },
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'Civic Engagement',
    items: [
      { title: 'Petitions', url: '/petitions', icon: Vote, badge: '2 new' },
      { title: 'Villages', url: '/villages', icon: MapPin },
      { title: 'Political Rankings', url: '/political-rankings', icon: TrendingUp },
      { title: 'Transparency', url: '/transparency', icon: Shield },
    ]
  },
  {
    title: 'Community',
    items: [
      { title: 'Messages', url: '/messages', icon: MessageSquare, badge: '5' },
      { title: 'Events', url: '/events', icon: Calendar },
      { title: 'Civic Education', url: '/civic-education', icon: BookOpen },
      { title: 'Senators', url: '/senators', icon: Users },
    ]
  },
  {
    title: 'Tools',
    items: [
      { title: 'Quick Actions', url: '/quick-actions', icon: Zap },
      { title: 'Documents', url: '/documents', icon: FileText },
      { title: 'Notifications', url: '/notifications', icon: Bell },
    ]
  }
];

export function ModernSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar
      className={`border-r bg-gradient-subtle transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="border-b bg-gradient-card">
        <div className="flex items-center gap-3 p-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary shrink-0">
            <Globe className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg bg-gradient-patriotic bg-clip-text text-transparent">
                CamerPulse
              </h1>
              <p className="text-xs text-muted-foreground">Civic Platform</p>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <div className="px-4 pb-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Civic Level</span>
                <Badge variant="secondary" className="text-xs">Level 3</Badge>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                350 XP to next level
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="flex-1 overflow-y-auto">
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                {section.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg transition-all duration-200 group ${
                          isActive(item.url)
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'hover:bg-muted/70 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <item.icon 
                          className={`h-5 w-5 shrink-0 ${
                            isActive(item.url) ? 'text-primary' : ''
                          }`} 
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 font-medium">{item.title}</span>
                            {item.badge && (
                              <Badge 
                                variant={isActive(item.url) ? "default" : "secondary"} 
                                className="text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t bg-gradient-card">
        {!collapsed && (
          <div className="p-4">
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Achievement</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You've engaged with 5 petitions this month! 🎉
              </p>
            </div>
          </div>
        )}
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-5 w-5" />
                {!collapsed && <span>Settings</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                to="/help"
                className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
              >
                <HelpCircle className="h-5 w-5" />
                {!collapsed && <span>Help & Support</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}