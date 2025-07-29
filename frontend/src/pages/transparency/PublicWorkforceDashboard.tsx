import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { usePublicWorkforceData, useRegionalComparisonData } from '@/hooks/usePublicWorkforceData';
import { CivicLayout } from '@/components/camerpulse/CivicLayout';
import { TrendingUp, Users, MapPin, Briefcase, Calendar } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function PublicWorkforceDashboard() {
  const { data: workforceData, isLoading } = usePublicWorkforceData();
  const { data: regionalComparison } = useRegionalComparisonData();

  if (isLoading) {
    return (
      <CivicLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading workforce intelligence...</p>
          </div>
        </div>
      </CivicLayout>
    );
  }

  const { workforceIntelligence, regionalData } = workforceData || {};

  return (
    <CivicLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Cameroon Workforce Intelligence
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Open government data dashboard providing real-time insights into employment trends, 
            regional job markets, and workforce development across Cameroon's 10 regions.
          </p>
          <Badge variant="secondary" className="text-sm">
            Last updated: {workforceData?.lastUpdated ? new Date(workforceData.lastUpdated).toLocaleString() : 'N/A'}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Job Openings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workforceIntelligence?.total_active_jobs?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Nationwide opportunities</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positions Filled</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workforceIntelligence?.total_filled_positions?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unemployment Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workforceIntelligence?.national_unemployment_rate}%</div>
              <p className="text-xs text-muted-foreground">National average</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{regionalData?.length || 0}</div>
              <p className="text-xs text-muted-foreground">With job activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
            <TabsTrigger value="sectors">Sector Trends</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Hiring Sectors */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Hiring Sectors</CardTitle>
                  <CardDescription>Most active industries by job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workforceIntelligence?.top_hiring_sectors?.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sector" angle={-45} textAnchor="end" height={80} fontSize={12} />
                      <YAxis />
                      <Bar dataKey="job_count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Regional Employment Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Regional Employment Distribution</CardTitle>
                  <CardDescription>Job opportunities by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={regionalData?.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="total_jobs"
                        label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                      >
                        {regionalData?.slice(0, 6).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="regional" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {regionalData?.map((region) => (
                <Card key={region.region}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {region.region}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Jobs</span>
                        <span className="font-medium">{region.total_jobs.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Filled Positions</span>
                        <span className="font-medium">{region.filled_positions.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(region.filled_positions / region.total_jobs) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Unemployment Rate</span>
                        <Badge variant={region.unemployment_rate > 20 ? "destructive" : "secondary"}>
                          {region.unemployment_rate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Salary</span>
                        <span className="text-sm font-medium">
                          {(region.average_salary_fcfa / 1000000).toFixed(1)}M FCFA
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Job Growth</span>
                        <Badge variant={region.job_growth_rate > 0 ? "default" : "secondary"}>
                          {region.job_growth_rate > 0 ? '+' : ''}{region.job_growth_rate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground">Top Sectors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {region.top_sectors.map((sector) => (
                          <Badge key={sector} variant="outline" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sector Performance Analysis</CardTitle>
                <CardDescription>Job count and growth rate by industry sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={workforceIntelligence?.top_hiring_sectors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Bar yAxisId="left" dataKey="job_count" fill="hsl(var(--primary))" name="Job Count" />
                    <Bar yAxisId="right" dataKey="growth_rate" fill="hsl(var(--secondary))" name="Growth Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Monthly Employment Trends
                </CardTitle>
                <CardDescription>Jobs posted vs. jobs filled over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={workforceIntelligence?.monthly_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Line 
                      type="monotone" 
                      dataKey="jobs_posted" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Jobs Posted"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="jobs_filled" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      name="Jobs Filled"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Notice */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                This dashboard provides real-time workforce intelligence for transparency and public accountability.
              </p>
              <p className="text-xs text-muted-foreground">
                Data is aggregated from government employment agencies, private sector partnerships, and verified sponsors.
                Personal information is protected and not displayed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CivicLayout>
  );
}