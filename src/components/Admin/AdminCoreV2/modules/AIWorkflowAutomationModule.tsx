import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Workflow, Zap, Play, Pause, Settings, 
  CheckCircle, Clock, AlertTriangle, RotateCcw, GitBranch
} from 'lucide-react';

interface AIWorkflowAutomationModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const AIWorkflowAutomationModule: React.FC<AIWorkflowAutomationModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('workflows');

  const automatedWorkflows = [
    {
      id: 1,
      name: 'Content Review & Approval',
      description: 'Automatically review and approve user-generated content using AI',
      status: 'active',
      trigger: 'New content submission',
      steps: 5,
      completedToday: 247,
      successRate: 94.2,
      avgProcessingTime: '2m 15s',
      lastRun: '2024-01-15 14:45',
      category: 'Content Management'
    },
    {
      id: 2,
      name: 'Political News Classification',
      description: 'Classify and categorize incoming political news articles',
      status: 'active',
      trigger: 'RSS feed update',
      steps: 3,
      completedToday: 189,
      successRate: 97.8,
      avgProcessingTime: '45s',
      lastRun: '2024-01-15 14:50',
      category: 'News Processing'
    },
    {
      id: 3,
      name: 'User Engagement Follow-up',
      description: 'Send personalized follow-up messages based on user activity',
      status: 'paused',
      trigger: 'User inactivity (7 days)',
      steps: 4,
      completedToday: 0,
      successRate: 89.5,
      avgProcessingTime: '1m 30s',
      lastRun: '2024-01-14 18:30',
      category: 'User Engagement'
    },
    {
      id: 4,
      name: 'Fraud Detection Response',
      description: 'Automatically flag and respond to suspicious activities',
      status: 'active',
      trigger: 'Fraud detection alert',
      steps: 6,
      completedToday: 23,
      successRate: 98.9,
      avgProcessingTime: '30s',
      lastRun: '2024-01-15 13:20',
      category: 'Security'
    }
  ];

  const workflowTemplates = [
    {
      id: 1,
      name: 'Social Media Automation',
      description: 'Auto-post content across social media platforms',
      category: 'Marketing',
      complexity: 'medium',
      estimatedSetup: '15 minutes',
      features: ['Cross-platform posting', 'Content scheduling', 'Analytics tracking']
    },
    {
      id: 2,
      name: 'Email Campaign Trigger',
      description: 'Send targeted emails based on user behavior',
      category: 'Communication',
      complexity: 'easy',
      estimatedSetup: '10 minutes',
      features: ['Behavior triggers', 'Personalization', 'A/B testing']
    },
    {
      id: 3,
      name: 'Report Generation',
      description: 'Generate automated reports from data analytics',
      category: 'Analytics',
      complexity: 'hard',
      estimatedSetup: '30 minutes',
      features: ['Data aggregation', 'Chart generation', 'PDF export']
    },
    {
      id: 4,
      name: 'User Onboarding',
      description: 'Automated user onboarding and welcome sequence',
      category: 'User Management',
      complexity: 'medium',
      estimatedSetup: '20 minutes',
      features: ['Welcome emails', 'Tutorial triggers', 'Progress tracking']
    }
  ];

  const executionHistory = [
    {
      id: 1,
      workflowName: 'Content Review & Approval',
      executedAt: '2024-01-15 14:45',
      duration: '2m 15s',
      status: 'success',
      itemsProcessed: 12,
      trigger: 'New article submission',
      result: 'Approved and published'
    },
    {
      id: 2,
      workflowName: 'Political News Classification',
      executedAt: '2024-01-15 14:42',
      duration: '45s',
      status: 'success',
      itemsProcessed: 5,
      trigger: 'RSS feed update',
      result: 'Categorized as Regional Politics'
    },
    {
      id: 3,
      workflowName: 'Fraud Detection Response',
      executedAt: '2024-01-15 14:30',
      duration: '30s',
      status: 'warning',
      itemsProcessed: 1,
      trigger: 'Suspicious activity detected',
      result: 'Account flagged for review'
    },
    {
      id: 4,
      workflowName: 'Content Review & Approval',
      executedAt: '2024-01-15 14:25',
      duration: '1m 45s',
      status: 'failed',
      itemsProcessed: 0,
      trigger: 'New video submission',
      result: 'Content moderation service unavailable'
    }
  ];

  const scheduledTasks = [
    {
      id: 1,
      name: 'Daily Analytics Report',
      schedule: 'Daily at 6:00 AM',
      nextRun: '2024-01-16 06:00',
      workflow: 'Report Generation',
      status: 'scheduled',
      lastExecution: 'success'
    },
    {
      id: 2,
      name: 'Weekly User Engagement Review',
      schedule: 'Weekly on Mondays',
      nextRun: '2024-01-22 09:00',
      workflow: 'User Engagement Follow-up',
      status: 'scheduled',
      lastExecution: 'success'
    },
    {
      id: 3,
      name: 'Social Media Content Push',
      schedule: 'Every 4 hours',
      nextRun: '2024-01-15 18:00',
      workflow: 'Social Media Automation',
      status: 'active',
      lastExecution: 'success'
    },
    {
      id: 4,
      name: 'Monthly Performance Analysis',
      schedule: 'Monthly on 1st',
      nextRun: '2024-02-01 00:00',
      workflow: 'Advanced Analytics',
      status: 'scheduled',
      lastExecution: 'pending'
    }
  ];

  const handleToggleWorkflow = (workflowId: number) => {
    logActivity('workflow_toggle', { workflow_id: workflowId });
  };

  const handleRunWorkflow = (workflowId: number) => {
    logActivity('workflow_manual_run', { workflow_id: workflowId });
  };

  const handleCreateFromTemplate = (templateId: number) => {
    logActivity('workflow_create_from_template', { template_id: templateId });
  };

  const handleScheduleTask = (taskId: number) => {
    logActivity('workflow_schedule_task', { task_id: taskId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
      case 'scheduled':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="AI Workflow Automation"
        description="Create, manage, and monitor automated workflows and processes"
        icon={Workflow}
        iconColor="text-blue-600"
        onRefresh={() => {
          logActivity('workflow_automation_refresh', { timestamp: new Date() });
        }}
      />

      {/* Workflow Automation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Workflows"
          value="24"
          icon={Workflow}
          description="Currently running"
          badge={{ text: "Automated", variant: "default" }}
        />
        <StatCard
          title="Tasks Completed"
          value="1,847"
          icon={CheckCircle}
          trend={{ value: 23.4, isPositive: true, period: "today" }}
          description="Successful executions"
        />
        <StatCard
          title="Success Rate"
          value="94.7%"
          icon={Zap}
          trend={{ value: 1.2, isPositive: true, period: "this week" }}
          description="Workflow reliability"
        />
        <StatCard
          title="Time Saved"
          value="892h"
          icon={Clock}
          trend={{ value: 45, isPositive: true, period: "monthly" }}
          description="Automation efficiency"
        />
      </div>

      {/* Workflow Automation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
          <TabsTrigger value="schedule">Scheduled Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Active Automation Workflows
              </CardTitle>
              <CardDescription>
                Monitor and control your automated business processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automatedWorkflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(workflow.status)}
                        <div>
                          <h4 className="font-semibold">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {workflow.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{workflow.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {workflow.steps} steps
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            workflow.status === 'active' ? 'default' :
                            workflow.status === 'paused' ? 'secondary' : 'outline'
                          }
                        >
                          {workflow.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRunWorkflow(workflow.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleWorkflow(workflow.id)}
                        >
                          {workflow.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Completed Today:</span>
                        <p className="font-medium">{workflow.completedToday}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <p className="font-medium text-green-600">{workflow.successRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Time:</span>
                        <p className="font-medium">{workflow.avgProcessingTime}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Run:</span>
                        <p className="font-medium">{workflow.lastRun}</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Success Rate</span>
                        <span>{workflow.successRate}%</span>
                      </div>
                      <Progress value={workflow.successRate} className="h-2" />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Trigger: {workflow.trigger}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Workflow Templates
              </CardTitle>
              <CardDescription>
                Pre-built workflow templates to get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflowTemplates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge className={getComplexityColor(template.complexity)}>
                            {template.complexity}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <p className="text-sm text-muted-foreground">
                        ⏱️ Setup time: {template.estimatedSetup}
                      </p>
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Features:</p>
                        <ul className="list-disc list-inside text-xs space-y-1">
                          {template.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => handleCreateFromTemplate(template.id)}
                      className="w-full"
                    >
                      Create Workflow
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Workflow Execution History
              </CardTitle>
              <CardDescription>
                Recent workflow executions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executionHistory.map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        execution.status === 'success' ? 'bg-green-100' :
                        execution.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {getStatusIcon(execution.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{execution.workflowName}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Executed: {execution.executedAt}</span>
                          <span>Duration: {execution.duration}</span>
                          <span>Items: {execution.itemsProcessed}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Trigger: {execution.trigger}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          execution.status === 'success' ? 'default' :
                          execution.status === 'warning' ? 'secondary' : 'destructive'
                        }
                      >
                        {execution.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {execution.result}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduled Workflow Tasks
              </CardTitle>
              <CardDescription>
                Manage scheduled and recurring workflow executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        task.status === 'active' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <Clock className={`h-6 w-6 ${
                          task.status === 'active' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{task.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Schedule: {task.schedule}</span>
                          <span>Workflow: {task.workflow}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Next run: {task.nextRun}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={task.status === 'active' ? 'default' : 'secondary'}
                      >
                        {task.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleScheduleTask(task.id)}
                      >
                        <Settings className="h-4 w-4" />
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