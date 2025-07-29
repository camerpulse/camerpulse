import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, CheckCircle, Clock, Star, Trophy, 
  MapPin, Eye, Edit, MessageSquare, BarChart3, Award,
  AlertTriangle, FileText, Calendar, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModeratorProfile {
  id: string;
  user_id: string;
  moderator_role: string;
  status: string;
  coverage_regions: string[];
  assigned_villages: string[];
  total_edits: number;
  total_approvals: number;
  total_rejections: number;
  last_active_at: string | null;
  created_at: string;
}

interface ModeratorBadge {
  id: string;
  badge_type: string;
  earned_at: string;
  description: string | null;
}

interface PendingSubmission {
  id: string;
  submission_type: string;
  submission_data: any;
  priority_level: number;
  region: string | null;
  created_at: string;
  submitted_by: string;
}

const badgeInfo = {
  civic_historian: { name: '🧠 Civic Historian', description: 'Contributed 10+ historical entries' },
  village_builder: { name: '🛠️ Village Builder', description: 'Verified 5+ infrastructure projects' },
  conflict_resolver: { name: '🕊️ Conflict Resolver', description: 'Logged and resolved a known conflict' },
  regional_pioneer: { name: '🧭 Regional Pioneer', description: 'First to complete 100% of village profile' },
  diaspora_link: { name: '🌍 Diaspora Link', description: 'Verified 3+ diaspora billionaires' },
  voice_of_people: { name: '📢 Voice of the People', description: 'Managed 5+ successful petitions' },
  civic_hero: { name: '🔥 Civic Hero', description: 'Most active monthly moderator' }
};

const roleColors = {
  village_moderator: 'bg-green-100 text-green-800',
  subdivision_moderator: 'bg-blue-100 text-blue-800',
  regional_moderator: 'bg-yellow-100 text-yellow-800',
  national_civic_lead: 'bg-red-100 text-red-800'
};

export const ModeratorDashboard: React.FC = () => {
  const [moderatorProfile, setModeratorProfile] = useState<ModeratorProfile | null>(null);
  const [badges, setBadges] = useState<ModeratorBadge[]>([]);
  const [pendingQueue, setPendingQueue] = useState<PendingSubmission[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModeratorData();
  }, []);

  const fetchModeratorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch moderator profile
      const { data: profile, error: profileError } = await supabase
        .from('civic_moderators')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setModeratorProfile(profile);

      // Fetch badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('moderator_badges')
        .select('*')
        .eq('moderator_id', profile.id)
        .order('earned_at', { ascending: false });

      if (badgesError) throw badgesError;
      setBadges(badgesData || []);

      // Fetch pending queue
      const { data: queueData, error: queueError } = await supabase
        .from('moderation_queue')
        .select('*')
        .eq('assigned_to', profile.id)
        .eq('status', 'pending')
        .order('priority_level', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(10);

      if (queueError) throw queueError;
      setPendingQueue(queueData || []);

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_moderator_stats', { p_moderator_id: profile.id });

      if (statsError) throw statsError;
      setStats(statsData);

    } catch (error) {
      console.error('Error fetching moderator data:', error);
      toast.error('Failed to load moderator dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionAction = async (submissionId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          decision_reason: reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: moderatorProfile?.id
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Update moderator stats
      if (moderatorProfile) {
        await supabase
          .from('civic_moderators')
          .update({
            [action === 'approve' ? 'total_approvals' : 'total_rejections']: 
              moderatorProfile[action === 'approve' ? 'total_approvals' : 'total_rejections'] + 1,
            total_edits: moderatorProfile.total_edits + 1,
            last_active_at: new Date().toISOString()
          })
          .eq('id', moderatorProfile.id);
      }

      toast.success(`Submission ${action}d successfully`);
      fetchModeratorData(); // Refresh data
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error(`Failed to ${action} submission`);
    }
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 1: return 'text-red-600 bg-red-100';
      case 2: return 'text-orange-600 bg-orange-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-blue-600 bg-blue-100';
      case 5: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityText = (level: number) => {
    switch (level) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      case 5: return 'Very Low';
      default: return 'Medium';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!moderatorProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Moderator Access Required</h2>
            <p className="text-muted-foreground mb-4">
              You need to be an approved civic moderator to access this dashboard.
            </p>
            <Button onClick={() => window.location.href = '/moderators/apply'}>
              Apply to Become a Moderator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const approvalRate = moderatorProfile.total_edits > 0 
    ? Math.round((moderatorProfile.total_approvals / moderatorProfile.total_edits) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="h-8 w-8 mr-3 text-civic" />
              Moderator Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage civic data for {moderatorProfile.coverage_regions.join(', ')}
            </p>
          </div>
          <Badge className={`px-3 py-1 ${roleColors[moderatorProfile.moderator_role as keyof typeof roleColors]}`}>
            {moderatorProfile.moderator_role.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-civic/10 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-civic" />
              </div>
              <div>
                <p className="text-2xl font-bold">{moderatorProfile.total_approvals}</p>
                <p className="text-sm text-muted-foreground">Approvals</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-warning/10 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.pending_queue || 0}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-success/10 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvalRate}%</p>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-accent/10 rounded-lg mr-4">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{badges.length}</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="queue">Review Queue</TabsTrigger>
            <TabsTrigger value="villages">My Villages</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Pending Submissions ({pendingQueue.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingQueue.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No pending submissions to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingQueue.map((submission) => (
                      <div key={submission.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold capitalize">
                              {submission.submission_type.replace('_', ' ')}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              {submission.region && (
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {submission.region}
                                </Badge>
                              )}
                              <Badge className={`text-xs ${getPriorityColor(submission.priority_level)}`}>
                                {getPriorityText(submission.priority_level)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSubmissionAction(submission.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleSubmissionAction(submission.id, 'reject', 'Needs review')}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                        {submission.submission_data && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                            {JSON.stringify(submission.submission_data, null, 2).substring(0, 200)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="villages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Assigned Villages ({moderatorProfile.assigned_villages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {moderatorProfile.assigned_villages.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No villages assigned yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Villages will be assigned based on your coverage area and activity level
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {moderatorProfile.assigned_villages.map((villageId, index) => (
                      <Card key={villageId} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Village {index + 1}</h3>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Click to manage village profile
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Earned Badges ({badges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No badges earned yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete moderation tasks to earn badges and recognition
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                      <Card key={badge.id} className="text-center p-4">
                        <div className="text-2xl mb-2">
                          {badgeInfo[badge.badge_type as keyof typeof badgeInfo]?.name.split(' ')[0]}
                        </div>
                        <h3 className="font-semibold">
                          {badgeInfo[badge.badge_type as keyof typeof badgeInfo]?.name.substring(2)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {badgeInfo[badge.badge_type as keyof typeof badgeInfo]?.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Earned {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Activity log will be displayed here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Track your moderation actions and their impact
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};