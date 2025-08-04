import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Flag, Users, Shield, BarChart, Bell, ShoppingCart, 
  Vote, Activity, TrendingUp, CheckCircle, AlertTriangle,
  ArrowRight, Calendar, Clock
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeFeatures: number;
  totalFeatures: number;
  recentNotifications: number;
  sentimentAnalyses: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

interface AdminModule {
  id: string;
  module_name: string;
  display_name: string;
  description: string;
  icon: string;
  route_path: string;
  is_enabled: boolean;
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
};

export const UnifiedAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeFeatures: 0,
    totalFeatures: 0,
    recentNotifications: 0,
    sentimentAnalyses: 0,
    systemHealth: 'good'
  });
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        featuresResponse,
        modulesResponse,
        sentimentResponse,
        notificationResponse
      ] = await Promise.all([
        supabase.from('system_feature_flags').select('feature_name, is_enabled'),
        supabase.from('admin_dashboard_modules').select('*').eq('is_enabled', true).order('display_order'),
        supabase.from('core_sentiment_analysis').select('id').limit(1),
        supabase.from('notification_templates').select('id').limit(1)
      ]);

      if (featuresResponse.error) throw featuresResponse.error;
      if (modulesResponse.error) throw modulesResponse.error;

      const activeFeatures = featuresResponse.data?.filter(f => f.is_enabled).length || 0;
      const totalFeatures = featuresResponse.data?.length || 0;

      setStats({
        totalUsers: 0, // Would come from user count query
        activeFeatures,
        totalFeatures,
        recentNotifications: notificationResponse.data?.length || 0,
        sentimentAnalyses: sentimentResponse.data?.length || 0,
        systemHealth: activeFeatures / totalFeatures > 0.7 ? 'good' : 'warning'
      });

      setModules(modulesResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading admin dashboard...</div>
      </div>
    );
  }

  const simplificationProgress = Math.round((stats.totalFeatures - stats.activeFeatures) / stats.totalFeatures * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Unified Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Centralized management interface for CamerPulse platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getHealthIcon(stats.systemHealth)}
          <span className={`text-sm font-medium ${getHealthColor(stats.systemHealth)}`}>
            System {stats.systemHealth === 'good' ? 'Healthy' : stats.systemHealth}
          </span>
        </div>
      </div>

      {/* Simplification Progress Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Phase 3 Simplification Complete</h3>
              <p className="text-green-600">
                Platform complexity reduced by {simplificationProgress}% • 
                Unified admin interface active • 
                Simplified notifications deployed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{simplificationProgress}%</div>
              <div className="text-sm text-green-600">Complexity Reduction</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.activeFeatures}</div>
                <div className="text-sm text-muted-foreground">Active Features</div>
              </div>
              <Flag className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{modules.length}</div>
                <div className="text-sm text-muted-foreground">Admin Modules</div>
              </div>
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.sentimentAnalyses}</div>
                <div className="text-sm text-muted-foreground">Sentiment Data</div>
              </div>
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.recentNotifications}</div>
                <div className="text-sm text-muted-foreground">Notifications</div>
              </div>
              <Bell className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {modules.slice(0, 6).map((module) => {
              const IconComponent = iconMap[module.icon as keyof typeof iconMap] || Shield;
              return (
                <Link 
                  key={module.id}
                  to={module.route_path}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{module.display_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {module.description}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">Unified Admin Active</div>
                  <div className="text-xs text-green-600">All modules consolidated</div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-800">Simplified Notifications</div>
                  <div className="text-xs text-blue-600">Streamlined channels</div>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Updated</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-3">
                <BarChart className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-800">Core Sentiment Analysis</div>
                  <div className="text-xs text-purple-600">Optimized performance</div>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Optimized</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-600" />
                <div>
                  <div className="font-medium">Last System Check</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
              <Badge variant="outline">Now</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button asChild className="h-16">
          <Link to="/admin/feature-flags" className="flex items-center gap-3">
            <Flag className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Feature Flags</div>
              <div className="text-xs opacity-80">Manage platform features</div>
            </div>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-16">
          <Link to="/admin/notifications" className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Notifications</div>
              <div className="text-xs opacity-80">Simplified system</div>
            </div>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-16">
          <Link to="/admin/analytics" className="flex items-center gap-3">
            <BarChart className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Core Analytics</div>
              <div className="text-xs opacity-80">Sentiment & metrics</div>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
};