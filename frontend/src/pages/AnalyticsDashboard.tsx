import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Package, Clock, DollarSign, Users, MapPin, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subMonths } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AnalyticsMetrics {
  totalShipments: number;
  totalRevenue: number;
  avgDeliveryTime: number;
  activeShipments: number;
  customerSatisfaction: number;
  onTimeDeliveryRate: number;
}

interface ShipmentData {
  date: string;
  shipments: number;
  revenue: number;
  delivered: number;
}

interface StatusDistribution {
  name: string;
  value: number;
  percentage: number;
}

interface PerformanceMetrics {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('30');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics data
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['analytics-metrics', dateRange, companyFilter],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(dateRange));
      
      // Get shipment counts and revenue
      const { data: shipments, error } = await supabase
        .from('shipments')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const totalShipments = shipments?.length || 0;
      const totalRevenue = shipments?.reduce((sum, s) => sum + (s.shipping_cost || 0), 0) || 0;
      const deliveredShipments = shipments?.filter(s => s.status === 'delivered') || [];
      const avgDeliveryTime = deliveredShipments.length > 0 
        ? deliveredShipments.reduce((sum, s) => {
            if (s.actual_delivery_date && s.created_at) {
              const created = new Date(s.created_at);
              const delivered = new Date(s.actual_delivery_date);
              return sum + (delivered.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            }
            return sum;
          }, 0) / deliveredShipments.length
        : 0;

      const activeShipments = shipments?.filter(s => 
        ['pending', 'in_transit', 'out_for_delivery'].includes(s.status)
      ).length || 0;

      const onTimeDeliveries = deliveredShipments.filter(s => {
        if (!s.estimated_delivery_date || !s.actual_delivery_date) return false;
        return new Date(s.actual_delivery_date) <= new Date(s.estimated_delivery_date);
      }).length;

      const onTimeDeliveryRate = deliveredShipments.length > 0 
        ? (onTimeDeliveries / deliveredShipments.length) * 100 
        : 0;

      return {
        totalShipments,
        totalRevenue,
        avgDeliveryTime: Math.round(avgDeliveryTime * 10) / 10,
        activeShipments,
        customerSatisfaction: 4.2, // Mock data - would come from customer ratings
        onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 10) / 10
      } as AnalyticsMetrics;
    }
  });

  // Fetch time series data
  const { data: timeSeriesData } = useQuery({
    queryKey: ['analytics-timeseries', dateRange, companyFilter],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(dateRange));
      
      const { data: shipments } = await supabase
        .from('shipments')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      // Group by day
      const dataByDay: { [key: string]: ShipmentData } = {};
      
      shipments?.forEach(shipment => {
        const date = format(new Date(shipment.created_at), 'MMM dd');
        if (!dataByDay[date]) {
          dataByDay[date] = { date, shipments: 0, revenue: 0, delivered: 0 };
        }
        dataByDay[date].shipments++;
        dataByDay[date].revenue += shipment.shipping_cost || 0;
        if (shipment.status === 'delivered') {
          dataByDay[date].delivered++;
        }
      });

      return Object.values(dataByDay);
    }
  });

  // Fetch status distribution
  const { data: statusData } = useQuery({
    queryKey: ['analytics-status', dateRange, companyFilter],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(dateRange));
      
      const { data: shipments } = await supabase
        .from('shipments')
        .select('status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const statusCounts: { [key: string]: number } = {};
      const total = shipments?.length || 0;

      shipments?.forEach(shipment => {
        statusCounts[shipment.status] = (statusCounts[shipment.status] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([name, value]) => ({
        name: name.replace('_', ' ').toUpperCase(),
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0
      }));
    }
  });

  // Performance metrics with mock comparison data
  const performanceMetrics: PerformanceMetrics[] = [
    {
      metric: 'Avg Delivery Time',
      current: metrics?.avgDeliveryTime || 0,
      previous: 3.8,
      change: ((metrics?.avgDeliveryTime || 0) - 3.8) / 3.8 * 100,
      trend: (metrics?.avgDeliveryTime || 0) > 3.8 ? 'down' : 'up'
    },
    {
      metric: 'On-Time Delivery',
      current: metrics?.onTimeDeliveryRate || 0,
      previous: 87.5,
      change: ((metrics?.onTimeDeliveryRate || 0) - 87.5) / 87.5 * 100,
      trend: (metrics?.onTimeDeliveryRate || 0) > 87.5 ? 'up' : 'down'
    },
    {
      metric: 'Customer Satisfaction',
      current: metrics?.customerSatisfaction || 0,
      previous: 4.0,
      change: ((metrics?.customerSatisfaction || 0) - 4.0) / 4.0 * 100,
      trend: (metrics?.customerSatisfaction || 0) > 4.0 ? 'up' : 'down'
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchMetrics();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const exportData = () => {
    // Mock export functionality
    const csvData = timeSeriesData?.map(item => 
      `${item.date},${item.shipments},${item.revenue},${item.delivered}`
    ).join('\n');
    
    const blob = new Blob([`Date,Shipments,Revenue,Delivered\n${csvData}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}days.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive shipping performance insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalShipments || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Last {dateRange} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.totalRevenue?.toLocaleString()} FCFA
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.avgDeliveryTime || 0} days</div>
                  <p className="text-xs text-muted-foreground">
                    -0.5 days from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.activeShipments || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently in transit
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.onTimeDeliveryRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.customerSatisfaction || 0}/5</div>
                  <p className="text-xs text-muted-foreground">
                    +0.2 from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Volume Trend</CardTitle>
                  <CardDescription>Daily shipment counts over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="shipments" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Daily revenue generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} FCFA`, 'Revenue']} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators with trend analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{metric.metric}</p>
                        <p className="text-2xl font-bold">{metric.current}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${
                          metric.change > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Delivery Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery vs Shipment Rate</CardTitle>
                  <CardDescription>Comparison of shipments created vs delivered</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="shipments" fill="#8884d8" name="Created" />
                      <Bar dataKey="delivered" fill="#82ca9d" name="Delivered" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Trends Analysis</CardTitle>
                <CardDescription>Detailed trend analysis over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="shipments" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Shipments"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Revenue (FCFA)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Current shipment status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {statusData?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Performance</CardTitle>
                  <CardDescription>Performance metrics by region (Mock Data)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { region: 'Centre', shipments: 245, onTime: 92, revenue: 1250000 },
                      { region: 'Littoral', shipments: 189, onTime: 88, revenue: 980000 },
                      { region: 'Ouest', shipments: 156, onTime: 85, revenue: 760000 },
                      { region: 'Nord', shipments: 98, onTime: 78, revenue: 450000 },
                    ].map((region, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{region.region}</h4>
                          <span className="text-sm text-muted-foreground">
                            {region.shipments} shipments
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">On-time rate</p>
                            <p className="font-medium">{region.onTime}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-medium">{region.revenue.toLocaleString()} FCFA</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AnalyticsDashboard;