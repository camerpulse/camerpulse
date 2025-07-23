import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle } from 'lucide-react';

interface ScoreBreakdownProps {
  entityType: string;
  entityId: string;
  entityName: string;
}

export function ScoreBreakdown({ entityType, entityId, entityName }: ScoreBreakdownProps) {
  // Fetch reputation data from existing system
  const { data: reputation } = useQuery({
    queryKey: ['civic-reputation', entityType, entityId],
    queryFn: async () => {
      if (entityType === 'politician') {
        const { data, error } = await supabase
          .from('politicians')
          .select('id, name, civic_score, verified')
          .eq('id', entityId)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data ? {
          id: data.id,
          entity_name: data.name,
          total_score: data.civic_score || 0,
          reputation_badge: data.civic_score >= 80 ? 'excellent' : data.civic_score >= 60 ? 'trusted' : 'under_watch'
        } : null;
      }
      
      if (entityType === 'senator') {
        const { data, error } = await supabase
          .from('senators')
          .select('id, name, performance_score, transparency_score')
          .eq('id', entityId)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data ? {
          id: data.id,
          entity_name: data.name,
          total_score: data.performance_score || 0,
          reputation_badge: data.performance_score >= 80 ? 'excellent' : data.performance_score >= 60 ? 'trusted' : 'under_watch'
        } : null;
      }
      
      return null;
    },
  });

  // Mock data for demo purposes since detailed breakdown tables don't exist yet
  const sources = [
    { id: 1, description: 'Bill sponsorship and participation', source_type: 'bill_passed', score_impact: 15 },
    { id: 2, description: 'Citizen feedback and ratings', source_type: 'citizen_rating', score_impact: 10 },
    { id: 3, description: 'Project completion', source_type: 'project_completed', score_impact: 8 },
  ];

  const breakdown = [
    { id: 1, category: 'projects_completed', score: 75, percentage: 75 },
    { id: 2, category: 'bills_sponsored', score: 60, percentage: 60 },
    { id: 3, category: 'citizen_complaints', score: 90, percentage: 90 },
    { id: 4, category: 'transparency_audit', score: 80, percentage: 80 },
  ];

  const history = [
    { id: 1, changed_at: new Date().toISOString(), new_score: reputation?.total_score || 50, score_change: 5 },
  ];

  if (!reputation) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No reputation data available yet</p>
            <p className="text-sm">Reputation will be calculated based on public service activities</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const breakdownChartData = breakdown?.map(item => ({
    category: item.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    score: item.score,
    percentage: item.percentage,
  })) || [];

  const historyChartData = history?.slice(0, 7).reverse().map(item => ({
    date: new Date(item.changed_at).toLocaleDateString(),
    score: item.new_score,
    change: item.score_change,
  })) || [];

  const sourceTypeData = sources?.reduce((acc, source) => {
    const type = source.source_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += Math.abs(source.score_impact);
      existing.count += 1;
    } else {
      acc.push({
        name: type,
        value: Math.abs(source.score_impact),
        count: 1,
        impact: source.score_impact > 0 ? 'positive' : 'negative'
      });
    }
    return acc;
  }, [] as any[]) || [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const getImpactIcon = (impact: number) => {
    if (impact > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (impact < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <CheckCircle className="h-4 w-4 text-gray-500" />;
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600 bg-green-50';
    if (impact < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Reputation Breakdown: {entityName}
          </CardTitle>
          <CardDescription>
            Detailed analysis of reputation score components and contributing factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{reputation?.total_score || 0}/100</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="capitalize">
                {reputation?.reputation_badge || 'Not Rated'}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Reputation Level</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500">
                <span className="capitalize">Stable</span>
              </div>
              <div className="text-sm text-muted-foreground">Trend</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{sources?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Score Sources</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
          <TabsTrigger value="sources">Score Sources</TabsTrigger>
          <TabsTrigger value="history">Score History</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Categories</CardTitle>
              <CardDescription>Score breakdown by performance category</CardDescription>
            </CardHeader>
            <CardContent>
              {breakdownChartData.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={breakdownChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="grid gap-2">
                    {breakdown?.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="capitalize font-medium">
                          {item.category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress value={item.percentage} className="w-20" />
                          <span className="text-sm font-medium">{item.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No breakdown data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Source Impact Distribution</CardTitle>
                <CardDescription>Types of activities affecting reputation</CardDescription>
              </CardHeader>
              <CardContent>
                {sourceTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={sourceTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sourceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No source data available</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Score Sources</CardTitle>
                <CardDescription>Activities contributing to current score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sources?.slice(0, 10).map((source) => (
                    <div key={source.id} className="flex items-start gap-3 p-2 border rounded">
                      <div className="flex-shrink-0">
                        {getImpactIcon(source.score_impact)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{source.description}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {source.source_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(source.score_impact)}`}>
                        {source.score_impact > 0 ? '+' : ''}{source.score_impact}
                      </div>
                    </div>
                  ))}
                  {(!sources || sources.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground">
                      No score sources recorded yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score History</CardTitle>
              <CardDescription>Reputation score changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              {historyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={historyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No history data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}