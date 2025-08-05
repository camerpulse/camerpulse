import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Music, 
  Calendar, 
  Award, 
  HandHeart, 
  Shield, 
  Users, 
  Wallet,
  Bell,
  Settings,
  Activity,
  TrendingUp,
  Eye
} from 'lucide-react';

// Import module components
import { FanDashboard } from '@/components/Fan/FanDashboard';
import { FanStorefront } from '@/components/Fan/FanStorefront';
import { FanWallet } from '@/components/Fan/FanWallet';
import { FanVoting } from '@/components/Fan/FanVoting';
import { FanLeaderboard } from '@/components/Fan/FanLeaderboard';
import ArtistManagement from '@/components/Admin/ArtistManagement';

interface UserStats {
  total_artists: number;
  total_fans: number;
  total_events: number;
  total_votes: number;
  total_revenue_fcfa: number;
  active_campaigns: number;
  platform_activity: number;
}

interface NotificationCenter {
  unread_count: number;
  recent_notifications: any[];
}

export const CamerPulseMasterCore: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('citizen');
  const [activeModule, setActiveModule] = useState('dashboard');
  const [notificationCenter, setNotificationCenter] = useState<NotificationCenter>({
    unread_count: 0,
    recent_notifications: []
  });

  // Fetch user role and permissions
  const { data: userRoleData } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      return data?.role || 'citizen';
    },
    enabled: !!user?.id
  });

  // Fetch platform statistics
  const { data: platformStats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const [
        { count: artistCount },
        { count: fanCount },
        { count: eventCount },
        { count: voteCount },
        { data: revenueData },
        { count: campaignCount }
      ] = await Promise.all([
        supabase.from('artist_memberships').select('*', { count: 'exact' }),
        supabase.from('fan_profiles').select('*', { count: 'exact' }),
        supabase.from('events').select('*', { count: 'exact' }),
        supabase.from('fan_voting').select('*', { count: 'exact' }),
        supabase.from('fan_transactions').select('amount_fcfa').eq('transaction_type', 'purchase'),
        supabase.from('artist_branding_profiles').select('*', { count: 'exact' }).eq('is_active', true)
      ]);

      const totalRevenue = revenueData?.reduce((sum, tx) => sum + tx.amount_fcfa, 0) || 0;

      return {
        total_artists: artistCount || 0,
        total_fans: fanCount || 0,
        total_events: eventCount || 0,
        total_votes: voteCount || 0,
        total_revenue_fcfa: totalRevenue,
        active_campaigns: campaignCount || 0,
        platform_activity: (artistCount || 0) + (fanCount || 0) + (eventCount || 0)
      };
    }
  });

  // Fetch notifications
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('fan_notifications')
        .select('*')
        .eq('fan_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      setNotificationCenter({
        unread_count: data?.length || 0,
        recent_notifications: data || []
      });
    };

    fetchNotifications();

    // Set up real-time notification updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fan_notifications',
          filter: `fan_id=eq.${user.id}`
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (userRoleData) {
      setUserRole(userRoleData);
    }
  }, [userRoleData]);

  const moduleConfig = {
    fan: [
      { id: 'dashboard', label: 'Dashboard', icon: Activity, component: FanDashboard },
      { id: 'storefront', label: 'Music Store', icon: Music, component: FanStorefront },
      { id: 'wallet', label: 'Wallet', icon: Wallet, component: FanWallet },
      { id: 'voting', label: 'Voting', icon: Award, component: FanVoting },
      { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp, component: FanLeaderboard }
    ],
    artist: [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'music', label: 'Music Manager', icon: Music },
      { id: 'events', label: 'Events', icon: Calendar },
      { id: 'brand', label: 'Brand Partnerships', icon: HandHeart },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp }
    ],
    admin: [
      { id: 'overview', label: 'Platform Overview', icon: Eye },
      { id: 'artists', label: 'Artist Management', icon: Users, component: ArtistManagement },
      { id: 'events', label: 'Event Management', icon: Calendar },
      { id: 'awards', label: 'Awards System', icon: Award },
      { id: 'security', label: 'Security & Monitoring', icon: Shield },
      { id: 'settings', label: 'System Settings', icon: Settings }
    ]
  };

  const getCurrentModules = () => {
    if (userRole === 'admin') return moduleConfig.admin;
    if (userRole === 'artist') return moduleConfig.artist;
    return moduleConfig.fan;
  };

  const renderModuleContent = () => {
    const currentModules = getCurrentModules();
    const currentModule = currentModules.find(m => m.id === activeModule);
    if (currentModule && 'component' in currentModule && currentModule.component) {
      const Component = currentModule.component as React.ComponentType;
      return <Component />;
    }

    // Default content for modules without specific components
    switch (activeModule) {
      case 'overview':
        return <PlatformOverview stats={platformStats} />;
      case 'music':
        return <ArtistMusicManager />;
      case 'events':
        return <EventsManager userRole={userRole} />;
      case 'brand':
        return <BrandPartnershipsManager />;
      case 'analytics':
        return <AnalyticsManager />;
      case 'awards':
        return <AwardsSystemManager />;
      case 'security':
        return <SecurityMonitoring />;
      case 'settings':
        return <SystemSettings />;
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {currentModule?.label || 'Module'} interface coming soon...
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Required</h2>
        <p className="text-muted-foreground mb-4">
          Please sign in to access the CamerPulse platform.
        </p>
        <Link to="/auth">
          <Button>Join CamerPulse</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">CamerPulse</h1>
              <Badge variant={userRole === 'admin' ? 'destructive' : userRole === 'artist' ? 'default' : 'secondary'}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {notificationCenter.unread_count > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {notificationCenter.unread_count}
                  </Badge>
                )}
              </Button>
              
              {/* User Info */}
              <div className="text-sm">
                <p className="font-medium">{user.email}</p>
                <p className="text-muted-foreground text-xs">
                  {userRole === 'admin' ? 'System Administrator' : 
                   userRole === 'artist' ? 'Verified Artist' : 'Community Member'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats Bar */}
        {platformStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{platformStats.total_artists}</div>
                <div className="text-sm text-muted-foreground">Artists</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{platformStats.total_fans}</div>
                <div className="text-sm text-muted-foreground">Fans</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{platformStats.total_events}</div>
                <div className="text-sm text-muted-foreground">Events</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{platformStats.total_votes}</div>
                <div className="text-sm text-muted-foreground">Votes</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">₣{(platformStats.total_revenue_fcfa / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{platformStats.active_campaigns}</div>
                <div className="text-sm text-muted-foreground">Campaigns</div>
              </div>
            </Card>
          </div>
        )}

        {/* Module Navigation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Platform Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getCurrentModules().map((module) => (
                <Button
                  key={module.id}
                  variant={activeModule === module.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveModule(module.id)}
                  className="flex items-center gap-2"
                >
                  <module.icon className="w-4 h-4" />
                  {module.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Content */}
        {renderModuleContent()}
      </div>
    </div>
  );
};

