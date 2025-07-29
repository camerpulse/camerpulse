import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  BarChart3, TrendingUp, Brain, Zap, Eye, Target, 
  AlertCircle, Activity, Layers, Database, Clock, LineChart
} from 'lucide-react';

interface AdvancedAnalyticsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const AdvancedAnalyticsModule: React.FC<AdvancedAnalyticsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('sentiment');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch sentiment trends
  const { data: sentimentTrends = [], isLoading: sentimentLoading } = useQuery({
    queryKey: ['sentiment_trends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sentiment_trends')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch trending topics
  const { data: trendingTopics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['trending_topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch analytics reports
  const { data: customReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['analytics_reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  const runPredictiveAnalysis = async () => {
    try {
      setIsLoading(true);
      
      // Call AI sentiment analyzer edge function
      const { data, error } = await supabase.functions.invoke('ai-sentiment-analyzer', {
        body: {
          text: 'Sample civic complaint for analysis',
          source: 'admin_manual_run',
          region: 'Douala',
          language: 'en'
        }
      });

      if (error) throw error;
      toast.success("Predictive analysis completed successfully");
      queryClient.invalidateQueries({ queryKey: ['sentiment_trends'] });
    } catch (error) {
      console.error('Error running analysis:', error);
      toast.error("Failed to run predictive analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      setIsLoading(true);
      
      // Call AI insights generator edge function
      const { data, error } = await supabase.functions.invoke('ai-insights-generator', {
        body: {
          sources: ['civic_complaints', 'sentiment_trends', 'polls']
        }
      });

      if (error) throw error;
      toast.success("AI insights generated successfully");
      queryClient.invalidateQueries({ queryKey: ['ai_insights'] });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error("Failed to generate insights");
    } finally {
      setIsLoading(false);
    }
  };

  const detectTrends = async () => {
    try {
      setIsLoading(true);
      
      // Call trend detector edge function
      const { data, error } = await supabase.functions.invoke('trend-detector', {
        body: {
          timeframe: '24h',
          threshold_multiplier: 2.0
        }
      });

      if (error) throw error;
      toast.success("Trend detection completed successfully");
      queryClient.invalidateQueries({ queryKey: ['trending_topics'] });
    } catch (error) {
      console.error('Error detecting trends:', error);
      toast.error("Failed to detect trends");
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('analytics_reports')
        .update({ last_generated_at: new Date().toISOString() })
        .eq('id', reportId);
      
      if (error) throw error;
      toast.success("Report generated successfully");
      queryClient.invalidateQueries({ queryKey: ['analytics_reports'] });
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Failed to generate report");
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Advanced Analytics & Intelligence"
        description="AI-powered analytics, predictive modeling and real-time intelligence"
        icon={Brain}
        iconColor="text-purple-600"
        badge={{
          text: "AI Powered",
          variant: "default"
        }}
        searchPlaceholder="Search analytics, models, reports..."
        onSearch={(query) => {
          console.log('Searching analytics:', query);
        }}
        onRefresh={() => {
          logActivity('advanced_analytics_refresh', { timestamp: new Date() });
        }}
      />

      {/* Advanced Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Models"
          value="4"
          icon={Brain}
          description="AI/ML models running"
          badge={{ text: "Healthy", variant: "default" }}
        />
        <StatCard
          title="Prediction Accuracy"
          value="89.4%"
          icon={Target}
          trend={{ value: 2.1, isPositive: true, period: "this week" }}
          description="Average model accuracy"
        />
        <StatCard
          title="Data Streams"
          value="12"
          icon={Activity}
          description="Real-time data sources"
          badge={{ text: "Active", variant: "default" }}
        />
        <StatCard
          title="Daily Insights"
          value={sentimentTrends.length.toString()}
          icon={Eye}
          trend={{ value: 12.8, isPositive: true, period: "this week" }}
          description="AI-generated insights"
        />
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="predictive">AI Processing</TabsTrigger>
          <TabsTrigger value="realtime">Trend Detection</TabsTrigger>
          <TabsTrigger value="reports">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sentiment Trends & Analysis
              </CardTitle>
              <CardDescription>
                Monitor public sentiment across different topics and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentimentLoading ? (
                <div className="text-center py-8">Loading sentiment data...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-medium text-sm text-muted-foreground">Positive</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {sentimentTrends.filter(t => t.sentiment_score > 0.6).length}
                      </p>
                      <p className="text-xs text-muted-foreground">+{sentimentTrends.filter(t => t.sentiment_score > 0.6).length} trending</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-medium text-sm text-muted-foreground">Negative</h4>
                      <p className="text-2xl font-bold text-red-600">
                        {sentimentTrends.filter(t => t.sentiment_score < 0.4).length}
                      </p>
                      <p className="text-xs text-muted-foreground">{sentimentTrends.filter(t => t.sentiment_score < 0.4).length} declining</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-medium text-sm text-muted-foreground">Total Volume</h4>
                      <p className="text-2xl font-bold">{sentimentTrends.length}</p>
                      <p className="text-xs text-muted-foreground">+{sentimentTrends.length} mentions</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <h4 className="font-medium text-sm text-muted-foreground">Velocity</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {(sentimentTrends.reduce((sum, t) => sum + t.sentiment_score, 0) / sentimentTrends.length || 0).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">{sentimentTrends.filter(t => t.sentiment_score > 0.7).length} accelerating</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Recent Sentiment Trends</h4>
                    <div className="space-y-2">
                      {sentimentTrends.slice(0, 5).map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          <div>
                            <h4 className="font-medium">{trend.topic}</h4>
                            <p className="text-sm text-muted-foreground">
                              Score: {(trend.sentiment_score * 100).toFixed(0)}%
                            </p>
                          </div>
                          <Badge variant={trend.sentiment_score > 0.6 ? "default" : trend.sentiment_score < 0.4 ? "destructive" : "secondary"}>
                            {trend.sentiment_score > 0.6 ? "Positive" : trend.sentiment_score < 0.4 ? "Negative" : "Neutral"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Processing & Analysis
              </CardTitle>
              <CardDescription>
                Run AI-powered analysis and generate insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={runPredictiveAnalysis} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    {isLoading ? "Analyzing..." : "Run Sentiment Analysis"}
                  </Button>
                  
                  <Button 
                    onClick={generateInsights} 
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {isLoading ? "Generating..." : "Generate AI Insights"}
                  </Button>
                  
                  <Button 
                    onClick={detectTrends} 
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    {isLoading ? "Detecting..." : "Detect Trends"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-card p-4 rounded-lg border">
                    <h4 className="font-medium text-sm text-muted-foreground">Sentiment Analyzer</h4>
                    <p className="text-lg font-bold text-blue-600">Ready</p>
                    <p className="text-xs text-muted-foreground">AI model active</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <h4 className="font-medium text-sm text-muted-foreground">Insight Generator</h4>
                    <p className="text-lg font-bold text-green-600">Ready</p>
                    <p className="text-xs text-muted-foreground">AI model active</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <h4 className="font-medium text-sm text-muted-foreground">Trend Detector</h4>
                    <p className="text-lg font-bold text-purple-600">Ready</p>
                    <p className="text-xs text-muted-foreground">AI model active</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <h4 className="font-medium text-sm text-muted-foreground">Stream Processor</h4>
                    <p className="text-lg font-bold text-orange-600">Ready</p>
                    <p className="text-xs text-muted-foreground">Real-time processing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Trending Topics Detection
              </CardTitle>
              <CardDescription>
                Monitor emerging trends and topic popularity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingTopics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No trending topics detected. Run trend detection to analyze data.
                  </div>
                ) : (
                  trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{topic.topic_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Score: {topic.trending_score} | Mentions: {topic.mention_count}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          topic.trending_score > 50 ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <Badge variant={topic.trending_score > 50 ? 'default' : 'secondary'}>
                          {topic.trending_score > 50 ? 'Hot' : 'Emerging'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Custom Analytics Reports
              </CardTitle>
              <CardDescription>
                Generate and schedule custom analytical reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No custom reports available. Create reports to analyze data patterns.
                  </div>
                ) : (
                  customReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{report.report_name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <Badge variant="outline">{report.report_type}</Badge>
                            <span>Status: {report.status}</span>
                            <span>Last: {report.last_generated_at ? new Date(report.last_generated_at).toLocaleDateString() : 'Never'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => generateReport(report.id)}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};