import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Shield, 
  Users, 
  AlertTriangle, 
  FileText,
  Eye,
  Lock,
  Activity,
  Database,
  Monitor
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CivicShieldAdminProps {
  userRole: string;
  systemConfig: any;
}

export const CivicShieldAdmin: React.FC<CivicShieldAdminProps> = ({ userRole, systemConfig }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin statistics
  const { data: adminStats } = useQuery({
    queryKey: ['civic-shield-admin-stats'],
    queryFn: async () => {
      const [submissions, protections, moderators, alerts] = await Promise.all([
        supabase.from('whistleblower_submissions').select('id, verification_status, threat_level').limit(1000),
        supabase.from('civic_shield_protection').select('id, shield_status').limit(1000),
        supabase.from('civic_shield_moderators').select('id, active_cases').limit(100),
        supabase.from('civic_risk_assessments').select('id, threat_level').limit(1000)
      ]);

      return {
        totalSubmissions: submissions.data?.length || 0,
        pendingSubmissions: submissions.data?.filter(s => s.verification_status === 'pending').length || 0,
        verifiedSubmissions: submissions.data?.filter(s => s.verification_status === 'verified').length || 0,
        highThreatSubmissions: submissions.data?.filter(s => s.threat_level === 'critical' || s.threat_level === 'high').length || 0,
        totalProtections: protections.data?.length || 0,
        activeProtections: protections.data?.filter(p => p.shield_status === 'active' || p.shield_status === 'protected').length || 0,
        totalModerators: moderators.data?.length || 0,
        activeModerators: moderators.data?.filter(m => m.active_cases > 0).length || 0,
        totalRiskAssessments: alerts.data?.length || 0,
        highRiskAlerts: alerts.data?.filter(a => a.threat_level === 'critical' || a.threat_level === 'high').length || 0,
      };
    },
    enabled: userRole === 'admin' || userRole === 'moderator',
  });

  // Fetch recent submissions for moderators
  const { data: recentSubmissions } = useQuery({
    queryKey: ['recent-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whistleblower_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: userRole === 'admin' || userRole === 'moderator',
  });

  // Update system configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('civic_shield_config')
        .update(updates)
        .eq('id', systemConfig.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "System configuration has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['civic-shield-config'] });
    },
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      disputed: 'bg-red-100 text-red-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {status}
      </Badge>
    );
  };

  const getThreatBadge = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[level as keyof typeof colors] || colors.low}>
        {level}
      </Badge>
    );
  };

  if (userRole !== 'admin' && userRole !== 'moderator') {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            This area is restricted to administrators and moderators only.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="moderators">Moderators</TabsTrigger>
          {userRole === 'admin' && (
            <TabsTrigger value="system">System Settings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Dashboard */}
          <div className="grid grid-cols-4 gap-6">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{adminStats?.totalSubmissions || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{adminStats?.pendingSubmissions || 0}</p>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{adminStats?.activeProtections || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Protections</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{adminStats?.activeModerators || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Moderators</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Encryption Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Security</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Secure</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Anonymization</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Assessment AI</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Learning</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Threat Detection</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Monitoring</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Communication Channels</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Encrypted</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup Systems</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Redundant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Legal Compliance</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Trail</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubmissions?.slice(0, 10).map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">{submission.submission_code}</span>
                        {getStatusBadge(submission.verification_status)}
                        {getThreatBadge(submission.threat_level)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-medium mb-1">{submission.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {submission.description.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Type: {submission.disclosure_type}</span>
                      <span>Region: {submission.region}</span>
                      <span>Urgency: {submission.urgency_level}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Moderator Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Moderator Dashboard</h3>
                <p className="text-muted-foreground">
                  Moderator management features coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === 'admin' && (
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="system-enabled">System Enabled</Label>
                      <Switch
                        id="system-enabled"
                        checked={systemConfig?.system_enabled}
                        onCheckedChange={(checked) => 
                          updateConfigMutation.mutate({ system_enabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="encryption-enabled">Global Encryption</Label>
                      <Switch
                        id="encryption-enabled"
                        checked={systemConfig?.global_encryption_enabled}
                        onCheckedChange={(checked) => 
                          updateConfigMutation.mutate({ global_encryption_enabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-risk">Auto Risk Assessment</Label>
                      <Switch
                        id="auto-risk"
                        checked={systemConfig?.auto_risk_assessment}
                        onCheckedChange={(checked) => 
                          updateConfigMutation.mutate({ auto_risk_assessment: checked })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Threat Thresholds</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Auto Protect Threshold</span>
                        <span>{systemConfig?.threat_threshold_config?.auto_protect || 7}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alert Moderators</span>
                        <span>{systemConfig?.threat_threshold_config?.alert_moderators || 8}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emergency Protocols</span>
                        <span>{systemConfig?.threat_threshold_config?.emergency_protocols || 9}/10</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Restricted Regions</h4>
                  <div className="space-y-2">
                    {systemConfig?.threat_threshold_config?.regions_high_risk?.map((region: string) => (
                      <Badge key={region} variant="outline" className="mr-2">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Sensitive Sectors</h4>
                  <div className="space-y-2">
                    {systemConfig?.threat_threshold_config?.sectors_sensitive?.map((sector: string) => (
                      <Badge key={sector} variant="outline" className="mr-2">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};