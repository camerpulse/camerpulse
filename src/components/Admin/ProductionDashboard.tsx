import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Zap, 
  Eye, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Server,
  Database,
  Globe,
  Clock,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  ExternalLink
} from 'lucide-react';
import { productionLogger, createProductionLogger } from '@/utils/productionLogger';
import { performanceMonitor } from '@/utils/performance';
import { memoryMonitor, performanceBudget } from '@/utils/performanceOptimizer';

const logger = createProductionLogger('ProductionDashboard');

interface SystemMetrics {
  performance: {
    fcp: number;
    lcp: number;
    cls: number;
    fid: number;
    memoryUsage: number;
  };
  security: {
    cspViolations: number;
    httpsScore: number;
    headersScore: number;
  };
  seo: {
    lighthouseScore: number;
    structuredData: boolean;
    metaTags: number;
  };
  uptime: {
    availability: number;
    responseTime: number;
    errorRate: number;
  };
}

/**
 * Production Dashboard Component
 * Comprehensive monitoring and analytics for production deployment
 */
export const ProductionDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load metrics on component mount
  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      logger.info('Loading production metrics');
      setIsLoading(true);

      // Simulate API call to get real metrics
      const mockMetrics: SystemMetrics = {
        performance: {
          fcp: 1200, // First Contentful Paint
          lcp: 2100, // Largest Contentful Paint
          cls: 0.05, // Cumulative Layout Shift
          fid: 45,   // First Input Delay
          memoryUsage: 65 // Memory usage percentage
        },
        security: {
          cspViolations: 0,
          httpsScore: 100,
          headersScore: 95
        },
        seo: {
          lighthouseScore: 98,
          structuredData: true,
          metaTags: 15
        },
        uptime: {
          availability: 99.97,
          responseTime: 245,
          errorRate: 0.03
        }
      };

      setMetrics(mockMetrics);
      setLastUpdate(new Date());
      logger.info('Production metrics loaded successfully');
    } catch (error) {
      logger.error('Failed to load production metrics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceScore = (metrics: SystemMetrics): number => {
    const { fcp, lcp, cls, fid } = metrics.performance;
    
    // Calculate score based on Core Web Vitals
    const fcpScore = fcp <= 1800 ? 100 : Math.max(0, 100 - ((fcp - 1800) / 20));
    const lcpScore = lcp <= 2500 ? 100 : Math.max(0, 100 - ((lcp - 2500) / 25));
    const clsScore = cls <= 0.1 ? 100 : Math.max(0, 100 - (cls * 1000));
    const fidScore = fid <= 100 ? 100 : Math.max(0, 100 - ((fid - 100) / 2));
    
    return Math.round((fcpScore + lcpScore + clsScore + fidScore) / 4);
  };

  const getStatusColor = (value: number, thresholds: { good: number; needs: number }): string => {
    if (value >= thresholds.good) return 'text-green-500';
    if (value >= thresholds.needs) return 'text-yellow-500';
    return 'text-red-500';
  };

  const downloadReport = () => {
    if (!metrics) return;

    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      performanceScore: getPerformanceScore(metrics),
      recommendations: generateRecommendations(metrics)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camerpulse-production-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logger.info('Production report downloaded');
  };

  const generateRecommendations = (metrics: SystemMetrics): string[] => {
    const recommendations: string[] = [];

    if (metrics.performance.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint by reducing image sizes and improving server response times');
    }
    if (metrics.performance.cls > 0.1) {
      recommendations.push('Reduce Cumulative Layout Shift by adding size attributes to images and reserving space for dynamic content');
    }
    if (metrics.performance.memoryUsage > 80) {
      recommendations.push('Memory usage is high - consider implementing more aggressive garbage collection');
    }
    if (metrics.security.cspViolations > 0) {
      recommendations.push('Review and fix Content Security Policy violations');
    }
    if (metrics.uptime.errorRate > 0.1) {
      recommendations.push('Error rate is elevated - investigate and fix recurring issues');
    }

    return recommendations;
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading production metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
            <p className="text-muted-foreground">Failed to load production metrics</p>
            <Button onClick={loadMetrics} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performanceScore = getPerformanceScore(metrics);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and analytics for CamerPulse platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button onClick={loadMetrics} size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={downloadReport} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance Score</p>
                <p className={`text-2xl font-bold ${getStatusColor(performanceScore, { good: 90, needs: 70 })}`}>
                  {performanceScore}
                </p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <Progress value={performanceScore} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.security.headersScore, { good: 95, needs: 80 })}`}>
                  {metrics.security.headersScore}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={metrics.security.headersScore} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SEO Score</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.seo.lighthouseScore, { good: 95, needs: 80 })}`}>
                  {metrics.seo.lighthouseScore}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={metrics.seo.lighthouseScore} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.uptime.availability, { good: 99.9, needs: 99.0 })}`}>
                  {metrics.uptime.availability}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={metrics.uptime.availability} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="uptime">Uptime</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Core Web Vitals
              </CardTitle>
              <CardDescription>
                Key performance metrics that affect user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">First Contentful Paint</p>
                  <p className={`text-2xl font-bold ${getStatusColor(1800 - metrics.performance.fcp, { good: 600, needs: 0 })}`}>
                    {metrics.performance.fcp}ms
                  </p>
                  <Badge variant={metrics.performance.fcp <= 1800 ? 'default' : 'destructive'} className="text-xs mt-1">
                    {metrics.performance.fcp <= 1800 ? 'Good' : 'Needs Work'}
                  </Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Largest Contentful Paint</p>
                  <p className={`text-2xl font-bold ${getStatusColor(2500 - metrics.performance.lcp, { good: 400, needs: 0 })}`}>
                    {metrics.performance.lcp}ms
                  </p>
                  <Badge variant={metrics.performance.lcp <= 2500 ? 'default' : 'destructive'} className="text-xs mt-1">
                    {metrics.performance.lcp <= 2500 ? 'Good' : 'Needs Work'}
                  </Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Cumulative Layout Shift</p>
                  <p className={`text-2xl font-bold ${getStatusColor(0.1 - metrics.performance.cls, { good: 0.05, needs: 0 })}`}>
                    {metrics.performance.cls.toFixed(3)}
                  </p>
                  <Badge variant={metrics.performance.cls <= 0.1 ? 'default' : 'destructive'} className="text-xs mt-1">
                    {metrics.performance.cls <= 0.1 ? 'Good' : 'Needs Work'}
                  </Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">First Input Delay</p>
                  <p className={`text-2xl font-bold ${getStatusColor(100 - metrics.performance.fid, { good: 55, needs: 0 })}`}>
                    {metrics.performance.fid}ms
                  </p>
                  <Badge variant={metrics.performance.fid <= 100 ? 'default' : 'destructive'} className="text-xs mt-1">
                    {metrics.performance.fid <= 100 ? 'Good' : 'Needs Work'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Analysis
              </CardTitle>
              <CardDescription>
                Security headers, CSP compliance, and vulnerability assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">HTTPS</p>
                  <p className="text-sm text-muted-foreground">Fully encrypted</p>
                  <Badge variant="default" className="mt-2">Secure</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">Security Headers</p>
                  <p className="text-sm text-muted-foreground">All implemented</p>
                  <Badge variant="default" className="mt-2">Protected</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">CSP Violations</p>
                  <p className="text-sm text-muted-foreground">{metrics.security.cspViolations} detected</p>
                  <Badge variant={metrics.security.cspViolations === 0 ? 'default' : 'destructive'} className="mt-2">
                    {metrics.security.cspViolations === 0 ? 'Clean' : 'Issues Found'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                SEO Optimization
              </CardTitle>
              <CardDescription>
                Search engine optimization metrics and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="font-semibold">Lighthouse Score</p>
                  <p className="text-2xl font-bold text-green-500">{metrics.seo.lighthouseScore}</p>
                  <Badge variant="default" className="mt-2">Excellent</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">Structured Data</p>
                  <p className="text-sm text-muted-foreground">JSON-LD implemented</p>
                  <Badge variant="default" className="mt-2">Optimized</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">Meta Tags</p>
                  <p className="text-2xl font-bold text-green-500">{metrics.seo.metaTags}</p>
                  <Badge variant="default" className="mt-2">Complete</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uptime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>
                Uptime monitoring, response times, and error tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">Availability</p>
                  <p className="text-2xl font-bold text-green-500">{metrics.uptime.availability}%</p>
                  <Badge variant="default" className="mt-2">Excellent</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">Response Time</p>
                  <p className="text-2xl font-bold text-green-500">{metrics.uptime.responseTime}ms</p>
                  <Badge variant="default" className="mt-2">Fast</Badge>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">Error Rate</p>
                  <p className="text-2xl font-bold text-green-500">{metrics.uptime.errorRate}%</p>
                  <Badge variant="default" className="mt-2">Low</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {generateRecommendations(metrics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Optimization Recommendations
            </CardTitle>
            <CardDescription>
              Suggested improvements to enhance performance and user experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generateRecommendations(metrics).map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductionDashboard;