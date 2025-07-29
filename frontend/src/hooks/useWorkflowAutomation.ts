import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NotificationWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config: any;
  conditions: any;
  actions: any;
  escalation_rules: any;
  is_active: boolean;
  priority: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  trigger_data: any;
  status: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  execution_log: any;
  escalation_level: number;
  next_escalation_at?: string;
}

export interface WorkflowCondition {
  id: string;
  workflow_id: string;
  condition_type: string;
  field_name: string;
  operator: string;
  value: any;
  logical_operator: 'AND' | 'OR';
  condition_order: number;
  is_active: boolean;
}

export interface EscalationHistory {
  id: string;
  execution_id: string;
  escalation_level: number;
  escalated_at: string;
  escalated_to: any;
  escalation_reason?: string;
  response_deadline?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export const useWorkflowAutomation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<NotificationWorkflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [escalations, setEscalations] = useState<EscalationHistory[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch workflows
  const fetchWorkflows = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_workflows')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch workflow executions
  const fetchExecutions = async (workflowId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('workflow_executions')
        .select(`
          *,
          notification_workflows (
            name, description
          )
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Error fetching executions:', error);
    }
  };

  // Fetch escalation history
  const fetchEscalations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('escalation_history')
        .select(`
          *,
          workflow_executions (
            workflow_id,
            notification_workflows (
              name
            )
          )
        `)
        .order('escalated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEscalations(data || []);
    } catch (error) {
      console.error('Error fetching escalations:', error);
    }
  };

  // Create workflow
  const createWorkflow = async (workflow: Omit<NotificationWorkflow, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('notification_workflows')
        .insert({
          ...workflow,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow created successfully",
      });

      await fetchWorkflows();
      return true;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update workflow
  const updateWorkflow = async (id: string, updates: Partial<NotificationWorkflow>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notification_workflows')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow updated successfully",
      });

      await fetchWorkflows();
      return true;
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Execute workflow manually
  const executeWorkflow = async (workflowId: string, triggerData: any = {}) => {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-processor', {
        body: {
          action: 'execute_workflow',
          workflow_id: workflowId,
          trigger_data: triggerData
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow execution started",
      });

      await fetchExecutions();
      return data.execution_id;
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast({
        title: "Error",
        description: "Failed to execute workflow",
        variant: "destructive"
      });
      return null;
    }
  };

  // Trigger event-based workflows
  const triggerEventWorkflows = async (eventData: any) => {
    try {
      const { error } = await supabase.functions.invoke('workflow-processor', {
        body: {
          action: 'trigger_event_workflows',
          trigger_data: eventData
        }
      });

      if (error) throw error;
      await fetchExecutions();
      return true;
    } catch (error) {
      console.error('Error triggering event workflows:', error);
      return false;
    }
  };

  // Resolve escalation
  const resolveEscalation = async (executionId: string, resolutionNotes: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.functions.invoke('workflow-processor', {
        body: {
          action: 'resolve_escalation',
          execution_id: executionId,
          trigger_data: {
            resolved_by: user.id,
            notes: resolutionNotes
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Escalation resolved successfully",
      });

      await Promise.all([fetchExecutions(), fetchEscalations()]);
      return true;
    } catch (error) {
      console.error('Error resolving escalation:', error);
      toast({
        title: "Error",
        description: "Failed to resolve escalation",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete workflow
  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notification_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });

      await fetchWorkflows();
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get workflow statistics
  const getWorkflowStats = () => {
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.is_active).length;
    const totalExecutions = executions.length;
    const pendingEscalations = escalations.filter(e => !e.resolved_at).length;

    const executionsByStatus = executions.reduce((acc, exec) => {
      acc[exec.status] = (acc[exec.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      pendingEscalations,
      executionsByStatus
    };
  };

  useEffect(() => {
    if (user) {
      fetchWorkflows();
      fetchExecutions();
      fetchEscalations();
    }
  }, [user]);

  return {
    workflows,
    executions,
    escalations,
    loading,
    createWorkflow,
    updateWorkflow,
    executeWorkflow,
    triggerEventWorkflows,
    resolveEscalation,
    deleteWorkflow,
    fetchWorkflows,
    fetchExecutions,
    fetchEscalations,
    getWorkflowStats
  };
};