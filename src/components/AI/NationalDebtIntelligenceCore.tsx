import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DebtDataScraper } from './DebtDataScraper';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Brain, 
  Target,
  BarChart3,
  Zap,
  RefreshCw,
  Calculator,
  PieChart,
  Activity,
  Coins,
  Globe,
  Users,
  Clock,
  Flame,
  Shield,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DebtRecord {
  id: string;
  year: number;
  total_debt_fcfa: number;
  total_debt_usd: number;
  debt_to_gdp_ratio: number;
  monthly_change_percentage: number;
  population: number;
  gdp_fcfa: number;
  created_at: string;
}

interface DebtAlert {
  id: string;
  alert_type: string;
  alert_severity: string;
  alert_title: string;
  alert_description: string;
  current_value: number;
  threshold_value: number;
  created_at: string;
  is_acknowledged: boolean;
}

interface DebtPrediction {
  id: string;
  prediction_date: string;
  predicted_total_debt_fcfa: number;
  predicted_total_debt_usd: number;
  predicted_debt_to_gdp: number;
  confidence_level: number;
  prediction_model: string;
}

interface DebtAnalysisResult {
  trend_analysis: {
    direction: 'increasing' | 'decreasing' | 'stable';
    rate_of_change: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
  };
  sustainability_assessment: {
    score: number;
    factors: string[];
    recommendations: string[];
  };
  civic_impact: {
    per_capita_burden: number;
    service_impact_score: number;
    transparency_score: number;
  };
  ai_insights: string[];
  alert_recommendations: string[];
}

