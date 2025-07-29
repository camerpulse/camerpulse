import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  GitBranch, Cloud, Zap, CheckCircle, AlertTriangle, 
  X, Clock, Play, Pause, RotateCcw, Monitor, Database
} from 'lucide-react';

interface DevOpsManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const DevOpsManagementModule: React.FC<DevOpsManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('pipelines');

  const cicdPipelines = [
    { 
      id: 1, 
      name: 'Main Frontend Pipeline', 
      status: 'success', 
      branch: 'main', 
      lastRun: '2024-01-15 14:30', 
      duration: '4m 32s',
      deploymentTarget: 'production',
      testsPassed: 247,
      testsTotal: 250,
      coverage: 92.4
    },
    { 
      id: 2, 
      name: 'Backend API Pipeline', 
      status: 'running', 
      branch: 'develop', 
      lastRun: '2024-01-15 14:45', 
      duration: '6m 12s',
      deploymentTarget: 'staging',
      testsPassed: 156,
      testsTotal: 160,
      coverage: 89.2
    },
    { 
      id: 3, 
      name: 'Mobile App Pipeline', 
      status: 'failed', 
      branch: 'feature/notifications', 
      lastRun: '2024-01-15 13:20', 
      duration: '2m 45s',
      deploymentTarget: 'development',
      testsPassed: 89,
      testsTotal: 95,
      coverage: 76.8
    }
  ];

  const deploymentEnvironments = [
    {
      id: 1,
      name: 'Production',
      status: 'healthy',
      version: 'v2.4.1',
      uptime: '99.9%',
      lastDeployment: '2024-01-14 16:00',
      traffic: '2.4k req/min',
      errorRate: '0.01%',
      instances: 3
    },
    {
      id: 2,
      name: 'Staging',
      status: 'healthy',
      version: 'v2.5.0-rc1',
      uptime: '99.7%',
      lastDeployment: '2024-01-15 14:30',
      traffic: '120 req/min',
      errorRate: '0.05%',
      instances: 2
    },
    {
      id: 3,
      name: 'Development',
      status: 'warning',
      version: 'v2.5.0-dev',
      uptime: '98.2%',
      lastDeployment: '2024-01-15 11:15',
      traffic: '45 req/min',
      errorRate: '1.2%',
      instances: 1
    }
  ];

  const performanceMetrics = [
    {
      id: 1,
      metric: 'Build Success Rate',
      current: 94.2,
      target: 95.0,
      trend: 'up',
      period: 'last 30 days'
    },
    {
      id: 2,
      metric: 'Deployment Frequency',
      current: 12.4,
      target: 15.0,
      trend: 'up',
      period: 'per week'
    },
    {
      id: 3,
      metric: 'Lead Time for Changes',
      current: 2.1,
      target: 2.0,
      trend: 'down',
      period: 'hours'
    },
    {
      id: 4,
      metric: 'Mean Time to Recovery',
      current: 15.6,
      target: 20.0,
      trend: 'down',
      period: 'minutes'
    }
  ];

  const infrastructureTests = [
    {
      id: 1,
      name: 'Database Connection Test',
      status: 'passed',
      lastRun: '2024-01-15 14:50',
      duration: '245ms',
      environment: 'production'
    },
    {
      id: 2,
      name: 'API Health Check',
      status: 'passed',
      lastRun: '2024-01-15 14:50',
      duration: '89ms',
      environment: 'production'
    },
    {
      id: 3,
      name: 'Load Balancer Test',
      status: 'failed',
      lastRun: '2024-01-15 14:49',
      duration: '2.3s',
      environment: 'staging'
    },
    {
      id: 4,
      name: 'SSL Certificate Check',
      status: 'passed',
      lastRun: '2024-01-15 14:48',
      duration: '156ms',
      environment: 'production'
    }
  ];

  const handlePipelineAction = (pipelineId: number, action: string) => {
    logActivity('pipeline_action', { pipeline_id: pipelineId, action });
  };

  const handleDeployment = (environmentId: number) => {
    logActivity('deployment_triggered', { environment_id: environmentId });
  };

  const handleRunTest = (testId: number) => {
    logActivity('infrastructure_test', { test_id: testId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'passed':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'failed':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <X className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="DevOps & Deployment Management"
        description="Manage CI/CD pipelines, deployments, and infrastructure testing"
        icon={GitBranch}
        iconColor="text-blue-600"
        onRefresh={() => {
          logActivity('devops_refresh', { timestamp: new Date() });
        }}
      />

      {/* DevOps Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Pipelines"
          value="8"
          icon={GitBranch}
          description="CI/CD pipelines running"
          badge={{ text: "Healthy", variant: "default" }}
        />
        <StatCard
          title="Deployment Success"
          value="94.2%"
          icon={Zap}
          trend={{ value: 2.1, isPositive: true, period: "this month" }}
          description="Success rate"
        />
        <StatCard
          title="Environments"
          value="5"
          icon={Cloud}
          description="Active deployment targets"
          badge={{ text: "Operational", variant: "secondary" }}
        />
        <StatCard
          title="Build Time"
          value="4m 32s"
          icon={Clock}
          trend={{ value: -0.3, isPositive: true, period: "avg" }}
          description="Average build duration"
        />
      </div>

      {/* DevOps Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipelines">CI/CD Pipelines</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="testing">Infrastructure Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                CI/CD Pipeline Management
              </CardTitle>
              <CardDescription>
                Monitor and manage continuous integration and deployment pipelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cicdPipelines.map((pipeline) => (
                  <div key={pipeline.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(pipeline.status)}
                        <h4 className="font-semibold">{pipeline.name}</h4>
                        <Badge variant="outline">{pipeline.branch}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            pipeline.status === 'success' ? 'default' :
                            pipeline.status === 'running' ? 'secondary' : 'destructive'
                          }
                        >
                          {pipeline.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePipelineAction(pipeline.id, 'rerun')}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Target:</span>
                        <p className="font-medium">{pipeline.deploymentTarget}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{pipeline.duration}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tests:</span>
                        <p className="font-medium">{pipeline.testsPassed}/{pipeline.testsTotal}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Coverage:</span>
                        <p className="font-medium">{pipeline.coverage}%</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Test Progress</span>
                        <span>{Math.round((pipeline.testsPassed / pipeline.testsTotal) * 100)}%</span>
                      </div>
                      <Progress value={(pipeline.testsPassed / pipeline.testsTotal) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Deployment Environments
              </CardTitle>
              <CardDescription>
                Monitor and manage deployment environments and their health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deploymentEnvironments.map((env) => (
                  <div key={env.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(env.status)}
                        <h4 className="font-semibold">{env.name}</h4>
                        <Badge variant="outline">{env.version}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            env.status === 'healthy' ? 'default' :
                            env.status === 'warning' ? 'secondary' : 'destructive'
                          }
                        >
                          {env.status}
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => handleDeployment(env.id)}
                        >
                          Deploy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Uptime:</span>
                        <p className="font-medium">{env.uptime}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Traffic:</span>
                        <p className="font-medium">{env.traffic}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Error Rate:</span>
                        <p className="font-medium">{env.errorRate}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Instances:</span>
                        <p className="font-medium">{env.instances}</p>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground">
                      Last deployment: {env.lastDeployment}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                DevOps Performance Metrics
              </CardTitle>
              <CardDescription>
                Track key DevOps performance indicators and team efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{metric.metric}</h4>
                      <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'}>
                        {metric.trend === 'up' ? '↗' : '↘'} Trending {metric.trend}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <p className="font-medium text-lg">{metric.current}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target:</span>
                        <p className="font-medium">{metric.target}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Period:</span>
                        <p className="font-medium">{metric.period}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Progress 
                        value={Math.min((metric.current / metric.target) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Infrastructure Testing
              </CardTitle>
              <CardDescription>
                Run and monitor infrastructure health checks and automated tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {infrastructureTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        test.status === 'passed' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {getStatusIcon(test.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{test.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Environment: {test.environment}</span>
                          <span>Duration: {test.duration}</span>
                          <span>Last run: {test.lastRun}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={test.status === 'passed' ? 'default' : 'destructive'}
                      >
                        {test.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRunTest(test.id)}
                      >
                        Run Test
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