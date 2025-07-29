import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Bot, 
  Users, 
  Activity, 
  Lock, 
  Eye, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Smartphone,
  Database,
  FileText,
  BarChart3
} from 'lucide-react';

export default function PetitionSecurity() {
  const [securityLevel, setSecurityLevel] = React.useState('high');
  const [antiSpamEnabled, setAntiSpamEnabled] = React.useState(true);
  const [captchaEnabled, setCaptchaEnabled] = React.useState(true);
  const [ratelimitEnabled, setRatelimitEnabled] = React.useState(true);

  const securityMetrics = {
    threatsPrevented: 1247,
    spamBlocked: 823,
    suspiciousActivity: 45,
    securityScore: 94
  };

  const fraudAlerts = [
    {
      id: 1,
      type: 'Duplicate Signatures',
      severity: 'high',
      count: 12,
      petition: 'Education Reform 2024',
      timestamp: '2 hours ago',
      status: 'investigating'
    },
    {
      id: 2,
      type: 'Bot Activity',
      severity: 'medium',
      count: 8,
      petition: 'Climate Action Now',
      timestamp: '4 hours ago',
      status: 'resolved'
    },
    {
      id: 3,
      type: 'Suspicious IP Pattern',
      severity: 'low',
      count: 3,
      petition: 'Healthcare Access',
      timestamp: '6 hours ago',
      status: 'monitoring'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'investigating': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'monitoring': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Security & Fraud Prevention</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Advanced security monitoring and fraud prevention for petition integrity
          </p>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{securityMetrics.securityScore}%</div>
              <Progress value={securityMetrics.securityScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Threats Prevented</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics.threatsPrevented.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spam Blocked</CardTitle>
              <Bot className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics.spamBlocked.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Automated detection</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics.suspiciousActivity}</div>
              <p className="text-xs text-muted-foreground">Under investigation</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
            <TabsTrigger value="analysis">Fraud Analysis</TabsTrigger>
            <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
          </TabsList>

          {/* Security Alerts */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Security Alerts
                </CardTitle>
                <CardDescription>
                  Real-time fraud detection and suspicious activity monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(alert.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{alert.type}</h3>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.count} incidents on "{alert.petition}"
                        </p>
                        <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Investigate</Button>
                      <Button variant="outline" size="sm">Resolve</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fraud Prevention</CardTitle>
                  <CardDescription>Configure automated fraud detection systems</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Security Level</Label>
                    <Select value={securityLevel} onValueChange={setSecurityLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Basic protection</SelectItem>
                        <SelectItem value="medium">Medium - Balanced security</SelectItem>
                        <SelectItem value="high">High - Maximum protection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Anti-Spam Detection</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically detect and block spam signatures
                      </p>
                    </div>
                    <Switch checked={antiSpamEnabled} onCheckedChange={setAntiSpamEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>CAPTCHA Protection</Label>
                      <p className="text-sm text-muted-foreground">
                        Require CAPTCHA for suspicious activity
                      </p>
                    </div>
                    <Switch checked={captchaEnabled} onCheckedChange={setCaptchaEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">
                        Limit signature frequency per IP address
                      </p>
                    </div>
                    <Switch checked={ratelimitEnabled} onCheckedChange={setRatelimitEnabled} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verification Systems</CardTitle>
                  <CardDescription>Configure identity verification requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="min-age">Minimum Age Requirement</Label>
                    <Input id="min-age" type="number" defaultValue="18" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-signatures">Max Signatures per IP (24h)</Label>
                    <Input id="max-signatures" type="number" defaultValue="5" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-threshold">Auto-verification Threshold</Label>
                    <Input id="verification-threshold" type="number" defaultValue="1000" />
                    <p className="text-sm text-muted-foreground">
                      Signatures before requiring enhanced verification
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Verification Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Require email verification for all signatures
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fraud Analysis */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Fraud Detection Patterns</CardTitle>
                  <CardDescription>AI-powered analysis of suspicious activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bot className="h-5 w-5 text-red-500" />
                        <div>
                          <h4 className="font-medium">Bot Signature Pattern</h4>
                          <p className="text-sm text-muted-foreground">
                            Rapid sequential signatures from same IP range
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-yellow-500" />
                        <div>
                          <h4 className="font-medium">Duplicate Information</h4>
                          <p className="text-sm text-muted-foreground">
                            Multiple signatures with identical details
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">Medium Risk</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">Geographic Anomaly</h4>
                          <p className="text-sm text-muted-foreground">
                            Unusual geographic distribution of signatures
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Low Risk</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>Current system security status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Overall Security</span>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                    <Progress value={94} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Fraud Prevention</span>
                      <span className="text-sm font-medium">98%</span>
                    </div>
                    <Progress value={98} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Data Integrity</span>
                      <span className="text-sm font-medium">96%</span>
                    </div>
                    <Progress value={96} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">System Monitoring</span>
                      <span className="text-sm font-medium">91%</span>
                    </div>
                    <Progress value={91} />
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security Status</AlertTitle>
                    <AlertDescription>
                      All systems operational. No critical threats detected.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Reports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Compliance Dashboard
                  </CardTitle>
                  <CardDescription>Legal and regulatory compliance tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Data Protection (GDPR)</h4>
                      <p className="text-sm text-muted-foreground">User data handling compliance</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Compliant
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Accessibility (WCAG 2.1)</h4>
                      <p className="text-sm text-muted-foreground">Web accessibility standards</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Compliant
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Digital Signature Law</h4>
                      <p className="text-sm text-muted-foreground">Electronic signature validity</p>
                    </div>
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                      Review Required
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Anti-Fraud Measures</h4>
                      <p className="text-sm text-muted-foreground">Fraud prevention compliance</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Compliant
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Audit Reports
                  </CardTitle>
                  <CardDescription>Generate and download compliance reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Monthly Security Report
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Data Processing Report
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Fraud Prevention Report
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Compliance Analytics
                  </Button>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Custom Report</h4>
                    <div className="space-y-2">
                      <Label htmlFor="report-period">Report Period</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Last Week</SelectItem>
                          <SelectItem value="month">Last Month</SelectItem>
                          <SelectItem value="quarter">Last Quarter</SelectItem>
                          <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full mt-3">Generate Report</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button size="lg" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Enable Enhanced Security
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Download Security Report
          </Button>
        </div>
      </div>
    </div>
  );
}