import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Minus, Star, Flag, Users, 
  BarChart3, AlertTriangle, CheckCircle, Eye, Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { VillageVotingDialog } from './VillageVotingDialog';
import { VillageCorruptionReportDialog } from './VillageCorruptionReportDialog';
import { VillageReputationTimeline } from './VillageReputationTimeline';
import { VillageTransparencyHeatmap } from './VillageTransparencyHeatmap';
import { VillageReputationSecurity } from './VillageReputationSecurity';
import { VillageCivicEngagementIntegration } from './VillageCivicEngagementIntegration';
import { toast } from 'sonner';

interface VillageReputationEngineProps {
  villageId: string;
  villageName: string;
}

interface TransparencyMetrics {
  id: string;
  village_id: string;
  project_completion_rate: number;
  corruption_reports_count: number;
  verified_corruption_count: number;
  citizen_satisfaction_score: number;
  transparency_score: number;
  development_progress_score: number;
  civic_engagement_score: number;
  official_performance_score: number;
  overall_reputation_score: number;
  reputation_badge: string;
  last_calculated_at: string;
}

interface CorruptionReport {
  id: string;
  title: string;
  report_type: string;
  status: string;
  severity_level: string;
  created_at: string;
}

interface MonthlyVote {
  id: string;
  development_progress_rating: number;
  leadership_transparency_rating: number;
  village_unity_rating: number;
  access_to_services_rating: number;
  overall_satisfaction_rating: number;
  is_diaspora_vote: boolean;
  created_at: string;
}

