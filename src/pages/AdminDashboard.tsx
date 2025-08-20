import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/utils/auth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Settings,
  Search
} from 'lucide-react';

interface DashboardStats {
  totalPetitions: number;
  activePetitions: number;
  pendingModeration: number;
  totalSignatures: number;
  flaggedContent: number;
  recentReports: number;
}

interface ModerationItem {
  id: string;
  petition_title: string;
  queue_type: string;
  priority: number;
  review_status: string;
  created_at: string;
  flags_count: number;
  flag_reasons: string[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPetitions: 0,
    activePetitions: 0,
    pendingModeration: 0,
    totalSignatures: 0,
    flaggedContent: 0,
    recentReports: 0
  });
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch basic petition stats
      const { data: petitions } = await supabase
        .from('petitions')
        .select('id, status, current_signatures');

      const totalPetitions = petitions?.length || 0;
      const activePetitions = petitions?.filter(p => p.status === 'active').length || 0;
      const totalSignatures = petitions?.reduce((sum, p) => sum + (p.current_signatures || 0), 0) || 0;

      // Fetch moderation queue
      const { data: queueItems } = await supabase
        .from('petition_moderation_queue')
        .select(`
          id,
          queue_type,
          priority,
          review_status,
          created_at,
          flags_count,
          flag_reasons,
          petitions!petition_moderation_queue_petition_id_fkey (
            title
          )
        `)
        .order('created_at', { ascending: false });

      const pendingModeration = queueItems?.filter(item => item.review_status === 'pending').length || 0;
      const flaggedContent = queueItems?.filter(item => item.flags_count > 0).length || 0;

      // Fetch recent reports
      const { data: reports } = await supabase
        .from('petition_reports')
        .select('id')
        .eq('status', 'pending')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const recentReports = reports?.length || 0;

      setStats({
        totalPetitions,
        activePetitions,
        pendingModeration,
        totalSignatures,
        flaggedContent,
        recentReports
      });

      // Format moderation queue
      const formattedQueue = queueItems?.map(item => ({
        id: item.id,
        petition_title: item.petitions?.title || 'Unknown Petition',
        queue_type: item.queue_type,
        priority: item.priority,
        review_status: item.review_status,
        created_at: item.created_at,
        flags_count: item.flags_count,
        flag_reasons: item.flag_reasons || []
      })) || [];

      setModerationQueue(formattedQueue);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      await supabase
        .from('petition_moderation_queue')
        .update({
          review_status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', itemId);

      // Log admin activity
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_user_id: user?.id,
          action_type: `moderation_${action}`,
          resource_type: 'petition_moderation_queue',
          resource_id: itemId,
          action_details: { action }
        });

      fetchDashboardData();
    } catch (error) {
      console.error('Error handling moderation action:', error);
    }
  };

  const filteredQueue = moderationQueue.filter(item => {
    const matchesSearch = item.petition_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.review_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage petitions, moderation, and platform analytics
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="w-4 h-4" />
          Live Updates
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Petitions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPetitions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePetitions} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signatures</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSignatures.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all petitions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Moderation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingModeration}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedContent}</div>
            <p className="text-xs text-muted-foreground">
              User reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentReports}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="moderation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="moderation">Moderation Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-4">
          {/* Moderation Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Moderation Queue</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search petitions..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredQueue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No items in moderation queue</p>
                  </div>
                ) : (
                  filteredQueue.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{item.petition_title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{item.queue_type}</Badge>
                            <span>Priority: {item.priority}</span>
                            {item.flags_count > 0 && (
                              <Badge variant="destructive">{item.flags_count} flags</Badge>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            item.review_status === 'pending' ? 'default' :
                            item.review_status === 'approved' ? 'success' : 'destructive'
                          }
                        >
                          {item.review_status}
                        </Badge>
                      </div>
                      
                      {item.flag_reasons.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Reported for:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.flag_reasons.map((reason, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.review_status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleModerationAction(item.id, 'approve')}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleModerationAction(item.id, 'reject')}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Reports management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Admin settings coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;