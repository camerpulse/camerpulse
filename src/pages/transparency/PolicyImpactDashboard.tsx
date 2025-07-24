import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePolicyImpactData } from '@/hooks/usePublicWorkforceData';
import { CivicLayout } from '@/components/camerpulse/CivicLayout';
import { TrendingUp, Users, DollarSign, MapPin, Calendar, Target } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function PolicyImpactDashboard() {
  const { data: policies, isLoading } = usePolicyImpactData();

  if (isLoading) {
    return (
      <CivicLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading policy impact data...</p>
          </div>
        </div>
      </CivicLayout>
    );
  }

  const totalJobsCreated = policies?.reduce((sum, policy) => sum + policy.jobs_created, 0) || 0;
  const totalBudgetAllocated = policies?.reduce((sum, policy) => sum + policy.budget_allocated_fcfa, 0) || 0;
  const totalBudgetSpent = policies?.reduce((sum, policy) => sum + policy.budget_spent_fcfa, 0) || 0;
  const averageSuccessRate = policies?.reduce((sum, policy) => sum + policy.success_rate, 0) / (policies?.length || 1) || 0;

  const budgetEfficiency = (totalBudgetSpent / totalBudgetAllocated) * 100;

  return (
    <CivicLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Employment Policy Impact Tracker
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Track the real-world impact of government employment policies and initiatives across Cameroon. 
            Monitor job creation, budget allocation, and regional development outcomes.
          </p>
          <Badge variant="secondary" className="text-sm">
            Real-time policy monitoring
          </Badge>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs Created</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJobsCreated.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From active policies</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Allocated</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalBudgetAllocated / 1000000000).toFixed(1)}B</div>
              <p className="text-xs text-muted-foreground">FCFA committed</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetEfficiency.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Of allocated funds</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageSuccessRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Average across policies</p>
            </CardContent>
          </Card>
        </div>

        {/* Policy Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Performance by Jobs Created</CardTitle>
              <CardDescription>Impact measurement of employment policies</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={policies} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="policy_name" type="category" width={120} fontSize={12} />
                  <Bar dataKey="jobs_created" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation vs Spending</CardTitle>
              <CardDescription>Financial efficiency of policy implementation</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={policies}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="policy_name" angle={-45} textAnchor="end" height={80} fontSize={10} />
                  <YAxis />
                  <Bar dataKey="budget_allocated_fcfa" fill="hsl(var(--primary))" name="Allocated" />
                  <Bar dataKey="budget_spent_fcfa" fill="hsl(var(--secondary))" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Policy Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Policy Implementation Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {policies?.map((policy, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{policy.policy_name}</CardTitle>
                    <Badge 
                      variant={policy.success_rate > 80 ? "default" : policy.success_rate > 60 ? "secondary" : "destructive"}
                    >
                      {policy.success_rate.toFixed(1)}% Success
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Started: {new Date(policy.implementation_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Jobs Impact */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Jobs Created</span>
                      <span className="font-bold text-green-600">{policy.jobs_created.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Budget Utilization</span>
                      <span className="text-sm font-medium">
                        {((policy.budget_spent_fcfa / policy.budget_allocated_fcfa) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(policy.budget_spent_fcfa / policy.budget_allocated_fcfa) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Spent: {(policy.budget_spent_fcfa / 1000000000).toFixed(1)}B FCFA</span>
                      <span>Total: {(policy.budget_allocated_fcfa / 1000000000).toFixed(1)}B FCFA</span>
                    </div>
                  </div>

                  {/* Regions Affected */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Regions Affected</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {policy.regions_affected.map((region) => (
                        <Badge key={region} variant="outline" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Efficiency Metrics */}
                  <div className="pt-2 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {(policy.budget_spent_fcfa / policy.jobs_created / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-xs text-muted-foreground">FCFA per job</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-secondary">
                          {policy.regions_affected.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Regions</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Rate Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Success Rate Distribution</CardTitle>
            <CardDescription>Performance analysis of employment policies</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={policies?.map(policy => ({
                    name: policy.policy_name,
                    value: policy.success_rate
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {policies?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Policy impact tracking promotes government accountability and evidence-based decision making.
              </p>
              <p className="text-xs text-muted-foreground">
                Data is sourced from government agencies, implementation partners, and verified through independent monitoring.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CivicLayout>
  );
}