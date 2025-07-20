import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Search, 
  Award, 
  Calendar,
  FileText,
  MessageSquare,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const PoliticianPerformance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const politicians = [
    {
      id: 1,
      name: 'Hon. Marie Ngozi',
      position: 'Minister of Education',
      region: 'Centre',
      party: 'CPDM',
      avatar: '/placeholder.svg',
      overallScore: 87,
      attendanceScore: 92,
      votingAlignmentScore: 85,
      billEffectivenessScore: 78,
      transparencyScore: 91,
      publicEngagementScore: 84,
      trend: 'up',
      alerts: 0,
      recentActivity: 'Sponsored education reform bill'
    },
    {
      id: 2,
      name: 'Hon. Jean Baptiste Fouda',
      position: 'Deputy - Douala I',
      region: 'Littoral',
      party: 'SDF',
      avatar: '/placeholder.svg',
      overallScore: 73,
      attendanceScore: 88,
      votingAlignmentScore: 72,
      billEffectivenessScore: 69,
      transparencyScore: 75,
      publicEngagementScore: 71,
      trend: 'down',
      alerts: 2,
      recentActivity: 'Missed 3 consecutive sessions'
    },
    {
      id: 3,
      name: 'Hon. Aminata Sow',
      position: 'Senator - North',
      region: 'North',
      party: 'UNDP',
      avatar: '/placeholder.svg',
      overallScore: 95,
      attendanceScore: 98,
      votingAlignmentScore: 94,
      billEffectivenessScore: 92,
      transparencyScore: 96,
      publicEngagementScore: 93,
      trend: 'up',
      alerts: 0,
      recentActivity: 'Launched transparency initiative'
    }
  ];

  const performanceMetrics = [
    {
      title: 'Session Attendance',
      icon: Clock,
      description: 'Regular participation in legislative sessions',
      weight: '25%'
    },
    {
      title: 'Voting Record',
      icon: CheckCircle,
      description: 'Consistency with party platform and constituent interests',
      weight: '20%'
    },
    {
      title: 'Bill Effectiveness',
      icon: FileText,
      description: 'Success rate of sponsored and co-sponsored legislation',
      weight: '20%'
    },
    {
      title: 'Transparency',
      icon: Eye,
      description: 'Asset disclosure and public communication',
      weight: '15%'
    },
    {
      title: 'Public Engagement',
      icon: MessageSquare,
      description: 'Town halls, social media, and constituent outreach',
      weight: '20%'
    }
  ];

  const topPerformers = [
    { name: 'Hon. Aminata Sow', score: 95, change: '+3' },
    { name: 'Hon. Marie Ngozi', score: 87, change: '+1' },
    { name: 'Hon. Paul Atanga', score: 84, change: '-2' },
    { name: 'Hon. Grace Muna', score: 82, change: '+5' },
    { name: 'Hon. Thomas Mbarga', score: 80, change: '0' }
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const PoliticianCard = ({ politician }: { politician: any }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{politician.name}</CardTitle>
              <CardDescription>{politician.position}</CardDescription>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{politician.party}</Badge>
                <span className="text-sm text-muted-foreground">{politician.region}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(politician.overallScore)}`}>
              {politician.overallScore}
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(politician.trend)}
              <span className="text-sm text-muted-foreground">Overall</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Performance Breakdown */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span>Attendance</span>
                <span className="font-medium">{politician.attendanceScore}%</span>
              </div>
              <Progress value={politician.attendanceScore} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Transparency</span>
                <span className="font-medium">{politician.transparencyScore}%</span>
              </div>
              <Progress value={politician.transparencyScore} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Bill Success</span>
                <span className="font-medium">{politician.billEffectivenessScore}%</span>
              </div>
              <Progress value={politician.billEffectivenessScore} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Engagement</span>
                <span className="font-medium">{politician.publicEngagementScore}%</span>
              </div>
              <Progress value={politician.publicEngagementScore} className="h-1.5" />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground mb-1">Recent Activity</div>
            <div className="text-sm">{politician.recentActivity}</div>
          </div>

          {/* Alerts */}
          {politician.alerts > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded border border-orange-200">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-700">
                {politician.alerts} performance alert{politician.alerts > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="flex space-x-2">
            <Button size="sm" className="flex-1">View Details</Button>
            <Button size="sm" variant="outline">Compare</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Politician Performance Tracker</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive performance analytics and accountability metrics for political representatives
          </p>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">247</div>
                  <div className="text-sm text-muted-foreground">Politicians Tracked</div>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">78.5%</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Active Alerts</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="rankings">Rankings</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search politicians..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {politicians.map((politician) => (
                    <PoliticianCard key={politician.id} politician={politician} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rankings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Rankings</CardTitle>
                    <CardDescription>Top performers by overall score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topPerformers.map((performer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                            <span className="font-medium">{performer.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg">{performer.score}</span>
                            <Badge variant={performer.change.startsWith('+') ? 'default' : performer.change.startsWith('-') ? 'destructive' : 'secondary'}>
                              {performer.change}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Performance Trends</h3>
                    <p className="text-muted-foreground">
                      Detailed trend analysis and historical performance data coming soon.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6">
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Performance Alerts</h3>
                    <p className="text-muted-foreground">
                      Monitor and manage performance alerts and notifications.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scoring Methodology</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{metric.title}</div>
                        <div className="text-xs text-muted-foreground">{metric.description}</div>
                        <Badge variant="outline" className="mt-1 text-xs">{metric.weight}</Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Compare Politicians
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Review
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliticianPerformance;