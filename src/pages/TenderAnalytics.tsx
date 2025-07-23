import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  MapPin,
  Building,
  Calendar,
  Download,
  Filter,
  Eye,
  FileText
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function TenderAnalytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tender, setTender] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>({
    bidsOverTime: [],
    bidderOrigins: [],
    budgetDistribution: [],
    evaluationTimeline: [],
    summary: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTenderAndAnalytics();
    }
  }, [id]);

  const fetchTenderAndAnalytics = async () => {
    try {
      // Fetch tender details
      const { data: tenderData, error: tenderError } = await supabase
        .from('tenders')
        .select('*')
        .eq('id', id)
        .single();

      if (tenderError) throw tenderError;
      setTender(tenderData);

      // Fetch bids for analytics
      const { data: bidsData, error: bidsError } = await supabase
        .from('tender_bids')
        .select('*')
        .eq('tender_id', id)
        .order('created_at', { ascending: true });

      if (bidsError) throw bidsError;

      // Process analytics data
      const processedAnalytics = processAnalyticsData(bidsData || [], tenderData);
      setAnalytics(processedAnalytics);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (bids: any[], tender: any) => {
    // Bids over time
    const bidsOverTime = [];
    const startDate = new Date(tender.created_at);
    const endDate = new Date();
    
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = format(d, 'MMM dd');
      const bidsOnDate = bids.filter(bid => 
        format(new Date(bid.created_at), 'MMM dd') === date
      ).length;
      
      bidsOverTime.push({
        date,
        bids: bidsOnDate,
        cumulative: bids.filter(bid => new Date(bid.created_at) <= d).length
      });
    }

    // Bidder origins (mock data - would need location info in real app)
    const regions = ['Littoral', 'Centre', 'West', 'Northwest', 'Southwest', 'North', 'Adamawa', 'East', 'Far North', 'South'];
    const bidderOrigins = regions.map(region => ({
      region,
      count: Math.floor(Math.random() * 10) + 1,
      percentage: Math.floor(Math.random() * 30) + 5
    })).sort((a, b) => b.count - a.count);

    // Budget distribution
    const budgetRanges = [
      { range: '< 50M', count: 0, color: '#8884d8' },
      { range: '50M - 100M', count: 0, color: '#82ca9d' },
      { range: '100M - 500M', count: 0, color: '#ffc658' },
      { range: '500M - 1B', count: 0, color: '#ff7300' },
      { range: '> 1B', count: 0, color: '#e73c7e' }
    ];

    bids.forEach(bid => {
      const amount = bid.bid_amount;
      if (amount < 50000000) budgetRanges[0].count++;
      else if (amount < 100000000) budgetRanges[1].count++;
      else if (amount < 500000000) budgetRanges[2].count++;
      else if (amount < 1000000000) budgetRanges[3].count++;
      else budgetRanges[4].count++;
    });

    // Evaluation timeline
    const evaluationTimeline = [
      { phase: 'Submission Open', date: format(new Date(tender.created_at), 'MMM dd'), status: 'completed' },
      { phase: 'Bid Collection', date: format(new Date(tender.deadline), 'MMM dd'), status: 'completed' },
      { phase: 'Technical Review', date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'MMM dd'), status: 'in_progress' },
      { phase: 'Financial Evaluation', date: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'MMM dd'), status: 'pending' },
      { phase: 'Award Decision', date: format(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), 'MMM dd'), status: 'pending' }
    ];

    // Summary stats
    const avgBidAmount = bids.length > 0 ? bids.reduce((sum, bid) => sum + bid.bid_amount, 0) / bids.length : 0;
    const minBid = bids.length > 0 ? Math.min(...bids.map(b => b.bid_amount)) : 0;
    const maxBid = bids.length > 0 ? Math.max(...bids.map(b => b.bid_amount)) : 0;

    const summary = {
      totalBids: bids.length,
      averageBidAmount: avgBidAmount,
      minBidAmount: minBid,
      maxBidAmount: maxBid,
      daysRemaining: Math.max(0, Math.ceil((new Date(tender.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      viewsCount: tender.views_count || 0
    };

    return {
      bidsOverTime,
      bidderOrigins,
      budgetDistribution: budgetRanges,
      evaluationTimeline,
      summary
    };
  };

  const formatCurrency = (amount: number, currency: string = 'FCFA') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'FCFA' ? 'XAF' : currency,
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  const exportAnalytics = () => {
    // In a real app, this would generate and download a comprehensive report
    toast({
      title: "Export Started",
      description: "Analytics report will be downloaded shortly."
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Tender Not Found</h1>
          <p className="text-muted-foreground mb-4">The tender you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/tenders')}>Back to Tenders</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/tenders/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tender
        </Button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Analytics: {tender.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {tender.category}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {tender.region}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Deadline: {format(new Date(tender.deadline), 'PPP')}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={exportAnalytics}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bids</p>
                <p className="text-2xl font-bold">{analytics.summary.totalBids}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+2 from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Bid Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.summary.averageBidAmount, tender.currency)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Range: {formatCurrency(analytics.summary.minBidAmount, tender.currency)} - {formatCurrency(analytics.summary.maxBidAmount, tender.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Days Remaining</p>
                <p className="text-2xl font-bold">{analytics.summary.daysRemaining}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Until submission deadline
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{analytics.summary.viewsCount}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Tender page views
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="bids" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bids">Bids Over Time</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          <TabsTrigger value="timeline">Evaluation Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="bids">
          <Card>
            <CardHeader>
              <CardTitle>Bid Submissions Over Time</CardTitle>
              <CardDescription>Track how bids are coming in leading up to the deadline</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.bidsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cumulative" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Bar dataKey="bids" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bidder Origins</CardTitle>
                <CardDescription>Geographic distribution of bidders</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.bidderOrigins.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ region, percentage }) => `${region} (${percentage}%)`}
                    >
                      {analytics.bidderOrigins.slice(0, 5).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Breakdown</CardTitle>
                <CardDescription>Bidders by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.bidderOrigins.slice(0, 8).map((region: any, index: number) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: `hsl(${index * 45}, 70%, 60%)` }}
                        />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{region.count}</span>
                        <span className="text-sm text-muted-foreground ml-2">({region.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Budget Distribution</CardTitle>
              <CardDescription>How bid amounts are distributed across different ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.budgetDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Timeline</CardTitle>
              <CardDescription>Track the progress of tender evaluation phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.evaluationTimeline.map((phase: any, index: number) => (
                  <div key={phase.phase} className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                      phase.status === 'completed' ? 'bg-green-500' :
                      phase.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{phase.phase}</h4>
                        <Badge variant={
                          phase.status === 'completed' ? 'default' :
                          phase.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }>
                          {phase.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{phase.date}</p>
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
}