import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  MapPin, 
  Building2,
  DollarSign,
  Users,
  Calendar,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  top_bidders?: any[];
  regional_breakdown?: any[];
  trend_data?: any[];
  period?: string;
  calculated_at?: string;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export const AdvancedTenderAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<{
    topBidders: AnalyticsData | null;
    regionalStats: AnalyticsData | null;
    tenderTrends: AnalyticsData | null;
  }>({
    topBidders: null,
    regionalStats: null,
    tenderTrends: null
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, selectedRegion, selectedCategory]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch cached analytics or calculate new ones
      const [topBiddersResponse, regionalResponse, trendsResponse] = await Promise.all([
        supabase.rpc('calculate_tender_analytics', {
          p_metric_type: 'top_bidders',
          p_period: selectedPeriod,
          p_region: selectedRegion || null,
          p_category: selectedCategory || null
        }),
        supabase.rpc('calculate_tender_analytics', {
          p_metric_type: 'regional_stats',
          p_period: selectedPeriod,
          p_region: selectedRegion || null,
          p_category: selectedCategory || null
        }),
        supabase.rpc('calculate_tender_analytics', {
          p_metric_type: 'tender_trends',
          p_period: selectedPeriod,
          p_region: selectedRegion || null,
          p_category: selectedCategory || null
        })
      ]);

      setAnalytics({
        topBidders: topBiddersResponse.data as AnalyticsData,
        regionalStats: regionalResponse.data as AnalyticsData,
        tenderTrends: trendsResponse.data as AnalyticsData
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    await supabase.rpc('update_tender_analytics_cache');
    fetchAnalytics();
    toast({
      title: "Success",
      description: "Analytics refreshed successfully",
    });
  };

  const TopBiddersSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Top Bidders
        </CardTitle>
        <CardDescription>Most active bidding companies and success rates</CardDescription>
      </CardHeader>
      <CardContent>
        {analytics.topBidders?.top_bidders ? (
          <div className="space-y-4">
            {analytics.topBidders.top_bidders.map((bidder: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{bidder.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {bidder.bids_count} bids submitted
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {Math.round(bidder.success_rate * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No bidder data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const RegionalStatsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Regional Statistics
        </CardTitle>
        <CardDescription>Tender distribution and activity by region</CardDescription>
      </CardHeader>
      <CardContent>
        {analytics.regionalStats?.regional_breakdown ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.regionalStats.regional_breakdown.map((region: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-semibold text-lg">{region.region}</h4>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Tenders</span>
                    <span className="font-semibold">{region.total_tenders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-semibold text-green-600">{region.active_tenders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Closed</span>
                    <span className="font-semibold text-blue-600">{region.closed_tenders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Budget</span>
                    <span className="font-semibold">
                      {region.avg_budget ? `${Math.round(region.avg_budget).toLocaleString()} FCFA` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No regional data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const TrendsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Tender Trends
        </CardTitle>
        <CardDescription>Historical trends and patterns</CardDescription>
      </CardHeader>
      <CardContent>
        {analytics.tenderTrends?.trend_data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold">
                  {analytics.tenderTrends.trend_data.length}
                </div>
                <div className="text-sm text-muted-foreground">Data Points</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.tenderTrends.trend_data.reduce((sum: number, item: any) => sum + item.count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Tenders</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    analytics.tenderTrends.trend_data.reduce((sum: number, item: any) => sum + (item.avg_budget || 0), 0) /
                    analytics.tenderTrends.trend_data.length
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Avg Budget FCFA</div>
              </div>
            </div>

            <div className="space-y-3">
              {analytics.tenderTrends.trend_data.slice(0, 10).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">
                      <span className="font-semibold">{item.count}</span> tenders
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.avg_budget ? `${Math.round(item.avg_budget).toLocaleString()} FCFA avg` : 'No budget data'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No trend data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
            Advanced Tender Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive analytics for tender platform performance
          </p>
        </div>
        <Button onClick={refreshAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Regions</SelectItem>
                {CAMEROON_REGIONS.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSelectedRegion('');
              setSelectedCategory('');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bidders">Top Bidders</TabsTrigger>
          <TabsTrigger value="regional">Regional Stats</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active Tenders</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Bidders</p>
                    <p className="text-2xl font-bold">89</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">2.3B</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">67%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopBiddersSection />
            <RegionalStatsSection />
          </div>
        </TabsContent>

        <TabsContent value="bidders">
          <TopBiddersSection />
        </TabsContent>

        <TabsContent value="regional">
          <RegionalStatsSection />
        </TabsContent>

        <TabsContent value="trends">
          <TrendsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};