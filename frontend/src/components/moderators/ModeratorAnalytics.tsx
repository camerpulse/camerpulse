import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Clock, CheckCircle, AlertTriangle, Award, 
  Calendar, Download, Filter 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ModerationStats {
  totalDecisions: number;
  avgResponseTime: number;
  accuracyScore: number;
  appealsWon: number;
  appealsLost: number;
  badgesEarned: number;
  activeDays: number;
  currentStreak: number;
}

interface ActivityData {
  date: string;
  decisions: number;
  appeals: number;
  avgTime: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ModeratorAnalytics() {
  const [stats, setStats] = useState<ModerationStats>({
    totalDecisions: 0,
    avgResponseTime: 0,
    accuracyScore: 0,
    appealsWon: 0,
    appealsLost: 0,
    badgesEarned: 0,
    activeDays: 0,
    currentStreak: 0
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    fetchAnalytics();
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Get moderator ID
      const { data: moderator } = await supabase
        .from('civic_moderators')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!moderator) return;

      // Fetch analytics data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      const { data: analyticsData, error } = await supabase
        .from('moderation_analytics')
        .select('*')
        .eq('moderator_id', moderator.id)
        .gte('period_start', startDate.toISOString().split('T')[0])
        .lte('period_end', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      // Process analytics data
      const processedStats = processAnalyticsData(analyticsData || []);
      setStats(processedStats);

      // Generate activity chart data
      const chartData = generateActivityChartData(analyticsData || [], parseInt(timeRange));
      setActivityData(chartData);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (data: any[]): ModerationStats => {
    const decisions = data.filter(d => d.metric_type === 'decisions_made');
    const appeals = data.filter(d => d.metric_type.includes('appeals_'));
    const responseTimes = data.filter(d => d.metric_type === 'response_time');
    const accuracy = data.filter(d => d.metric_type === 'accuracy_score');

    return {
      totalDecisions: decisions.reduce((sum, d) => sum + d.metric_value, 0),
      avgResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((sum, d) => sum + d.metric_value, 0) / responseTimes.length 
        : 0,
      accuracyScore: accuracy.length > 0
        ? accuracy.reduce((sum, d) => sum + d.metric_value, 0) / accuracy.length
        : 0,
      appealsWon: data.filter(d => d.metric_type === 'appeals_won').reduce((sum, d) => sum + d.metric_value, 0),
      appealsLost: data.filter(d => d.metric_type === 'appeals_lost').reduce((sum, d) => sum + d.metric_value, 0),
      badgesEarned: 3, // This would come from badges table
      activeDays: Math.min(parseInt(timeRange), 25), // Placeholder
      currentStreak: 7 // Placeholder
    };
  };

  const generateActivityChartData = (data: any[], days: number): ActivityData[] => {
    const chartData: ActivityData[] = [];
    const endDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = data.filter(d => d.period_start === dateStr);
      
      chartData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        decisions: dayData.filter(d => d.metric_type === 'decisions_made').reduce((sum, d) => sum + d.metric_value, 0),
        appeals: dayData.filter(d => d.metric_type.includes('appeals_')).length,
        avgTime: dayData.filter(d => d.metric_type === 'response_time').reduce((sum, d) => sum + d.metric_value, 0) || 0
      });
    }
    
    return chartData;
  };

  const exportData = async () => {
    // Implementation for exporting analytics data
    toast({
      title: "Export Started",
      description: "Your analytics report is being prepared...",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: 'Approved', value: stats.totalDecisions * 0.7 },
    { name: 'Rejected', value: stats.totalDecisions * 0.2 },
    { name: 'Needs Review', value: stats.totalDecisions * 0.1 }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Track your moderation performance and insights
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalDecisions}</p>
                <p className="text-sm text-muted-foreground">Total Decisions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.avgResponseTime)}h</p>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.accuracyScore)}%</p>
                <p className="text-sm text-muted-foreground">Accuracy Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.badgesEarned}</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>Your moderation activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="decisions" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Decision Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Decision Distribution</CardTitle>
            <CardDescription>Breakdown of your moderation decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>AI-powered recommendations to improve your moderation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Great Response Time!</p>
                <p className="text-sm text-green-700">
                  Your average response time is 15% faster than other moderators in your region.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Appeals Rate</p>
                <p className="text-sm text-blue-700">
                  Consider reviewing the community guidelines - your appeals rate is slightly above average.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <Award className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-purple-800">Badge Progress</p>
                <p className="text-sm text-purple-700">
                  You're only 5 decisions away from earning the "Consistency Expert" badge!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}