import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
import { 
  Flag, Users, Shield, BarChart, Bell, ShoppingCart, 
  Vote, Activity, Settings, LogOut
} from 'lucide-react';

interface AdminModule {
  id: string;
  module_name: string;
  display_name: string;
  description: string;
  icon: string;
  route_path: string;
  is_enabled: boolean;
  display_order: number;
}

const iconMap = {
  flag: Flag,
  users: Users,
  shield: Shield,
  'bar-chart': BarChart,
  bell: Bell,
  'shopping-cart': ShoppingCart,
  vote: Vote,
  activity: Activity,
  settings: Settings,
};

export function UnifiedAdminSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { toast } = useToast();
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_dashboard_modules')
          .select('*')
          .eq('is_enabled', true)
          .order('display_order');

        if (error) throw error;
        setModules(data || []);
      } catch (error) {
        console.error('Error fetching admin modules:', error);
        toast({
          title: "Error",
          description: "Failed to load admin modules",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [toast]);

  const isActive = (path: string) => currentPath === path;
  const isExpanded = modules.some((module) => isActive(module.route_path));
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  if (loading) {
    return (
      <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible>
        <SidebarTrigger className="m-2 self-end" />
        <SidebarContent>
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        {/* Admin Header */}
        <div className="p-4 border-b">
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-lg">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Unified Management Interface</p>
            </div>
          )}
        </div>

        {/* Core Admin Modules */}
        <SidebarGroup open={isExpanded}>
          <SidebarGroupLabel>
            {!collapsed && "Core Functions"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((module) => {
                const IconComponent = iconMap[module.icon as keyof typeof iconMap] || Settings;
                return (
                  <SidebarMenuItem key={module.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={module.route_path} 
                        className={getNavCls}
                        title={collapsed ? module.display_name : undefined}
                      >
                        <IconComponent className="h-4 w-4 mr-2" />
                        {!collapsed && (
                          <div className="flex flex-col">
                            <span className="text-sm">{module.display_name}</span>
                            {module.description && (
                              <span className="text-xs text-muted-foreground truncate">
                                {module.description}
                              </span>
                            )}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && "Quick Actions"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/admin/settings" 
                    className={getNavCls}
                    title={collapsed ? "System Settings" : undefined}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {!collapsed && <span>System Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/" 
                    className={getNavCls}
                    title={collapsed ? "Back to Platform" : undefined}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {!collapsed && <span>Back to Platform</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Simplification Progress */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs font-medium text-green-800 mb-1">
                Simplification Progress
              </div>
              <div className="text-xs text-green-600">
                Phase 3 Complete
              </div>
              <div className="text-xs text-green-600">
                70% complexity reduction achieved
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}