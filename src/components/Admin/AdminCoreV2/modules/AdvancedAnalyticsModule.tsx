import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sentiment trends
  const { data: sentimentTrends, isLoading: sentimentLoading } = useQuery({
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

  // Fetch predictive models
  const { data: predictiveModels, isLoading: modelsLoading } = useQuery({
    queryKey: ['predictive_models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictive_models')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch real-time data streams
  const { data: realTimeStreams, isLoading: streamsLoading } = useQuery({
    queryKey: ['real_time_data_streams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('real_time_data_streams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch analytics reports
  const { data: customReports, isLoading: reportsLoading } = useQuery({
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

  // Mutations for actions
  const runModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const { data, error } = await supabase
        .from('prediction_results')
        .insert({
          model_id: modelId,
          prediction_type: 'manual_run',
          input_data: { triggered_by: 'admin', timestamp: new Date().toISOString() },
          predicted_value: { status: 'initiated' }
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Model execution initiated", description: "The predictive model is now running." });
      queryClient.invalidateQueries({ queryKey: ['predictive_models'] });
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const { data, error } = await supabase
        .from('analytics_reports')
        .update({ last_generated_at: new Date().toISOString() })
        .eq('id', reportId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Report generated", description: "The analytics report has been generated successfully." });
      queryClient.invalidateQueries({ queryKey: ['analytics_reports'] });
    }
  });

  const handleRunModel = (modelId: string) => {
    runModelMutation.mutate(modelId);
    logActivity('predictive_model_run', { model_id: modelId });
  };

  const handleGenerateReport = (reportId: string) => {
    generateReportMutation.mutate(reportId);
    logActivity('custom_report_generated', { report_id: reportId });
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
          value="12"
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
          value="47"
          icon={Activity}
          description="Real-time data sources"
          badge={{ text: "Active", variant: "default" }}
        />
        <StatCard
          title="Daily Insights"
          value="156"
          icon={Eye}
          trend={{ value: 12.8, isPositive: true, period: "this week" }}
          description="AI-generated insights"
        />
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Models</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Streams</TabsTrigger>
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
              <div className="space-y-4">
                {sentimentTrends.map((trend) => (
                  <div key={trend.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        trend.sentiment === 'positive' ? 'bg-green-100' :
                        trend.sentiment === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <TrendingUp className={`h-6 w-6 ${
                          trend.sentiment === 'positive' ? 'text-green-600' :
                          trend.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{trend.topic}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Score: {trend.score.toFixed(2)}</span>
                          <span>Volume: {trend.volume.toLocaleString()}</span>
                          <span className={`flex items-center gap-1 ${
                            trend.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trend.change > 0 ? '↗' : '↘'} {Math.abs(trend.change).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          trend.sentiment === 'positive' ? 'default' :
                          trend.sentiment === 'negative' ? 'destructive' : 'secondary'
                        }
                      >
                        {trend.sentiment}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Predictive Analytics Models
              </CardTitle>
              <CardDescription>
                Manage AI/ML models for forecasting and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveModels.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{model.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Accuracy: {model.accuracy}%</span>
                          <span>Last run: {model.last_run}</span>
                        </div>
                        <div className="w-40 bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${model.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          model.status === 'active' ? 'default' :
                          model.status === 'training' ? 'secondary' : 'outline'
                        }
                      >
                        {model.status}
                      </Badge>
                      {model.status === 'active' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleRunModel(model.id)}
                        >
                          Run Model
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Data Streams
              </CardTitle>
              <CardDescription>
                Monitor live data feeds and streaming analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realTimeStreams.map((stream) => (
                  <div key={stream.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        stream.status === 'healthy' ? 'bg-green-100' :
                        stream.status === 'delayed' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Activity className={`h-6 w-6 ${
                          stream.status === 'healthy' ? 'text-green-600' :
                          stream.status === 'delayed' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{stream.source}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{stream.events.toLocaleString()} events</span>
                          <span>{stream.rate} rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          stream.status === 'healthy' ? 'default' :
                          stream.status === 'delayed' ? 'secondary' : 'destructive'
                        }
                      >
                        {stream.status}
                      </Badge>
                    </div>
                  </div>
                ))}
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
                {customReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline">{report.type}</Badge>
                          <span>Frequency: {report.frequency}</span>
                          <span>Last: {report.last_generated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleGenerateReport(report.id)}
                      >
                        Generate
                      </Button>
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