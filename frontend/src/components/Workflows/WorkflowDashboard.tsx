import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowAutomation } from '@/hooks/useWorkflowAutomation';
import { Play, Pause, Edit, Trash2, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export const WorkflowDashboard: React.FC = () => {
  const {
    workflows,
    executions,
    escalations,
    loading,
    executeWorkflow,
    updateWorkflow,
    deleteWorkflow,
    resolveEscalation,
    getWorkflowStats
  } = useWorkflowAutomation();

  const stats = getWorkflowStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'running':
        return <Clock className="h-4 w-4 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'escalated':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'running':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'escalated':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleToggleWorkflow = async (id: string, isActive: boolean) => {
    await updateWorkflow(id, { is_active: !isActive });
  };

  const handleExecuteWorkflow = async (id: string) => {
    await executeWorkflow(id, { manual_trigger: true, timestamp: new Date().toISOString() });
  };

  const handleResolveEscalation = async (executionId: string) => {
    await resolveEscalation(executionId, "Manually resolved from dashboard");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Total Workflows</div>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.totalWorkflows}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeWorkflows} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Total Executions</div>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.totalExecutions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.executionsByStatus.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div className="text-sm font-medium">Pending Escalations</div>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.pendingEscalations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Success Rate</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              {stats.totalExecutions > 0 
                ? Math.round(((stats.executionsByStatus.completed || 0) / stats.totalExecutions) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflows List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {workflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No workflows configured</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {workflow.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                            {workflow.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{workflow.trigger_type}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Priority: {workflow.priority}
                          </span>
                          {workflow.escalation_rules && Array.isArray(workflow.escalation_rules) && workflow.escalation_rules.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {workflow.escalation_rules.length} escalation levels
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExecuteWorkflow(workflow.id)}
                            disabled={!workflow.is_active}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleWorkflow(workflow.id, workflow.is_active)}
                          >
                            {workflow.is_active ? (
                              <Pause className="h-3 w-3" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteWorkflow(workflow.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {executions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No executions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {executions.map((execution: any) => (
                    <div
                      key={execution.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <span className="font-medium text-sm">
                            {execution.notification_workflows?.name || 'Unknown Workflow'}
                          </span>
                        </div>
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Started: {format(new Date(execution.started_at), 'MMM dd, HH:mm')}
                        </span>
                        {execution.escalation_level > 0 && (
                          <span className="text-warning">
                            Escalation Level: {execution.escalation_level}
                          </span>
                        )}
                      </div>

                      {execution.status === 'escalated' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveEscalation(execution.id)}
                          className="w-full mt-2"
                        >
                          Resolve Escalation
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Escalations */}
      {escalations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Active Escalations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {escalations
                .filter(escalation => !escalation.resolved_at)
                .map((escalation: any) => (
                  <div
                    key={escalation.id}
                    className="p-4 border border-warning/20 bg-warning/5 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Level {escalation.escalation_level}
                      </span>
                      <Badge variant="outline" className="text-warning">
                        Escalated
                      </Badge>
                    </div>
                    
                    <p className="text-sm">
                      {escalation.escalation_reason || 'Automatic escalation'}
                    </p>
                    
                    <div className="text-xs text-muted-foreground">
                      Escalated: {format(new Date(escalation.escalated_at), 'MMM dd, HH:mm')}
                      {escalation.response_deadline && (
                        <span className="block">
                          Deadline: {format(new Date(escalation.response_deadline), 'MMM dd, HH:mm')}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveEscalation(escalation.execution_id)}
                      className="w-full mt-2"
                    >
                      Resolve
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};