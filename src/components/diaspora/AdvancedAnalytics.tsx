import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Globe, Target, Download, RefreshCw } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const investmentData = [
  { month: 'Jan', healthcare: 45000, education: 32000, infrastructure: 28000, agriculture: 15000 },
  { month: 'Feb', healthcare: 52000, education: 38000, infrastructure: 31000, agriculture: 18000 },
  { month: 'Mar', healthcare: 48000, education: 41000, infrastructure: 35000, agriculture: 22000 },
  { month: 'Apr', healthcare: 61000, education: 45000, infrastructure: 38000, agriculture: 25000 },
  { month: 'May', healthcare: 55000, education: 48000, infrastructure: 42000, agriculture: 28000 },
  { month: 'Jun', healthcare: 67000, education: 52000, infrastructure: 45000, agriculture: 31000 },
];

const regionData = [
  { name: 'Centre', investments: 125000, projects: 15, participants: 450 },
  { name: 'Littoral', investments: 98000, projects: 12, participants: 380 },
  { name: 'West', investments: 87000, projects: 10, participants: 320 },
  { name: 'Northwest', investments: 76000, projects: 9, participants: 290 },
  { name: 'Southwest', investments: 72000, projects: 8, participants: 270 },
];

const participationData = [
  { category: 'Project Funding', value: 35, participants: 1250 },
  { category: 'Town Halls', value: 28, participants: 980 },
  { category: 'Voting', value: 22, participants: 780 },
  { category: 'Community Forums', value: 15, participants: 530 },
];

const impactMetrics = [
  { metric: 'Projects Completed', current: 47, target: 60, change: +12 },
  { metric: 'Total Investment', current: 850000, target: 1000000, change: +8.5 },
  { metric: 'Active Participants', current: 3420, target: 4000, change: +15.2 },
  { metric: 'Success Rate', current: 78, target: 85, change: +5.1 },
];

export const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('investments');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  const getChangeIcon = (change: number) => {
    return change > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Analytics Dashboard
            </CardTitle>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="centre">Centre</SelectItem>
                  <SelectItem value="littoral">Littoral</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                  <SelectItem value="northwest">Northwest</SelectItem>
                  <SelectItem value="southwest">Southwest</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {impactMetrics.map((metric, index) => (
          <Card key={metric.metric}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {index === 0 && <Target className="h-4 w-4 text-blue-500" />}
                  {index === 1 && <DollarSign className="h-4 w-4 text-green-500" />}
                  {index === 2 && <Users className="h-4 w-4 text-purple-500" />}
                  {index === 3 && <Globe className="h-4 w-4 text-orange-500" />}
                </div>
                {getChangeIcon(metric.change)}
              </div>
              <p className="text-sm text-muted-foreground">{metric.metric}</p>
              <p className="text-2xl font-bold">
                {index === 1 ? formatCurrency(metric.current) : 
                 index === 3 ? formatPercentage(metric.current) : 
                 metric.current.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2">
                <Progress value={(metric.current / metric.target) * 100} className="flex-1 mr-2" />
                <span className={`text-xs ${getChangeColor(metric.change)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: {index === 1 ? formatCurrency(metric.target) : 
                        index === 3 ? formatPercentage(metric.target) : 
                        metric.target.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="investments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="participation">Participation</TabsTrigger>
          <TabsTrigger value="regions">Regional</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="investments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Trends by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={investmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Area type="monotone" dataKey="healthcare" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="education" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="infrastructure" stackId="1" stroke="#ffc658" fill="#ffc658" />
                    <Area type="monotone" dataKey="agriculture" stackId="1" stroke="#ff7300" fill="#ff7300" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Healthcare', value: 334000 },
                        { name: 'Education', value: 256000 },
                        { name: 'Infrastructure', value: 219000 },
                        { name: 'Agriculture', value: 139000 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="participation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Participation by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={participationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participation Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {participationData.map((item, index) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <Badge variant="secondary">{item.participants} participants</Badge>
                    </div>
                    <Progress value={item.value} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {item.value}% of total participation
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={regionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="investments" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-500">78%</div>
                    <p className="text-sm text-muted-foreground">Overall Success Rate</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Completed Projects</span>
                      <span>47/60</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">13</div>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">2</div>
                      <p className="text-xs text-muted-foreground">On Hold</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">125K</div>
                    <p className="text-xs text-muted-foreground">People Served</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">850</div>
                    <p className="text-xs text-muted-foreground">Jobs Created</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Healthcare Access</span>
                    <span>+35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Education Enrollment</span>
                    <span>+28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Infrastructure Quality</span>
                    <span>+42%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economic Activity</span>
                    <span>+18%</span>
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