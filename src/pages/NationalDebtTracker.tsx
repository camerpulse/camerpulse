import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, TrendingDown, Download, ExternalLink } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { toast } from "sonner";

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
  verified: boolean;
  updated_at: string;
}

interface DebtSource {
  id: string;
  name: string;
  acronym: string;
  website_url: string;
  description: string;
}

interface DebtNews {
  id: string;
  title: string;
  summary: string;
  author: string;
  source_url: string;
  published_at: string;
  tags: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function NationalDebtTracker() {
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>([]);
  const [sources, setSources] = useState<DebtSource[]>([]);
  const [news, setNews] = useState<DebtNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(2023);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [debtResult, sourcesResult, newsResult] = await Promise.all([
        supabase.from('debt_records').select('*').eq('verified', true).order('year', { ascending: false }),
        supabase.from('debt_sources').select('*').eq('is_active', true),
        supabase.from('debt_news').select('*').order('published_at', { ascending: false }).limit(5)
      ]);

      if (debtResult.error) throw debtResult.error;
      if (sourcesResult.error) throw sourcesResult.error;
      if (newsResult.error) throw newsResult.error;

      setDebtRecords(debtResult.data || []);
      setSources(sourcesResult.data || []);
      setNews(newsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load debt data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: 'FCFA' | 'USD') => {
    if (currency === 'FCFA') {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatBillions = (amount: number) => {
    return (amount / 1000000000).toFixed(1) + 'B';
  };

  const currentRecord = debtRecords.find(record => record.year === selectedYear) || debtRecords[0];
  const previousRecord = debtRecords.find(record => record.year === selectedYear - 1);

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return { percentage: 0, isIncrease: true };
    const change = ((current - previous) / previous) * 100;
    return { percentage: Math.abs(change), isIncrease: change > 0 };
  };

  const debtPerCitizen = currentRecord ? currentRecord.total_debt_fcfa / currentRecord.population : 0;

  const pieData = currentRecord ? [
    { name: 'Internal Debt', value: currentRecord.internal_debt_fcfa, color: COLORS[0] },
    { name: 'External Debt', value: currentRecord.external_debt_fcfa, color: COLORS[1] }
  ] : [];

  const timelineData = debtRecords.map(record => ({
    year: record.year,
    totalDebt: record.total_debt_usd / 1000000000, // in billions
    debtToGDP: record.debt_to_gdp_ratio,
    internal: record.internal_debt_fcfa / 1000000000000, // in trillions FCFA
    external: record.external_debt_fcfa / 1000000000000
  })).reverse();

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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">📉 National Debt Tracker</h1>
          <p className="text-muted-foreground text-lg">
            Monitoring Cameroon's public debt with transparency and accountability
          </p>
          <Badge variant="secondary" className="text-sm">
            Last Updated: {currentRecord ? new Date(currentRecord.updated_at).toLocaleDateString() : 'N/A'}
          </Badge>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Public Debt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">
                  {formatBillions(currentRecord?.total_debt_fcfa || 0)} FCFA
                </p>
                <p className="text-lg text-muted-foreground">
                  ${formatBillions(currentRecord?.total_debt_usd || 0)} USD
                </p>
                {previousRecord && (
                  <div className="flex items-center space-x-1">
                    {calculateChange(currentRecord?.total_debt_fcfa || 0, previousRecord.total_debt_fcfa).isIncrease ? (
                      <TrendingUp className="h-4 w-4 text-destructive" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {calculateChange(currentRecord?.total_debt_fcfa || 0, previousRecord.total_debt_fcfa).percentage.toFixed(1)}% from {previousRecord.year}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Debt to GDP Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{currentRecord?.debt_to_gdp_ratio || 0}%</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((currentRecord?.debt_to_gdp_ratio || 0), 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(currentRecord?.debt_to_gdp_ratio || 0) > 60 ? 'Above recommended 60% threshold' : 'Within acceptable range'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Debt per Citizen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {formatCurrency(debtPerCitizen, 'FCFA').slice(0, -3)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ~${(debtPerCitizen / 600).toLocaleString()} USD
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on {currentRecord?.population.toLocaleString()} population
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">External vs Internal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">External</span>
                  <span className="font-medium">
                    {currentRecord ? ((currentRecord.external_debt_fcfa / currentRecord.total_debt_fcfa) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Internal</span>
                  <span className="font-medium">
                    {currentRecord ? ((currentRecord.internal_debt_fcfa / currentRecord.total_debt_fcfa) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="education">Learn More</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Debt Composition Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Debt Composition ({selectedYear})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatBillions(value) + ' FCFA'} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Debt News */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Debt News</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {news.length > 0 ? news.map((article) => (
                    <div key={article.id} className="border-l-2 border-primary/20 pl-3 space-y-1">
                      <h4 className="font-medium text-sm">{article.title}</h4>
                      <p className="text-xs text-muted-foreground">{article.summary}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.published_at).toLocaleDateString()}
                        </span>
                        {article.source_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">No recent news available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historical Debt Trends (2019-2023)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="totalDebt" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      name="Total Debt (Billions USD)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debt to GDP Ratio Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="debtToGDP" fill="#82ca9d" name="Debt to GDP %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Sources & Citations</CardTitle>
                <p className="text-muted-foreground">
                  All debt data is sourced from verified official institutions
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sources.map((source) => (
                    <div key={source.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{source.name}</h3>
                        <Badge variant="outline">{source.acronym}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                      {source.website_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={source.website_url} target="_blank" rel="noopener noreferrer">
                            Visit Website <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>What is National Debt?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">
                    National debt is the total amount of money that a country owes to creditors. 
                    It includes both internal debt (owed to domestic lenders) and external debt (owed to foreign lenders).
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Types of Debt:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <strong>Internal Debt:</strong> Borrowed from domestic banks, institutions, and citizens</li>
                      <li>• <strong>External Debt:</strong> Borrowed from foreign governments, institutions, and markets</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Why Does National Debt Matter?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">
                    National debt affects every citizen because it influences government spending, 
                    economic growth, and future fiscal policy decisions.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Impact on Citizens:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Higher debt can limit government spending on public services</li>
                      <li>• Interest payments reduce funds available for development</li>
                      <li>• Excessive debt can lead to economic instability</li>
                      <li>• Future generations may bear the burden of repayment</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cameroon's Debt Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">
                    As a member of the Central African Economic and Monetary Union (CEMAC), 
                    Cameroon follows specific debt sustainability guidelines.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Thresholds:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• CEMAC debt-to-GDP ceiling: 70%</li>
                      <li>• IMF recommended ceiling: 60%</li>
                      <li>• Current ratio: {currentRecord?.debt_to_gdp_ratio || 0}%</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Understanding the Numbers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">
                    The debt per citizen calculation helps put the national debt in personal perspective.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Current Household Impact:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Debt per citizen: {formatCurrency(debtPerCitizen, 'FCFA').slice(0, -3)}</li>
                      <li>• Average household size: ~5 people</li>
                      <li>• Debt per household: ~{formatCurrency(debtPerCitizen * 5, 'FCFA').slice(0, -3)}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>
            Data compiled by CamerPulse for public transparency. 
            <Button variant="link" className="p-0 h-auto ml-1" asChild>
              <a href="/contact">Report inaccuracies</a>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}