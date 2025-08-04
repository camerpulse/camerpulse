import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Globe, 
  Shield, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetrics {
  total_votes: number;
  unique_voters: number;
  engagement_rate: number;
  average_time_to_vote: string;
  geographic_diversity_score: number;
  fraud_risk_score: number;
}

interface PollPerformanceAnalyticsProps {
  pollId: string;
  pollTitle: string;
}

export const PollPerformanceAnalytics: React.FC<PollPerformanceAnalyticsProps> = ({
  pollId,
  pollTitle
}) => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [pollId]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('calculate_poll_performance_metrics', {
        p_poll_id: pollId
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setMetrics({
          ...data[0],
          average_time_to_vote: String(data[0].average_time_to_vote || '')
        });
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load performance metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  };

  const getEngagementStatus = (rate: number) => {
    if (rate >= 80) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
    if (rate >= 60) return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (rate >= 40) return { label: 'Average', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { label: 'Low', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const getFraudRiskStatus = (score: number) => {
    if (score === 0) return { label: 'Clean', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score <= 25) return { label: 'Low Risk', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (score <= 50) return { label: 'Medium Risk', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (score <= 75) return { label: 'High Risk', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const formatDuration = (duration: string) => {
    if (!duration) return 'N/A';
    // Parse PostgreSQL interval format
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const [, hours, minutes, seconds] = match;
      if (parseInt(hours) > 0) return `${hours}h ${minutes}m`;
      if (parseInt(minutes) > 0) return `${minutes}m ${seconds}s`;
      return `${seconds}s`;
    }
    return duration;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Available</h3>
          <p className="text-muted-foreground">
            Analytics will be available once the poll receives votes
          </p>
        </CardContent>
      </Card>
    );
  }

  const engagementStatus = getEngagementStatus(metrics.engagement_rate);
  const fraudStatus = getFraudRiskStatus(metrics.fraud_risk_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Analytics
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMetrics}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time performance metrics for "{pollTitle}"
          </p>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Votes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold">{metrics.total_votes.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unique Voters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Voters</p>
                <p className="text-2xl font-bold">{metrics.unique_voters.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Time to Vote */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Time to Vote</p>
                <p className="text-2xl font-bold">{formatDuration(metrics.average_time_to_vote)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Engagement Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement Rate</span>
                <Badge variant="outline" className={engagementStatus.textColor}>
                  {engagementStatus.label}
                </Badge>
              </div>
              <Progress value={metrics.engagement_rate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {metrics.engagement_rate.toFixed(1)}% of visitors participated
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Geographic Diversity</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.geographic_diversity_score.toFixed(0)}%
                </span>
              </div>
              <Progress value={metrics.geographic_diversity_score} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Coverage across Cameroon regions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security & Fraud Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fraud Risk Score</span>
                <Badge variant="outline" className={fraudStatus.textColor}>
                  {fraudStatus.label}
                </Badge>
              </div>
              <Progress value={metrics.fraud_risk_score} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {metrics.fraud_risk_score}% risk level detected
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              {metrics.fraud_risk_score === 0 ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {metrics.fraud_risk_score === 0 
                    ? 'Clean Voting Pattern' 
                    : 'Potential Issues Detected'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.fraud_risk_score === 0 
                    ? 'No suspicious activity detected in this poll'
                    : 'Review fraud protection alerts for details'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Voter Behavior</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unique voter ratio: {((metrics.unique_voters / Math.max(metrics.total_votes, 1)) * 100).toFixed(1)}%</li>
                <li>• Average decision time: {formatDuration(metrics.average_time_to_vote)}</li>
                <li>• Geographic reach: {metrics.geographic_diversity_score.toFixed(0)}% of regions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Security Status</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fraud detection: {fraudStatus.label}</li>
                <li>• Vote verification: Active</li>
                <li>• Pattern analysis: Continuous</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};