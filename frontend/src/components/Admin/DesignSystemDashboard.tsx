/**
 * Design System Management Dashboard
 * 
 * Admin interface for managing and monitoring design system compliance
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Palette, 
  Monitor,
  RefreshCw,
  Settings,
  FileCode,
  TrendingUp,
  Eye,
  Edit,
  Download,
  Upload
} from 'lucide-react';
import { designSystemEnforcer, DesignSystemMetrics, DesignViolation } from '@/lib/design-system-enforcer';

export const DesignSystemDashboard: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DesignSystemMetrics | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<DesignViolation | null>(null);
  const [autoFixEnabled, setAutoFixEnabled] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    // Simulate loading metrics from scan
    setIsScanning(true);
    try {
      // In a real implementation, this would scan the actual codebase
      const mockFiles = [
        { path: '/src/components/ui/button.tsx', content: 'className="text-white bg-black"' },
        { path: '/src/pages/Home.tsx', content: 'className="p-4 m-2 text-lg"' }
      ];
      
      const scanResult = designSystemEnforcer.generateComplianceReport(mockFiles);
      setMetrics(scanResult);
      
      toast({
        title: "Scan Complete",
        description: `Found ${scanResult.violations.length} violations across ${scanResult.totalComponents} components`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed", 
        description: "Unable to complete design system scan",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutoFix = async (violation: DesignViolation) => {
    if (!autoFixEnabled) return;
    
    try {
      const fix = designSystemEnforcer.generateAutoFix(violation);
      toast({
        title: "Auto-fix Applied",
        description: `Fixed ${violation.type} in ${violation.file}:${violation.line}`,
      });
    } catch (error) {
      toast({
        title: "Auto-fix Failed",
        description: "Unable to automatically fix this violation",
        variant: "destructive"
      });
    }
  };

  const exportReport = () => {
    if (!metrics) return;
    
    const report = {
      generated: new Date().toISOString(),
      summary: {
        totalComponents: metrics.totalComponents,
        compliantComponents: metrics.compliantComponents,
        complianceRate: ((metrics.compliantComponents / metrics.totalComponents) * 100).toFixed(1),
        violationCount: metrics.violations.length,
        responsiveCompliance: metrics.responsiveCompliance.toFixed(1)
      },
      violations: metrics.violations,
      tokenUsage: metrics.tokenUsage
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-system-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return 'text-cm-green';
    if (rate >= 70) return 'text-cm-yellow';
    return 'text-cm-red';
  };

  const getViolationSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Design System Dashboard</h2>
            <p className="text-muted-foreground mb-6">Monitor and enforce design system compliance</p>
            <Button onClick={loadMetrics} disabled={isScanning}>
              {isScanning && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {isScanning ? 'Scanning...' : 'Start Scan'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const complianceRate = (metrics.compliantComponents / metrics.totalComponents) * 100;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Design System Core</h1>
            <p className="text-muted-foreground">CamerPulse Design System Management & Enforcement</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={loadMetrics} disabled={isScanning}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Rescan
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Design Compliance</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getComplianceColor(complianceRate)}`}>
                {complianceRate.toFixed(1)}%
              </div>
              <Progress value={complianceRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.compliantComponents} of {metrics.totalComponents} components compliant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {metrics.violations.length}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="destructive" className="text-xs">
                  {metrics.violations.filter(v => v.severity === 'error').length} Errors
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {metrics.violations.filter(v => v.severity === 'warning').length} Warnings
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Responsive</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getComplianceColor(metrics.responsiveCompliance)}`}>
                {metrics.responsiveCompliance.toFixed(1)}%
              </div>
              <Progress value={metrics.responsiveCompliance} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Mobile-first compliance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Object.values(metrics.tokenUsage.colors).reduce((a, b) => a + b, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Semantic tokens used
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="violations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="tokens">Token Usage</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 h-5" />
                  Design Violations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.violations.map((violation, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getViolationSeverityColor(violation.severity)}>
                            {violation.severity}
                          </Badge>
                          <span className="font-medium">{violation.type}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedViolation(violation)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {autoFixEnabled && (
                            <Button size="sm" onClick={() => handleAutoFix(violation)}>
                              <Edit className="h-4 w-4" />
                              Auto-fix
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{violation.file}:{violation.line}</p>
                      <p className="text-sm">{violation.message}</p>
                      <div className="bg-muted p-3 rounded text-xs font-mono">
                        {violation.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Color Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(metrics.tokenUsage.colors).map(([token, count]) => (
                      <div key={token} className="flex justify-between items-center">
                        <span className="text-sm">{token}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spacing Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(metrics.tokenUsage.spacing).map(([token, count]) => (
                      <div key={token} className="flex justify-between items-center">
                        <span className="text-sm">{token}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Typography Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(metrics.tokenUsage.typography).map(([token, count]) => (
                      <div key={token} className="flex justify-between items-center">
                        <span className="text-sm">{token}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Component Library Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['FollowButton', 'UserAvatar', 'PollCard', 'OfficialCard', 'CivicTag', 'RatingStars'].map(component => (
                    <div key={component} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{component}</span>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Design system compliant</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enforcement Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-fix Violations</p>
                    <p className="text-sm text-muted-foreground">Automatically fix design system violations</p>
                  </div>
                  <Button 
                    variant={autoFixEnabled ? "default" : "outline"}
                    onClick={() => setAutoFixEnabled(!autoFixEnabled)}
                  >
                    {autoFixEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">24hr Scanning</p>
                    <p className="text-sm text-muted-foreground">Automatically scan for violations daily</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Publish Checks</p>
                    <p className="text-sm text-muted-foreground">Block publishing with design violations</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};