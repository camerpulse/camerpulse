import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdvancedNotifications } from '@/hooks/useAdvancedNotifications';
import { Calendar, Clock, Send, Variable } from 'lucide-react';

export const NotificationTemplateManager: React.FC = () => {
  const { templates, createFromTemplate, loading } = useAdvancedNotifications();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template && template.variables) {
      // Initialize variables from template
      const initialVars: Record<string, string> = {};
      Object.keys(template.variables || {}).forEach((key) => {
        initialVars[key] = '';
      });
      setVariables(initialVars);
    }
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleSendNotification = async (scheduled: boolean = false) => {
    if (!selectedTemplate) return;

    let scheduledFor: Date | undefined;
    if (scheduled && scheduledDate && scheduledTime) {
      scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
    }

    const success = await createFromTemplate(selectedTemplate, variables, scheduledFor);
    if (success) {
      setVariables({});
      setScheduledDate('');
      setScheduledTime('');
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Variable className="h-5 w-5" />
            Notification Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="grid gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.template_name}</h4>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{template.channel}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {template.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedTemplateData && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Variables */}
            {selectedTemplateData.variables && Object.keys(selectedTemplateData.variables).length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Template Variables</Label>
                {Object.keys(selectedTemplateData.variables).map((varName) => (
                  <div key={varName}>
                    <Label htmlFor={varName}>
                      {varName} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={varName}
                      placeholder={`Enter ${varName}`}
                      value={variables[varName] || ''}
                      onChange={(e) => handleVariableChange(varName, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Preview */}
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="mt-2 space-y-1">
                <p className="font-medium">
                  {selectedTemplateData.subject.replace(
                    /{{(\w+)}}/g,
                    (match, key) => variables[key] || match
                  )}
                </p>
                <p className="text-sm">
                  {selectedTemplateData.content.replace(
                    /{{(\w+)}}/g,
                    (match, key) => variables[key] || match
                  )}
                </p>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule (Optional)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="scheduled-date">Date</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduled-time">Time</Label>
                  <Input
                    id="scheduled-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleSendNotification(false)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Now
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSendNotification(true)}
                disabled={loading || !scheduledDate || !scheduledTime}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};