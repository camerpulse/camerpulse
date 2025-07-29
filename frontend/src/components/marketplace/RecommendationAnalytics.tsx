import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Users, Target, MousePointer, ShoppingCart, Percent } from 'lucide-react';

interface AnalyticsData {
  clickThroughRate: number;
  conversionRate: number;
  averageOrderValue: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
}

interface AbTestResult {
  group: string;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cvr: number;
  aov: number;
}

interface RecommendationPerformance {
  recommendation_type: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

export function RecommendationAnalytics() {
  const { user, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [abTestResults, setAbTestResults] = useState<AbTestResult[]>([]);
  const [performanceByType, setPerformanceByType] = useState<RecommendationPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const periodDays = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // Fetch overall analytics
      const { data: events, error: eventsError } = await supabase
        .from('recommendation_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .not('user_id', 'eq', isAdmin ? null : user?.id);

      if (eventsError) throw eventsError;

      // Calculate overall metrics
      const totalClicks = events?.filter(e => e.clicked_product_id).length || 0;
      const totalConversions = events?.filter(e => e.converted).length || 0;
      const totalRevenue = events?.reduce((sum, e) => sum + (e.conversion_value || 0), 0) || 0;
      const totalEvents = events?.length || 0;

      const clickThroughRate = totalEvents > 0 ? (totalClicks / totalEvents) * 100 : 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;

      setAnalytics({
        clickThroughRate,
        conversionRate,
        averageOrderValue,
        totalClicks,
        totalConversions,
        totalRevenue
      });

      // Calculate A/B test results
      const abGroups = ['control', 'personalized', 'trending'];
      const abResults = abGroups.map(group => {
        const groupEvents = events?.filter(e => e.ab_test_group === group) || [];
        const clicks = groupEvents.filter(e => e.clicked_product_id).length;
        const conversions = groupEvents.filter(e => e.converted).length;
        const revenue = groupEvents.reduce((sum, e) => sum + (e.conversion_value || 0), 0);
        const ctr = groupEvents.length > 0 ? (clicks / groupEvents.length) * 100 : 0;
        const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
        const aov = conversions > 0 ? revenue / conversions : 0;

        return { group, clicks, conversions, revenue, ctr, cvr, aov };
      });

      setAbTestResults(abResults);

      // Calculate performance by recommendation type
      const types = ['general', 'cross_sell', 'trending', 'similar_users'];
      const typePerformance = types.map(type => {
        const typeEvents = events?.filter(e => e.recommendation_type === type) || [];
        const clicks = typeEvents.filter(e => e.clicked_product_id).length;
        const conversions = typeEvents.filter(e => e.converted).length;
        const revenue = typeEvents.reduce((sum, e) => sum + (e.conversion_value || 0), 0);

        return { recommendation_type: type, clicks, conversions, revenue };
      });

      setPerformanceByType(typePerformance);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (isAdmin || user)) {
      fetchAnalytics();
    }
  }, [user, isAdmin, selectedPeriod]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to view analytics</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recommendation Analytics</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period as '7d' | '30d' | '90d')}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CTR</p>
                    <p className="text-2xl font-bold">{analytics?.clickThroughRate.toFixed(2)}%</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CVR</p>
                    <p className="text-2xl font-bold">{analytics?.conversionRate.toFixed(2)}%</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AOV</p>
                    <p className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF' }).format(analytics?.averageOrderValue || 0)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                    <p className="text-2xl font-bold">{analytics?.totalClicks}</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversions</p>
                    <p className="text-2xl font-bold">{analytics?.totalConversions}</p>
                  </div>
                  <Users className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF' }).format(analytics?.totalRevenue || 0)}</p>
                  </div>
                  <Percent className="h-8 w-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="ab-tests" className="space-y-4">
            <TabsList>
              <TabsTrigger value="ab-tests">A/B Test Results</TabsTrigger>
              <TabsTrigger value="performance">Performance by Type</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="ab-tests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>A/B Test Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={abTestResults}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="group" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="ctr" fill="#8884d8" name="CTR %" />
                        <Bar dataKey="cvr" fill="#82ca9d" name="CVR %" />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {abTestResults.map((result, index) => (
                        <Card key={result.group}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index] }}
                              />
                              {result.group}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">CTR:</span>
                              <span className="font-semibold">{result.ctr.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">CVR:</span>
                              <span className="font-semibold">{result.cvr.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">AOV:</span>
                              <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF' }).format(result.aov)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Revenue:</span>
                              <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF' }).format(result.revenue)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Recommendation Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={performanceByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ recommendation_type, percent }) => `${recommendation_type}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="clicks"
                        >
                          {performanceByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-4">
                      {performanceByType.map((type, index) => (
                        <div key={type.recommendation_type} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium capitalize">{type.recommendation_type.replace('_', ' ')}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{type.clicks} clicks</div>
                            <div className="text-sm text-muted-foreground">{type.conversions} conversions</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <p>Trend analysis coming soon...</p>
                    <p className="text-sm">Daily and hourly performance trends will be available here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}