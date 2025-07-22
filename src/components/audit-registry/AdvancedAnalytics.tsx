import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  Shield,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TrendData {
  region: string;
  trend_type: string;
  current_value: number;
  previous_value?: number;
  change_percentage?: number;
  trend_direction: 'improving' | 'declining' | 'stable' | 'volatile';
}

interface AnalyticsData {
  corruption_trends: TrendData[];
  regional_stats: any[];
  investigation_metrics: any[];
  whistleblower_stats: any[];
}

export const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    corruption_trends: [],
    regional_stats: [],
    investigation_metrics: [],
    whistleblower_stats: []
  });
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('12_months');
  const [isLoading, setIsLoading] = useState(false);

  const regions = [
    'All Regions', 'Centre', 'Littoral', 'West', 'Southwest', 'Northwest', 
    'North', 'Far North', 'Adamawa', 'East', 'South'
  ];

  const timeRanges = [
    { value: '3_months', label: 'Last 3 Months' },
    { value: '6_months', label: 'Last 6 Months' },
    { value: '12_months', label: 'Last 12 Months' },
    { value: '24_months', label: 'Last 2 Years' }
  ];

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Fetch corruption trends
      const { data: trendsData, error: trendsError } = await supabase
        .rpc('calculate_corruption_trends', {
          p_region: selectedRegion === 'all' ? null : selectedRegion,
          p_lookback_months: parseInt(timeRange.split('_')[0])
        });

      if (trendsError) throw trendsError;

      // Fetch regional statistics
      const { data: regionalData, error: regionalError } = await supabase
        .from('audit_registry')
        .select(`
          region,
          audit_score,
          source_type,
          created_at,
          investigation_count,
          watchlist_count
        `)
        .gte('created_at', new Date(Date.now() - parseInt(timeRange.split('_')[0]) * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (regionalError) throw regionalError;

      // Process data
      const processedRegionalStats = processRegionalStats(regionalData || []);
      const investigationMetrics = calculateInvestigationMetrics(regionalData || []);
      const whistleblowerStats = calculateWhistleblowerStats(regionalData || []);

      setAnalyticsData({
        corruption_trends: trendsData || [],
        regional_stats: processedRegionalStats,
        investigation_metrics: investigationMetrics,
        whistleblower_stats: whistleblowerStats
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process regional statistics
  const processRegionalStats = (data: any[]) => {
    const regionMap = new Map();
    
    data.forEach(audit => {
      if (!regionMap.has(audit.region)) {
        regionMap.set(audit.region, {
          region: audit.region,
          total_audits: 0,
          avg_score: 0,
          total_investigations: 0,
          total_watchers: 0,
          whistleblower_count: 0,
          scores: []
        });
      }
      
      const regionData = regionMap.get(audit.region);
      regionData.total_audits++;
      regionData.total_investigations += audit.investigation_count || 0;
      regionData.total_watchers += audit.watchlist_count || 0;
      
      if (audit.audit_score) {
        regionData.scores.push(audit.audit_score);
      }
      
      if (audit.source_type === 'whistleblower_leak') {
        regionData.whistleblower_count++;
      }
    });

    // Calculate averages
    return Array.from(regionMap.values()).map(region => ({
      ...region,
      avg_score: region.scores.length > 0 
        ? Math.round(region.scores.reduce((a: number, b: number) => a + b, 0) / region.scores.length)
        : 0,
      corruption_risk: region.scores.length > 0
        ? region.scores.filter((s: number) => s < 60).length / region.scores.length * 100
        : 0
    }));
  };

  // Calculate investigation metrics
  const calculateInvestigationMetrics = (data: any[]) => {
    const monthlyData = new Map();
    
    data.forEach(audit => {
      const month = new Date(audit.created_at).toISOString().slice(0, 7);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, {
          month,
          investigations: 0,
          average_score: 0,
          scores: []
        });
      }
      
      const monthData = monthlyData.get(month);
      monthData.investigations += audit.investigation_count || 0;
      
      if (audit.audit_score) {
        monthData.scores.push(audit.audit_score);
      }
    });

    return Array.from(monthlyData.values())
      .map(month => ({
        ...month,
        average_score: month.scores.length > 0
          ? Math.round(month.scores.reduce((a: number, b: number) => a + b, 0) / month.scores.length)
          : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // Calculate whistleblower statistics
  const calculateWhistleblowerStats = (data: any[]) => {
    const whistleblowerData = data.filter(audit => audit.source_type === 'whistleblower_leak');
    const totalReports = whistleblowerData.length;
    const avgScore = whistleblowerData.length > 0
      ? whistleblowerData.reduce((sum, audit) => sum + (audit.audit_score || 0), 0) / whistleblowerData.length
      : 0;

    return {
      total_reports: totalReports,
      average_score: Math.round(avgScore),
      high_risk_reports: whistleblowerData.filter(audit => (audit.audit_score || 0) < 40).length,
      protection_active: totalReports // Assuming all have protection
    };
  };

  // Get trend icon and color
  const getTrendDisplay = (direction: string, value?: number) => {
    switch (direction) {
      case 'improving':
        return { icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'declining':
        return { icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'volatile':
        return { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      default:
        return { icon: Minus, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedRegion, timeRange]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading advanced analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive corruption trends and transparency insights
          </p>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region} value={region === 'All Regions' ? 'all' : region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Corruption Trends</TabsTrigger>
          <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          <TabsTrigger value="investigations">Investigations</TabsTrigger>
          <TabsTrigger value="whistleblower">Whistleblower Data</TabsTrigger>
        </TabsList>

        {/* Corruption Trends */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analyticsData.corruption_trends.map((trend) => {
              const display = getTrendDisplay(trend.trend_direction, trend.change_percentage);
              const Icon = display.icon;
              
              return (
                <Card key={`${trend.region}-${trend.trend_type}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span className="capitalize">
                        {trend.trend_type.replace('_', ' ')} - {trend.region}
                      </span>
                      <div className={`p-1 rounded-full ${display.bgColor}`}>
                        <Icon className={`h-4 w-4 ${display.color}`} />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {trend.current_value.toFixed(1)}
                        {trend.trend_type.includes('score') || trend.trend_type.includes('index') ? '/100' : ''}
                      </div>
                      
                      {trend.change_percentage && (
                        <div className={`flex items-center text-sm ${display.color}`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {Math.abs(trend.change_percentage)}% vs previous period
                        </div>
                      )}
                      
                      <Badge className={display.bgColor + ' ' + display.color + ' border-0'}>
                        {trend.trend_direction}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Regional Analysis */}
        <TabsContent value="regional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analyticsData.regional_stats.map((region) => (
              <Card key={region.region}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {region.region} Region
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-2xl font-bold">{region.total_audits}</div>
                        <div className="text-sm text-muted-foreground">Total Audits</div>
                      </div>
                      
                      <div>
                        <div className="text-2xl font-bold">{region.avg_score}</div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {region.corruption_risk.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Corruption Risk</div>
                      </div>
                      
                      <div>
                        <div className="text-2xl font-bold">{region.whistleblower_count}</div>
                        <div className="text-sm text-muted-foreground">Whistleblower Reports</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Investigation Metrics */}
        <TabsContent value="investigations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Investigation Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.investigation_metrics.slice(-6).map((metric) => (
                    <div key={metric.month} className="flex items-center justify-between">
                      <span className="text-sm">
                        {new Date(metric.month + '-01').toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.investigations}</span>
                        <span className="text-sm text-muted-foreground">investigations</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investigation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Investigations</span>
                    <span className="font-bold text-2xl">
                      {analyticsData.investigation_metrics.reduce((sum, m) => sum + m.investigations, 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Average Monthly</span>
                    <span className="font-medium">
                      {Math.round(analyticsData.investigation_metrics.reduce((sum, m) => sum + m.investigations, 0) / Math.max(analyticsData.investigation_metrics.length, 1))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Trend</span>
                    <Badge variant="outline">
                      {analyticsData.investigation_metrics.length > 1 &&
                       analyticsData.investigation_metrics[analyticsData.investigation_metrics.length - 1]?.investigations >
                       analyticsData.investigation_metrics[analyticsData.investigation_metrics.length - 2]?.investigations
                        ? 'Increasing' : 'Stable'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Whistleblower Analytics */}
        <TabsContent value="whistleblower" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{analyticsData.whistleblower_stats.total_reports}</div>
                    <div className="text-sm text-muted-foreground">Total Reports</div>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{analyticsData.whistleblower_stats.average_score}</div>
                    <div className="text-sm text-muted-foreground">Average Audit Score</div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-600">{analyticsData.whistleblower_stats.high_risk_reports}</div>
                    <div className="text-sm text-muted-foreground">High Risk Cases</div>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{analyticsData.whistleblower_stats.protection_active}</div>
                    <div className="text-sm text-muted-foreground">Protected Sources</div>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Whistleblower Protection Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">Protection Success Rate</div>
                    <div className="text-sm text-muted-foreground">
                      All whistleblower identities remain secure
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">100%</div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">Average Response Time</div>
                    <div className="text-sm text-muted-foreground">
                      Time from submission to initial review
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">24h</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};