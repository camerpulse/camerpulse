import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Flag, 
  Download, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ReputationWeights {
  project_completion: number;
  corruption_penalty: number;
  citizen_satisfaction: number;
  infrastructure_index: number;
  civic_engagement: number;
  official_performance: number;
}

interface CorruptionReport {
  id: string;
  village_id: string;
  title: string;
  report_type: string;
  severity_level: string;
  status: string;
  created_at: string;
  village_name: string;
  reporter_anonymous: boolean;
}

interface VillageRanking {
  id: string;
  village_name: string;
  overall_reputation_score: number;
  reputation_badge: string;
  transparency_score: number;
  corruption_reports_count: number;
  citizen_satisfaction_score: number;
}

export default function VillageReputationAdmin() {
  const { user } = useAuth();
  const [weights, setWeights] = useState<ReputationWeights>({
    project_completion: 25,
    corruption_penalty: 20,
    citizen_satisfaction: 20,
    infrastructure_index: 15,
    civic_engagement: 10,
    official_performance: 10
  });
  const [corruptionReports, setCorruptionReports] = useState<CorruptionReport[]>([]);
  const [villageRankings, setVillageRankings] = useState<VillageRanking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCorruptionReports();
    loadVillageRankings();
  }, []);

  const loadCorruptionReports = async () => {
    try {
      const { data, error } = await supabase
        .from('village_corruption_reports')
        .select(`
          *,
          villages(village_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedReports = data?.map(report => ({
        id: report.id,
        village_id: report.village_id,
        title: report.title,
        report_type: report.report_type,
        severity_level: report.severity_level,
        status: report.status,
        created_at: report.created_at,
        village_name: report.villages?.village_name || 'Unknown',
        reporter_anonymous: report.anonymous_report
      })) || [];

      setCorruptionReports(formattedReports);
    } catch (error) {
      console.error('Error loading corruption reports:', error);
      toast.error('Failed to load corruption reports');
    }
  };

  const loadVillageRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('village_transparency_metrics')
        .select(`
          village_id,
          overall_reputation_score,
          reputation_badge,
          transparency_score,
          corruption_reports_count,
          citizen_satisfaction_score,
          villages(village_name)
        `)
        .order('overall_reputation_score', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedRankings = data?.map(ranking => ({
        id: ranking.village_id,
        village_name: ranking.villages?.village_name || 'Unknown',
        overall_reputation_score: ranking.overall_reputation_score || 0,
        reputation_badge: ranking.reputation_badge || 'under_assessment',
        transparency_score: ranking.transparency_score || 0,
        corruption_reports_count: ranking.corruption_reports_count || 0,
        citizen_satisfaction_score: ranking.citizen_satisfaction_score || 0
      })) || [];

      setVillageRankings(formattedRankings);
    } catch (error) {
      console.error('Error loading village rankings:', error);
      toast.error('Failed to load village rankings');
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('village_corruption_reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Report ${newStatus} successfully`);
      loadCorruptionReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    }
  };

  const recalculateAllScores = async () => {
    setLoading(true);
    try {
      // Get all villages and recalculate their scores
      const { data: villages, error } = await supabase
        .from('villages')
        .select('id');

      if (error) throw error;

      for (const village of villages || []) {
        await supabase.rpc('calculate_village_reputation_index', {
          p_village_id: village.id
        });
      }

      toast.success('All village scores recalculated successfully');
      loadVillageRankings();
    } catch (error) {
      console.error('Error recalculating scores:', error);
      toast.error('Failed to recalculate scores');
    } finally {
      setLoading(false);
    }
  };

  const exportReputationData = async () => {
    try {
      const { data, error } = await supabase
        .from('village_transparency_metrics')
        .select(`
          *,
          villages(village_name, region, division)
        `)
        .order('overall_reputation_score', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const csvHeaders = [
        'Village Name', 'Region', 'Division', 'Overall Score', 'Reputation Badge',
        'Transparency Score', 'Citizen Satisfaction', 'Corruption Reports',
        'Project Completion Rate', 'Last Updated'
      ];

      const csvData = data?.map(row => [
        row.villages?.village_name || '',
        row.villages?.region || '',
        row.villages?.division || '',
        row.overall_reputation_score || 0,
        row.reputation_badge || '',
        row.transparency_score || 0,
        row.citizen_satisfaction_score || 0,
        row.corruption_reports_count || 0,
        row.project_completion_rate || 0,
        new Date(row.last_calculated_at).toLocaleDateString()
      ]) || [];

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `village-reputation-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export report');
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Village Reputation Administration</h1>
        <div className="flex gap-3">
          <Button onClick={exportReputationData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={recalculateAllScores} disabled={loading}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {loading ? 'Recalculating...' : 'Recalculate All Scores'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rankings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rankings">Village Rankings</TabsTrigger>
          <TabsTrigger value="reports">Corruption Reports</TabsTrigger>
          <TabsTrigger value="weights">Score Weights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Village Reputation Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {villageRankings.map((village, index) => (
                  <div key={village.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                      <div>
                        <h3 className="font-semibold">{village.village_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getBadgeColor(village.reputation_badge)}>
                            {village.reputation_badge.replace('_', ' ')}
                          </Badge>
                          {village.corruption_reports_count > 0 && (
                            <Badge variant="destructive">
                              {village.corruption_reports_count} reports
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{village.overall_reputation_score.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        Transparency: {village.transparency_score.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Satisfaction: {village.citizen_satisfaction_score.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Corruption Reports Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {corruptionReports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{report.title}</h3>
                          <Badge variant="outline">{report.report_type.replace('_', ' ')}</Badge>
                          <Badge className={getSeverityColor(report.severity_level)}>
                            {report.severity_level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Village: {report.village_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reported: {new Date(report.created_at).toLocaleDateString()} 
                          {report.reporter_anonymous && ' (Anonymous)'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={report.status === 'verified' ? 'destructive' : 
                                  report.status === 'resolved' ? 'default' : 'secondary'}
                        >
                          {report.status}
                        </Badge>
                        {report.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReportStatus(report.id, 'verified')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReportStatus(report.id, 'dismissed')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Reputation Score Weights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Project Completion ({weights.project_completion}%)</Label>
                    <Slider
                      value={[weights.project_completion]}
                      onValueChange={(value) => setWeights({...weights, project_completion: value[0]})}
                      max={50}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Corruption Penalty ({weights.corruption_penalty}%)</Label>
                    <Slider
                      value={[weights.corruption_penalty]}
                      onValueChange={(value) => setWeights({...weights, corruption_penalty: value[0]})}
                      max={50}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Citizen Satisfaction ({weights.citizen_satisfaction}%)</Label>
                    <Slider
                      value={[weights.citizen_satisfaction]}
                      onValueChange={(value) => setWeights({...weights, citizen_satisfaction: value[0]})}
                      max={50}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Infrastructure Index ({weights.infrastructure_index}%)</Label>
                    <Slider
                      value={[weights.infrastructure_index]}
                      onValueChange={(value) => setWeights({...weights, infrastructure_index: value[0]})}
                      max={50}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Civic Engagement ({weights.civic_engagement}%)</Label>
                    <Slider
                      value={[weights.civic_engagement]}
                      onValueChange={(value) => setWeights({...weights, civic_engagement: value[0]})}
                      max={50}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Official Performance ({weights.official_performance}%)</Label>
                    <Slider
                      value={[weights.official_performance]}
                      onValueChange={(value) => setWeights({...weights, official_performance: value[0]})}
                      max={50}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  Total Weight: {Object.values(weights).reduce((sum, weight) => sum + weight, 0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Weights should ideally total 100% for balanced scoring
                </p>
              </div>

              <Button onClick={recalculateAllScores} disabled={loading} className="w-full">
                Apply New Weights & Recalculate Scores
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Villages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{villageRankings.length}</div>
                <p className="text-sm text-muted-foreground">Being monitored</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {corruptionReports.filter(r => r.status === 'pending').length}
                </div>
                <p className="text-sm text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Excellent Villages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {villageRankings.filter(v => v.reputation_badge === 'excellent').length}
                </div>
                <p className="text-sm text-muted-foreground">Top performers</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}