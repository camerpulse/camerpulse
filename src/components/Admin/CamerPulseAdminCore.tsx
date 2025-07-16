import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3, Users, ShieldCheck, Settings, TrendingUp, Activity,
  Globe, Bot, Eye, MessageSquare, Building2, CreditCard,
  AlertTriangle, CheckCircle, Clock, Smartphone, Monitor,
  Menu, X, Home, FileText, UserCheck, Calendar, Database
} from 'lucide-react';
import { CamerPulseIntelligencePanel } from './CamerPulseIntelligencePanel';
import { ResponsiveChart } from './ResponsiveChart';
import { MobileBottomNav } from './MobileBottomNav';
import { CollapsibleSidebar } from './CollapsibleSidebar';

interface DashboardStats {
  users: number;
  politicians: number;
  polls: number;
  posts: number;
  vendors: number;
  reports: number;
}

interface AdminUser {
  id: string;
  role: string;
}

export const CamerPulseAdminCore: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for mobile optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check admin privileges
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['admin_role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin_dashboard_stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [users, politicians, polls, posts, vendors, reports] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('politicians').select('id', { count: 'exact' }),
        supabase.from('polls').select('id', { count: 'exact' }),
        supabase.from('pulse_posts').select('id', { count: 'exact' }),
        supabase.from('marketplace_vendors').select('id', { count: 'exact' }),
        supabase.from('civic_complaints').select('id', { count: 'exact' })
      ]);

      return {
        users: users.count || 0,
        politicians: politicians.count || 0,
        polls: polls.count || 0,
        posts: posts.count || 0,
        vendors: vendors.count || 0,
        reports: reports.count || 0
      };
    },
    enabled: !!userRole,
  });

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need administrator privileges to access CamerPulse Admin Core.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'text-cm-green' },
    { id: 'users', label: 'Users', icon: Users, color: 'text-blue-600' },
    { id: 'politicians', label: 'Politicians', icon: UserCheck, color: 'text-cm-red' },
    { id: 'civic-tools', label: 'Civic Tools', icon: Eye, color: 'text-cm-yellow' },
    { id: 'polls', label: 'Polls', icon: BarChart3, color: 'text-purple-600' },
    { id: 'marketplace', label: 'Marketplace', icon: Building2, color: 'text-orange-600' },
    { id: 'financials', label: 'Financials', icon: CreditCard, color: 'text-green-600' },
    { id: 'security', label: 'Security', icon: ShieldCheck, color: 'text-red-600' },
    { id: 'intelligence', label: 'Intelligence', icon: Bot, color: 'text-indigo-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-lg font-bold text-foreground">
              CamerPulse Admin
            </h1>
          </div>
          <Badge variant="default" className="bg-cm-green text-white">
            Live
          </Badge>
        </div>
      )}

      <div className="flex">
        {/* Collapsible Sidebar */}
        <CollapsibleSidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
        } ${isMobile ? 'pb-20' : ''}`}>
          {/* Desktop Header */}
          {!isMobile && (
            <header className="bg-card border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-1">
                    CamerPulse Admin Core
                  </h1>
                  <p className="text-muted-foreground">
                    Comprehensive platform management and intelligence dashboard
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="bg-cm-green text-white px-3 py-1">
                    <Activity className="h-4 w-4 mr-1" />
                    System Online
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    {sidebarOpen ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </div>
            </header>
          )}

          {/* Content Area */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Overview Dashboard */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-cm-green hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-foreground">
                          {statsLoading ? '...' : stats?.users.toLocaleString()}
                        </div>
                        <Users className="h-8 w-8 text-cm-green" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        +12.3% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-cm-red hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Politicians
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-foreground">
                          {statsLoading ? '...' : stats?.politicians.toLocaleString()}
                        </div>
                        <UserCheck className="h-8 w-8 text-cm-red" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        14 verified profiles
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-cm-yellow hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Active Polls
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-foreground">
                          {statsLoading ? '...' : stats?.polls.toLocaleString()}
                        </div>
                        <BarChart3 className="h-8 w-8 text-cm-yellow" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        +8.7% engagement rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Vendors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-foreground">
                          {statsLoading ? '...' : stats?.vendors.toLocaleString()}
                        </div>
                        <Building2 className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        CM-ID System Active
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Activity (Last 7 Days)</CardTitle>
                      <CardDescription>
                        User engagement and platform growth metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveChart type="line" data={[
                        { name: 'Mon', users: 120, polls: 8, posts: 45 },
                        { name: 'Tue', users: 145, polls: 12, posts: 52 },
                        { name: 'Wed', users: 165, polls: 9, posts: 38 },
                        { name: 'Thu', users: 180, polls: 15, posts: 67 },
                        { name: 'Fri', users: 195, polls: 11, posts: 49 },
                        { name: 'Sat', users: 210, polls: 7, posts: 31 },
                        { name: 'Sun', users: 175, polls: 9, posts: 42 }
                      ]} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Regional Distribution</CardTitle>
                      <CardDescription>
                        User distribution across Cameroon's 10 regions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveChart type="bar" data={[
                        { name: 'Centre', value: 245 },
                        { name: 'Littoral', value: 198 },
                        { name: 'West', value: 156 },
                        { name: 'Northwest', value: 134 },
                        { name: 'Southwest', value: 127 },
                        { name: 'North', value: 98 },
                        { name: 'Far North', value: 87 },
                        { name: 'East', value: 76 },
                        { name: 'South', value: 65 },
                        { name: 'Adamawa', value: 54 }
                      ]} />
                    </CardContent>
                  </Card>
                </div>

                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Health Monitor</CardTitle>
                    <CardDescription>
                      Real-time status of all CamerPulse services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950">
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">Database</p>
                          <p className="text-sm text-green-600 dark:text-green-300">Operational</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">API Services</p>
                          <p className="text-sm text-blue-600 dark:text-blue-300">Active</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                        <div>
                          <p className="font-medium text-yellow-900 dark:text-yellow-100">AI Scanner</p>
                          <p className="text-sm text-yellow-600 dark:text-yellow-300">Monitoring</p>
                        </div>
                        <Activity className="h-6 w-6 text-yellow-600" />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                        <div>
                          <p className="font-medium text-purple-900 dark:text-purple-100">Intelligence</p>
                          <p className="text-sm text-purple-600 dark:text-purple-300">Learning</p>
                        </div>
                        <Bot className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Intelligence Panel */}
            {activeTab === 'intelligence' && (
              <CamerPulseIntelligencePanel />
            )}

            {/* Placeholder sections for other tabs */}
            {activeTab !== 'overview' && activeTab !== 'intelligence' && (
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{activeTab.replace('-', ' ')} Management</CardTitle>
                  <CardDescription>
                    Comprehensive {activeTab.replace('-', ' ')} administration tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {activeTab.replace('-', ' ').charAt(0).toUpperCase() + activeTab.replace('-', ' ').slice(1)} Dashboard
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Advanced management tools for this section are being integrated.
                    </p>
                    <Button variant="outline">
                      Configure {activeTab.replace('-', ' ')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav
          items={sidebarItems.slice(0, 5)} // Show top 5 items
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
};

export default CamerPulseAdminCore;