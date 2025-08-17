import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Scan, 
  Lock, Key, Database, Users, Eye, RefreshCw, 
  FileText, Settings, Zap, Search
} from 'lucide-react';

interface SecurityAuditManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

interface SecurityFinding {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  affected_resource: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
  created_at: string;
  updated_at: string;
}

interface SecurityScanResult {
  scan_id: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'completed' | 'failed';
  total_checks: number;
  findings_count: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  progress: number;
}

export const SecurityAuditManager: React.FC<SecurityAuditManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentScan, setCurrentScan] = useState<SecurityScanResult | null>(null);

  // Fetch security findings
  const { data: securityFindings, isLoading: findingsLoading } = useQuery({
    queryKey: ['security_findings'],
    queryFn: async (): Promise<SecurityFinding[]> => {
      // Mock security findings - in production, this would call actual security scanning APIs
      const mockFindings: SecurityFinding[] = [
        {
          id: '1',
          type: 'critical',
          category: 'Database Security',
          title: 'Tables with RLS Enabled but No Policies',
          description: '990 tables have Row Level Security enabled but no policies defined',
          recommendation: 'Create appropriate RLS policies for all tables or disable RLS if not needed',
          affected_resource: 'Multiple database tables',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'high',
          title: 'Infinite Recursion in RLS Policies',
          category: 'Database Security',
          description: 'Detected infinite recursion in shipping_company_staff and related table policies',
          recommendation: 'Refactor RLS policies to use security definer functions',
          affected_resource: 'shipping_company_staff, marketplace_orders',
          status: 'acknowledged',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          type: 'medium',
          category: 'Authentication',
          title: 'Missing Rate Limiting on Admin Endpoints',
          description: 'Admin API endpoints do not have rate limiting configured',
          recommendation: 'Implement rate limiting for admin operations',
          affected_resource: 'Admin API endpoints',
          status: 'open',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '4',
          type: 'low',
          category: 'Logging',
          title: 'Insufficient Activity Logging',
          description: 'Some admin actions are not being logged for audit purposes',
          recommendation: 'Enhance activity logging coverage',
          affected_resource: 'Admin activity logger',
          status: 'open',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 259200000).toISOString()
        }
      ];

      return mockFindings;
    },
    enabled: hasPermission('all') || hasPermission('security_audit')
  });

  // Run security scan
  const securityScanMutation = useMutation({
    mutationFn: async () => {
      const scanId = `scan_${Date.now()}`;
      const scanResult: SecurityScanResult = {
        scan_id: scanId,
        started_at: new Date().toISOString(),
        completed_at: null,
        status: 'running',
        total_checks: 25,
        findings_count: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        progress: 0
      };

      setCurrentScan(scanResult);

      // Simulate progressive scan
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentScan(prev => prev ? { ...prev, progress: i } : null);
      }

      // Complete scan
      const completedScan: SecurityScanResult = {
        ...scanResult,
        completed_at: new Date().toISOString(),
        status: 'completed',
        progress: 100,
        findings_count: { critical: 1, high: 1, medium: 1, low: 1, info: 3 }
      };

      setCurrentScan(completedScan);
      await logActivity('security_scan_completed', { scan_id: scanId });
      
      return completedScan;
    },
    onSuccess: () => {
      toast({
        title: "Security Scan Complete",
        description: "Security audit completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['security_findings'] });
    }
  });

  // Update finding status
  const updateFindingMutation = useMutation({
    mutationFn: async ({ findingId, status }: { findingId: string; status: string }) => {
      await logActivity('security_finding_updated', { finding_id: findingId, new_status: status });
      return { findingId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security_findings'] });
    }
  });

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  if (!hasPermission('all') && !hasPermission('security_audit')) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          You need security audit permissions to access this module.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="h-6 w-6 mr-2 text-red-600" />
            Security Audit & Compliance
          </h2>
          <p className="text-muted-foreground">
            Comprehensive security analysis and vulnerability management
          </p>
        </div>
        
        <Button
          onClick={() => securityScanMutation.mutate()}
          disabled={securityScanMutation.isPending || currentScan?.status === 'running'}
        >
          <Scan className="h-4 w-4 mr-1" />
          {currentScan?.status === 'running' ? 'Scanning...' : 'Run Security Scan'}
        </Button>
      </div>

      {/* Active Scan Progress */}
      {currentScan && currentScan.status === 'running' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Security Scan in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scan ID: {currentScan.scan_id}</span>
                <span>{currentScan.progress}% complete</span>
              </div>
              <Progress value={currentScan.progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Running {currentScan.total_checks} security checks...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {securityFindings?.filter(f => f.type === 'critical').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {securityFindings?.filter(f => f.type === 'high').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">High</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {securityFindings?.filter(f => f.type === 'medium').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Medium</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {securityFindings?.filter(f => f.status === 'resolved').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="findings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="findings">Security Findings</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

        <TabsContent value="findings">
          <div className="space-y-4">
            {securityFindings?.map((finding) => (
              <Card key={finding.id} className={`border-l-4 ${getSeverityColor(finding.type)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      {getSeverityIcon(finding.type)}
                      <span className="ml-2">{finding.title}</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={finding.type === 'critical' ? 'destructive' : 'outline'}>
                        {finding.type.toUpperCase()}
                      </Badge>
                      <Badge variant={finding.status === 'resolved' ? 'default' : 'secondary'}>
                        {finding.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{finding.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{finding.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{finding.recommendation}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Affected Resource</h4>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {finding.affected_resource}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(finding.created_at).toLocaleString()}
                      </div>
                      
                      <div className="flex gap-2">
                        {finding.status === 'open' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateFindingMutation.mutate({
                                findingId: finding.id,
                                status: 'acknowledged'
                              })}
                            >
                              Acknowledge
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateFindingMutation.mutate({
                                findingId: finding.id,
                                status: 'resolved'
                              })}
                            >
                              Mark Resolved
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
              <CardDescription>
                Security compliance status and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold">Database Security</h3>
                    <div className="text-2xl font-bold text-red-600">45%</div>
                    <p className="text-sm text-muted-foreground">Needs Attention</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold">Access Control</h3>
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <p className="text-sm text-muted-foreground">Good</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <h3 className="font-semibold">Audit Logging</h3>
                    <div className="text-2xl font-bold text-yellow-600">78%</div>
                    <p className="text-sm text-muted-foreground">Improving</p>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Critical Compliance Issues</AlertTitle>
                  <AlertDescription>
                    990 database tables have RLS enabled but no policies defined. 
                    This poses a significant security risk and should be addressed immediately.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Security Scan History</CardTitle>
              <CardDescription>
                Previous security scans and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Scan History</h3>
                <p className="text-muted-foreground">
                  Historical security scan data and trends
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};