// Placeholder components for modules not yet implemented
const PlatformOverview: React.FC<{ stats: UserStats | undefined }> = ({ stats }) => (
  <Card>
    <CardHeader>
      <CardTitle>Platform Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Total Activity</h3>
          <p className="text-2xl font-bold">{stats?.platform_activity || 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Revenue Generated</h3>
          <p className="text-2xl font-bold">₣{((stats?.total_revenue_fcfa || 0) / 1000000).toFixed(1)}M</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Active Campaigns</h3>
          <p className="text-2xl font-bold">{stats?.active_campaigns || 0}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ArtistMusicManager = () => (
  <Card>
    <CardHeader>
      <CardTitle>Music Management</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">CamerPlay music management interface coming soon...</p>
    </CardContent>
  </Card>
);

const EventsManager: React.FC<{ userRole: string }> = ({ userRole }) => (
  <Card>
    <CardHeader>
      <CardTitle>Events Management</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        {userRole === 'admin' ? 'Admin event management' : 'Event creation and management'} interface coming soon...
      </p>
    </CardContent>
  </Card>
);

const BrandPartnershipsManager = () => (
  <Card>
    <CardHeader>
      <CardTitle>Brand Partnerships</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Brand partnership management interface coming soon...</p>
    </CardContent>
  </Card>
);

const AnalyticsManager = () => (
  <Card>
    <CardHeader>
      <CardTitle>Analytics Dashboard</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Advanced analytics interface coming soon...</p>
    </CardContent>
  </Card>
);

const AwardsSystemManager = () => (
  <Card>
    <CardHeader>
      <CardTitle>Awards System</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Awards system management interface coming soon...</p>
    </CardContent>
  </Card>
);

const SecurityMonitoring = () => (
  <Card>
    <CardHeader>
      <CardTitle>Security & Monitoring</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Security monitoring interface coming soon...</p>
    </CardContent>
  </Card>
);

const SystemSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>System Settings</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">System configuration interface coming soon...</p>
    </CardContent>
  </Card>
);

export default CamerPulseMasterCore;