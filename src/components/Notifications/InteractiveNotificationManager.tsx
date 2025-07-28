import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Send,
  Bell,
  Clock,
  Target,
  Filter,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  frequency: string;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
}

interface NotificationTemplate {
  id: string;
  template_name: string;
  channel: string;
  subject: string | null;
  content: string;
  variables: any;
  is_active: boolean;
}

export const InteractiveNotificationManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preferences');

  // Test notification state
  const [testNotification, setTestNotification] = useState({
    type: 'system_alert',
    title: '',
    message: '',
    priority: 'medium',
    channels: ['in_app']
  });

  // Template editor state
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load preferences
        const { data: prefData } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id);

        // Load templates
        const { data: templateData } = await supabase
          .from('notification_templates')
          .select('*');

        setTemplates((templateData as any[])?.map(template => ({
          id: template.id,
          template_name: template.template_name,
          channel: template.channel,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          is_active: template.is_active
        })) || []);
      } catch (error) {
        console.error('Error loading notification data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const updatePreference = async (
    notificationType: string, 
    field: string, 
    value: any
  ) => {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user?.id,
          notification_type: notificationType,
          [field]: value
        });

      if (error) throw error;

      // Update local state
      setPreferences(prev => {
        const existing = prev.find(p => p.notification_type === notificationType);
        if (existing) {
          return prev.map(p => 
            p.notification_type === notificationType 
              ? { ...p, [field]: value }
              : p
          );
        } else {
          return [...prev, {
            id: crypto.randomUUID(),
            user_id: user?.id || '',
            notification_type: notificationType,
            email_enabled: true,
            sms_enabled: false,
            push_enabled: true,
            in_app_enabled: true,
            frequency: 'immediate',
            quiet_hours_start: null,
            quiet_hours_end: null,
            timezone: 'UTC',
            [field]: value
          }];
        }
      });

      toast({
        title: "Success",
        description: "Notification preference updated"
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive"
      });
    }
  };

  const sendTestNotification = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('process-notification', {
        body: {
          action: 'create_test',
          user_id: user?.id,
          notification_type: testNotification.type,
          title: testNotification.title,
          message: testNotification.message,
          priority: testNotification.priority,
          channels: testNotification.channels
        }
      });

      if (error) throw error;

      toast({
        title: "Test Sent",
        description: "Test notification has been sent successfully"
      });

      // Reset form
      setTestNotification({
        type: 'system_alert',
        title: '',
        message: '',
        priority: 'medium',
        channels: ['in_app']
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive"
      });
    }
  };

  const saveTemplate = async (template: Partial<NotificationTemplate>) => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .upsert({
          ...template
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template saved successfully"
      });

      setShowTemplateDialog(false);
      setEditingTemplate(null);

      // Reload templates
      const { data: templateData } = await supabase
        .from('notification_templates')
        .select('*');
      setTemplates((templateData as any[])?.map(template => ({
        id: template.id,
        template_name: template.template_name,
        channel: template.channel,
        subject: template.subject,
        content: template.content,
        variables: template.variables,
        is_active: template.is_active
      })) || []);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const notificationTypes = [
    'order_status_change',
    'shipment_status_change',
    'payment_confirmation',
    'system_alert',
    'message_received',
    'account_update'
  ];

  const getPreference = (type: string) => {
    return preferences.find(p => p.notification_type === type) || {
      notification_type: type,
      email_enabled: true,
      sms_enabled: false,
      push_enabled: true,
      in_app_enabled: true,
      frequency: 'immediate'
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Interactive Notification Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {notificationTypes.map((type) => {
                    const pref = getPreference(type);
                    return (
                      <Card key={type}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium capitalize">
                              {type.replace(/_/g, ' ')}
                            </h4>
                            <Badge variant="outline">
                              {pref.frequency}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={pref.email_enabled}
                                onCheckedChange={(checked) => 
                                  updatePreference(type, 'email_enabled', checked)
                                }
                              />
                              <Label>Email</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={pref.sms_enabled}
                                onCheckedChange={(checked) => 
                                  updatePreference(type, 'sms_enabled', checked)
                                }
                              />
                              <Label>SMS</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={pref.push_enabled}
                                onCheckedChange={(checked) => 
                                  updatePreference(type, 'push_enabled', checked)
                                }
                              />
                              <Label>Push</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={pref.in_app_enabled}
                                onCheckedChange={(checked) => 
                                  updatePreference(type, 'in_app_enabled', checked)
                                }
                              />
                              <Label>In-App</Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Global Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Quiet Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        defaultValue="22:00"
                        onChange={(e) => 
                          updatePreference('global', 'quiet_hours_start', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        defaultValue="08:00"
                        onChange={(e) => 
                          updatePreference('global', 'quiet_hours_end', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Notification Templates</h3>
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingTemplate(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTemplate ? 'Edit Template' : 'Create Template'}
                    </DialogTitle>
                  </DialogHeader>
                  <TemplateEditor
                    template={editingTemplate}
                    onSave={saveTemplate}
                    onCancel={() => {
                      setShowTemplateDialog(false);
                      setEditingTemplate(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.template_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.channel}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.is_active ? 'default' : 'secondary'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTemplate(template);
                            setShowTemplateDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Test Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Notification Type</Label>
                    <Select
                      value={testNotification.type}
                      onValueChange={(value) => 
                        setTestNotification(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={testNotification.priority}
                      onValueChange={(value) => 
                        setTestNotification(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={testNotification.title}
                    onChange={(e) => 
                      setTestNotification(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Test notification title"
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={testNotification.message}
                    onChange={(e) => 
                      setTestNotification(prev => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Test notification message"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={sendTestNotification}
                  disabled={!testNotification.title || !testNotification.message}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Notification
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Template Editor Component
const TemplateEditor: React.FC<{
  template: NotificationTemplate | null;
  onSave: (template: Partial<NotificationTemplate>) => void;
  onCancel: () => void;
}> = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    template_name: template?.template_name || '',
    channel: template?.channel || 'email',
    subject: template?.subject || '',
    content: template?.content || '',
    is_active: template?.is_active ?? true
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Template Name</Label>
          <Input
            value={formData.template_name}
            onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
            placeholder="Template name"
          />
        </div>
        <div>
          <Label>Channel</Label>
          <Select
            value={formData.channel}
            onValueChange={(value) => setFormData(prev => ({ ...prev, channel: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="in_app">In-App</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.channel === 'email' && (
        <div>
          <Label>Subject Template</Label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Email subject template"
          />
        </div>
      )}

      <div>
        <Label>Content Template</Label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Message content template"
          rows={5}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label>Template Active</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>
          Save Template
        </Button>
      </div>
    </div>
  );
};