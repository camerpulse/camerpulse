import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSecurityScans } from '@/hooks/usePluginMarketplace';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Bug,
  Lock,
  Eye,
  Clock,
  Target,
  Code,
  FileText,
  Zap
} from 'lucide-react';

interface SecurityPattern {
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

const SECURITY_PATTERNS: SecurityPattern[] = [
  {
    pattern: 'eval\\s*\\(',
    severity: 'critical',
    description: 'Dynamic code execution using eval()',
    recommendation: 'Remove eval() calls and use safer alternatives'
  },
  {
    pattern: 'innerHTML\\s*=',
    severity: 'high',
    description: 'Potential XSS vulnerability through innerHTML',
    recommendation: 'Use textContent or sanitize HTML content'
  },
  {
    pattern: 'document\\.write\\s*\\(',
    severity: 'high',
    description: 'Deprecated document.write usage',
    recommendation: 'Use modern DOM manipulation methods'
  },
  {
    pattern: 'window\\[.*\\]\\s*\\(',
    severity: 'medium',
    description: 'Dynamic property access on window object',
    recommendation: 'Validate property names before access'
  },
  {
    pattern: 'localStorage\\.|sessionStorage\\.',
    severity: 'low',
    description: 'Browser storage access',
    recommendation: 'Ensure sensitive data is encrypted'
  }
];

export const SecurityEngine: React.FC = () => {
  const { scans, isLoading } = useSecurityScans();
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [scanResults, setScanResults] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Mock security scan function
  const performSecurityScan = async (pluginCode: string) => {
    setIsScanning(true);
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const findings: any[] = [];
    let overallScore = 100;
    
    // Check for security patterns
    SECURITY_PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.pattern, 'gi');
      const matches = pluginCode.match(regex);
      
      if (matches) {
        const severityScores = { low: 5, medium: 15, high: 25, critical: 40 };
        overallScore -= severityScores[pattern.severity] * matches.length;
        
        findings.push({
          pattern: pattern.pattern,
          severity: pattern.severity,
          description: pattern.description,
          recommendation: pattern.recommendation,
          matches: matches.length,
          examples: matches.slice(0, 3)
        });
      }
    });

    // Dependency analysis (mock)
    const dependencies = extractDependencies(pluginCode);
    const vulnerableDeps = dependencies.filter(dep => 
      Math.random() < 0.2 // 20% chance of vulnerability for demo
    );

    vulnerableDeps.forEach(dep => {
      overallScore -= 10;
      findings.push({
        type: 'dependency',
        severity: 'medium',
        description: `Vulnerable dependency: ${dep}`,
        recommendation: 'Update to latest secure version',
        dependency: dep
      });
    });

    // Code quality checks
    const qualityScore = calculateCodeQuality(pluginCode);
    
    const result = {
      overallScore: Math.max(0, Math.min(100, overallScore)),
      qualityScore,
      findings,
      dependencyCount: dependencies.length,
      vulnerableDependencies: vulnerableDeps.length,
      requiresManualReview: overallScore < 70 || findings.some(f => f.severity === 'critical'),
      scanDuration: 2000,
      timestamp: new Date().toISOString()
    };
    
    setScanResults(result);
    setIsScanning(false);
    return result;
  };

  const extractDependencies = (code: string): string[] => {
    // Mock dependency extraction
    const imports = code.match(/import.*from\s+['"](.+)['"]/g) || [];
    return imports.map(imp => imp.match(/from\s+['"](.+)['"]/)?.[1] || '').filter(Boolean);
  };

  const calculateCodeQuality = (code: string): number => {
    let score = 80;
    
    // Basic quality metrics
    if (code.length < 100) score -= 10; // Too short
    if (code.length > 10000) score -= 5; // Very long
    if (!code.includes('function') && !code.includes('=>')) score -= 15; // No functions
    if (!code.includes('//') && !code.includes('/*')) score -= 10; // No comments
    
    return Math.max(0, Math.min(100, score));
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-800">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="h-8 w-8 mr-3" />
            Security Engine
          </h1>
          <p className="text-muted-foreground">
            Automated security scanning and analysis for plugins
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{scans.length} Scans</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scans">Recent Scans</TabsTrigger>
          <TabsTrigger value="patterns">Security Patterns</TabsTrigger>
          <TabsTrigger value="demo">Demo Scanner</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                    <p className="text-2xl font-bold">{scans.length}</p>
                  </div>
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Passed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {scans.filter(s => s.status === 'passed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {scans.filter(s => s.status === 'failed').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Manual Review</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {scans.filter(s => s.status === 'manual_review').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Activity</CardTitle>
              <CardDescription>Latest security scans and findings</CardDescription>
            </CardHeader>
            <CardContent>
              {scans.slice(0, 5).map((scan) => (
                <div key={scan.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {scan.status === 'passed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {scan.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                      {scan.status === 'manual_review' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                      {scan.status === 'pending' && <Clock className="h-4 w-4 text-gray-500" />}
                    </div>
                    <div>
                      <p className="font-medium">{scan.plugin_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {scan.overall_score && (
                      <span className={`font-medium ${getScoreColor(scan.overall_score)}`}>
                        {scan.overall_score}/100
                      </span>
                    )}
                    <Badge variant="outline">{scan.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scans" className="space-y-4">
          {scans.map((scan) => (
            <Card key={scan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {getScoreIcon(scan.overall_score || 0)}
                      <span className="ml-2">{scan.plugin_id}</span>
                    </CardTitle>
                    <CardDescription>
                      Scanned {new Date(scan.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(scan.overall_score || 0)}`}>
                      {scan.overall_score || 0}/100
                    </div>
                    <Badge variant="outline">{scan.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scan.overall_score && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Security Score</span>
                        <span>{scan.overall_score}/100</span>
                      </div>
                      <Progress value={scan.overall_score} className="h-2" />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Vulnerabilities:</span>
                      <span className="ml-1">{scan.malicious_patterns_found?.length || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium">Dependencies:</span>
                      <span className="ml-1">{scan.dependency_vulnerabilities?.length || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium">Manual Review:</span>
                      <span className="ml-1">{scan.requires_manual_review ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <span className="ml-1">
                        {scan.completed_at ? `${Math.round((new Date(scan.completed_at).getTime() - new Date(scan.created_at).getTime()) / 1000)}s` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Pattern Library</CardTitle>
              <CardDescription>Patterns checked during security scans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SECURITY_PATTERNS.map((pattern, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <code className="text-sm bg-muted px-2 py-1 rounded">{pattern.pattern}</code>
                      </div>
                      {getSeverityBadge(pattern.severity)}
                    </div>
                    <p className="text-sm mb-2">{pattern.description}</p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Recommendation:</strong> {pattern.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demo Security Scanner</CardTitle>
              <CardDescription>Test the security scanner with sample code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Plugin Code</label>
                <textarea
                  className="w-full h-40 p-3 border rounded-md font-mono text-sm"
                  placeholder="// Paste plugin code here to test security scanning...
function myPlugin() {
  // Your plugin code
  return 'Hello World';
}"
                  id="demo-code"
                />
              </div>
              
              <Button 
                onClick={() => {
                  const code = (document.getElementById('demo-code') as HTMLTextAreaElement)?.value || '';
                  if (code.trim()) {
                    performSecurityScan(code);
                  }
                }}
                disabled={isScanning}
                className="w-full"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Security Scan
                  </>
                )}
              </Button>

              {scanResults && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getScoreIcon(scanResults.overallScore)}
                      <span className="ml-2">Scan Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(scanResults.overallScore)}`}>
                          {scanResults.overallScore}
                        </div>
                        <div className="text-sm text-muted-foreground">Security Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{scanResults.qualityScore}</div>
                        <div className="text-sm text-muted-foreground">Code Quality</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{scanResults.findings.length}</div>
                        <div className="text-sm text-muted-foreground">Issues Found</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{scanResults.dependencyCount}</div>
                        <div className="text-sm text-muted-foreground">Dependencies</div>
                      </div>
                    </div>

                    {scanResults.findings.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Security Findings</h4>
                        <div className="space-y-2">
                          {scanResults.findings.map((finding: any, index: number) => (
                            <div key={index} className="border rounded p-3">
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-medium">{finding.description}</span>
                                {getSeverityBadge(finding.severity)}
                              </div>
                              <p className="text-sm text-muted-foreground">{finding.recommendation}</p>
                              {finding.matches && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Found {finding.matches} occurrence(s)
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {scanResults.requiresManualReview && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                          <span className="font-medium text-orange-800">Manual Review Required</span>
                        </div>
                        <p className="text-sm text-orange-700 mt-1">
                          This plugin requires manual security review before approval.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};