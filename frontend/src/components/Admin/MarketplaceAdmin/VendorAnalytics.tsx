import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Star,
  AlertTriangle,
  BarChart3,
  Search,
  Download,
  Award,
  DollarSign
} from 'lucide-react';

interface VendorAnalyticsProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
}

interface VendorMetric {
  id: string;
  vendor_id: string;
  metric_type: string;
  metric_value: number;
  period_start: string;
  period_end: string;
  calculated_at: string;
}

interface VendorSummary {
  vendor_id: string;
  business_name: string;
  total_revenue: number;
  total_orders: number;
  avg_rating: number;
  fulfillment_rate: number;
  dispute_count: number;
  performance_score: number;
  status: string;
}

export const VendorAnalytics: React.FC<VendorAnalyticsProps> = ({
  hasPermission,
  logActivity
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [metricType, setMetricType] = useState('total_revenue');
  const [timePeriod, setTimePeriod] = useState('30');

  // Fetch vendor performance metrics
  const { data: vendorMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['vendor-metrics', metricType, timePeriod],
    queryFn: async (): Promise<VendorMetric[]> => {
      const { data, error } = await supabase
        .from('vendor_performance_metrics')
        .select('*')
        .eq('metric_type', metricType)
        .gte('period_start', new Date(Date.now() - parseInt(timePeriod) * 24 * 60 * 60 * 1000).toISOString())
        .order('metric_value', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch vendor summary data
  const { data: vendorSummaries, isLoading: summariesLoading } = useQuery({
    queryKey: ['vendor-summaries', statusFilter, searchTerm],
    queryFn: async (): Promise<VendorSummary[]> => {
      // Mock data for vendor summaries since we need to aggregate from multiple tables
      const mockData: VendorSummary[] = [
        {
          vendor_id: '1',
          business_name: 'Local Crafts Co.',
          total_revenue: 2500000,
          total_orders: 156,
          avg_rating: 4.8,
          fulfillment_rate: 96,
          dispute_count: 2,
          performance_score: 92,
          status: 'excellent'
        },
        {
          vendor_id: '2',
          business_name: 'Village Foods Market',
          total_revenue: 1800000,
          total_orders: 203,
          avg_rating: 4.6,
          fulfillment_rate: 94,
          dispute_count: 1,
          performance_score: 89,
          status: 'good'
        },
        {
          vendor_id: '3',
          business_name: 'Artisan Textiles',
          total_revenue: 950000,
          total_orders: 78,
          avg_rating: 4.3,
          fulfillment_rate: 87,
          dispute_count: 4,
          performance_score: 74,
          status: 'needs_improvement'
        }
      ];

      return mockData.filter(vendor => {
        const matchesSearch = vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }
  });

  // Fetch vendor compliance checks
  const { data: complianceData, isLoading: complianceLoading } = useQuery({
    queryKey: ['vendor-compliance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_compliance_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  const handleExportAnalytics = async (exportType: string) => {
    logActivity('export_vendor_analytics', { exportType, metricType, timePeriod });
    // Implementation for analytics export would go here
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    if (score >= 60) return 'outline';
    return 'destructive';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <Award className="w-4 h-4 text-green-600" />;
      case 'good': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'needs_improvement': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount);
  };

  if (metricsLoading || summariesLoading || complianceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendor Performance Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive vendor performance tracking and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExportAnalytics('performance_report')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Advanced Analytics
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Search Vendors</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by business name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Performance Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Metric Type</label>
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total_revenue">Revenue</SelectItem>
                  <SelectItem value="total_orders">Orders</SelectItem>
                  <SelectItem value="fulfillment_rate">Fulfillment</SelectItem>
                  <SelectItem value="customer_satisfaction">Satisfaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="rankings">Vendor Rankings</TabsTrigger>
        </TabsList>

        {/* Performance Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorSummaries?.slice(0, 5).map((vendor, index) => (
                    <div
                      key={vendor.vendor_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{vendor.business_name}</p>
                            {getStatusIcon(vendor.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {vendor.total_orders} orders • {vendor.avg_rating}/5 rating
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(vendor.total_revenue)}</p>
                        <Badge variant={getPerformanceColor(vendor.performance_score)}>
                          {vendor.performance_score}% score
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Excellent (90-100%)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-3/4 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Good (75-89%)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-1/2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">50%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Needs Improvement (60-74%)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-1/4 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Poor (Below 60%)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-1/12 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Vendor</th>
                      <th className="text-left p-2">Revenue</th>
                      <th className="text-left p-2">Orders</th>
                      <th className="text-left p-2">Rating</th>
                      <th className="text-left p-2">Fulfillment</th>
                      <th className="text-left p-2">Disputes</th>
                      <th className="text-left p-2">Score</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorSummaries?.map((vendor) => (
                      <tr key={vendor.vendor_id} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(vendor.status)}
                            <span className="font-medium">{vendor.business_name}</span>
                          </div>
                        </td>
                        <td className="p-2">{formatCurrency(vendor.total_revenue)}</td>
                        <td className="p-2">{vendor.total_orders}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {vendor.avg_rating}
                          </div>
                        </td>
                        <td className="p-2">{vendor.fulfillment_rate}%</td>
                        <td className="p-2">
                          <Badge variant={vendor.dispute_count > 3 ? 'destructive' : 'outline'}>
                            {vendor.dispute_count}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={getPerformanceColor(vendor.performance_score)}>
                            {vendor.performance_score}%
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Contact
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Status Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <p className="text-sm text-muted-foreground">Fully Compliant</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">12%</div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">3%</div>
                  <p className="text-sm text-muted-foreground">Non-Compliant</p>
                </div>
              </div>

              <div className="space-y-4">
                {complianceData?.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Vendor {check.vendor_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {check.check_type} - {new Date(check.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={check.check_status === 'passed' ? 'default' : 'destructive'}>
                      {check.check_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Rankings Tab */}
        <TabsContent value="rankings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue Leaders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vendorSummaries?.slice(0, 5).map((vendor, index) => (
                    <div key={vendor.vendor_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{vendor.business_name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(vendor.total_revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Satisfaction Leaders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vendorSummaries?.sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 5).map((vendor, index) => (
                    <div key={vendor.vendor_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{vendor.business_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{vendor.avg_rating}</span>
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
  );
};