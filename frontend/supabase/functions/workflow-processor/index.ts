import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DatabaseWorkflow {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: any;
  conditions: any[];
  actions: any[];
  escalation_rules: any[];
  is_active: boolean;
  priority: number;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  trigger_data: any;
  status: string;
  escalation_level: number;
  next_escalation_at: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { action, workflow_id, trigger_data, execution_id } = await req.json();
    console.log(`Processing workflow action: ${action}`);

    switch (action) {
      case 'execute_workflow':
        return await executeWorkflow(supabaseClient, workflow_id, trigger_data);
      
      case 'process_escalations':
        return await processEscalations(supabaseClient);
      
      case 'trigger_event_workflows':
        return await triggerEventWorkflows(supabaseClient, trigger_data);
      
      case 'resolve_escalation':
        return await resolveEscalation(supabaseClient, execution_id, trigger_data);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in workflow processor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function executeWorkflow(supabaseClient: any, workflowId: string, triggerData: any) {
  console.log(`Executing workflow: ${workflowId}`);
  
  // Use the database function to execute workflow
  const { data: executionId, error } = await supabaseClient
    .rpc('execute_workflow', {
      p_workflow_id: workflowId,
      p_trigger_data: triggerData
    });

  if (error) {
    console.error('Error executing workflow:', error);
    throw error;
  }

  console.log(`Workflow executed, execution ID: ${executionId}`);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      execution_id: executionId,
      message: 'Workflow executed successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processEscalations(supabaseClient: any) {
  console.log('Processing escalations...');
  
  // Get executions ready for escalation
  const { data: executions, error: fetchError } = await supabaseClient
    .from('workflow_executions')
    .select(`
      *,
      notification_workflows (
        name,
        escalation_rules
      )
    `)
    .eq('status', 'completed')
    .not('next_escalation_at', 'is', null)
    .lt('next_escalation_at', new Date().toISOString());

  if (fetchError) {
    console.error('Error fetching escalations:', fetchError);
    throw fetchError;
  }

  console.log(`Found ${executions?.length || 0} executions ready for escalation`);

  let processedCount = 0;
  
  for (const execution of executions || []) {
    try {
      const workflow = execution.notification_workflows;
      const escalationRules = workflow.escalation_rules || [];
      
      if (execution.escalation_level < escalationRules.length) {
        const currentRule = escalationRules[execution.escalation_level];
        
        // Create escalation history
        const { error: historyError } = await supabaseClient
          .from('escalation_history')
          .insert({
            execution_id: execution.id,
            escalation_level: execution.escalation_level + 1,
            escalation_reason: 'Automatic escalation - timeout reached',
            escalated_to: currentRule.escalated_to || [],
            response_deadline: new Date(Date.now() + (currentRule.timeout_hours || 24) * 60 * 60 * 1000).toISOString()
          });

        if (historyError) {
          console.error('Error creating escalation history:', historyError);
          continue;
        }

        // Update execution
        const nextEscalationAt = execution.escalation_level + 1 < escalationRules.length
          ? new Date(Date.now() + (currentRule.timeout_hours || 24) * 60 * 60 * 1000).toISOString()
          : null;

        const { error: updateError } = await supabaseClient
          .from('workflow_executions')
          .update({
            status: 'escalated',
            escalation_level: execution.escalation_level + 1,
            next_escalation_at: nextEscalationAt
          })
          .eq('id', execution.id);

        if (updateError) {
          console.error('Error updating execution:', updateError);
          continue;
        }

        // Send escalation notifications
        await sendEscalationNotifications(supabaseClient, execution, currentRule);
        
        processedCount++;
        console.log(`Escalated execution ${execution.id} to level ${execution.escalation_level + 1}`);
      }
    } catch (error) {
      console.error(`Error processing escalation for execution ${execution.id}:`, error);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      processed: processedCount,
      message: `Processed ${processedCount} escalations` 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function triggerEventWorkflows(supabaseClient: any, eventData: any) {
  console.log('Triggering event-based workflows...');
  
  // Get active workflows with event triggers
  const { data: workflows, error } = await supabaseClient
    .from('notification_workflows')
    .select('*')
    .eq('is_active', true)
    .eq('trigger_type', 'event')
    .order('priority', { ascending: true });

  if (error) {
    console.error('Error fetching workflows:', error);
    throw error;
  }

  let triggeredCount = 0;
  
  for (const workflow of workflows || []) {
    try {
      const triggerConfig = workflow.trigger_config;
      
      // Check if event matches trigger configuration
      if (shouldTriggerWorkflow(eventData, triggerConfig)) {
        const { data: executionId } = await supabaseClient
          .rpc('execute_workflow', {
            p_workflow_id: workflow.id,
            p_trigger_data: eventData
          });
        
        console.log(`Triggered workflow ${workflow.name} (${workflow.id}), execution: ${executionId}`);
        triggeredCount++;
      }
    } catch (error) {
      console.error(`Error triggering workflow ${workflow.id}:`, error);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      triggered: triggeredCount,
      message: `Triggered ${triggeredCount} workflows` 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function resolveEscalation(supabaseClient: any, executionId: string, resolutionData: any) {
  console.log(`Resolving escalation for execution: ${executionId}`);
  
  // Update escalation history
  const { error: historyError } = await supabaseClient
    .from('escalation_history')
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: resolutionData.resolved_by,
      resolution_notes: resolutionData.notes
    })
    .eq('execution_id', executionId)
    .is('resolved_at', null);

  if (historyError) {
    console.error('Error updating escalation history:', historyError);
    throw historyError;
  }

  // Update execution status
  const { error: executionError } = await supabaseClient
    .from('workflow_executions')
    .update({
      status: 'resolved',
      next_escalation_at: null
    })
    .eq('id', executionId);

  if (executionError) {
    console.error('Error updating execution:', executionError);
    throw executionError;
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Escalation resolved successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendEscalationNotifications(supabaseClient: any, execution: any, escalationRule: any) {
  try {
    const escalatedTo = escalationRule.escalated_to || [];
    
    for (const target of escalatedTo) {
      // Create notification for escalated users
      const { error } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: target.user_id,
          type: 'escalation',
          title: `Escalation: ${execution.notification_workflows?.name || 'Workflow'}`,
          message: `A workflow execution has been escalated and requires attention. Level: ${execution.escalation_level + 1}`,
          data: {
            execution_id: execution.id,
            escalation_level: execution.escalation_level + 1,
            escalation_reason: escalationRule.reason || 'Timeout reached'
          }
        });

      if (error) {
        console.error('Error sending escalation notification:', error);
      }
    }
  } catch (error) {
    console.error('Error in sendEscalationNotifications:', error);
  }
}

function shouldTriggerWorkflow(eventData: any, triggerConfig: any): boolean {
  try {
    // Simple event matching logic
    if (triggerConfig.event_type && eventData.event_type !== triggerConfig.event_type) {
      return false;
    }
    
    if (triggerConfig.conditions) {
      for (const condition of triggerConfig.conditions) {
        const fieldValue = eventData[condition.field];
        const expectedValue = condition.value;
        
        switch (condition.operator) {
          case 'equals':
            if (fieldValue !== expectedValue) return false;
            break;
          case 'greater_than':
            if (Number(fieldValue) <= Number(expectedValue)) return false;
            break;
          case 'contains':
            if (!String(fieldValue).includes(String(expectedValue))) return false;
            break;
          default:
            break;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error evaluating trigger conditions:', error);
    return false;
  }
}