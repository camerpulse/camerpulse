import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export const BusinessIntelligenceModule = () => {
  const [activeView, setActiveView] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const kpiMetrics = [
    { name: 'Revenue Growth', value: '+24.5%', trend: 'up', target: '25%' },
    { name: 'User Acquisition', value: '1,234', trend: 'up', target: '1,200' },
    { name: 'Engagement Rate', value: '78.9%', trend: 'down', target: '80%' },
    { name: 'Conversion Rate', value: '3.2%', trend: 'up', target: '3.0%' }
  ];

  const dashboards = [
    { id: 1, name: 'Executive Overview', description: 'High-level KPIs and trends', lastUpdated: '2 hours ago', status: 'active' },
    { id: 2, name: 'Financial Performance', description: 'Revenue, costs, and profitability', lastUpdated: '1 hour ago', status: 'active' },
    { id: 3, name: 'User Analytics', description: 'User behavior and engagement', lastUpdated: '30 min ago', status: 'active' },
    { id: 4, name: 'Operational Metrics', description: 'System performance and efficiency', lastUpdated: '15 min ago', status: 'warning' }
  ];

  const reports = [
    { id: 1, name: 'Monthly Business Review', type: 'Automated', schedule: 'Monthly', nextRun: 'Jan 1, 2024' },
    { id: 2, name: 'Weekly KPI Summary', type: 'Automated', schedule: 'Weekly', nextRun: 'Dec 31, 2023' },
    { id: 3, name: 'Quarterly Analysis', type: 'Manual', schedule: 'Quarterly', nextRun: 'Manual' },
    { id: 4, name: 'Custom Insight Report', type: 'On-demand', schedule: 'Ad-hoc', nextRun: 'On-demand' }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Intelligence</h2>
          <p className="text-muted-foreground">
            Advanced analytics and data-driven insights for strategic decision making
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">Target: {metric.target}</p>
                    </div>
                    <div className={`p-2 rounded-full ${
                      metric.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Custom Report
                </Button>
                <Button variant="outline" className="justify-start">
                  <PieChart className="h-4 w-4 mr-2" />
                  Create Dashboard
                </Button>
                <Button variant="outline" className="justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Dashboards</h3>
            <Button>
              <PieChart className="h-4 w-4 mr-2" />
              Create Dashboard
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {dashboards.map((dashboard) => (
              <Card key={dashboard.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                    <Badge variant={dashboard.status === 'active' ? 'default' : 'destructive'}>
                      {dashboard.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {dashboard.status}
                    </Badge>
                  </div>
                  <CardDescription>{dashboard.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Last updated: {dashboard.lastUpdated}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Report Management</h3>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-6 space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">{report.type} • {report.schedule}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Next Run</p>
                          <p className="text-sm text-muted-foreground">{report.nextRun}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Run Now</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <h3 className="text-lg font-semibold">AI-Powered Insights</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  User engagement has increased by 15% over the past month, with peak activity during weekend hours.
                </p>
                <Button variant="link" className="p-0 h-auto mt-2">
                  View detailed analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Detected unusual spike in server response times at 14:30. Investigate potential causes.
                </p>
                <Button variant="link" className="p-0 h-auto mt-2">
                  Investigate anomaly
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Predictive Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Based on current trends, expect 20% increase in user registrations next quarter.
                </p>
                <Button variant="link" className="p-0 h-auto mt-2">
                  View forecast details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Optimization Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Consider implementing caching for API endpoints with response times greater than 500ms.
                </p>
                <Button variant="link" className="p-0 h-auto mt-2">
                  Apply recommendations
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};