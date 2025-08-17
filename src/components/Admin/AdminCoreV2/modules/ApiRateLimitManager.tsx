import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Shield, Zap, Users, AlertTriangle, CheckCircle, Settings, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiRateLimitManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

interface RateLimitRule {
  id: string;
  rule_name: string;
  endpoint_pattern: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  user_type: 'anonymous' | 'authenticated' | 'premium' | 'admin';
  is_active: boolean;
  whitelist_ips: string[];
  blacklist_ips: string[];
  created_at: string;
  updated_at: string;
}

interface RateLimitViolation {
  id: string;
  ip_address: string;
  user_id?: string;
  endpoint: string;
  requests_count: number;
  time_window: string;
  violation_type: string;
  blocked_until?: string;
  created_at: string;
}

interface RateLimitStats {
  total_requests: number;
  blocked_requests: number;
  unique_ips: number;
  violations_today: number;
}

export const ApiRateLimitManager: React.FC<ApiRateLimitManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [rules, setRules] = useState<RateLimitRule[]>([]);
  const [violations, setViolations] = useState<RateLimitViolation[]>([]);
  const [rateLimitStats, setRateLimitStats] = useState<RateLimitStats>({
    total_requests: 0,
    blocked_requests: 0,
    unique_ips: 0,
    violations_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<RateLimitRule | null>(null);
  const [newRule, setNewRule] = useState({
    rule_name: '',
    endpoint_pattern: '',
    requests_per_minute: 60,
    requests_per_hour: 1000,
    requests_per_day: 10000,
    user_type: 'anonymous' as const,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (hasPermission('admin:rate_limiting')) {
      fetchRules();
      fetchViolations();
      fetchStats();
    }
  }, [hasPermission]);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('api_rate_limit_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rate limit rules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch rate limit rules",
        variant: "destructive"
      });
    }
  };

  const fetchViolations = async () => {
    try {
      const { data, error } = await supabase
        .from('api_rate_limit_violations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setViolations(data || []);
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // This would typically come from analytics/logging system
      setRateLimitStats({
        total_requests: 45231,
        blocked_requests: 127,
        unique_ips: 1243,
        violations_today: 8
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRule = async () => {
    try {
      const { error } = await supabase
        .from('api_rate_limit_rules')
        .insert([{
          ...newRule,
          whitelist_ips: [],
          blacklist_ips: []
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rate limit rule created successfully"
      });

      logActivity('rate_limit_rule_created', newRule);
      fetchRules();
      setNewRule({
        rule_name: '',
        endpoint_pattern: '',
        requests_per_minute: 60,
        requests_per_hour: 1000,
        requests_per_day: 10000,
        user_type: 'anonymous',
        is_active: true
      });
    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        title: "Error",
        description: "Failed to create rate limit rule",
        variant: "destructive"
      });
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<RateLimitRule>) => {
    try {
      const { error } = await supabase
        .from('api_rate_limit_rules')
        .update(updates)
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rate limit rule updated successfully"
      });

      logActivity('rate_limit_rule_updated', { rule_id: ruleId, updates });
      fetchRules();
    } catch (error) {
      console.error('Error updating rule:', error);
      toast({
        title: "Error",
        description: "Failed to update rate limit rule",
        variant: "destructive"
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('api_rate_limit_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rate limit rule deleted successfully"
      });

      logActivity('rate_limit_rule_deleted', { rule_id: ruleId });
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete rate limit rule",
        variant: "destructive"
      });
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'bg-purple-500 text-white';
      case 'premium': return 'bg-yellow-500 text-white';
      case 'authenticated': return 'bg-blue-500 text-white';
      case 'anonymous': return 'bg-gray-500 text-white';
      default: return 'bg-muted';
    }
  };

  const getViolationTypeColor = (type: string) => {
    switch (type) {
      case 'minute_exceeded': return 'bg-red-500 text-white';
      case 'hour_exceeded': return 'bg-orange-500 text-white';
      case 'day_exceeded': return 'bg-yellow-500 text-white';
      default: return 'bg-muted';
    }
  };

  if (!hasPermission('admin:rate_limiting')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to access API rate limiting management.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Shield className="h-6 w-6 mr-2 text-blue-600" />
          API Rate Limiting Manager
        </h2>
        <p className="text-muted-foreground">Configure and monitor API rate limiting rules</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{rateLimitStats.total_requests.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked Requests</p>
                <p className="text-2xl font-bold text-red-600">{rateLimitStats.blocked_requests}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique IPs</p>
                <p className="text-2xl font-bold">{rateLimitStats.unique_ips.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Violations Today</p>
                <p className="text-2xl font-bold text-yellow-600">{rateLimitStats.violations_today}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList>
          <TabsTrigger value="rules">Rate Limit Rules</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="create">Create Rule</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Rate Limit Rules</CardTitle>
              <CardDescription>Manage API endpoint rate limiting rules</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading rules...</div>
              ) : rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>No rate limit rules configured.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{rule.rule_name}</h3>
                            <Badge className={getUserTypeColor(rule.user_type)}>
                              {rule.user_type}
                            </Badge>
                            <Badge variant={rule.is_active ? "default" : "secondary"}>
                              {rule.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Pattern: <code className="bg-muted px-1 rounded">{rule.endpoint_pattern}</code>
                          </p>
                          <div className="text-sm text-muted-foreground">
                            Limits: {rule.requests_per_minute}/min • {rule.requests_per_hour}/hour • {rule.requests_per_day}/day
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={(checked) => updateRule(rule.id, { is_active: checked })}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingRule(rule)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteRule(rule.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Violations</CardTitle>
              <CardDescription>Recent API rate limit violations and blocked requests</CardDescription>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No rate limit violations found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {violations.map((violation) => (
                    <div key={violation.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getViolationTypeColor(violation.violation_type)}>
                              {violation.violation_type}
                            </Badge>
                            <span className="text-sm font-medium">{violation.ip_address}</span>
                            {violation.user_id && (
                              <span className="text-sm text-muted-foreground">
                                User: {violation.user_id.substring(0, 8)}...
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Endpoint: <code className="bg-muted px-1 rounded">{violation.endpoint}</code>
                          </p>
                          <div className="text-sm text-muted-foreground">
                            {violation.requests_count} requests in {violation.time_window} • {new Date(violation.created_at).toLocaleString()}
                            {violation.blocked_until && (
                              <span className="text-red-600">
                                {' '}• Blocked until {new Date(violation.blocked_until).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Rate Limit Rule</CardTitle>
              <CardDescription>Add a new API rate limiting rule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule_name">Rule Name</Label>
                  <Input
                    id="rule_name"
                    value={newRule.rule_name}
                    onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                    placeholder="e.g., API Endpoint Limit"
                  />
                </div>
                <div>
                  <Label htmlFor="endpoint_pattern">Endpoint Pattern</Label>
                  <Input
                    id="endpoint_pattern"
                    value={newRule.endpoint_pattern}
                    onChange={(e) => setNewRule({ ...newRule, endpoint_pattern: e.target.value })}
                    placeholder="e.g., /api/*, /auth/login"
                  />
                </div>
                <div>
                  <Label htmlFor="user_type">User Type</Label>
                  <Select
                    value={newRule.user_type}
                    onValueChange={(value: any) => setNewRule({ ...newRule, user_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anonymous">Anonymous</SelectItem>
                      <SelectItem value="authenticated">Authenticated</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={newRule.is_active}
                    onCheckedChange={(checked) => setNewRule({ ...newRule, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="requests_per_minute">Requests per Minute</Label>
                  <Input
                    id="requests_per_minute"
                    type="number"
                    value={newRule.requests_per_minute}
                    onChange={(e) => setNewRule({ ...newRule, requests_per_minute: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="requests_per_hour">Requests per Hour</Label>
                  <Input
                    id="requests_per_hour"
                    type="number"
                    value={newRule.requests_per_hour}
                    onChange={(e) => setNewRule({ ...newRule, requests_per_hour: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="requests_per_day">Requests per Day</Label>
                  <Input
                    id="requests_per_day"
                    type="number"
                    value={newRule.requests_per_day}
                    onChange={(e) => setNewRule({ ...newRule, requests_per_day: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Button onClick={createRule} className="w-full">
                Create Rate Limit Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting Settings</CardTitle>
              <CardDescription>Global rate limiting configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Global Settings</h3>
                <p className="text-muted-foreground">
                  Configure global rate limiting behavior and defaults
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};