export const VillageReputationEngine: React.FC<VillageReputationEngineProps> = ({
  villageId,
  villageName
}) => {
  const [metrics, setMetrics] = useState<TransparencyMetrics | null>(null);
  const [reports, setReports] = useState<CorruptionReport[]>([]);
  const [recentVotes, setRecentVotes] = useState<MonthlyVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVotingDialog, setShowVotingDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [userHasVotedThisMonth, setUserHasVotedThisMonth] = useState(false);

  useEffect(() => {
    fetchReputationData();
    checkUserVoteStatus();
  }, [villageId]);

  const fetchReputationData = async () => {
    try {
      setLoading(true);

      // Fetch transparency metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('village_transparency_metrics')
        .select('*')
        .eq('village_id', villageId)
        .single();

      if (metricsError && metricsError.code !== 'PGRST116') throw metricsError;
      setMetrics(metricsData);

      // Fetch recent corruption reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('village_corruption_reports')
        .select('id, title, report_type, status, severity_level, created_at')
        .eq('village_id', villageId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reportsError) throw reportsError;
      setReports(reportsData || []);

      // Fetch recent votes (last 100)
      const { data: votesData, error: votesError } = await supabase
        .from('village_monthly_votes')
        .select('id, development_progress_rating, leadership_transparency_rating, village_unity_rating, access_to_services_rating, overall_satisfaction_rating, is_diaspora_vote, created_at')
        .eq('village_id', villageId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (votesError) throw votesError;
      setRecentVotes(votesData || []);

    } catch (error) {
      console.error('Error fetching reputation data:', error);
      toast.error('Failed to load reputation data');
    } finally {
      setLoading(false);
    }
  };

  const checkUserVoteStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      const { data } = await supabase
        .from('village_monthly_votes')
        .select('id')
        .eq('village_id', villageId)
        .eq('voter_user_id', user.id)
        .eq('vote_month', currentMonth)
        .single();

      setUserHasVotedThisMonth(!!data);
    } catch (error) {
      // User hasn't voted this month, which is fine
    }
  };

  const recalculateReputationScore = async () => {
    try {
      const { error } = await supabase.rpc('calculate_village_reputation_index', {
        p_village_id: villageId
      });

      if (error) throw error;
      
      toast.success('Reputation score updated successfully');
      fetchReputationData(); // Refresh data
    } catch (error) {
      console.error('Error recalculating reputation:', error);
      toast.error('Failed to update reputation score');
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'average': return 'bg-yellow-500 text-white';
      case 'poor': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'destructive';
      case 'escalated': return 'destructive';
      case 'under_review': return 'secondary';
      case 'dismissed': return 'outline';
      default: return 'default';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
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

  return (
    <div className="space-y-6">
      {/* Header with VRI Score */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Village Reputation Index (VRI)
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive transparency and performance tracking
              </p>
            </div>
            <div className="text-right">
              {metrics && (
                <>
                  <div className={`text-4xl font-bold ${getScoreColor(metrics.overall_reputation_score)}`}>
                    {metrics.overall_reputation_score.toFixed(1)}%
                  </div>
                  <Badge className={getBadgeColor(metrics.reputation_badge)}>
                    {metrics.reputation_badge.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    Updated: {new Date(metrics.last_calculated_at).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setShowVotingDialog(true)}
              disabled={userHasVotedThisMonth}
              className="flex-1 min-w-[140px]"
            >
              <Star className="h-4 w-4 mr-2" />
              {userHasVotedThisMonth ? 'Voted This Month' : 'Rate Village'}
            </Button>
            <Button
              onClick={() => setShowReportDialog(true)}
              variant="outline"
              className="flex-1 min-w-[140px]"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
            <Button
              onClick={recalculateReputationScore}
              variant="secondary"
              size="sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh Score
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="civic">Civic Links</TabsTrigger>
          <TabsTrigger value="heatmap">Map</TabsTrigger>
          <TabsTrigger value="votes">Votes</TabsTrigger>
          <TabsTrigger value="trends">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Project Completion */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Project Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {metrics.project_completion_rate.toFixed(1)}%
                  </div>
                  <Progress value={metrics.project_completion_rate} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Weight: 25% of total score
                  </p>
                </CardContent>
              </Card>

              {/* Transparency Score */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">
                    {metrics.transparency_score.toFixed(1)}%
                  </div>
                  <Progress value={metrics.transparency_score} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Weight: 20% of total score
                  </p>
                </CardContent>
              </Card>

              {/* Citizen Satisfaction */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Citizen Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">
                    {metrics.citizen_satisfaction_score.toFixed(1)}%
                  </div>
                  <Progress value={metrics.citizen_satisfaction_score} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Weight: 20% of total score
                  </p>
                </CardContent>
              </Card>

              {/* Civic Engagement */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Civic Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-info">
                    {metrics.civic_engagement_score.toFixed(1)}%
                  </div>
                  <Progress value={metrics.civic_engagement_score} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Weight: 10% of total score
                  </p>
                </CardContent>
              </Card>

              {/* Official Performance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Official Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">
                    {metrics.official_performance_score.toFixed(1)}%
                  </div>
                  <Progress value={metrics.official_performance_score} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Weight: 10% of total score
                  </p>
                </CardContent>
              </Card>

              {/* Corruption Reports */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Corruption Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-destructive">
                        {metrics.verified_corruption_count}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Verified / {metrics.corruption_reports_count} Total
                      </p>
                    </div>
                    <Flag className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <VillageReputationSecurity 
            villageId={villageId} 
            villageName={villageName} 
          />
        </TabsContent>

        <TabsContent value="civic" className="space-y-6">
          <VillageCivicEngagementIntegration 
            villageId={villageId} 
            villageName={villageName} 
          />
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <VillageTransparencyHeatmap />
        </TabsContent>

        <TabsContent value="votes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Citizen Votes</h3>
            <div className="text-sm text-muted-foreground">
              {recentVotes.length} votes (last 100)
            </div>
          </div>
          
          <div className="space-y-3">
            {recentVotes.slice(0, 10).map((vote) => (
              <Card key={vote.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span>Development: {renderStars(vote.development_progress_rating)}</span>
                      <span>Transparency: {renderStars(vote.leadership_transparency_rating)}</span>
                      <span>Unity: {renderStars(vote.village_unity_rating)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Services: {renderStars(vote.access_to_services_rating)}</span>
                      <span>Overall: {renderStars(vote.overall_satisfaction_rating)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {vote.is_diaspora_vote && (
                      <Badge variant="outline" className="mb-1">
                        Diaspora
                      </Badge>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(vote.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {recentVotes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No votes yet. Be the first to rate this village!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Corruption & Issue Reports</h3>
            <div className="text-sm text-muted-foreground">
              {reports.length} recent reports
            </div>
          </div>

          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{report.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {report.report_type.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getStatusColor(report.status)} className="text-xs">
                        {report.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {report.severity_level}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reports yet. This village appears to be running smoothly!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <VillageReputationTimeline 
            villageId={villageId} 
            villageName={villageName} 
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <VillageVotingDialog
        open={showVotingDialog}
        onOpenChange={setShowVotingDialog}
        villageId={villageId}
        villageName={villageName}
        onVoteSubmitted={() => {
          fetchReputationData();
          checkUserVoteStatus();
        }}
      />

      <VillageCorruptionReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        villageId={villageId}
        villageName={villageName}
        onReportSubmitted={fetchReputationData}
      />
    </div>
  );
};