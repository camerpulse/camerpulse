import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreatePollDialog } from '@/components/Polls/CreatePollDialog';
import { PollResponsePanel } from './PollResponsePanel';
import { 
  Plus, 
  Vote, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  BarChart3,
  Award,
  Target
} from 'lucide-react';

interface PoliticianProfile {
  id: string;
  name: string;
  role_title: string;
  party: string;
  region: string;
  civic_score: number;
  performance_score: number;
  transparency_rating: number;
  can_create_polls: boolean;
  poll_creation_count: number;
  verified: boolean;
  is_claimed: boolean;
}

interface DashboardStats {
  totalPolls: number;
  totalResponses: number;
  avgCivicScore: number;
  recentImpacts: number;
}

export const PoliticianDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [politician, setPolitician] = useState<PoliticianProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPolls: 0,
    totalResponses: 0,
    avgCivicScore: 0,
    recentImpacts: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPoliticianProfile();
      fetchDashboardStats();
    }
  }, [user]);

  const fetchPoliticianProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .eq('user_id', user?.id)
        .eq('verified', true)
        .eq('is_claimed', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Access Denied",
            description: "No verified political profile found for your account",
            variant: "destructive"
          });
        }
        return;
      }

      setPolitician(data);
    } catch (error) {
      console.error('Error fetching politician profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      // Fetch polls created by politician
      const { data: pollsData } = await supabase
        .from('polls')
        .select('id')
        .eq('creator_id', user.id);

      // Fetch poll responses by politician
      const { data: responsesData } = await supabase
        .from('politician_poll_responses')
        .select('id')
        .eq('politician_id', politician?.id);

      // Fetch recent impact tracking
      const { data: impactsData } = await supabase
        .from('poll_impact_tracking')
        .select('id')
        .eq('politician_id', politician?.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalPolls: pollsData?.length || 0,
        totalResponses: responsesData?.length || 0,
        avgCivicScore: politician?.civic_score || 0,
        recentImpacts: impactsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!politician) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Political Profile Required</h3>
            <p className="text-muted-foreground mb-4">
              You need a verified and claimed political profile to access this dashboard.
            </p>
            <Button variant="outline">
              Learn About Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Political Dashboard
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{politician.name}</span>
            <Badge variant="outline">{politician.role_title}</Badge>
            <Badge variant="secondary">{politician.party}</Badge>
            <Badge className="bg-cm-green text-white">{politician.region}</Badge>
          </div>
        </div>

        {politician.can_create_polls && (
          <Button onClick={() => setShowCreatePoll(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Poll
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Vote className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalPolls}</div>
            <div className="text-sm text-muted-foreground">Polls Created</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-cm-blue mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalResponses}</div>
            <div className="text-sm text-muted-foreground">Poll Responses</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-cm-green mx-auto mb-2" />
            <div className="text-2xl font-bold">{politician.civic_score?.toFixed(1) || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">Civic Score</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-cm-yellow mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.recentImpacts}</div>
            <div className="text-sm text-muted-foreground">Recent Impacts</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Civic Score</span>
                  <span className="text-sm text-muted-foreground">
                    {politician.civic_score?.toFixed(1) || 'N/A'}/100
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-cm-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${politician.civic_score || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Performance Score</span>
                  <span className="text-sm text-muted-foreground">
                    {politician.performance_score?.toFixed(1) || 'N/A'}/100
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-cm-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${politician.performance_score || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Transparency Rating</span>
                  <span className="text-sm text-muted-foreground">
                    {politician.transparency_rating?.toFixed(1) || 'N/A'}/100
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-cm-yellow h-2 rounded-full transition-all duration-300"
                    style={{ width: `${politician.transparency_rating || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Poll Creation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              {politician.can_create_polls ? (
                <>
                  <div className="w-16 h-16 bg-cm-green/10 rounded-full flex items-center justify-center mx-auto">
                    <Vote className="w-8 h-8 text-cm-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-cm-green">Enabled</p>
                    <p className="text-sm text-muted-foreground">
                      You can create polls from your dashboard
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Vote className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Disabled</p>
                    <p className="text-sm text-muted-foreground">
                      Contact admin to enable poll creation
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="responses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="responses">Poll Responses</TabsTrigger>
          <TabsTrigger value="created">Created Polls</TabsTrigger>
        </TabsList>

        <TabsContent value="responses">
          <PollResponsePanel politicianId={politician.id} />
        </TabsContent>

        <TabsContent value="created">
          <Card>
            <CardHeader>
              <CardTitle>Your Created Polls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Your created polls will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Poll Dialog */}
      <CreatePollDialog
        isOpen={showCreatePoll}
        onClose={() => setShowCreatePoll(false)}
        onSuccess={() => {
          setShowCreatePoll(false);
          fetchDashboardStats();
          toast({
            title: "Poll Created",
            description: "Your poll has been created successfully"
          });
        }}
      />
    </div>
  );
};