import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useWorkflowAutomation } from '@/hooks/useWorkflowAutomation';
import { Plus, Settings, Play, Trash2, AlertTriangle, Clock, Users, Target } from 'lucide-react';

export const WorkflowBuilder: React.FC = () => {
  const { createWorkflow, loading } = useWorkflowAutomation();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'event' as 'event' | 'schedule' | 'manual' | 'condition',
    trigger_config: {},
    conditions: [],
    actions: [],
    escalation_rules: [],
    is_active: true,
    priority: 1
  });

  const [newCondition, setNewCondition] = useState({
    field_name: '',
    operator: 'equals',
    value: '',
    logical_operator: 'AND'
  });

  const [newAction, setNewAction] = useState({
    type: 'send_notification',
    channels: ['email'],
    template: '',
    delay_seconds: 0
  });

  const [newEscalationRule, setNewEscalationRule] = useState({
    level: 1,
    escalated_to: '',
    timeout_hours: 1,
    channels: ['email']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createWorkflow({
      ...formData,
      trigger_config: formData.trigger_type === 'event' ? {
        event_type: (formData.trigger_config as any).event_type || 'notification_sent'
      } : formData.trigger_config
    });

    if (success) {
      setIsCreating(false);
      setFormData({
        name: '',
        description: '',
        trigger_type: 'event',
        trigger_config: {},
        conditions: [],
        actions: [],
        escalation_rules: [],
        is_active: true,
        priority: 1
      });
    }
  };

  const addCondition = () => {
    if (newCondition.field_name && newCondition.value) {
      setFormData(prev => ({
        ...prev,
        conditions: [...prev.conditions, {
          ...newCondition,
          value: [newCondition.value],
          condition_order: prev.conditions.length + 1
        }]
      }));
      setNewCondition({
        field_name: '',
        operator: 'equals',
        value: '',
        logical_operator: 'AND'
      });
    }
  };

  const addAction = () => {
    if (newAction.type) {
      setFormData(prev => ({
        ...prev,
        actions: [...prev.actions, newAction]
      }));
      setNewAction({
        type: 'send_notification',
        channels: ['email'],
        template: '',
        delay_seconds: 0
      });
    }
  };

  const addEscalationRule = () => {
    if (newEscalationRule.escalated_to) {
      setFormData(prev => ({
        ...prev,
        escalation_rules: [...prev.escalation_rules, {
          ...newEscalationRule,
          escalated_to: [{ user_id: newEscalationRule.escalated_to, channels: newEscalationRule.channels }]
        }]
      }));
      setNewEscalationRule({
        level: formData.escalation_rules.length + 2,
        escalated_to: '',
        timeout_hours: 1,
        channels: ['email']
      });
    }
  };

  if (!isCreating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Workflow Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Workflow
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this workflow does"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trigger-type">Trigger Type</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, trigger_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event-based</SelectItem>
                    <SelectItem value="schedule">Scheduled</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="condition">Condition-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </div>

          {/* Trigger Configuration */}
          {formData.trigger_type === 'event' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Event Configuration</Label>
              <div>
                <Label htmlFor="event-type">Event Type</Label>
                <Select
                  value={(formData.trigger_config as any).event_type || ''}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    trigger_config: { ...prev.trigger_config, event_type: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notification_sent">Notification Sent</SelectItem>
                    <SelectItem value="notification_opened">Notification Opened</SelectItem>
                    <SelectItem value="notification_clicked">Notification Clicked</SelectItem>
                    <SelectItem value="user_login">User Login</SelectItem>
                    <SelectItem value="system_alert">System Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Conditions */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Conditions</Label>
            
            {formData.conditions.length > 0 && (
              <div className="space-y-2">
                {formData.conditions.map((condition: any, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm">
                      {condition.field_name} {condition.operator} {condition.value.join(', ')}
                    </span>
                    <Badge variant="outline">{condition.logical_operator}</Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <Input
                placeholder="Field name"
                value={newCondition.field_name}
                onChange={(e) => setNewCondition(prev => ({ ...prev, field_name: e.target.value }))}
              />
              <Select
                value={newCondition.operator}
                onValueChange={(value) => setNewCondition(prev => ({ ...prev, operator: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Value"
                value={newCondition.value}
                onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
              />
              <Button type="button" onClick={addCondition} size="sm">
                Add
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Actions</Label>
            
            {formData.actions.length > 0 && (
              <div className="space-y-2">
                {formData.actions.map((action: any, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm">
                      {action.type} via {action.channels.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Select
                value={newAction.type}
                onValueChange={(value) => setNewAction(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send_notification">Send Notification</SelectItem>
                  <SelectItem value="send_email">Send Email</SelectItem>
                  <SelectItem value="create_ticket">Create Ticket</SelectItem>
                  <SelectItem value="log_event">Log Event</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Template/Message"
                value={newAction.template}
                onChange={(e) => setNewAction(prev => ({ ...prev, template: e.target.value }))}
              />
              <Button type="button" onClick={addAction} size="sm">
                Add
              </Button>
            </div>
          </div>

          {/* Escalation Rules */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Escalation Rules</Label>
            
            {formData.escalation_rules.length > 0 && (
              <div className="space-y-2">
                {formData.escalation_rules.map((rule: any, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">
                      Level {rule.level}: Escalate to {rule.escalated_to[0]?.user_id} after {rule.timeout_hours}h
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <Input
                placeholder="User ID/Role"
                value={newEscalationRule.escalated_to}
                onChange={(e) => setNewEscalationRule(prev => ({ ...prev, escalated_to: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Timeout hours"
                value={newEscalationRule.timeout_hours}
                onChange={(e) => setNewEscalationRule(prev => ({ ...prev, timeout_hours: parseInt(e.target.value) }))}
              />
              <Select
                value={newEscalationRule.channels[0]}
                onValueChange={(value) => setNewEscalationRule(prev => ({ ...prev, channels: [value] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addEscalationRule} size="sm">
                Add
              </Button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading || !formData.name}>
              Create Workflow
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};