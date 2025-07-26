import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Building, Vote, MessageSquare, Calendar, 
  TrendingUp, Target, Award, ArrowRight, ExternalLink, Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface CivicEngagementData {
  village_projects_count: number;
  active_petitions_count: number;
  politician_interactions: number;
  civic_events_attended: number;
  community_discussions: number;
  voter_registration_rate: number;
  political_awareness_score: number;
  civic_participation_trend: 'up' | 'down' | 'stable';
}

interface Project {
  id: string;
  title: string;
  status: string;
  completion_percentage: number;
  created_at: string;
}

interface Politician {
  id: string;
  name: string;
  position: string;
  last_interaction: string;
  interaction_type: string;
}

interface VillageCivicEngagementIntegrationProps {
  villageId: string;
  villageName: string;
}

export const VillageCivicEngagementIntegration: React.FC<VillageCivicEngagementIntegrationProps> = ({
  villageId,
  villageName
}) => {
  const [engagementData, setEngagementData] = useState<CivicEngagementData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCivicEngagementData();
  }, [villageId]);

  const fetchCivicEngagementData = async () => {
    try {
      setLoading(true);
      
      // Mock village projects data since the table structure may not exist yet
      const mockProjects: Project[] = [
        {
          id: '1',
          title: 'Village Water System Upgrade',
          status: 'in_progress',
          completion_percentage: 75,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Community Health Center',
          status: 'planned',
          completion_percentage: 15,
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setProjects(mockProjects);

      // Simulate civic engagement metrics (in production, calculate from real data)
      const mockEngagementData: CivicEngagementData = {
        village_projects_count: mockProjects?.length || 0,
        active_petitions_count: Math.floor(Math.random() * 5),
        politician_interactions: Math.floor(Math.random() * 10),
        civic_events_attended: Math.floor(Math.random() * 15),
        community_discussions: Math.floor(Math.random() * 20),
        voter_registration_rate: 60 + Math.floor(Math.random() * 40),
        political_awareness_score: 70 + Math.floor(Math.random() * 30),
        civic_participation_trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
      };

      setEngagementData(mockEngagementData);

      // Mock politician data
      const mockPoliticians: Politician[] = [
        {
          id: '1',
          name: 'Hon. Marie Dubois',
          position: 'MP for Douala III',
          last_interaction: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          interaction_type: 'village visit'
        },
        {
          id: '2',
          name: 'Mayor Jean Nguema',
          position: 'Mayor of Douala',
          last_interaction: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
          interaction_type: 'project meeting'
        }
      ];

      setPoliticians(mockPoliticians);

    } catch (error) {
      console.error('Error fetching civic engagement data:', error);
      toast.error('Failed to load civic engagement data');
    } finally {
      setLoading(false);
    }
  };

  const calculateCivicScore = (): number => {
    if (!engagementData) return 0;
    
    const weights = {
      projects: 0.25,
      petitions: 0.15,
      politician_interactions: 0.20,
      events: 0.15,
      discussions: 0.10,
      voter_registration: 0.15
    };

    return (
      (Math.min(engagementData.village_projects_count * 10, 100) * weights.projects) +
      (Math.min(engagementData.active_petitions_count * 20, 100) * weights.petitions) +
      (Math.min(engagementData.politician_interactions * 10, 100) * weights.politician_interactions) +
      (Math.min(engagementData.civic_events_attended * 6.67, 100) * weights.events) +
      (Math.min(engagementData.community_discussions * 5, 100) * weights.discussions) +
      (engagementData.voter_registration_rate * weights.voter_registration)
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'planned': return 'bg-yellow-500';
      case 'on_hold': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const civicScore = calculateCivicScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Civic Engagement Integration
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Political participation and community involvement metrics
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {civicScore.toFixed(1)}%
              </div>
              <div className="flex items-center justify-end gap-1">
                {engagementData && getTrendIcon(engagementData.civic_participation_trend)}
                <span className="text-sm text-muted-foreground">
                  {engagementData?.civic_participation_trend}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Projects</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {engagementData?.village_projects_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Petitions</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {engagementData?.active_petitions_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Political Links</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {engagementData?.politician_interactions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Events</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {engagementData?.civic_events_attended || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Village Projects</TabsTrigger>
          <TabsTrigger value="politicians">Political Connections</TabsTrigger>
          <TabsTrigger value="participation">Participation Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Village Projects</h3>
            <Link to={`/village/${villageId}/projects`}>
              <Button variant="outline" size="sm">
                View All <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{project.title}</h4>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.completion_percentage}%</span>
                    </div>
                    <Progress value={project.completion_percentage} />
                    <div className="text-xs text-muted-foreground">
                      Started: {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {projects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active projects found</p>
                <Button variant="outline" className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Propose a Project
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="politicians" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Political Representatives</h3>
            <Link to="/politicians">
              <Button variant="outline" size="sm">
                Find Representatives <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {politicians.map((politician) => (
              <Card key={politician.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{politician.name}</h4>
                      <p className="text-sm text-muted-foreground">{politician.position}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {politician.interaction_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(politician.last_interaction).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Contact <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="participation" className="space-y-4">
          <h3 className="text-lg font-semibold">Civic Participation Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Voter Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-2">
                  {engagementData?.voter_registration_rate}%
                </div>
                <Progress value={engagementData?.voter_registration_rate || 0} />
                <p className="text-xs text-muted-foreground mt-2">
                  Estimated eligible voters registered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Political Awareness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary mb-2">
                  {engagementData?.political_awareness_score}%
                </div>
                <Progress value={engagementData?.political_awareness_score || 0} />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on community discussions and engagement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Community Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent mb-2">
                  {engagementData?.community_discussions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active political and civic discussions this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Civic Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning mb-2">
                  {engagementData?.civic_events_attended}
                </div>
                <p className="text-xs text-muted-foreground">
                  Community members attending civic events
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Civic Engagement Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {civicScore >= 80 && (
                  <div className="flex items-center gap-3 p-3 border border-green-500/20 rounded-lg">
                    <Award className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-600">Highly Engaged Community</p>
                      <p className="text-xs text-muted-foreground">Outstanding civic participation</p>
                    </div>
                  </div>
                )}
                
                {engagementData?.village_projects_count && engagementData.village_projects_count >= 5 && (
                  <div className="flex items-center gap-3 p-3 border border-blue-500/20 rounded-lg">
                    <Building className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">Project Champion</p>
                      <p className="text-xs text-muted-foreground">Multiple active development projects</p>
                    </div>
                  </div>
                )}
                
                {engagementData?.voter_registration_rate && engagementData.voter_registration_rate >= 85 && (
                  <div className="flex items-center gap-3 p-3 border border-purple-500/20 rounded-lg">
                    <Vote className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-600">Democratic Pioneer</p>
                      <p className="text-xs text-muted-foreground">High voter registration rate</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};