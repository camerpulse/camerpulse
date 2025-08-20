import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  TrendingUp, 
  Clock, 
  Target, 
  Plus,
  Filter,
  Star,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';

interface PetitionsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats: {
    active: number;
    trending: number;
    successful: number;
    recent: number;
  };
}

const CATEGORIES = [
  { value: 'governance', label: 'Governance', icon: '🏛️', count: 45 },
  { value: 'justice', label: 'Justice', icon: '⚖️', count: 32 },
  { value: 'education', label: 'Education', icon: '📚', count: 28 },
  { value: 'health', label: 'Health', icon: '🏥', count: 24 },
  { value: 'environment', label: 'Environment', icon: '🌍', count: 19 },
  { value: 'digital_rights', label: 'Digital Rights', icon: '💻', count: 15 },
  { value: 'local_issues', label: 'Local Issues', icon: '🏘️', count: 38 },
  { value: 'corruption', label: 'Anti-Corruption', icon: '🛡️', count: 22 }
];

export const PetitionsSidebar: React.FC<PetitionsSidebarProps> = ({
  activeTab,
  onTabChange,
  stats
}) => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();

  const mainItems = [
    { id: 'active', label: 'Active Petitions', icon: TrendingUp, count: stats.active },
    { id: 'trending', label: 'Trending', icon: Star, count: stats.trending },
    { id: 'successful', label: 'Successful', icon: Target, count: stats.successful },
    { id: 'recent', label: 'Recent', icon: Clock, count: stats.recent }
  ];

  const quickActions = [
    { id: 'create', label: 'Start Petition', icon: Plus, action: () => {} }, // Will be handled by Link component
    { id: 'my-petitions', label: 'My Petitions', icon: Users, action: () => console.log('My petitions') },
    { id: 'saved', label: 'Saved', icon: Star, action: () => console.log('Saved') }
  ];

  return (
    <Sidebar className={collapsed ? "w-16" : "w-72"} collapsible>
      <SidebarContent className="pt-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold">
            {!collapsed && "Browse Petitions"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <Badge variant="secondary" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold">
            {!collapsed && "Quick Actions"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {user ? (
                  <Link to="/petitions/create">
                    <SidebarMenuButton className="w-full justify-start">
                      <Plus className="w-4 h-4" />
                      {!collapsed && <span>Start Petition</span>}
                    </SidebarMenuButton>
                  </Link>
                ) : (
                  <Link to="/auth?redirect=/petitions/create">
                    <SidebarMenuButton className="w-full justify-start">
                      <Plus className="w-4 h-4" />
                      {!collapsed && <span>Start Petition</span>}
                    </SidebarMenuButton>
                  </Link>
                )}
              </SidebarMenuItem>
              {quickActions.slice(1).map((action) => (
                <SidebarMenuItem key={action.id}>
                  <SidebarMenuButton
                    onClick={action.action}
                    className="w-full justify-start"
                  >
                    <action.icon className="w-4 h-4" />
                    {!collapsed && <span>{action.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Categories */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-semibold">
              Categories
            </SidebarGroupLabel>
            <SidebarGroupContent className="max-h-64 overflow-y-auto">
              <SidebarMenu>
                {CATEGORIES.map((category) => (
                  <SidebarMenuItem key={category.value}>
                    <SidebarMenuButton className="w-full justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{category.icon}</span>
                        <span className="text-xs">{category.label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {category.count}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Filters Quick Access */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-semibold">
              Quick Filters
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>By Region</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>This Week</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-sm">
                    <Filter className="w-4 h-4" />
                    <span>Advanced Filters</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};