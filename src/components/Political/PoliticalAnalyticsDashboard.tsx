import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Shield, 
  Target,
  Activity,
  Zap,
  Star
} from 'lucide-react';

interface PoliticalAnalyticsDashboardProps {
  data: any[];
  type: 'politician' | 'senator' | 'mp' | 'minister';
}

export const PoliticalAnalyticsDashboard: React.FC<PoliticalAnalyticsDashboardProps> = ({
  data,
  type
}) => {
  // Calculate analytics
  const analytics = React.useMemo(() => {
    const totalCount = data.length;
    
    // Performance distribution
    const performanceRanges = {
      excellent: data.filter(item => (item.performance_score || 0) >= 90).length,
      good: data.filter(item => (item.performance_score || 0) >= 70 && (item.performance_score || 0) < 90).length,
      average: data.filter(item => (item.performance_score || 0) >= 50 && (item.performance_score || 0) < 70).length,
      poor: data.filter(item => (item.performance_score || 0) < 50).length
    };

    // Regional distribution
    const regionalData = data.reduce((acc, item) => {
      const region = item.region || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Party distribution
    const partyData = data.reduce((acc, item) => {
      const party = item.political_party || item.party_affiliation || 'Independent';
      acc[party] = (acc[party] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top performers
    const topPerformers = [...data]
      .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
      .slice(0, 10);

    // Transparency vs Performance correlation
    const correlationData = data.map(item => ({
      transparency: item.transparency_score || 0,
      performance: item.performance_score || 0,
      name: item.name || item.full_name
    }));

    // Average scores
    const avgPerformance = data.reduce((sum, item) => sum + (item.performance_score || 0), 0) / totalCount;
    const avgTransparency = data.reduce((sum, item) => sum + (item.transparency_score || 0), 0) / totalCount;
    const avgRating = data.reduce((sum, item) => sum + (item.average_rating || 0), 0) / totalCount;

    return {
      totalCount,
      performanceRanges,
      regionalData: Object.entries(regionalData).map(([name, value]) => ({ name, value })),
      partyData: Object.entries(partyData).map(([name, value]) => ({ name, value })),
      topPerformers,
      correlationData,
      avgPerformance,
      avgTransparency,
      avgRating
    };
  }, [data]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-500" />
              Avg Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.avgPerformance.toFixed(1)}%
            </div>
            <Progress value={analytics.avgPerformance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              Avg Transparency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.avgTransparency.toFixed(1)}%
            </div>
            <Progress value={analytics.avgTransparency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analytics.avgRating.toFixed(1)}/5
            </div>
            <div className="flex items-center mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.round(analytics.avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-purple-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.performanceRanges.excellent}
            </div>
            <p className="text-xs text-muted-foreground">
              90%+ performance score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { range: 'Excellent (90%+)', count: analytics.performanceRanges.excellent },
                    { range: 'Good (70-89%)', count: analytics.performanceRanges.good },
                    { range: 'Average (50-69%)', count: analytics.performanceRanges.average },
                    { range: 'Poor (<50%)', count: analytics.performanceRanges.poor }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.correlationData.slice(0, 20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="performance" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.regionalData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.regionalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Party Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.partyData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transparency vs Performance Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.correlationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="transparency" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="performance" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={index < 3 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{performer.name || performer.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {performer.position || performer.office}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {(performer.performance_score || 0).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Performance Score
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};