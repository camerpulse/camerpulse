import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  CheckCircle, 
  XCircle,
  Eye,
  FileText,
  Users,
  Activity,
  Settings,
  Search,
  Filter
} from "lucide-react";
import { CamerPlayHeader } from "@/components/Layout/CamerPlayHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ModerationRule {
  id: string;
  rule_name: string;
  rule_type: string;
  content_type: string;
  severity_level: string;
  action_type: string;
  is_active: boolean;
  created_at: string;
}

interface ModerationAction {
  id: string;
  content_id: string;
  content_type: string;
  action_type: string;
  reason: string;
  auto_generated: boolean;
  status: string;
  created_at: string;
}

interface SecurityAuditLog {
  id: string;
  action_type: string;
  resource_type: string;
  risk_score: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const ModerationCenter: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateRule, setShowCreateRule] = useState(false);

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    try {
      // Fetch moderation rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('moderation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;
      setRules(rulesData || []);

      // Fetch moderation actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('moderation_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (actionsError) throw actionsError;
      setActions(actionsData || []);

      // Fetch security audit logs
      const { data: logsData, error: logsError } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setAuditLogs(logsData || []);

    } catch (error) {
      toast({
        title: "Error loading moderation data",
        description: "Could not load moderation center data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createModerationRule = async (ruleData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('moderation_rules')
        .insert({
          ...ruleData,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Rule created",
        description: "Moderation rule has been created successfully.",
      });

      setShowCreateRule(false);
      fetchModerationData();
    } catch (error) {
      toast({
        title: "Error creating rule",
        description: "Could not create moderation rule.",
        variant: "destructive",
      });
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('moderation_rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Rule updated",
        description: "Rule status has been updated successfully.",
      });

      fetchModerationData();
    } catch (error) {
      toast({
        title: "Error updating rule",
        description: "Could not update rule status.",
        variant: "destructive",
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'resolved': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CamerPlayHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading moderation center...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CamerPlayHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Moderation Center</h1>
              <p className="text-muted-foreground">Content moderation and security management</p>
            </div>
            <Button onClick={() => setShowCreateRule(true)}>
              <Shield className="mr-2 h-4 w-4" />
              Create Rule
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{rules.filter(r => r.is_active).length}</p>
                    <p className="text-xs text-muted-foreground">Active Rules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{actions.filter(a => a.status === 'active').length}</p>
                    <p className="text-xs text-muted-foreground">Active Actions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{auditLogs.filter(log => log.risk_score >= 5).length}</p>
                    <p className="text-xs text-muted-foreground">High Risk Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{actions.filter(a => a.auto_generated).length}</p>
                    <p className="text-xs text-muted-foreground">Auto Actions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="rules" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Moderation Rules
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Actions Log
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Audit
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Rules</CardTitle>
                  <CardDescription>Manage automated content moderation rules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{rule.rule_name}</h3>
                            <Badge variant={getSeverityBadge(rule.severity_level)}>
                              {rule.severity_level}
                            </Badge>
                            <Badge variant="outline">{rule.content_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {rule.rule_type} - {rule.action_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={rule.is_active ? "default" : "outline"}
                            onClick={() => toggleRuleStatus(rule.id, rule.is_active)}
                          >
                            {rule.is_active ? "Active" : "Inactive"}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Actions</CardTitle>
                  <CardDescription>Review recent moderation actions and interventions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content Type</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {actions.map((action) => (
                        <TableRow key={action.id}>
                          <TableCell>
                            <Badge variant="outline">{action.content_type}</Badge>
                          </TableCell>
                          <TableCell>{action.action_type}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {action.reason || 'No reason provided'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={action.auto_generated ? "secondary" : "default"}>
                              {action.auto_generated ? "Auto" : "Manual"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(action.status)}>
                              {action.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(action.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Audit Log</CardTitle>
                  <CardDescription>Monitor security events and potential threats</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action Type</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>User Agent</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.action_type}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.resource_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold ${getRiskScoreColor(log.risk_score)}`}>
                              {log.risk_score}/10
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.ip_address}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm">
                            {log.user_agent}
                          </TableCell>
                          <TableCell>
                            {new Date(log.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Moderation Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Rules</span>
                        <span className="font-semibold">{rules.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Rules</span>
                        <span className="font-semibold">{rules.filter(r => r.is_active).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actions Today</span>
                        <span className="font-semibold">
                          {actions.filter(a => 
                            new Date(a.created_at).toDateString() === new Date().toDateString()
                          ).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto-Generated</span>
                        <span className="font-semibold">
                          {actions.filter(a => a.auto_generated).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Events</span>
                        <span className="font-semibold">{auditLogs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>High Risk</span>
                        <span className="font-semibold text-red-600">
                          {auditLogs.filter(l => l.risk_score >= 8).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium Risk</span>
                        <span className="font-semibold text-yellow-600">
                          {auditLogs.filter(l => l.risk_score >= 5 && l.risk_score < 8).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Risk</span>
                        <span className="font-semibold text-green-600">
                          {auditLogs.filter(l => l.risk_score < 5).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ModerationCenter;