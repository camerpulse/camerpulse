import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Send, 
  Settings, 
  BarChart3,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationStats {
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  delivery_rate: number;
  avg_delivery_time_ms: number;
  top_notification_types: Array<{
    type: string;
    count: number;
  }>;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  language: string;
  is_active: boolean;
  variables: string[];
}

export const NotificationAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general',
    language: 'en'
  });

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch notification statistics
      const { data: statsData } = await supabase.functions.invoke('notification-admin-stats');
      if (statsData) setStats(statsData);

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .insert([{
          ...newTemplate,
          variables: extractVariables(newTemplate.content + newTemplate.subject)
        }]);

      if (error) throw error;

      toast.success('Template created successfully');
      setNewTemplate({ name: '', subject: '', content: '', category: 'general', language: 'en' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const updateTemplate = async (template: Template) => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .update({
          ...template,
          variables: extractVariables(template.content + template.subject)
        })
        .eq('id', template.id);

      if (error) throw error;

      toast.success('Template updated successfully');
      setSelectedTemplate(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Template deleted successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const sendTestNotification = async () => {
    try {
      await supabase.functions.invoke('unified-notification-service', {
        body: {
          type: 'admin_test',
          title: 'Test Notification',
          body: 'This is a test notification from the admin dashboard',
          source_module: 'admin_dashboard',
          category: 'system',
          priority: 1,
          delivery_channels: ['in_app'],
          target_criteria: { user_roles: ['admin'] }
        }
      });

      toast.success('Test notification sent to all admins');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{\s*(\w+)\s*\}\}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '').trim()) : [];
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Administration</h1>
          <p className="text-muted-foreground">Manage notification system and templates</p>
        </div>
        <Button onClick={sendTestNotification} className="gap-2">
          <Send className="h-4 w-4" />
          Send Test Notification
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_sent?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.delivery_rate ? `${stats.delivery_rate.toFixed(1)}%` : '0%'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avg_delivery_time_ms ? `${Math.round(stats.avg_delivery_time_ms)}ms` : '0ms'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Deliveries</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats?.total_failed?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template List */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Templates</CardTitle>
                <CardDescription>Manage reusable notification templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{template.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">{template.category}</Badge>
                      <Badge variant="outline">{template.language}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Create/Edit Template */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={selectedTemplate?.name || newTemplate.name}
                    onChange={(e) => {
                      if (selectedTemplate) {
                        setSelectedTemplate({...selectedTemplate, name: e.target.value});
                      } else {
                        setNewTemplate({...newTemplate, name: e.target.value});
                      }
                    }}
                    placeholder="Welcome Email Template"
                  />
                </div>

                <div>
                  <Label htmlFor="template-subject">Subject</Label>
                  <Input
                    id="template-subject"
                    value={selectedTemplate?.subject || newTemplate.subject}
                    onChange={(e) => {
                      if (selectedTemplate) {
                        setSelectedTemplate({...selectedTemplate, subject: e.target.value});
                      } else {
                        setNewTemplate({...newTemplate, subject: e.target.value});
                      }
                    }}
                    placeholder="Welcome to {{ platform_name }}!"
                  />
                </div>

                <div>
                  <Label htmlFor="template-content">Content</Label>
                  <Textarea
                    id="template-content"
                    value={selectedTemplate?.content || newTemplate.content}
                    onChange={(e) => {
                      if (selectedTemplate) {
                        setSelectedTemplate({...selectedTemplate, content: e.target.value});
                      } else {
                        setNewTemplate({...newTemplate, content: e.target.value});
                      }
                    }}
                    placeholder="Hello {{ user_name }}, welcome to our platform!"
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Select
                      value={selectedTemplate?.category || newTemplate.category}
                      onValueChange={(value) => {
                        if (selectedTemplate) {
                          setSelectedTemplate({...selectedTemplate, category: value});
                        } else {
                          setNewTemplate({...newTemplate, category: value});
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="template-language">Language</Label>
                    <Select
                      value={selectedTemplate?.language || newTemplate.language}
                      onValueChange={(value) => {
                        if (selectedTemplate) {
                          setSelectedTemplate({...selectedTemplate, language: value});
                        } else {
                          setNewTemplate({...newTemplate, language: value});
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedTemplate ? (
                    <>
                      <Button onClick={() => updateTemplate(selectedTemplate)}>
                        Update Template
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={createTemplate}>
                      Create Template
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Notification Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Advanced analytics dashboard coming soon. Basic metrics are shown in the overview cards above.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Global notification settings and rate limiting configuration coming soon.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};