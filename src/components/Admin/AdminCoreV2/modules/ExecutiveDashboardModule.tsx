import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Target,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const ExecutiveDashboardModule = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeView, setActiveView] = useState('overview');

  const kpiData = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      period: 'vs last month'
    },
    {
      title: 'Active Users',
      value: '45.2K',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      period: 'vs last month'
    },
    {
      title: 'Engagement Rate',
      value: '78.9%',
      change: '-2.1%',
      trend: 'down',
      icon: Activity,
      period: 'vs last month'
    },
    {
      title: 'Goal Achievement',
      value: '94.7%',
      change: '+5.3%',
      trend: 'up',
      icon: Target,
      period: 'vs target'
    }
  ];

  const recentAlerts = [
    { id: 1, type: 'warning', message: 'Server response time increased by 15%', time: '2 hours ago' },
    { id: 2, type: 'success', message: 'Monthly revenue target achieved', time: '4 hours ago' },
    { id: 3, type: 'info', message: 'New feature deployment completed', time: '6 hours ago' },
    { id: 4, type: 'warning', message: 'User engagement dip detected', time: '8 hours ago' }
  ];

  const topMetrics = [
    { metric: 'Customer Acquisition Cost', value: '$24.50', change: '-8.2%', trend: 'down' },
    { metric: 'Lifetime Value', value: '$340.80', change: '+15.7%', trend: 'up' },
    { metric: 'Churn Rate', value: '2.3%', change: '-0.5%', trend: 'down' },
    { metric: 'Conversion Rate', value: '3.8%', change: '+1.2%', trend: 'up' }
  ];

  const quickActions = [
    { title: 'Generate Monthly Report', description: 'Create comprehensive monthly business report', icon: BarChart3 },
    { title: 'Schedule Review Meeting', description: 'Set up quarterly business review', icon: Calendar },
    { title: 'View Detailed Analytics', description: 'Access in-depth performance analytics', icon: Activity },
    { title: 'Export Dashboard Data', description: 'Download current dashboard data', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Executive Dashboard</h2>
          <p className="text-muted-foreground">
            High-level overview of key business metrics and performance indicators
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="strategic">Strategic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <kpi.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">{kpi.title}</span>
                    </div>
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-medium ${
                        kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.change}
                      </span>
                      <span className="text-sm text-muted-foreground">{kpi.period}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Alerts */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Alerts & Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`p-1 rounded-full ${
                        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        alert.type === 'success' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {alert.type === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
                         alert.type === 'success' ? <CheckCircle className="h-3 w-3" /> :
                         <Clock className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button key={index} variant="outline" className="w-full justify-start h-auto p-3">
                      <action.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <h3 className="text-lg font-semibold">Financial Performance</h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {topMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center gap-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-64 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Revenue chart visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <h3 className="text-lg font-semibold">Operational Metrics</h3>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Server Uptime</span>
                    <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <Badge variant="outline">142ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <Badge className="bg-green-100 text-green-800">0.02%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Sessions</span>
                    <Badge variant="outline">2,341</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Active Users</span>
                    <span className="text-sm font-medium">12,456</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Duration</span>
                    <span className="text-sm font-medium">8m 32s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Page Views</span>
                    <span className="text-sm font-medium">45,678</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="text-sm font-medium">23.4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-6">
          <h3 className="text-lg font-semibold">Strategic Insights</h3>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Goals Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Q4 Revenue Target</span>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">User Growth Target</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Cost Reduction Goal</span>
                      <span className="text-sm font-medium">76%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Market Share</p>
                    <p className="text-lg font-semibold">12.4%</p>
                    <p className="text-xs text-green-600">+2.1% vs last quarter</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Competitive Position</p>
                    <p className="text-lg font-semibold">#3</p>
                    <p className="text-xs text-green-600">Moved up 1 position</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Growth Rate</p>
                    <p className="text-lg font-semibold">18.7%</p>
                    <p className="text-xs text-green-600">Above industry average</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};