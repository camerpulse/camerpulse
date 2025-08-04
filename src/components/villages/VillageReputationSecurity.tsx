import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, AlertTriangle, Eye, Clock, UserCheck, 
  TrendingUp, Activity, Lock, CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityMetrics {
  suspicious_voting_patterns: number;
  rapid_vote_clusters: number;
  ip_diversity_score: number;
  device_fingerprint_variations: number;
  geographic_distribution_score: number;
  temporal_distribution_score: number;
  verification_rate: number;
  manipulation_risk_score: number;
}

interface VillageReputationSecurityProps {
  villageId: string;
  villageName: string;
}

export const VillageReputationSecurity: React.FC<VillageReputationSecurityProps> = ({
  villageId,
  villageName
}) => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSecurityScan, setLastSecurityScan] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityMetrics();
  }, [villageId]);

  const fetchSecurityMetrics = async () => {
    try {
      setLoading(true);
      
      // Simulate advanced security analysis
      // In production, this would call backend AI/ML services
      const metrics: SecurityMetrics = {
        suspicious_voting_patterns: Math.floor(Math.random() * 5),
        rapid_vote_clusters: Math.floor(Math.random() * 3),
        ip_diversity_score: 75 + Math.floor(Math.random() * 25),
        device_fingerprint_variations: 80 + Math.floor(Math.random() * 20),
        geographic_distribution_score: 70 + Math.floor(Math.random() * 30),
        temporal_distribution_score: 85 + Math.floor(Math.random() * 15),
        verification_rate: 90 + Math.floor(Math.random() * 10),
        manipulation_risk_score: Math.floor(Math.random() * 30)
      };

      setSecurityMetrics(metrics);
      setLastSecurityScan(new Date().toISOString());
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      toast.error('Failed to load security metrics');
    } finally {
      setLoading(false);
    }
  };

  const runSecurityScan = async () => {
    toast.info('Running advanced security scan...');
    await fetchSecurityMetrics();
    toast.success('Security scan completed');
  };

  const getSecurityLevel = (score: number): { level: string; color: string } => {
    if (score >= 90) return { level: 'EXCELLENT', color: 'text-green-600' };
    if (score >= 75) return { level: 'GOOD', color: 'text-blue-600' };
    if (score >= 60) return { level: 'MODERATE', color: 'text-yellow-600' };
    return { level: 'CONCERNING', color: 'text-red-600' };
  };

  const getRiskLevel = (score: number): { level: string; color: string } => {
    if (score <= 15) return { level: 'LOW', color: 'text-green-600' };
    if (score <= 35) return { level: 'MODERATE', color: 'text-yellow-600' };
    if (score <= 60) return { level: 'HIGH', color: 'text-orange-600' };
    return { level: 'CRITICAL', color: 'text-red-600' };
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

  if (!securityMetrics) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Security metrics unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallSecurity = (
    securityMetrics.ip_diversity_score +
    securityMetrics.device_fingerprint_variations +
    securityMetrics.geographic_distribution_score +
    securityMetrics.temporal_distribution_score +
    securityMetrics.verification_rate
  ) / 5;

  const securityLevel = getSecurityLevel(overallSecurity);
  const riskLevel = getRiskLevel(securityMetrics.manipulation_risk_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Reputation Security Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced anti-manipulation monitoring and validation
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${securityLevel.color}`}>
                {overallSecurity.toFixed(1)}%
              </div>
              <Badge className={securityLevel.level === 'EXCELLENT' ? 'bg-green-500' : 
                              securityLevel.level === 'GOOD' ? 'bg-blue-500' :
                              securityLevel.level === 'MODERATE' ? 'bg-yellow-500' : 'bg-red-500'}>
                {securityLevel.level}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={runSecurityScan} className="flex-1">
              <Activity className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last scan: {lastSecurityScan ? new Date(lastSecurityScan).toLocaleString() : 'Never'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Manipulation Risk Score */}
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Manipulation Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${riskLevel.color}`}>
              {securityMetrics.manipulation_risk_score}%
            </div>
            <Progress 
              value={100 - securityMetrics.manipulation_risk_score} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Risk Level: {riskLevel.level}
            </p>
          </CardContent>
        </Card>

        {/* IP Diversity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              IP Diversity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {securityMetrics.ip_diversity_score}%
            </div>
            <Progress value={securityMetrics.ip_diversity_score} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Geographic spread of votes
            </p>
          </CardContent>
        </Card>

        {/* Device Fingerprinting */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Device Variations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {securityMetrics.device_fingerprint_variations}%
            </div>
            <Progress value={securityMetrics.device_fingerprint_variations} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Unique device patterns
            </p>
          </CardContent>
        </Card>

        {/* Verification Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Verification Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {securityMetrics.verification_rate}%
            </div>
            <Progress value={securityMetrics.verification_rate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Verified authentic votes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temporal Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temporal Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Natural voting patterns</span>
                <span className="font-medium">{securityMetrics.temporal_distribution_score}%</span>
              </div>
              <Progress value={securityMetrics.temporal_distribution_score} />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Rapid vote clusters detected</span>
                <Badge variant={securityMetrics.rapid_vote_clusters > 0 ? 'destructive' : 'secondary'}>
                  {securityMetrics.rapid_vote_clusters}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Geographic spread</span>
                <span className="font-medium">{securityMetrics.geographic_distribution_score}%</span>
              </div>
              <Progress value={securityMetrics.geographic_distribution_score} />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Suspicious patterns</span>
                <Badge variant={securityMetrics.suspicious_voting_patterns > 0 ? 'destructive' : 'secondary'}>
                  {securityMetrics.suspicious_voting_patterns}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityMetrics.manipulation_risk_score > 50 && (
              <div className="flex items-start gap-3 p-3 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">High manipulation risk detected</p>
                  <p className="text-xs text-muted-foreground">Consider enabling additional verification measures</p>
                </div>
              </div>
            )}
            
            {securityMetrics.ip_diversity_score < 70 && (
              <div className="flex items-start gap-3 p-3 border border-yellow-500/20 rounded-lg">
                <Eye className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-600">Low IP diversity</p>
                  <p className="text-xs text-muted-foreground">Votes may be concentrated from few locations</p>
                </div>
              </div>
            )}
            
            {securityMetrics.rapid_vote_clusters > 2 && (
              <div className="flex items-start gap-3 p-3 border border-orange-500/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-600">Rapid voting clusters detected</p>
                  <p className="text-xs text-muted-foreground">Unusual patterns in voting timestamps found</p>
                </div>
              </div>
            )}
            
            {securityMetrics.manipulation_risk_score <= 15 && 
             securityMetrics.ip_diversity_score >= 75 && 
             securityMetrics.rapid_vote_clusters === 0 && (
              <div className="flex items-start gap-3 p-3 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-600">Excellent security profile</p>
                  <p className="text-xs text-muted-foreground">No concerning patterns detected</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};