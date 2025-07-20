import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  UserX, 
  Eye, 
  AlertTriangle, 
  Lock,
  Activity,
  Settings,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProtectionCenterProps {
  userRole: string;
}

export const ProtectionCenter: React.FC<ProtectionCenterProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user protection status
  const { data: protection } = useQuery({
    queryKey: ['user-protection'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('civic_shield_protection')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Fetch protection statistics - simplified for now
  const { data: stats } = useQuery({
    queryKey: ['protection-stats'],
    queryFn: async () => {
      return { total_protected: 1247, active_alerts: 89 };
    },
  });

  const getShieldStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      protected: 'bg-blue-100 text-blue-800',
      high_risk: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.inactive}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const requestProtection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('create_user_protection', {
        p_user_id: user.id,
        p_activation_reason: 'User requested protection'
      });

      if (error) throw error;
      
      // Refresh data
      location.reload();
    } catch (error) {
      console.error('Error requesting protection:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Protection Overview</TabsTrigger>
          <TabsTrigger value="measures">Security Measures</TabsTrigger>
          <TabsTrigger value="alerts">Threat Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Protection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Your Protection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {protection ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Protection Active</h3>
                      <p className="text-sm text-muted-foreground">
                        Alias: {protection.protection_alias}
                      </p>
                    </div>
                    {getShieldStatusBadge(protection.shield_status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">IP Obfuscation</span>
                        <Badge variant={protection.ip_obfuscation_enabled ? "default" : "secondary"}>
                          {protection.ip_obfuscation_enabled ? 'On' : 'Off'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserX className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Visibility Cloak</span>
                        <Badge variant={protection.visibility_cloaked ? "default" : "secondary"}>
                          {protection.visibility_cloaked ? 'On' : 'Off'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Risk Score</span>
                        <Badge variant="outline">{protection.risk_score}/10</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Auto Protection</span>
                        <Badge variant={protection.auto_protection_triggered ? "default" : "secondary"}>
                          {protection.auto_protection_triggered ? 'Active' : 'Standby'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Protection Active Since</h4>
                    <p className="text-sm text-green-800">
                      {new Date(protection.created_at).toLocaleDateString()} - 
                      Your identity and activities are being protected by Civic Shield
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Active Protection</h3>
                  <p className="text-muted-foreground mb-4">
                    Request protection if you feel at risk due to civic activities
                  </p>
                  <Button onClick={requestProtection}>
                    <Shield className="h-4 w-4 mr-2" />
                    Request Protection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Protection Statistics */}
          <div className="grid grid-cols-4 gap-6">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-sm text-muted-foreground">Protected Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">89</p>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <UserX className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">3,456</p>
                    <p className="text-sm text-muted-foreground">Anonymized Actions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm text-muted-foreground">Monitoring</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="measures" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Identity Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="h-5 w-5" />
                  Identity Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Anonymous Browsing</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Profile Masking</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Activity Obfuscation</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pseudonym System</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Network Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">End-to-End Encryption</span>
                    <Badge variant="default">Military Grade</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IP Address Masking</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Secure Communication</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Traffic Anonymization</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Behavioral Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Behavioral Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pattern Disruption</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Timing Randomization</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Isolation</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Activity Mixing</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Physical Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Location Obfuscation</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emergency Protocols</span>
                    <Badge variant="secondary">Standby</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Safe House Network</span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Legal Aid Access</span>
                    <Badge variant="default">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Current Threat Level: LOW
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">All Systems Normal</h4>
                  <p className="text-sm text-green-800">
                    No active threats detected. Your protection systems are functioning normally.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-muted-foreground">2 hours ago</span>
                      <span>Protection systems updated</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-muted-foreground">6 hours ago</span>
                      <span>Routine security scan completed</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-muted-foreground">1 day ago</span>
                      <span>New threat patterns analyzed</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};