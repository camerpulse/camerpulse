import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Users, 
  TrendingUp, 
  MessageCircle, 
  FileText, 
  Heart, 
  Eye, 
  Calendar,
  Award,
  Plus,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface EngagementScore {
  id: string;
  politician_id: string;
  overall_score: number;
  communication_score: number;
  participation_score: number;
  constituency_outreach_score: number;
  public_visibility_score: number;
  policy_advocacy_score: number;
  engagement_level: string;
  last_activity_date: string | null;
  last_activity_description: string | null;
  total_activities: number;
  politician?: {
    name: string;
    position: string;
    party: string;
    region: string;
  } | null;
}

interface EngagementActivity {
  id: string;
  politician_id: string;
  activity_type: string;
  category: string;
  title: string;
  description: string;
  activity_date: string;
  location: string;
  impact_score: number;
  source_url: string | null;
  verified: boolean;
  politician?: {
    name: string;
    position: string;
  } | null;
}

interface EngagementStats {
  total_politicians: number;
  highly_active: number;
  moderately_active: number;
  low_active: number;
  inactive: number;
  average_score: number;
  recent_activities: number;
}

const PoliticianEngagementScore: React.FC = () => {
  const [scores, setScores] = useState<EngagementScore[]>([]);
  const [activities, setActivities] = useState<EngagementActivity[]>([]);
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEngagementData();
  }, []);

  const loadEngagementData = async () => {
    try {
      setLoading(true);

      // Load engagement statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_engagement_statistics');

      if (statsError) {
        console.error('Stats error:', statsError);
      } else {
        setStats(statsData as unknown as EngagementStats);
      }

      // Load top engagement scores with politician info
      const { data: scoresData, error: scoresError } = await supabase
        .from('politician_engagement_scores')
        .select(`
          *,
          politician:politicians(name, position, party, region)
        `)
        .order('overall_score', { ascending: false })
        .limit(20);

      if (scoresError) {
        console.error('Scores error:', scoresError);
        toast({
          title: "Error Loading Scores",
          description: "Failed to load engagement scores",
          variant: "destructive",
        });
      } else {
        setScores((scoresData as any[]) || []);
      }

      // Load recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('engagement_activities')
        .select(`
          *,
          politician:politicians(name, position)
        `)
        .eq('verified', true)
        .order('activity_date', { ascending: false })
        .limit(50);

      if (activitiesError) {
        console.error('Activities error:', activitiesError);
      } else {
        setActivities((activitiesData as any[]) || []);
      }

    } catch (error) {
      console.error('Error loading engagement data:', error);
      toast({
        title: "Error",
        description: "Failed to load engagement data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEngagementLevelColor = (level: string) => {
    switch (level) {
      case 'highly_active': return 'bg-green-500';
      case 'moderately_active': return 'bg-yellow-500';
      case 'low_active': return 'bg-orange-500';
      case 'inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEngagementLevelText = (level: string) => {
    switch (level) {
      case 'highly_active': return 'Highly Active';
      case 'moderately_active': return 'Moderately Active';
      case 'low_active': return 'Low Active';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return <MessageCircle className="h-4 w-4" />;
      case 'participation': return <Users className="h-4 w-4" />;
      case 'constituency_outreach': return <Heart className="h-4 w-4" />;
      case 'public_visibility': return <Eye className="h-4 w-4" />;
      case 'policy_advocacy': return <FileText className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Politician Engagement Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Loading engagement data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Politician Engagement Score System
        </CardTitle>
        <CardDescription>
          Track how active, responsive, and visible each politician is based on verified public activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scores">Top Scores</TabsTrigger>
            <TabsTrigger value="activities">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Politicians</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_politicians}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Highly Active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.highly_active}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.average_score}/100</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.recent_activities}</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Engagement Levels Breakdown */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { level: 'highly_active', count: stats.highly_active, label: 'Highly Active', color: 'bg-green-500' },
                      { level: 'moderately_active', count: stats.moderately_active, label: 'Moderately Active', color: 'bg-yellow-500' },
                      { level: 'low_active', count: stats.low_active, label: 'Low Active', color: 'bg-orange-500' },
                      { level: 'inactive', count: stats.inactive, label: 'Inactive', color: 'bg-red-500' }
                    ].map((item) => (
                      <div key={item.level} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.count}</span>
                          <span className="text-xs text-muted-foreground">
                            ({stats.total_politicians > 0 ? Math.round((item.count / stats.total_politicians) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scores" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Top Engagement Scores</h3>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Activity
              </Button>
            </div>

            <div className="space-y-4">
              {scores.map((score) => (
                <Card key={score.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{score.politician?.name || 'Unknown'}</h4>
                          <Badge className={getEngagementLevelColor(score.engagement_level)}>
                            {getEngagementLevelText(score.engagement_level)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {score.politician?.position} • {score.politician?.party} • {score.politician?.region}
                        </p>
                        
                        {/* Overall Score */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Overall Score</span>
                            <span className="text-sm font-bold">{score.overall_score}/100</span>
                          </div>
                          <Progress value={score.overall_score} className="h-2" />
                        </div>

                        {/* Category Scores */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                          {[
                            { key: 'communication_score', label: 'Communication', icon: MessageCircle },
                            { key: 'participation_score', label: 'Participation', icon: Users },
                            { key: 'constituency_outreach_score', label: 'Outreach', icon: Heart },
                            { key: 'public_visibility_score', label: 'Visibility', icon: Eye },
                            { key: 'policy_advocacy_score', label: 'Advocacy', icon: FileText }
                          ].map((category) => (
                            <div key={category.key} className="text-center">
                              <div className="flex items-center justify-center mb-1">
                                <category.icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="text-xs text-muted-foreground">{category.label}</div>
                              <div className="text-sm font-bold">{score[category.key as keyof EngagementScore] as number}/100</div>
                            </div>
                          ))}
                        </div>

                        {/* Last Activity */}
                        {score.last_activity_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Last active: {formatDate(score.last_activity_date)}</span>
                            {score.last_activity_description && (
                              <span>• {score.last_activity_description}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{score.overall_score}</div>
                        <div className="text-xs text-muted-foreground">{score.total_activities} activities</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Political Activities</h3>
              <Button size="sm" variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getCategoryIcon(activity.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{activity.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {formatActivityType(activity.activity_type)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Impact: {activity.impact_score}/10
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.politician?.name} • {activity.politician?.position}
                        </p>
                        {activity.description && (
                          <p className="text-sm mb-2 line-clamp-2">{activity.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>{formatDate(activity.activity_date)}</span>
                            {activity.location && <span>📍 {activity.location}</span>}
                          </div>
                          {activity.source_url && (
                            <Button size="sm" variant="ghost" className="h-auto p-1 gap-1">
                              <ExternalLink className="h-3 w-3" />
                              Source
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Detailed charts and trends for politician engagement patterns
              </p>
              <Button className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Coming Soon
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PoliticianEngagementScore;