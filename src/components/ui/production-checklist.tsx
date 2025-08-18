import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Rocket } from 'lucide-react';
import { productionValidator } from '@/utils/productionValidator';

interface DeploymentCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

export const ProductionChecklist: React.FC = () => {
  const [checks, setChecks] = useState<DeploymentCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<string>('');

  const runProductionChecks = async () => {
    setIsRunning(true);
    try {
      const results = await productionValidator.runAllChecks();
      setChecks(results);
      setReport(productionValidator.generateReport());
    } catch (error) {
      console.error('Production check failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runProductionChecks();
  }, []);

  const criticalFailures = checks.filter(check => check.critical && check.status === 'fail');
  const warnings = checks.filter(check => check.status === 'warning');
  const passes = checks.filter(check => check.status === 'pass');
  const isProductionReady = criticalFailures.length === 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, critical: boolean) => {
    if (status === 'pass') {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Pass</Badge>;
    }
    if (status === 'fail') {
      return <Badge variant="destructive">{critical ? 'Critical' : 'Fail'}</Badge>;
    }
    return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>;
  };

  const progressValue = Math.round((passes.length / checks.length) * 100) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            CamerPulse Production Readiness
          </CardTitle>
          <CardDescription>
            Comprehensive production deployment checklist and validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Status */}
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold">
              {isProductionReady ? (
                <span className="text-green-600">✅ PRODUCTION READY</span>
              ) : (
                <span className="text-red-600">❌ NOT READY</span>
              )}
            </div>
            <Progress value={progressValue} className="w-full" />
            <div className="text-sm text-muted-foreground">
              {passes.length} of {checks.length} checks passed ({progressValue}%)
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{passes.length}</div>
                <div className="text-sm text-muted-foreground">Checks Passed</div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{warnings.length}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{criticalFailures.length}</div>
                <div className="text-sm text-muted-foreground">Critical Issues</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button 
              onClick={runProductionChecks} 
              disabled={isRunning}
              className="min-w-[200px]"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Checks...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-run Checks
                </>
              )}
            </Button>
          </div>

          {/* Critical Issues Alert */}
          {criticalFailures.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical Issues Found:</strong> {criticalFailures.length} critical issues must be resolved before production deployment.
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings Alert */}
          {warnings.length > 0 && isProductionReady && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warnings:</strong> {warnings.length} non-critical issues should be addressed for optimal performance.
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Check Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detailed Results</h3>
            
            {criticalFailures.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Critical Issues</h4>
                {criticalFailures.map((check, index) => (
                  <Card key={index} className="border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(check.status)}
                          <span className="font-medium">{check.name}</span>
                        </div>
                        {getStatusBadge(check.status, check.critical)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{check.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-600">Warnings</h4>
                {warnings.map((check, index) => (
                  <Card key={index} className="border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(check.status)}
                          <span className="font-medium">{check.name}</span>
                        </div>
                        {getStatusBadge(check.status, check.critical)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{check.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Passed Checks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {passes.map((check, index) => (
                  <Card key={index} className="border-green-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(check.status)}
                          <span className="text-sm font-medium">{check.name}</span>
                        </div>
                        {getStatusBadge(check.status, check.critical)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Production Report */}
          {report && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Production Report</h3>
              <Card>
                <CardContent className="p-4">
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-md overflow-x-auto">
                    {report}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};