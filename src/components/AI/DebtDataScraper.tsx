import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  RefreshCw, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Database,
  Zap,
  Activity,
  Shield,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DataSource {
  id: string;
  source_name: string;
  source_url: string;
  source_type: string;
  is_active: boolean;
  last_scraped_at: string | null;
  scraping_frequency: string;
  metadata: any;
}

interface ScrapingResult {
  id: string;
  source_id: string;
  scraping_date: string;
  status: string;
  total_debt_detected: number | null;
  creditors_found: string[];
  borrowing_purposes: string[];
  data_quality_score: number;
  changes_detected: boolean;
  error_message: string | null;
  debt_data_sources: {
    source_name: string;
    source_url: string;
    source_type: string;
  };
}

export const DebtDataScraper: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [scrapingResults, setScrapingResults] = useState<ScrapingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [activeTab, setActiveTab] = useState('sources');
  const { toast } = useToast();

  useEffect(() => {
    loadScrapingStatus();
  }, []);

  const loadScrapingStatus = async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('debt-data-scraper', {
        body: { action: 'get_scraping_status' }
      });

      if (response.error) throw response.error;

      setDataSources(response.data.active_sources || []);
      setScrapingResults(response.data.recent_results || []);
    } catch (error: any) {
      toast({
        title: 'Failed to Load Scraping Status',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runFullScrape = async () => {
    setIsLoading(true);
    try {
      toast({
        title: 'Scraping Started',
        description: 'Automated scraping of all debt data sources initiated...'
      });

      const response = await supabase.functions.invoke('debt-data-scraper', {
        body: { action: 'scrape_all_sources' }
      });

      if (response.error) throw response.error;

      toast({
        title: 'Scraping Complete',
        description: `Successfully scraped ${response.data.scraped_sources} sources`
      });

      await loadScrapingStatus();
    } catch (error: any) {
      toast({
        title: 'Scraping Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrapeSingleSource = async (sourceId: string) => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('debt-data-scraper', {
        body: { 
          action: 'scrape_single_source',
          source_id: sourceId
        }
      });

      if (response.error) throw response.error;

      toast({
        title: 'Source Scraped',
        description: 'Single source scraping completed successfully'
      });

      await loadScrapingStatus();
    } catch (error: any) {
      toast({
        title: 'Scraping Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runManualScrape = async () => {
    if (!manualUrl.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a URL to scrape',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('debt-data-scraper', {
        body: { 
          action: 'manual_scrape',
          source_url: manualUrl,
          force_scrape: true
        }
      });

      if (response.error) throw response.error;

      toast({
        title: 'Manual Scrape Complete',
        description: `Successfully scraped: ${manualUrl}`
      });

      setManualUrl('');
      await loadScrapingStatus();
    } catch (error: any) {
      toast({
        title: 'Manual Scraping Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'partial':
        return <Badge variant="secondary">Partial</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getSourceTypeBadge = (type: string) => {
    const typeColors = {
      government: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      international: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      bank: 'bg-green-500/10 text-green-600 border-green-500/20',
      manual: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    };

    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-500/10 text-gray-600'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('fr-CM', {
      style: 'decimal',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount) + ' FCFA';
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Debt Data Scraper</h2>
            <p className="text-muted-foreground">
              Automated collection and monitoring of national debt data from multiple sources
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={runFullScrape}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Scrape All Sources
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataSources.length}</div>
            <p className="text-xs text-muted-foreground">Government & International</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Scrapes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scrapingResults.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scrapingResults.length > 0 ? 
                Math.round((scrapingResults.filter(r => r.status === 'success').length / scrapingResults.length) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Data extraction accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Changes Detected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {scrapingResults.filter(r => r.changes_detected).length}
            </div>
            <p className="text-xs text-muted-foreground">Significant updates</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="results">Scraping Results</TabsTrigger>
          <TabsTrigger value="manual">Manual Scraping</TabsTrigger>
        </TabsList>

        {/* Data Sources Tab */}
        <TabsContent value="sources">
          <div className="grid gap-4">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{source.source_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {source.source_url}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSourceTypeBadge(source.source_type)}
                      <Button
                        size="sm"
                        onClick={() => scrapeSingleSource(source.id)}
                        disabled={isLoading}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Scrape
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Frequency: {source.scraping_frequency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        Status: {source.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      Last scraped: {source.last_scraped_at ? 
                        new Date(source.last_scraped_at).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scraping Results Tab */}
        <TabsContent value="results">
          <div className="space-y-4">
            {scrapingResults.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {result.debt_data_sources?.source_name || 'Unknown Source'}
                      </CardTitle>
                      <CardDescription>
                        Scraped: {new Date(result.scraping_date).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.status)}
                      {result.changes_detected && (
                        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Changes
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Total Debt Detected</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(result.total_debt_detected)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Data Quality</p>
                      <div className="flex items-center gap-2">
                        <Progress value={result.data_quality_score} className="flex-1" />
                        <span className={`text-sm font-medium ${getQualityColor(result.data_quality_score)}`}>
                          {result.data_quality_score}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Creditors Found</p>
                      <p className="text-lg font-bold">
                        {result.creditors_found?.length || 0}
                      </p>
                    </div>
                  </div>

                  {result.error_message && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {result.error_message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {result.creditors_found && result.creditors_found.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Creditors Identified:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.creditors_found.slice(0, 6).map((creditor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {creditor}
                          </Badge>
                        ))}
                        {result.creditors_found.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{result.creditors_found.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Manual Scraping Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Manual URL Scraping
              </CardTitle>
              <CardDescription>
                Scrape debt data from any government or financial website URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter website URL (e.g., https://example.gov.cm/debt-report)"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={runManualScrape}
                  disabled={isLoading || !manualUrl.trim()}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Scrape URL
                </Button>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Manual scraping will attempt to extract debt-related information from the provided URL.
                  Results depend on the website structure and data availability.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};