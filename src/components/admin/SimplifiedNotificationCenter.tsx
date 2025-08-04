import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, Edit2, Trash2 } from 'lucide-react';

interface NotificationTemplate {
  id: string;
  template_name: string;
  template_type: string;
  subject?: string;
  content: string;
  variables: string[];
  is_system_template: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SimplifiedPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_frequency: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export const SimplifiedNotificationCenter = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [preferences, setPreferences] = useState<SimplifiedPreferences[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    template_type: 'email',
    subject: '',
    content: '',
    variables: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [templatesResponse, preferencesResponse] = await Promise.all([
        supabase.from('notification_templates').select('*').order('template_name'),
        supabase.from('simplified_notification_preferences').select('*').limit(10)
      ]);

      if (templatesResponse.error) throw templatesResponse.error;
      if (preferencesResponse.error) throw preferencesResponse.error;

      setTemplates(templatesResponse.data || []);
      setPreferences(preferencesResponse.data || []);
    } catch (error) {
      console.error('Error fetching notification data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notification data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('notification_templates')
          .update({
            subject: editingTemplate.subject,
            content: editingTemplate.content,
            is_active: editingTemplate.is_active
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        setEditingTemplate(null);
      } else {
        const { error } = await supabase
          .from('notification_templates')
          .insert([{
            ...newTemplate,
            variables: JSON.stringify(newTemplate.variables)
          }]);

        if (error) throw error;
        setNewTemplate({
          template_name: '',
          template_type: 'email',
          subject: '',
          content: '',
          variables: []
        });
      }

      toast({
        title: "Success",
        description: "Template saved successfully"
      });
      
      fetchData();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const toggleTemplate = async (templateId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .update({ is_active: !isActive })
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(templates.map(t => 
        t.id === templateId ? { ...t, is_active: !isActive } : t
      ));

      toast({
        title: "Success",
        description: `Template ${!isActive ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      console.error('Error toggling template:', error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading notification center...</div>
      </div>
    );
  }

  const activeTemplates = templates.filter(t => t.is_active).length;
  const systemTemplates = templates.filter(t => t.is_system_template).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Simplified Notification Center</h1>
        <p className="text-muted-foreground">
          Manage notification templates and user preferences with the simplified system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
            <div className="text-sm text-muted-foreground">Total Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeTemplates}</div>
            <div className="text-sm text-muted-foreground">Active Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{systemTemplates}</div>
            <div className="text-sm text-muted-foreground">System Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{preferences.length}</div>
            <div className="text-sm text-muted-foreground">User Preferences</div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Management */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create New Template */}
          <div className="border rounded-lg p-4 bg-muted/10">
            <h3 className="font-medium mb-3">Create New Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template_name">Template Name</Label>
                <Input
                  id="template_name"
                  value={newTemplate.template_name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, template_name: e.target.value })}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="template_type">Type</Label>
                <select
                  id="template_type"
                  className="w-full p-2 border rounded-md"
                  value={newTemplate.template_type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, template_type: e.target.value })}
                >
                  <option value="email">Email</option>
                  <option value="push">Push</option>
                  <option value="in_app">In-App</option>
                </select>
              </div>
              {newTemplate.template_type === 'email' && (
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    placeholder="Email subject"
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Template content (use {{variable_name}} for variables)"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Button onClick={saveTemplate} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Templates */}
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{template.template_name}</h4>
                    <Badge variant={template.template_type === 'email' ? 'default' : 'secondary'}>
                      {template.template_type}
                    </Badge>
                    {template.is_system_template && (
                      <Badge variant="outline">System</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={() => toggleTemplate(template.id, template.is_active)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {template.subject && (
                  <div className="text-sm text-muted-foreground mb-1">
                    Subject: {template.subject}
                  </div>
                )}
                <div className="text-sm bg-muted p-2 rounded">
                  {template.content}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <Card className="fixed inset-4 z-50 max-w-2xl mx-auto bg-background shadow-lg">
          <CardHeader>
            <CardTitle>Edit Template: {editingTemplate.template_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingTemplate.template_type === 'email' && (
              <div>
                <Label htmlFor="edit_subject">Subject</Label>
                <Input
                  id="edit_subject"
                  value={editingTemplate.subject || ''}
                  onChange={(e) => setEditingTemplate({ 
                    ...editingTemplate, 
                    subject: e.target.value 
                  })}
                />
              </div>
            )}
            <div>
              <Label htmlFor="edit_content">Content</Label>
              <Textarea
                id="edit_content"
                value={editingTemplate.content}
                onChange={(e) => setEditingTemplate({ 
                  ...editingTemplate, 
                  content: e.target.value 
                })}
                rows={6}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingTemplate.is_active}
                onCheckedChange={(checked) => setEditingTemplate({ 
                  ...editingTemplate, 
                  is_active: checked 
                })}
              />
              <Label>Active</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
