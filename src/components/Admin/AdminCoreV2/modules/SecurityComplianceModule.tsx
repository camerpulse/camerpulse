import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Lock, FileCheck, AlertTriangle, CheckCircle, 
  Eye, Users, Database, Key, Clock, Zap
} from 'lucide-react';

interface SecurityComplianceModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const SecurityComplianceModule: React.FC<SecurityComplianceModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('security');

  const securityAudits = [
    {
      id: 1,
      name: 'Authentication Security Audit',
      status: 'completed',
      score: 92,
      lastRun: '2024-01-15 10:00',
      duration: '2h 15m',
      findings: 3,
      critical: 0,
      high: 1,
      medium: 2,
      low: 0
    },
    {
      id: 2,
      name: 'Data Protection Compliance',
      status: 'in_progress',
      score: 88,
      lastRun: '2024-01-15 14:30',
      duration: '1h 45m',
      findings: 5,
      critical: 1,
      high: 2,
      medium: 1,
      low: 1
    },
    {
      id: 3,
      name: 'API Security Assessment',
      status: 'scheduled',
      score: 95,
      lastRun: '2024-01-14 16:00',
      duration: '3h 20m',
      findings: 2,
      critical: 0,
      high: 0,
      medium: 1,
      low: 1
    }
  ];

  const threatDetection = [
    {
      id: 1,
      threat: 'Unusual Login Pattern',
      severity: 'medium',
      status: 'investigating',
      detected: '2024-01-15 14:45',
      affected: '12 user accounts',
      location: 'Multiple IPs from Nigeria',
      action: 'Account monitoring enabled'
    },
    {
      id: 2,
      threat: 'SQL Injection Attempt',
      severity: 'high',
      status: 'blocked',
      detected: '2024-01-15 13:20',
      affected: 'API endpoint /admin/users',
      location: 'IP: 192.168.1.100',
      action: 'IP blocked, logs preserved'
    },
    {
      id: 3,
      threat: 'Rate Limit Exceeded',
      severity: 'low',
      status: 'resolved',
      detected: '2024-01-15 12:10',
      affected: 'Registration API',
      location: 'Automated bot traffic',
      action: 'Rate limiting adjusted'
    }
  ];

  const complianceFrameworks = [
    {
      id: 1,
      framework: 'GDPR',
      compliance: 94,
      status: 'compliant',
      lastAssessment: '2024-01-10',
      requirements: 25,
      met: 23,
      pending: 2,
      nonCompliant: 0
    },
    {
      id: 2,
      framework: 'ISO 27001',
      compliance: 87,
      status: 'mostly_compliant',
      lastAssessment: '2024-01-08',
      requirements: 114,
      met: 99,
      pending: 12,
      nonCompliant: 3
    },
    {
      id: 3,
      framework: 'SOC 2 Type II',
      compliance: 91,
      status: 'compliant',
      lastAssessment: '2024-01-05',
      requirements: 64,
      met: 58,
      pending: 4,
      nonCompliant: 2
    }
  ];

  const accessControls = [
    {
      id: 1,
      user: 'john.doe@example.com',
      role: 'Super Admin',
      lastLogin: '2024-01-15 14:30',
      loginAttempts: 1,
      status: 'active',
      mfaEnabled: true,
      permissions: ['all']
    },
    {
      id: 2,
      user: 'admin@camerpulse.com',
      role: 'System Admin',
      lastLogin: '2024-01-15 12:15',
      loginAttempts: 3,
      status: 'active',
      mfaEnabled: true,
      permissions: ['user_management', 'system_config']
    },
    {
      id: 3,
      user: 'moderator@camerpulse.com',
      role: 'Content Moderator',
      lastLogin: '2024-01-14 18:45',
      loginAttempts: 1,
      status: 'active',
      mfaEnabled: false,
      permissions: ['content_moderation']
    }
  ];

  const handleSecurityAction = (auditId: number, action: string) => {
    logActivity('security_action', { audit_id: auditId, action });
  };

  const handleThreatResponse = (threatId: number, action: string) => {
    logActivity('threat_response', { threat_id: threatId, action });
  };

  const handleComplianceUpdate = (frameworkId: number) => {
    logActivity('compliance_update', { framework_id: frameworkId });
  };

  const handleAccessControl = (userId: number, action: string) => {
    logActivity('access_control', { user_id: userId, action });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Security & Compliance Management"
        description="Monitor security threats, audit compliance, and manage access controls"
        icon={Shield}
        iconColor="text-red-600"
        onRefresh={() => {
          logActivity('security_compliance_refresh', { timestamp: new Date() });
        }}
      />

      {/* Security & Compliance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Security Score"
          value="92%"
          icon={Shield}
          trend={{ value: 2.1, isPositive: true, period: "this week" }}
          description="Overall security posture"
          badge={{ text: "Excellent", variant: "default" }}
        />
        <StatCard
          title="Active Threats"
          value="3"
          icon={AlertTriangle}
          description="Threats being monitored"
          badge={{ text: "Medium Risk", variant: "secondary" }}
        />
        <StatCard
          title="Compliance Level"
          value="91%"
          icon={FileCheck}
          trend={{ value: 1.5, isPositive: true, period: "this month" }}
          description="Average compliance score"
        />
        <StatCard
          title="Failed Logins"
          value="12"
          icon={Lock}
          trend={{ value: -15, isPositive: true, period: "24h" }}
          description="Blocked login attempts"
        />
      </div>

      {/* Security & Compliance Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security">Security Audits</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Audit Dashboard
              </CardTitle>
              <CardDescription>
                Monitor and manage security audits and assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityAudits.map((audit) => (
                  <div key={audit.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          audit.status === 'completed' ? 'bg-green-100' :
                          audit.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Shield className={`h-6 w-6 ${
                            audit.status === 'completed' ? 'text-green-600' :
                            audit.status === 'in_progress' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{audit.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Score: {audit.score}% • Duration: {audit.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            audit.status === 'completed' ? 'default' :
                            audit.status === 'in_progress' ? 'secondary' : 'outline'
                          }
                        >
                          {audit.status.replace('_', ' ')}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => handleSecurityAction(audit.id, 'rerun')}
                        >
                          Rerun
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{audit.critical}</p>
                        <p className="text-xs text-muted-foreground">Critical</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{audit.high}</p>
                        <p className="text-xs text-muted-foreground">High</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{audit.medium}</p>
                        <p className="text-xs text-muted-foreground">Medium</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{audit.low}</p>
                        <p className="text-xs text-muted-foreground">Low</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Security Score</span>
                        <span>{audit.score}%</span>
                      </div>
                      <Progress value={audit.score} className="h-2" />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Last run: {audit.lastRun} • {audit.findings} findings total
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Threat Detection & Response
              </CardTitle>
              <CardDescription>
                Monitor and respond to security threats in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatDetection.map((threat) => (
                  <div key={threat.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getSeverityColor(threat.severity)}`}>
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{threat.threat}</h4>
                          <p className="text-sm text-muted-foreground">
                            Detected: {threat.detected}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            threat.status === 'blocked' ? 'default' :
                            threat.status === 'investigating' ? 'secondary' : 'outline'
                          }
                        >
                          {threat.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleThreatResponse(threat.id, 'investigate')}
                        >
                          Investigate
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Affected:</span>
                        <p className="font-medium">{threat.affected}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{threat.location}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Action Taken:</span>
                        <p className="font-medium">{threat.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Compliance Framework Monitoring
              </CardTitle>
              <CardDescription>
                Track compliance with various regulatory frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceFrameworks.map((framework) => (
                  <div key={framework.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          framework.status === 'compliant' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          <FileCheck className={`h-6 w-6 ${
                            framework.status === 'compliant' ? 'text-green-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{framework.framework}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last assessment: {framework.lastAssessment}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={framework.status === 'compliant' ? 'default' : 'secondary'}
                        >
                          {framework.compliance}% compliant
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => handleComplianceUpdate(framework.id)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{framework.met}</p>
                        <p className="text-xs text-muted-foreground">Met</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{framework.pending}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{framework.nonCompliant}</p>
                        <p className="text-xs text-muted-foreground">Non-compliant</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{framework.requirements}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Compliance Progress</span>
                        <span>{framework.compliance}%</span>
                      </div>
                      <Progress value={framework.compliance} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Access Control Management
              </CardTitle>
              <CardDescription>
                Monitor and manage user access controls and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessControls.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        user.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Users className={`h-6 w-6 ${
                          user.status === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{user.user}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{user.role}</span>
                          <span>Last login: {user.lastLogin}</span>
                          <span>MFA: {user.mfaEnabled ? '✓' : '✗'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                      >
                        {user.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAccessControl(user.id, 'review')}
                      >
                        Review Access
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};