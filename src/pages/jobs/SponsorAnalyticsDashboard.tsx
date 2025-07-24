import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Users, Target, MapPin, Building, Calendar, 
  Download, BarChart3, PieChart, Award, DollarSign 
} from 'lucide-react';
import { CamerJobsLayout } from '@/components/Layout/CamerJobsLayout';
import { useSponsorAnalytics, useAllSponsors, useExportSponsorData } from '@/hooks/useSponsorAnalytics';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Cell, LineChart, Line, Area, AreaChart, Pie
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const SponsorAnalyticsDashboard = () => {
  const [selectedSponsor, setSelectedSponsor] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  const { toast } = useToast();
  const { data: sponsors, isLoading: sponsorsLoading } = useAllSponsors();
  const { data: analytics, isLoading: analyticsLoading } = useSponsorAnalytics(selectedSponsor, timeframe);
  const exportMutation = useExportSponsorData();

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    if (!selectedSponsor) {
      toast({
        title: "Select a sponsor",
        description: "Please select a sponsor to export data",
        variant: "destructive"
      });
      return;
    }

    try {
      await exportMutation.mutateAsync({ sponsorId: selectedSponsor, format });
      toast({
        title: "Export started",
        description: `Your ${format.toUpperCase()} report will be ready shortly`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Transform data for charts
  const genderData = analytics ? Object.entries(analytics.analytics.genderBreakdown).map(([key, value]) => ({
    name: key === 'female' ? 'Women' : key === 'male' ? 'Men' : 'Other',
    value
  })) : [];

  const regionalData = analytics ? Object.entries(analytics.analytics.regionalBreakdown).map(([key, value]) => ({
    region: key,
    hires: value
  })) : [];

  const sectorData = analytics ? Object.entries(analytics.analytics.sectorBreakdown).map(([key, value]) => ({
    sector: key,
    hires: value
  })) : [];

  const monthlyData = analytics ? Object.entries(analytics.analytics.monthlyTrend)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, hires]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: 'numeric' }),
      hires
    })) : [];

  return (
    <CamerJobsLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              📊 Sponsor Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track impact, analyze performance, and measure success
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedSponsor && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExport('xlsx')}
                  disabled={exportMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={exportMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sponsor Selection */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Sponsor Organization</label>
                <Select value={selectedSponsor} onValueChange={setSelectedSponsor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a sponsor to view analytics..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sponsors?.map(sponsor => (
                      <SelectItem key={sponsor.id} value={sponsor.id}>
                        <div className="flex items-center gap-2">
                          {sponsor.logo_url && (
                            <img src={sponsor.logo_url} alt={sponsor.name} className="w-6 h-6 rounded" />
                          )}
                          <span>{sponsor.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {sponsor.sponsor_type.toUpperCase()}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {analytics?.sponsor && (
                <div className="flex items-center gap-3">
                  {analytics.sponsor.logo_url && (
                    <img 
                      src={analytics.sponsor.logo_url} 
                      alt={analytics.sponsor.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{analytics.sponsor.name}</p>
                    <Badge variant="secondary">
                      {analytics.sponsor.sponsor_type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!selectedSponsor ? (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a Sponsor</h3>
              <p className="text-muted-foreground">
                Choose a sponsor organization to view detailed analytics and impact metrics
              </p>
            </CardContent>
          </Card>
        ) : analyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Hires</p>
                      <p className="text-3xl font-bold text-green-600">{analytics.analytics.totalHires}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analytics.analytics.averageHiresPerCampaign} avg per campaign
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                      <p className="text-3xl font-bold text-blue-600">{analytics.analytics.activeCampaigns}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analytics.analytics.completedCampaigns} completed
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {analytics.analytics.totalBudget > 0 
                          ? `${(analytics.analytics.totalBudget / 1000000).toFixed(1)}M` 
                          : 'N/A'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        FCFA allocated
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Regions Impacted</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {Object.keys(analytics.analytics.regionalBreakdown).length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Active regions
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="regions">Regional Impact</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sector Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hiring by Sector</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sectorData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="sector" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="hires" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Campaign Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.campaigns.slice(0, 5).map(campaign => {
                          const progress = Math.round((campaign.current_hires / campaign.target_hires) * 100);
                          return (
                            <div key={campaign.id} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{campaign.name}</span>
                                <span>{campaign.current_hires} / {campaign.target_hires}</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{progress}% complete</span>
                                <Badge variant="outline" className="text-xs">
                                  {campaign.campaign_status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="demographics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gender Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Gender Diversity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={genderData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label
                          >
                            {genderData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Impact Highlights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Impact Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Women Hired</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {analytics.analytics.genderBreakdown.female || 0}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Youth (18-35)</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">
                            {analytics.analytics.ageBreakdown['18-35'] || 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">Regions Reached</span>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">
                            {Object.keys(analytics.analytics.regionalBreakdown).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="regions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Regional Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={regionalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="hires" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hiring Trends Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="hires" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                No analytics data found for the selected sponsor and timeframe
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </CamerJobsLayout>
  );
};

export default SponsorAnalyticsDashboard;