export const NationalDebtIntelligenceCore: React.FC = () => {
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>([]);
  const [debtAlerts, setDebtAlerts] = useState<DebtAlert[]>([]);
  const [predictions, setPredictions] = useState<DebtPrediction[]>([]);
  const [analysis, setAnalysis] = useState<DebtAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('intelligence');
  
  // AI Analysis Form
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [customThreshold, setCustomThreshold] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadDebtIntelligence();
    
    const interval = setInterval(() => {
      loadDebtIntelligence();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const loadDebtIntelligence = async () => {
    setIsProcessing(true);
    try {
      // Load debt records
      const { data: records } = await supabase
        .from('debt_records')
        .select('*')
        .order('year', { ascending: false })
        .limit(10);

      // Load debt alerts
      const { data: alerts } = await supabase
        .from('debt_alerts')
        .select('*')
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(20);

      // Load predictions
      const { data: predictionData } = await supabase
        .from('debt_predictions')
        .select('*')
        .gte('prediction_date', new Date().toISOString().split('T')[0])
        .order('prediction_date', { ascending: true })
        .limit(5);

      setDebtRecords(records || []);
      setDebtAlerts(alerts || []);
      setPredictions(predictionData || []);

      // Run AI analysis if we have data
      if (records && records.length > 0) {
        await runAIAnalysis(records[0]);
      }

      setLastUpdate(new Date());
    } catch (error: any) {
      toast({
        title: 'Data Loading Error',
        description: error.message || 'Failed to load debt intelligence data',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const runAIAnalysis = async (latestRecord: DebtRecord) => {
    try {
      const response = await supabase.functions.invoke('civic-strategist-core', {
        body: { 
          action: 'analyze_debt_intelligence',
          debt_data: {
            latest_record: latestRecord,
            historical_records: debtRecords,
            current_alerts: debtAlerts
          }
        }
      });

      if (response.error) throw response.error;
      
      setAnalysis(response.data.analysis);
      
      // Push critical insights to Civic Alert System
      if (response.data.analysis.trend_analysis.risk_level === 'critical') {
        await pushToCivicAlerts(response.data.analysis);
      }

    } catch (error: any) {
      console.error('AI Analysis failed:', error);
    }
  };

  const pushToCivicAlerts = async (analysisData: DebtAnalysisResult) => {
    try {
      await supabase.functions.invoke('civic-alert-bot', {
        body: {
          alert_type: 'debt_critical',
          severity: 'high',
          title: '🚨 Critical National Debt Alert',
          description: `National debt risk level: ${analysisData.trend_analysis.risk_level}. ${analysisData.alert_recommendations[0] || 'Immediate attention required.'}`,
          source: 'National Debt Intelligence Core',
          affected_regions: ['National'],
          metadata: {
            debt_to_gdp: analysisData.civic_impact.per_capita_burden,
            risk_level: analysisData.trend_analysis.risk_level,
            recommendations: analysisData.sustainability_assessment.recommendations
          }
        }
      });

      toast({
        title: 'Critical Alert Sent',
        description: 'Debt risk alert pushed to Civic Alert System and Pulse Messenger'
      });
    } catch (error: any) {
      console.error('Failed to push alert:', error);
    }
  };

  const runCustomAnalysis = async () => {
    if (!analysisPrompt.trim()) {
      toast({
        title: 'Missing Prompt',
        description: 'Please provide an analysis prompt',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await supabase.functions.invoke('civic-strategist-core', {
        body: { 
          action: 'custom_debt_analysis',
          prompt: analysisPrompt,
          debt_context: {
            latest_data: debtRecords[0],
            alerts: debtAlerts,
            predictions: predictions
          }
        }
      });

      if (response.error) throw response.error;

      toast({
        title: 'Analysis Complete',
        description: 'Custom debt analysis generated successfully'
      });

      setAnalysisPrompt('');
    } catch (error: any) {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to run custom analysis',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const createThresholdAlert = async () => {
    if (!customThreshold.trim()) {
      toast({
        title: 'Missing Threshold',
        description: 'Please specify a debt threshold',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('debt_thresholds')
        .insert([{
          threshold_name: `Custom Alert - ${new Date().toLocaleDateString()}`,
          threshold_type: 'debt_to_gdp',
          threshold_value: parseFloat(customThreshold),
          alert_severity: 'medium',
          description: `Custom threshold set via Debt Intelligence Core`
        }]);

      if (error) throw error;

      toast({
        title: 'Alert Threshold Created',
        description: `New threshold set at ${customThreshold}% debt-to-GDP ratio`
      });

      setCustomThreshold('');
    } catch (error: any) {
      toast({
        title: 'Threshold Creation Failed',
        description: error.message || 'Failed to create alert threshold',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'FCFA') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(amount);
    }
    return new Intl.NumberFormat('en-CM', {
      style: 'decimal',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount) + ` ${currency}`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const latestRecord = debtRecords[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">National Debt Intelligence Core</h2>
            <p className="text-muted-foreground">
              AI-powered debt monitoring, prediction, and civic impact analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button 
            onClick={loadDebtIntelligence}
            disabled={isProcessing}
            size="sm"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Debt</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestRecord ? formatCurrency(latestRecord.total_debt_fcfa) : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestRecord ? formatCurrency(latestRecord.total_debt_usd, 'USD') : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debt-to-GDP Ratio</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestRecord ? latestRecord.debt_to_gdp_ratio : 0}%
            </div>
            <Progress 
              value={latestRecord ? Math.min(latestRecord.debt_to_gdp_ratio, 100) : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{debtAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Threshold violations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Per Capita Debt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestRecord ? formatCurrency(latestRecord.total_debt_fcfa / latestRecord.population) : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">Per citizen burden</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
          <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
          <TabsTrigger value="predictions">Forecasting</TabsTrigger>
          <TabsTrigger value="scraper">Data Scraper</TabsTrigger>
          <TabsTrigger value="analysis">Custom Analysis</TabsTrigger>
        </TabsList>

        {/* AI Intelligence Tab */}
        <TabsContent value="intelligence">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered assessment of debt trajectory and sustainability
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trend Direction:</span>
                      <Badge variant="outline" className="capitalize">
                        {analysis.trend_analysis.direction}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Level:</span>
                      <Badge variant={getSeverityBadge(analysis.trend_analysis.risk_level)}>
                        {analysis.trend_analysis.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rate of Change:</span>
                      <span className={`text-sm font-bold ${getRiskColor(analysis.trend_analysis.risk_level)}`}>
                        {analysis.trend_analysis.rate_of_change > 0 ? '+' : ''}
                        {analysis.trend_analysis.rate_of_change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Sustainability Score</h4>
                      <Progress value={analysis.sustainability_assessment.score} className="mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {analysis.sustainability_assessment.score}/100
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading AI analysis...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Civic Impact Assessment
                </CardTitle>
                <CardDescription>
                  How debt levels affect citizen services and transparency
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Service Impact</span>
                        <span className="text-sm">{analysis.civic_impact.service_impact_score}/100</span>
                      </div>
                      <Progress value={analysis.civic_impact.service_impact_score} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Transparency Score</span>
                        <span className="text-sm">{analysis.civic_impact.transparency_score}/100</span>
                      </div>
                      <Progress value={analysis.civic_impact.transparency_score} />
                    </div>
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">AI Insights</h4>
                      <div className="space-y-1">
                        {analysis.ai_insights.map((insight, index) => (
                          <p key={index} className="text-xs text-muted-foreground">
                            • {insight}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing civic impact...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Debt Risk Alerts
              </CardTitle>
              <CardDescription>
                Threshold violations and risk indicators requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {debtAlerts.length > 0 ? (
                  debtAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="p-2 rounded-lg bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityBadge(alert.alert_severity)}>
                            {alert.alert_severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.alert_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{alert.alert_title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.alert_description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current: </span>
                            <span className="font-medium">{alert.current_value.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Threshold: </span>
                            <span className="font-medium">{alert.threshold_value.toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Send to Alerts
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No active alerts</p>
                    <p className="text-sm text-muted-foreground">
                      All debt metrics are within safe thresholds
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Debt Forecasting
              </CardTitle>
              <CardDescription>
                AI-generated predictions for future debt levels and trajectories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.length > 0 ? (
                  predictions.map((prediction) => (
                    <div key={prediction.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">
                          {new Date(prediction.prediction_date).getFullYear()} Forecast
                        </h4>
                        <Badge variant="outline">
                          {(prediction.confidence_level * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Predicted Debt</p>
                          <p className="font-medium">
                            {formatCurrency(prediction.predicted_total_debt_fcfa)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">USD Equivalent</p>
                          <p className="font-medium">
                            {formatCurrency(prediction.predicted_total_debt_usd, 'USD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Debt-to-GDP</p>
                          <p className="font-medium">{prediction.predicted_debt_to_gdp}%</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={prediction.confidence_level * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Model: {prediction.prediction_model}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No predictions available</p>
                    <p className="text-sm text-muted-foreground">
                      Generate predictions from historical data
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Scraper Tab */}
        <TabsContent value="scraper">
          <DebtDataScraper />
        </TabsContent>

        {/* Custom Analysis Tab */}
        <TabsContent value="analysis">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Custom AI Analysis
                </CardTitle>
                <CardDescription>
                  Ask specific questions about debt data and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., What are the main drivers of debt growth in the last 5 years? How does our debt compare to regional averages?"
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={runCustomAnalysis}
                  disabled={isProcessing || !analysisPrompt.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Create Alert Threshold
                </CardTitle>
                <CardDescription>
                  Set custom debt thresholds for automatic alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Debt-to-GDP Ratio Threshold (%)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 60"
                    value={customThreshold}
                    onChange={(e) => setCustomThreshold(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current ratio: {latestRecord?.debt_to_gdp_ratio}%
                  </p>
                </div>
                <Button 
                  onClick={createThresholdAlert}
                  disabled={!customThreshold.trim()}
                  className="w-full"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Create Alert
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NationalDebtIntelligenceCore;