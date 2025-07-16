import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar, 
  DollarSign,
  Globe,
  FileText,
  Download,
  ExternalLink,
  Brain,
  BookOpen,
  Zap,
  Activity,
  Target,
  Users,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Globe2,
  MessageSquare,
  Clock,
  TrendingUp as TrendingUpIcon,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DebtRecord {
  id: string;
  year: number;
  total_debt_fcfa: number;
  total_debt_usd: number;
  domestic_debt_fcfa?: number;
  external_debt_fcfa?: number;
  internal_debt_fcfa?: number;
  debt_breakdown?: any;
  debt_to_gdp_ratio?: number;
  gdp_value_fcfa?: number;
  gdp_fcfa?: number;
  population_count?: number;
  population?: number;
  monthly_change_percentage?: number;
  ai_analysis_summary?: string;
  risk_level?: string;
  milestone_events?: any[];
  prediction_data?: any;
  last_updated?: string;
  updated_at?: string;
  source_id?: string;
  created_by?: string;
  verified?: boolean;
  debt_sources?: Array<{
    name: string;
    logo_url?: string;
  }> | null;
  debt_lenders?: Array<{
    lender_name: string;
    amount_fcfa: number;
  }>;
}

interface DebtAlert {
  id: string;
  alert_type: string;
  alert_severity: string;
  alert_title: string;
  alert_description: string;
  current_value: number;
  threshold_value: number;
  is_acknowledged: boolean;
  created_at: string;
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

interface CountryComparison {
  country_name: string;
  country_code: string;
  debt_to_gdp_ratio: number;
  debt_per_capita_usd: number;
  total_debt_usd: number;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  difficulty_level: string;
  reading_time_minutes: number;
  view_count: number;
}

interface DebtSource {
  id: string;
  source_name?: string;
  name?: string;
  source_logo_url?: string;
  logo_url?: string;
  is_verified?: boolean;
  is_active?: boolean;
  acronym?: string;
  website_url?: string;
  description?: string;
}

const NationalDebtTracker = () => {
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>([]);
  const [debtSources, setDebtSources] = useState<DebtSource[]>([]);
  const [debtAlerts, setDebtAlerts] = useState<DebtAlert[]>([]);
  const [debtPredictions, setDebtPredictions] = useState<DebtPrediction[]>([]);
  const [countryComparisons, setCountryComparisons] = useState<CountryComparison[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchDebtData(),
        fetchDebtSources(),
        fetchDebtAlerts(),
        fetchPredictions(),
        fetchCountryComparisons(),
        fetchKnowledgeArticles()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      toast.error('Failed to load debt intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDebtData = async () => {
    try {
      console.log('Starting debt data fetch...');
      const { data, error } = await supabase
        .from('debt_records')
        .select('*')
        .order('year', { ascending: false });

      console.log('Debt data fetch response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Transform and validate the data
      const transformedData = (data || []).map(record => ({
        ...record,
        milestone_events: Array.isArray(record.milestone_events) 
          ? record.milestone_events 
          : record.milestone_events 
            ? (typeof record.milestone_events === 'string' ? JSON.parse(record.milestone_events) : record.milestone_events)
            : [],
        // Ensure numeric values are valid
        total_debt_fcfa: Number(record.total_debt_fcfa) || 0,
        total_debt_usd: Number(record.total_debt_usd) || 0,
        debt_to_gdp_ratio: Number(record.debt_to_gdp_ratio) || 0,
        monthly_change_percentage: Number(record.monthly_change_percentage) || 0,
        domestic_debt_fcfa: Number(record.domestic_debt_fcfa) || Number(record.internal_debt_fcfa) || 0,
        external_debt_fcfa: Number(record.external_debt_fcfa) || 0,
        population_count: Number(record.population_count) || Number(record.population) || 27000000,
        gdp_value_fcfa: Number(record.gdp_value_fcfa) || Number(record.gdp_fcfa) || 0
      })) as DebtRecord[];
      
      console.log('Transformed data:', transformedData);
      setDebtRecords(transformedData);
      toast.success(`Loaded ${transformedData.length} debt records`);
    } catch (error) {
      console.error('Error fetching debt data:', error);
      toast.error(`Failed to fetch debt data: ${error.message}`);
    }
  };

  const fetchDebtSources = async () => {
    try {
      const { data, error } = await supabase
        .from('debt_sources')
        .select('*')
        .order('name');

      if (error) throw error;
      setDebtSources(data || []);
    } catch (error) {
      console.error('Error fetching debt sources:', error);
      toast.error('Failed to fetch debt sources');
    }
  };

  const fetchDebtAlerts = async () => {
    const { data, error } = await supabase
      .from('debt_alerts')
      .select('*')
      .eq('is_acknowledged', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    setDebtAlerts(data || []);
  };

  const fetchPredictions = async () => {
    const { data, error } = await supabase
      .from('debt_predictions')
      .select('*')
      .order('prediction_date', { ascending: true });

    if (error) throw error;
    setDebtPredictions(data || []);
  };

  const fetchCountryComparisons = async () => {
    const { data, error } = await supabase
      .from('debt_country_comparisons')
      .select('*')
      .eq('year', 2023)
      .order('debt_to_gdp_ratio', { ascending: false });

    if (error) throw error;
    setCountryComparisons(data || []);
  };

  const fetchKnowledgeArticles = async () => {
    const { data, error } = await supabase
      .from('debt_knowledge_articles')
      .select('id, title, slug, summary, category, difficulty_level, reading_time_minutes, view_count')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(6);

    if (error) throw error;
    setKnowledgeArticles(data || []);
  };

  // Calculate debt metrics with safe fallbacks
  const latestRecord = debtRecords[0];
  const population = latestRecord?.population_count || 27000000;
  const debtPerCapitaFCFA = latestRecord ? Math.round(latestRecord.total_debt_fcfa / population) : 0;
  const debtPerCapitaUSD = latestRecord ? Math.round(latestRecord.total_debt_usd / population) : 0;
  
  // Calculate year-over-year change with validation
  const previousRecord = debtRecords[1];
  const yearOverYearChange = latestRecord && previousRecord && previousRecord.total_debt_usd > 0
    ? ((latestRecord.total_debt_usd - previousRecord.total_debt_usd) / previousRecord.total_debt_usd) * 100
    : 0;

  // Risk level color mapping
  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'critical': return 'text-destructive';
      case 'warning': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-primary';
    }
  };

  const getRiskBadgeVariant = (level?: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  // Prepare chart data with proper validation
  const chartData = debtRecords
    .slice()
    .reverse()
    .filter(record => record.year && record.total_debt_usd)
    .map(record => ({
      year: record.year,
      totalDebtUSD: Math.round((record.total_debt_usd || 0) / 1000000),
      domesticDebt: Math.round((record.domestic_debt_fcfa || 0) / 600000000),
      externalDebt: Math.round((record.external_debt_fcfa || 0) / 600000000),
      debtToGDP: record.debt_to_gdp_ratio || 0,
      type: 'actual'
    }))
    .filter(item => item.totalDebtUSD > 0);

  // Add predictions to chart data with validation
  const predictionData = debtPredictions
    .filter(pred => pred.predicted_total_debt_usd && pred.prediction_date)
    .map(pred => ({
      year: new Date(pred.prediction_date).getFullYear(),
      totalDebtUSD: Math.round((pred.predicted_total_debt_usd || 0) / 1000000),
      debtToGDP: pred.predicted_debt_to_gdp || 0,
      confidence: pred.confidence_level || 0,
      type: 'prediction'
    }))
    .filter(item => !isNaN(item.year) && item.totalDebtUSD > 0);

  const combinedChartData = [...chartData, ...predictionData];

  // Prepare pie chart data with validation
  const pieData = latestRecord?.debt_lenders?.filter(lender => 
    lender.lender_name && lender.amount_fcfa && lender.amount_fcfa > 0
  ).map(lender => ({
    name: lender.lender_name,
    value: lender.amount_fcfa,
    percentage: latestRecord.total_debt_fcfa > 0 
      ? ((lender.amount_fcfa / latestRecord.total_debt_fcfa) * 100).toFixed(1)
      : '0'
  })) || [];

  // Country comparison chart data with validation
  const comparisonData = countryComparisons
    .filter(country => country.country_name && !isNaN(country.debt_to_gdp_ratio))
    .map(country => ({
      country: country.country_name,
      debtToGDP: country.debt_to_gdp_ratio || 0,
      debtPerCapita: country.debt_per_capita_usd || 0
    }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading intelligence dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              📉 National Debt Intelligence
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            AI-powered economic transparency system tracking Cameroon's national debt with real-time insights, predictions, and civic intelligence
          </p>
        </div>

        {/* Critical Alerts Banner */}
        {debtAlerts.filter(alert => alert.alert_severity === 'critical').length > 0 && (
          <Alert variant="destructive" className="border-l-4 border-l-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {debtAlerts.filter(alert => alert.alert_severity === 'critical').length} critical debt threshold(s) exceeded
              </span>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("alerts")}>
                View Alerts
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* AI Intelligence Summary */}
        {latestRecord?.ai_analysis_summary && (
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                CamerPulse Intelligence Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{latestRecord.ai_analysis_summary}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={getRiskBadgeVariant(latestRecord.risk_level)}>
                  {latestRecord.risk_level?.toUpperCase()} RISK
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Last analysis: {new Date(latestRecord.last_updated).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Debt (FCFA)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestRecord ? `${(latestRecord.total_debt_fcfa / 1e12).toFixed(1)}T` : 'N/A'}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {yearOverYearChange > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                )}
                <span className={`text-xs font-medium ${yearOverYearChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.abs(yearOverYearChange).toFixed(1)}% from last year
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {latestRecord ? new Date(latestRecord.last_updated || latestRecord.updated_at || '').toLocaleDateString() : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Debt (USD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${latestRecord ? `${(latestRecord.total_debt_usd / 1e9).toFixed(1)}B` : 'N/A'}
              </div>
              {latestRecord?.debt_to_gdp_ratio && (
                <div className="mt-2">
                  <Progress value={latestRecord.debt_to_gdp_ratio} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {latestRecord.debt_to_gdp_ratio}% of GDP
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Exchange rate: 1 USD = 600 FCFA
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Debt per Citizen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${debtPerCapitaUSD.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {debtPerCapitaFCFA.toLocaleString()} FCFA per person
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Population: {(population / 1e6).toFixed(1)}M people
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRiskColor(latestRecord?.risk_level)}`}>
                {latestRecord?.risk_level?.toUpperCase() || 'NORMAL'}
              </div>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-xs">
                  <span>Internal:</span>
                  <span className="font-medium">
                    {latestRecord ? `${((latestRecord.domestic_debt_fcfa / latestRecord.total_debt_fcfa) * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>External:</span>
                  <span className="font-medium">
                    {latestRecord ? `${((latestRecord.external_debt_fcfa / latestRecord.total_debt_fcfa) * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="learn">Knowledge Hub</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Historical Debt Trend with Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5" />
                    Debt Timeline with 3-Year Forecast
                  </CardTitle>
                  <CardDescription>
                    Historical debt evolution and AI predictions (USD millions)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {combinedChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={combinedChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `$${value}M`, 
                            name === 'totalDebtUSD' ? (
                              combinedChartData.find(d => d.totalDebtUSD === value)?.type === 'prediction' ? 'Predicted Debt' : 'Actual Debt'
                            ) : name
                          ]} 
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="totalDebtUSD" 
                          stroke="#8884d8" 
                          strokeWidth={3}
                          name="Total Debt (USD)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="debtToGDP" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          name="Debt-to-GDP %"
                          yAxisId="right"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                      No chart data available
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Dashed lines indicate AI predictions • Confidence levels vary by timeframe
                  </div>
                </CardContent>
              </Card>

              {/* Debt Breakdown Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Current Debt Breakdown by Lender
                  </CardTitle>
                  <CardDescription>
                    Distribution of debt by major creditors ({latestRecord?.year || 'Latest'})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${((value as number) / 1e12).toFixed(2)}T FCFA`, 'Amount']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No lender breakdown data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Country Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe2 className="h-5 w-5" />
                  Regional Debt Comparison (2023)
                </CardTitle>
                <CardDescription>
                  How Cameroon compares to other West/Central African countries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {comparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="debtToGDP" fill="#8884d8" name="Debt-to-GDP %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No comparison data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  CamerPulse Intelligence Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered insights and economic analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced AI Analysis Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Our AI system will analyze debt patterns, predict economic trends, and provide actionable insights for policymakers and citizens.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Debt Monitoring Alerts
                </CardTitle>
                <CardDescription>
                  Active alerts based on predefined thresholds
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debtAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {debtAlerts.map((alert) => (
                      <Alert 
                        key={alert.id} 
                        variant={alert.alert_severity === 'critical' ? 'destructive' : 'default'}
                        className="border-l-4"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <div className="space-y-1">
                          <div className="font-semibold">{alert.alert_title}</div>
                          <div className="text-sm">{alert.alert_description}</div>
                          <div className="text-xs text-muted-foreground">
                            Created: {new Date(alert.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                    <p className="text-muted-foreground">
                      No active debt alerts. All thresholds are within safe limits.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Debt Forecasting Model
                </CardTitle>
                <CardDescription>
                  AI-generated predictions based on historical trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debtPredictions.length > 0 ? (
                  <div className="space-y-4">
                    {debtPredictions.slice(0, 3).map((prediction) => (
                      <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-semibold">
                            {new Date(prediction.prediction_date).getFullYear()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Predicted: ${(prediction.predicted_total_debt_usd / 1e9).toFixed(1)}B USD
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Debt-to-GDP: {prediction.predicted_debt_to_gdp}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {(prediction.confidence_level * 100).toFixed(0)}% confidence
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {prediction.prediction_model}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Generating Predictions</h3>
                    <p className="text-muted-foreground">
                      AI models are analyzing historical data to generate debt forecasts.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Hub Tab */}
          <TabsContent value="learn" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Debt Knowledge Hub
                </CardTitle>
                <CardDescription>
                  Learn about national debt, economics, and Cameroon's financial landscape
                </CardDescription>
              </CardHeader>
              <CardContent>
                {knowledgeArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {knowledgeArticles.map((article) => (
                      <Card key={article.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {article.reading_time_minutes} min read
                            </span>
                          </div>
                          <CardTitle className="text-sm font-semibold line-clamp-2">
                            {article.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {article.view_count} views
                            </span>
                            <Button variant="ghost" size="sm" className="h-auto p-1">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Knowledge Base Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Educational articles about debt, economics, and financial literacy.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Sources & Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Live Data Sources
              </CardTitle>
              <CardDescription>
                Real-time integration with verified economic institutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debtSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {source.source_logo_url && (
                        <img 
                          src={source.source_logo_url} 
                          alt={source.source_name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <div>
                        <div className="font-medium text-sm">{source.source_name}</div>
                        {source.is_verified && (
                          <Badge variant="default" className="text-xs">
                            Live Integration
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Civic Actions & Tools
              </CardTitle>
              <CardDescription>
                Take action with debt transparency data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Complete Dataset
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Share on Social Media
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                API Documentation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Educational Context */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              🧠 Learn More About National Debt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">What is National Debt?</h4>
                <p className="text-sm text-muted-foreground">
                  National debt is the total amount of money that a country owes to creditors. 
                  It includes both domestic debt (owed within the country) and external debt (owed to foreign entities).
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Why Monitor Debt?</h4>
                <p className="text-sm text-muted-foreground">
                  Tracking national debt helps citizens understand their country's financial health, 
                  government spending capacity, and potential impact on future economic policies and taxation.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Debt-to-GDP Ratio Explained</h4>
                <p className="text-sm text-muted-foreground">
                  This ratio indicates a country's ability to pay back its debt. 
                  Generally, ratios above 80% are considered high risk by international standards.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Impact on Your Daily Life</h4>
                <p className="text-sm text-muted-foreground">
                  High debt levels can affect public spending on healthcare, education, and infrastructure. 
                  It may also influence inflation, employment, and economic growth.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NationalDebtTracker;
