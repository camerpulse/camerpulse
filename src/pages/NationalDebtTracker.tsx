import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Download, 
  Share2, 
  Copy,
  ExternalLink,
  DollarSign,
  Users,
  Globe,
  Calendar,
  BookOpen,
  Target,
  Zap,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { CreditorBreakdown } from "@/components/AI/CreditorBreakdown";

interface DebtRecord {
  id: string;
  year: number;
  total_debt_fcfa: number;
  total_debt_usd: number;
  internal_debt_fcfa: number;
  external_debt_fcfa: number;
  debt_to_gdp_ratio: number;
  gdp_fcfa: number;
  population: number;
  notes: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface DebtSource {
  id: string;
  name: string;
  acronym: string;
  logo_url: string;
  website_url: string;
  is_active: boolean;
  last_updated?: string;
}

interface LenderData {
  name: string;
  amount: number;
  percentage: number;
  risk_level: 'low' | 'medium' | 'high';
  flag: string;
}

interface DebtAlert {
  id: string;
  type: 'threshold' | 'spike' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  created_at: string;
  is_active: boolean;
}

export default function NationalDebtTracker() {
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>([]);
  const [sources, setSources] = useState<DebtSource[]>([]);
  const [alerts, setAlerts] = useState<DebtAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [aiSummary, setAiSummary] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Chart colors
  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

  useEffect(() => {
    fetchData();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setIsAdmin(roles?.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [debtResult, sourcesResult, refreshLogsResult] = await Promise.all([
        supabase.from('debt_records').select('*').order('year', { ascending: true }),
        supabase.from('debt_sources').select('*').eq('is_active', true),
        supabase.from('debt_refresh_logs').select('*').order('created_at', { ascending: false }).limit(1)
      ]);

      if (debtResult.error) throw debtResult.error;
      if (sourcesResult.error) throw sourcesResult.error;

      setDebtRecords(debtResult.data || []);
      setSources(sourcesResult.data || []);
      
      // Set last updated from most recent refresh log or fallback to now
      const lastRefreshLog = refreshLogsResult.data?.[0];
      if (lastRefreshLog?.completed_at) {
        setLastUpdated(new Date(lastRefreshLog.completed_at));
      } else {
        setLastUpdated(new Date());
      }
      
      // Generate AI summary
      generateAISummary(debtResult.data || []);
      
      // Simulate alerts
      generateAlerts(debtResult.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load debt data');
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can force refresh');
      return;
    }

    setIsRefreshing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('automated-debt-refresh', {
        body: {
          trigger_type: 'manual',
          user_id: user?.id
        }
      });

      if (error) throw error;

      toast.success(`Debt data refreshed successfully! Updated ${data.records_updated} records.`);
      
      // Refresh the page data
      await fetchData();
      
    } catch (error) {
      console.error('Error forcing refresh:', error);
      toast.error('Failed to refresh debt data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const generateAISummary = (records: DebtRecord[]) => {
    if (records.length < 2) return;
    
    const latest = records[records.length - 1];
    const previous = records[records.length - 2];
    const debtChange = ((latest.total_debt_fcfa - previous.total_debt_fcfa) / previous.total_debt_fcfa) * 100;
    
    const summary = `Cameroon's national debt stands at ${formatCurrency(latest.total_debt_fcfa)} FCFA (${formatCurrency(latest.total_debt_usd, 'USD')} USD) as of ${latest.year}. The debt has ${debtChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(debtChange).toFixed(1)}% from the previous year. The debt-to-GDP ratio is currently ${latest.debt_to_gdp_ratio}%, ${latest.debt_to_gdp_ratio > 70 ? 'exceeding safe international thresholds' : 'within manageable limits'}. Per capita debt burden is approximately ${formatCurrency(latest.total_debt_fcfa / latest.population)} FCFA per citizen.`;
    
    setAiSummary(summary);
  };

  const generateAlerts = (records: DebtRecord[]) => {
    const alerts: DebtAlert[] = [];
    if (records.length === 0) return;
    
    const latest = records[records.length - 1];
    
    // GDP threshold alerts
    if (latest.debt_to_gdp_ratio > 90) {
      alerts.push({
        id: '1',
        type: 'threshold',
        severity: 'critical',
        message: `Critical: Debt-to-GDP ratio at ${latest.debt_to_gdp_ratio}% exceeds 90% danger threshold`,
        created_at: new Date().toISOString(),
        is_active: true
      });
    } else if (latest.debt_to_gdp_ratio > 70) {
      alerts.push({
        id: '2',
        type: 'threshold',
        severity: 'high',
        message: `Warning: Debt-to-GDP ratio at ${latest.debt_to_gdp_ratio}% exceeds 70% caution threshold`,
        created_at: new Date().toISOString(),
        is_active: true
      });
    }
    
    // Rapid growth alert
    if (records.length >= 2) {
      const previous = records[records.length - 2];
      const growthRate = ((latest.total_debt_fcfa - previous.total_debt_fcfa) / previous.total_debt_fcfa) * 100;
      
      if (growthRate > 15) {
        alerts.push({
          id: '3',
          type: 'spike',
          severity: 'high',
          message: `Alert: Debt increased by ${growthRate.toFixed(1)}% in one year - significant growth detected`,
          created_at: new Date().toISOString(),
          is_active: true
        });
      }
    }
    
    setAlerts(alerts);
  };

  const formatCurrency = (amount: number, currency = 'FCFA') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    
    if (amount >= 1000000000000) {
      return `${(amount / 1000000000000).toFixed(1)}T FCFA`;
    } else if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B FCFA`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    return `${amount.toLocaleString()} FCFA`;
  };

  const exportData = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csv = [
        'Year,Total Debt FCFA,Total Debt USD,Internal Debt FCFA,External Debt FCFA,Debt to GDP %,GDP FCFA,Population',
        ...debtRecords.map(r => 
          `${r.year},${r.total_debt_fcfa},${r.total_debt_usd},${r.internal_debt_fcfa},${r.external_debt_fcfa},${r.debt_to_gdp_ratio},${r.gdp_fcfa},${r.population}`
        )
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cameroon-debt-data-${new Date().getFullYear()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const json = JSON.stringify(debtRecords, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cameroon-debt-data-${new Date().getFullYear()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    toast.success(`Data exported as ${format.toUpperCase()}`);
  };

  const copyAISummary = () => {
    navigator.clipboard.writeText(aiSummary);
    toast.success("Summary copied to clipboard");
  };

  const shareToSocial = (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    const text = `Cameroon National Debt Update: ${aiSummary.substring(0, 100)}... Check full details at`;
    const url = window.location.href;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
  };

  // Mock lender data (in production, this would come from the database)
  const lenderData: LenderData[] = [
    { name: 'China', amount: 3200000000000, percentage: 35, risk_level: 'high', flag: '🇨🇳' },
    { name: 'IMF', amount: 1800000000000, percentage: 20, risk_level: 'low', flag: '🏛️' },
    { name: 'World Bank', amount: 1600000000000, percentage: 18, risk_level: 'low', flag: '🌍' },
    { name: 'France', amount: 1200000000000, percentage: 13, risk_level: 'medium', flag: '🇫🇷' },
    { name: 'Private Banks', amount: 800000000000, percentage: 9, risk_level: 'medium', flag: '🏦' },
    { name: 'Other', amount: 400000000000, percentage: 5, risk_level: 'low', flag: '🌐' }
  ];

  const latest = debtRecords[debtRecords.length - 1];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            🇨🇲 Cameroon National Debt Intelligence
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
            Real-time monitoring and analysis of Cameroon's national debt. Empowering citizens with transparent, 
            AI-driven insights into the country's financial health and fiscal responsibility.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="text-center sm:text-left">Last Updated: {lastUpdated.toLocaleString()} – Source: MINFI</span>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600 w-fit">
                <Zap className="h-3 w-3 mr-1" />
                Auto-Updated Daily
              </Badge>
              {isAdmin && (
                <Button
                  onClick={forceRefresh}
                  disabled={isRefreshing}
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? '/* animate-spin - disabled */' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Force Update'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Alert Bar */}
        {alerts.filter(a => a.is_active).map(alert => (
          <Alert key={alert.id} className={`border-l-4 ${
            alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
            alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {alert.message}
            </AlertDescription>
          </Alert>
        ))}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto pb-2">
              <TabsList className="grid w-full grid-cols-7 min-w-[600px] sm:min-w-0 h-auto p-1 bg-muted/50">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-3 px-2 sm:px-3 min-h-[44px] touch-manipulation">
                <span className="hidden sm:inline">📊 </span>Overview
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm py-3 px-2 sm:px-3 min-h-[44px] touch-manipulation">
                <span className="hidden sm:inline">📈 </span>History
              </TabsTrigger>
              <TabsTrigger value="lenders" className="text-xs sm:text-sm py-3 px-2 sm:px-3 min-h-[44px] touch-manipulation">
                <span className="hidden sm:inline">🌍 </span>Lenders
              </TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs sm:text-sm py-3 px-2 sm:px-3 min-h-[44px] touch-manipulation">
                <span className="hidden sm:inline">🧠 </span>AI
              </TabsTrigger>
              <TabsTrigger value="education" className="text-xs sm:text-sm py-3 px-2 sm:px-3 min-h-[44px] touch-manipulation">
                <span className="hidden sm:inline">📚 </span>Learn
              </TabsTrigger>
              <TabsTrigger value="creditors" className="text-xs sm:text-sm py-3 px-2 sm:px-3 min-h-[44px] touch-manipulation">
                <span className="hidden sm:inline">🏛️ </span>Creditors
              </TabsTrigger>
              <TabsTrigger value="regional" className="text-xs sm:text-sm py-3 px-2 sm:px-3 min-h-[44px] touch-manipulation">
                <span className="hidden sm:inline">🗺️ </span>Regional
              </TabsTrigger>
            </TabsList>
          </div>

          {/* MODULE 1: Live Debt Overview Panel */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {latest && (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm sm:text-base font-medium">Total National Debt</CardTitle>
                      <DollarSign className="h-5 w-5 text-purple-600 shrink-0" />
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 break-words">
                        {formatCurrency(latest.total_debt_fcfa)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 break-words">
                        {formatCurrency(latest.total_debt_usd, 'USD')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm sm:text-base font-medium">Debt Per Capita</CardTitle>
                      <Users className="h-5 w-5 text-blue-600 shrink-0" />
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 break-words">
                        {formatCurrency(latest.total_debt_fcfa / latest.population)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Per citizen debt burden
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm sm:text-base font-medium">Debt-to-GDP Ratio</CardTitle>
                      <Target className="h-5 w-5 text-green-600 shrink-0" />
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-3">
                        {latest.debt_to_gdp_ratio}%
                      </div>
                      <Progress 
                        value={latest.debt_to_gdp_ratio} 
                        className="w-full h-2"
                        max={100}
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm sm:text-base font-medium">External vs Internal</CardTitle>
                      <Globe className="h-5 w-5 text-orange-600 shrink-0" />
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 break-words">
                        {((latest.external_debt_fcfa / latest.total_debt_fcfa) * 100).toFixed(0)}% / {((latest.internal_debt_fcfa / latest.total_debt_fcfa) * 100).toFixed(0)}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        External / Internal split
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Debt Composition Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl">Debt Composition Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-4">Internal vs External Debt</h3>
                        <div className="w-full h-[280px] sm:h-[320px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'External Debt', value: latest.external_debt_fcfa, color: '#8B5CF6' },
                                  { name: 'Internal Debt', value: latest.internal_debt_fcfa, color: '#06B6D4' }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={window.innerWidth < 640 ? 70 : 90}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {[
                                  { name: 'External Debt', value: latest.external_debt_fcfa, color: '#8B5CF6' },
                                  { name: 'Internal Debt', value: latest.internal_debt_fcfa, color: '#06B6D4' }
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-4">Key Statistics</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm sm:text-base">External Debt</span>
                            <span className="font-mono text-sm sm:text-base break-all text-right">{formatCurrency(latest.external_debt_fcfa)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm sm:text-base">Internal Debt</span>
                            <span className="font-mono text-sm sm:text-base break-all text-right">{formatCurrency(latest.internal_debt_fcfa)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm sm:text-base">GDP Value</span>
                            <span className="font-mono text-sm sm:text-base break-all text-right">{formatCurrency(latest.gdp_fcfa)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm sm:text-base">Population</span>
                            <span className="font-mono text-sm sm:text-base">{latest.population.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl">Data Sources & Credibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {sources.map((source) => (
                        <div key={source.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:shadow-md transition-shadow min-h-[80px]">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold">{source.acronym}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base break-words">{source.name}</p>
                            <a 
                              href={source.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm text-primary hover:underline inline-flex items-center mt-1 min-h-[44px] touch-manipulation"
                            >
                              Visit Source <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* MODULE 2: Debt History Timeline */}
          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">Debt Evolution (2000 - Present)</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Track how Cameroon's national debt has evolved over the years
                </p>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={debtRecords}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        fontSize={12}
                        tickMargin={8}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)} 
                        fontSize={12}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                        labelFormatter={(label) => `Year: ${label}`}
                        contentStyle={{ 
                          fontSize: '14px',
                          maxWidth: '300px'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="total_debt_fcfa" 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.3}
                        name="Total Debt (FCFA)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="external_debt_fcfa" 
                        stroke="#06B6D4" 
                        fill="#06B6D4" 
                        fillOpacity={0.3}
                        name="External Debt (FCFA)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">Debt-to-GDP Ratio Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[280px] sm:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={debtRecords}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        fontSize={12}
                        tickMargin={8}
                      />
                      <YAxis 
                        fontSize={12}
                        width={50}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Debt-to-GDP Ratio']}
                        contentStyle={{ 
                          fontSize: '14px',
                          maxWidth: '250px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="debt_to_gdp_ratio" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Debt-to-GDP %"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        y={50} 
                        stroke="#F59E0B" 
                        strokeDasharray="5 5" 
                        name="Caution Threshold (50%)"
                      />
                      <Line 
                        y={70} 
                        stroke="#EF4444" 
                        strokeDasharray="5 5" 
                        name="Danger Threshold (70%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MODULE 3: Lender Breakdown */}
          <TabsContent value="lenders" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="touch-manipulation">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Debt by Creditor</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={lenderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {lenderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="touch-manipulation">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Creditor Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {lenderData.map((lender, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg touch-manipulation hover:shadow-sm transition-shadow">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <span className="text-xl sm:text-2xl shrink-0">{lender.flag}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">{lender.name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {lender.percentage}% • {formatCurrency(lender.amount)}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            lender.risk_level === 'high' ? 'destructive' :
                            lender.risk_level === 'medium' ? 'secondary' : 'default'
                          }
                          className="text-xs shrink-0"
                        >
                          {lender.risk_level.toUpperCase()} RISK
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="touch-manipulation">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Risk Analysis by Creditor Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h3 className="font-semibold text-green-800">Low Risk</h3>
                    <p className="text-sm text-green-600">
                      Multilateral institutions (IMF, World Bank) with favorable terms
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <h3 className="font-semibold text-yellow-800">Medium Risk</h3>
                    <p className="text-sm text-yellow-600">
                      Bilateral and commercial loans with market rates
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-red-50">
                    <h3 className="font-semibold text-red-800">High Risk</h3>
                    <p className="text-sm text-red-600">
                      High dependency on single creditor or unfavorable terms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MODULE 5: AI-Generated Civic Summary */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🧠 AI-Generated Civic Summary</span>
                  <Badge variant="outline">Updated Weekly</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">{aiSummary}</p>
                  <div className="flex space-x-2">
                    <Button onClick={copyAISummary} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Summary
                    </Button>
                    <Button onClick={() => shareToSocial('facebook')} variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Facebook
                    </Button>
                    <Button onClick={() => shareToSocial('whatsapp')} variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debt Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Key Insights</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-red-500 mt-0.5" />
                        <span>Debt has grown significantly in the past decade</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <span>External debt dependency remains concerning</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>Infrastructure investments driving borrowing</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Recommendations</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Diversify revenue sources</li>
                      <li>• Improve debt management transparency</li>
                      <li>• Focus on productive debt investments</li>
                      <li>• Strengthen domestic resource mobilization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MODULE 6: Civic Knowledge Panel */}
          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Understanding National Debt</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basics" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="basics">Basics</TabsTrigger>
                    <TabsTrigger value="impact">Impact on You</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basics" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">What is National Debt?</h3>
                      <p className="text-muted-foreground">
                        National debt is the total amount of money that a government owes to creditors. 
                        This includes money borrowed from other countries, international organizations, 
                        and domestic sources to finance government operations and development projects.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Types of Debt</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li><strong>External Debt:</strong> Borrowed from foreign creditors</li>
                        <li><strong>Internal Debt:</strong> Borrowed from domestic sources</li>
                        <li><strong>Bilateral Debt:</strong> Government-to-government loans</li>
                        <li><strong>Multilateral Debt:</strong> Loans from international organizations</li>
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="impact" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">How Does National Debt Affect You?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">💰 Your Salary</h4>
                          <p className="text-sm text-muted-foreground">
                            High debt can lead to reduced government spending on salaries and benefits
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">⛽ Fuel Prices</h4>
                          <p className="text-sm text-muted-foreground">
                            Debt payments may reduce fuel subsidies, leading to higher prices
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">🏫 Education</h4>
                          <p className="text-sm text-muted-foreground">
                            Less money available for schools, universities, and educational programs
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">🏥 Healthcare</h4>
                          <p className="text-sm text-muted-foreground">
                            Reduced funding for hospitals and healthcare infrastructure
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Cameroon's Debt History Since 1960</h3>
                      <div className="space-y-3">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium">1960s-1980s: Early Independence</h4>
                          <p className="text-sm text-muted-foreground">
                            Low debt levels as the country focused on building basic infrastructure
                          </p>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-4">
                          <h4 className="font-medium">1990s-2000s: Economic Crisis</h4>
                          <p className="text-sm text-muted-foreground">
                            Debt crisis led to structural adjustment programs and debt relief initiatives
                          </p>
                        </div>
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-medium">2010s-Present: Rapid Growth</h4>
                          <p className="text-sm text-muted-foreground">
                            Significant borrowing for infrastructure projects, particularly from China
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MODULE 12: Creditor Breakdown */}
          <TabsContent value="creditors" className="space-y-6">
            <CreditorBreakdown />
          </TabsContent>

          {/* MODULE 13: Regional Comparison */}
          <TabsContent value="regional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Debt Comparison</CardTitle>
                <p className="text-muted-foreground">
                  Compare Cameroon's debt metrics with other African countries
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { country: 'Cameroon', debt_to_gdp: latest?.debt_to_gdp_ratio || 0, flag: '🇨🇲' },
                    { country: 'Nigeria', debt_to_gdp: 32.5, flag: '🇳🇬' },
                    { country: 'Ghana', debt_to_gdp: 81.2, flag: '🇬🇭' },
                    { country: 'Senegal', debt_to_gdp: 69.4, flag: '🇸🇳' },
                    { country: 'Chad', debt_to_gdp: 52.8, flag: '🇹🇩' },
                    { country: 'Gabon', debt_to_gdp: 76.5, flag: '🇬🇦' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Debt-to-GDP Ratio']}
                    />
                    <Bar dataKey="debt_to_gdp" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* MODULE 9: Download & Share Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">Export & Share Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button 
                onClick={() => exportData('csv')} 
                variant="outline" 
                className="min-h-[48px] text-sm touch-manipulation"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export </span>CSV
              </Button>
              <Button 
                onClick={() => exportData('json')} 
                variant="outline" 
                className="min-h-[48px] text-sm touch-manipulation"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export </span>JSON
              </Button>
              <Button 
                onClick={() => shareToSocial('whatsapp')} 
                variant="outline" 
                className="min-h-[48px] text-sm touch-manipulation"
              >
                <Share2 className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                onClick={() => shareToSocial('facebook')} 
                variant="outline" 
                className="min-h-[48px] text-sm touch-manipulation"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}