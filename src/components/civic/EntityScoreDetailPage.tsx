import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Building2,
  Home,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Flag,
  FileText,
  BarChart3,
  Users,
  ArrowLeft,
  ExternalLink,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface EntityDetail {
  id: string;
  type: 'politician' | 'ministry' | 'village' | 'citizen';
  name: string;
  title?: string;
  region: string;
  currentScore: number;
  previousScore: number;
  scoreLevel: 'excellent' | 'good' | 'average' | 'poor' | 'flagged';
  scoreTrend: 'rising' | 'falling' | 'stable';
  avatar?: string;
  lastUpdated: string;
  verificationStatus: 'verified' | 'unverified' | 'flagged';
}

interface ScoreBreakdown {
  category: string;
  score: number;
  percentage: number;
  dataPoints: number;
}

interface ScoreHistory {
  date: string;
  score: number;
  reason?: string;
}

interface DataSource {
  source: string;
  icon: any;
  count: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export function EntityScoreDetailPage() {
  const { entityId } = useParams<{ entityId: string }>();
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState<EntityDetail | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);

  useEffect(() => {
    fetchEntityDetails();
  }, [entityId]);

  const fetchEntityDetails = async () => {
    setLoading(true);
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockEntity: EntityDetail = {
        id: entityId || '1',
        type: 'politician',
        name: 'Hon. John Tamfu',
        title: 'Member of Parliament - Mezam',
        region: 'Northwest',
        currentScore: 82,
        previousScore: 75,
        scoreLevel: 'excellent',
        scoreTrend: 'rising',
        lastUpdated: new Date().toISOString(),
        verificationStatus: 'verified'
      };

      const mockHistory: ScoreHistory[] = [
        { date: '2024-01', score: 68, reason: 'Initial assessment' },
        { date: '2024-02', score: 71, reason: 'Community engagement' },
        { date: '2024-03', score: 75, reason: 'Bill sponsorship' },
        { date: '2024-04', score: 78, reason: 'Project completion' },
        { date: '2024-05', score: 82, reason: 'Healthcare initiative' }
      ];

      const mockBreakdown: ScoreBreakdown[] = [
        { category: 'Legislative Performance', score: 85, percentage: 30, dataPoints: 12 },
        { category: 'Community Engagement', score: 88, percentage: 25, dataPoints: 8 },
        { category: 'Project Delivery', score: 79, percentage: 20, dataPoints: 15 },
        { category: 'Transparency', score: 76, percentage: 15, dataPoints: 6 },
        { category: 'Citizen Feedback', score: 83, percentage: 10, dataPoints: 24 }
      ];

      const mockDataSources: DataSource[] = [
        { source: 'CivicPetitions', icon: FileText, count: 8, impact: 'positive' },
        { source: 'Legislations', icon: Building2, count: 12, impact: 'positive' },
        { source: 'CivicWatch', icon: Shield, count: 15, impact: 'neutral' },
        { source: 'Audits', icon: BarChart3, count: 3, impact: 'positive' },
        { source: 'Citizen Reports', icon: Users, count: 24, impact: 'positive' }
      ];

      setEntity(mockEntity);
      setScoreHistory(mockHistory);
      setScoreBreakdown(mockBreakdown);
      setDataSources(mockDataSources);
      setLoading(false);
    }, 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'politician': return User;
      case 'ministry': return Building2;
      case 'village': return Home;
      default: return User;
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--border))'];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Entity Not Found</h2>
          <p className="text-muted-foreground">The requested entity could not be found.</p>
        </div>
      </div>
    );
  }

  const EntityIcon = getEntityIcon(entity.type);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <Badge variant="outline">{entity.type}</Badge>
      </div>

      {/* Entity Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={entity.avatar} />
                <AvatarFallback>
                  <EntityIcon className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{entity.name}</h1>
                  {entity.verificationStatus === 'verified' && (
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                {entity.title && (
                  <p className="text-lg text-muted-foreground">{entity.title}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {entity.region}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Updated {new Date(entity.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold" style={{ color: getScoreColor(entity.currentScore) }}>
                  {entity.currentScore}
                </span>
                <div className="flex items-center gap-1">
                  {entity.scoreTrend === 'rising' ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : entity.scoreTrend === 'falling' ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : null}
                  <span className="text-sm text-muted-foreground">
                    {entity.currentScore > entity.previousScore ? '+' : ''}
                    {entity.currentScore - entity.previousScore}
                  </span>
                </div>
              </div>
              <Badge variant="outline" style={{ color: getScoreColor(entity.currentScore) }}>
                {entity.scoreLevel.charAt(0).toUpperCase() + entity.scoreLevel.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scoreBreakdown.slice(0, 3).map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span style={{ color: getScoreColor(item.score) }}>
                        {item.score}/100
                      </span>
                    </div>
                    <Progress 
                      value={item.score} 
                      className="h-2"
                      style={{ 
                        background: 'hsl(var(--muted))',
                      }}
                    />
                    <div className="text-xs text-muted-foreground">
                      {item.dataPoints} data points
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Score Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scoreHistory.slice(-3).reverse().map((change, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">{change.date}</div>
                      <div className="text-sm">{change.reason}</div>
                    </div>
                    <div className="font-medium" style={{ color: getScoreColor(change.score) }}>
                      {change.score}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category.split(' ')[0]} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {scoreBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scoreBreakdown.map((item) => (
                  <div key={item.category} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{item.category}</h4>
                      <Badge variant="outline" style={{ color: getScoreColor(item.score) }}>
                        {item.score}/100
                      </Badge>
                    </div>
                    <Progress value={item.score} className="mb-2" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Weight: {item.percentage}%</span>
                      <span>{item.dataPoints} data points</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Score History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold">{label}</p>
                            <p style={{ color: getScoreColor(data.score) }}>
                              Score: {data.score}
                            </p>
                            {data.reason && (
                              <p className="text-sm text-muted-foreground">{data.reason}</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.map((source) => {
              const Icon = source.icon;
              return (
                <Card key={source.source}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{source.source}</h4>
                          <p className="text-sm text-muted-foreground">
                            {source.count} records
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          source.impact === 'positive'
                            ? 'text-success border-success'
                            : source.impact === 'negative'
                            ? 'text-destructive border-destructive'
                            : 'text-muted-foreground'
                        }
                      >
                        {source.impact}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Flag className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
            <Button>
              View Public Profile
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}