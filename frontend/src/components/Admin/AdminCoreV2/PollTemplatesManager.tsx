import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Palette, Target, BarChart3, Smile, Radar, Timer, 
  ArrowLeftRight, Map, PlayCircle, Mic, Settings, 
  Eye, Edit, Trash2, Plus, Search, Filter 
} from 'lucide-react';

interface PollTemplate {
  id: string;
  template_name: string;
  style_name: string;
  description: string;
  layout_type: string;
  style_class: string;
  color_theme: any;
  icon_set: string;
  is_active: boolean;
  is_premium: boolean;
  supported_poll_types: string[];
  preview_image_url?: string;
  features: any;
  created_at: string;
  updated_at: string;
}

interface PollTemplatesManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
}

const templateIcons = {
  government: Target,
  voting: BarChart3,
  analytics: BarChart3,
  emoji: Smile,
  civic: Radar,
  timer: Timer,
  comparison: ArrowLeftRight,
  regional: Map,
  media: PlayCircle,
  accessibility: Mic
};

export const PollTemplatesManager: React.FC<PollTemplatesManagerProps> = ({
  hasPermission,
  logActivity
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'premium'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PollTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<PollTemplate | null>(null);

  // Fetch poll templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['poll_templates'],
    queryFn: async (): Promise<PollTemplate[]> => {
      const { data, error } = await supabase
        .from('poll_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch template usage statistics
  const { data: usageStats = {} } = useQuery({
    queryKey: ['template_usage_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poll_template_usage')
        .select('template_id, poll_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count usage per template
      const stats: Record<string, number> = {};
      data?.forEach(usage => {
        stats[usage.template_id] = (stats[usage.template_id] || 0) + 1;
      });

      return stats;
    }
  });

  // Toggle template status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('poll_templates')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['poll_templates'] });
      toast({
        title: "Template Updated",
        description: `Template ${variables.is_active ? 'activated' : 'deactivated'} successfully.`,
      });
      logActivity('toggle_template_status', { templateId: variables.id, status: variables.is_active });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update template status.",
        variant: "destructive",
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('poll_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, templateId) => {
      queryClient.invalidateQueries({ queryKey: ['poll_templates'] });
      toast({
        title: "Template Deleted",
        description: "Template deleted successfully.",
      });
      logActivity('delete_template', { templateId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    }
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.style_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'active' && template.is_active) ||
      (filterType === 'premium' && template.is_premium);

    return matchesSearch && matchesFilter;
  });

  const TemplatePreview: React.FC<{ template: PollTemplate }> = ({ template }) => {
    const IconComponent = templateIcons[template.icon_set as keyof typeof templateIcons] || Target;
    const colorTheme = template.color_theme;

    return (
      <div 
        className="p-6 rounded-lg border-2 transition-all duration-300"
        style={{
          backgroundColor: colorTheme.background,
          borderColor: colorTheme.primary,
          color: colorTheme.text
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: colorTheme.secondary }}
          >
            <IconComponent className="h-5 w-5" style={{ color: colorTheme.primary }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: colorTheme.text }}>
              {template.style_name}
            </h3>
            <p className="text-sm opacity-80">
              {template.layout_type.charAt(0).toUpperCase() + template.layout_type.slice(1)} Layout
            </p>
          </div>
        </div>

        <p className="text-sm mb-4 opacity-90">{template.description}</p>

        <div className="space-y-2">
          {template.layout_type === 'card' && (
            <div className="space-y-2">
              <div 
                className="h-2 rounded-full"
                style={{ backgroundColor: colorTheme.secondary }}
              >
                <div 
                  className="h-2 rounded-full w-3/4"
                  style={{ backgroundColor: colorTheme.primary }}
                />
              </div>
              <div 
                className="h-2 rounded-full"
                style={{ backgroundColor: colorTheme.secondary }}
              >
                <div 
                  className="h-2 rounded-full w-1/2"
                  style={{ backgroundColor: colorTheme.accent }}
                />
              </div>
            </div>
          )}

          {template.layout_type === 'emoji' && (
            <div className="flex gap-2 text-2xl">
              <span>👍🏽</span>
              <span>👎🏽</span>
              <span>🤷🏽‍♂️</span>
              <span>😡</span>
            </div>
          )}

          {template.layout_type === 'chart' && (
            <div className="space-y-1">
              {[60, 40, 75, 30].map((width, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-16 text-xs">Option {i + 1}</div>
                  <div 
                    className="h-4 rounded"
                    style={{ 
                      backgroundColor: colorTheme.primary,
                      width: `${width}%`
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {template.layout_type === 'timer' && (
            <div className="text-center">
              <div 
                className="text-2xl font-bold mb-2"
                style={{ color: colorTheme.primary }}
              >
                02:45
              </div>
              <div className="text-xs opacity-80">Time Remaining</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {template.supported_poll_types.slice(0, 3).map(type => (
            <Badge 
              key={type} 
              variant="outline" 
              className="text-xs"
              style={{ 
                borderColor: colorTheme.primary,
                color: colorTheme.primary
              }}
            >
              {type.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Poll Templates Manager</h2>
          <p className="text-muted-foreground">
            Manage and customize the 10 interactive poll templates for CamerPulse
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            {templates.length} Templates
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {templates.filter(t => t.is_active).length} Active
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">All Templates</option>
            <option value="active">Active Only</option>
            <option value="premium">Premium Only</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const IconComponent = templateIcons[template.icon_set as keyof typeof templateIcons] || Target;
              const usageCount = usageStats[template.id] || 0;

              return (
                <Card key={template.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.style_name}</CardTitle>
                          <CardDescription className="text-xs">
                            {template.layout_type} • {usageCount} uses
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {template.is_premium && (
                          <Badge variant="secondary" className="text-xs">Premium</Badge>
                        )}
                        <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                          {template.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>

                    {/* Mini Preview */}
                    <div className="scale-75 origin-left">
                      <TemplatePreview template={template} />
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(template.features).slice(0, 3).map(feature => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={(checked) => 
                            toggleStatusMutation.mutate({ id: template.id, is_active: checked })
                          }
                          disabled={toggleStatusMutation.isPending}
                        />
                        <span className="text-sm text-muted-foreground">Active</span>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this template?')) {
                              deleteTemplateMutation.mutate(template.id);
                            }
                          }}
                          disabled={deleteTemplateMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-4">
            {filteredTemplates.map((template) => {
              const IconComponent = templateIcons[template.icon_set as keyof typeof templateIcons] || Target;
              const usageCount = usageStats[template.id] || 0;

              return (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{template.style_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {template.layout_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {usageCount} uses
                            </Badge>
                            {template.supported_poll_types.slice(0, 2).map(type => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={template.is_active}
                            onCheckedChange={(checked) => 
                              toggleStatusMutation.mutate({ id: template.id, is_active: checked })
                            }
                            disabled={toggleStatusMutation.isPending}
                          />
                          <span className="text-sm text-muted-foreground">Active</span>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewTemplate(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(usageStats)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([templateId, count]) => {
                      const template = templates.find(t => t.id === templateId);
                      if (!template) return null;
                      
                      return (
                        <div key={templateId} className="flex justify-between items-center">
                          <span className="text-sm">{template.style_name}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active Templates</span>
                    <Badge>{templates.filter(t => t.is_active).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Disabled Templates</span>
                    <Badge variant="secondary">{templates.filter(t => !t.is_active).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium Templates</span>
                    <Badge variant="outline">{templates.filter(t => t.is_premium).length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    templates.reduce((acc, t) => {
                      acc[t.layout_type] = (acc[t.layout_type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([layout, count]) => (
                    <div key={layout} className="flex justify-between">
                      <span className="capitalize">{layout}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewTemplate?.style_name}</DialogTitle>
            <DialogDescription>
              Full preview of how this template appears to poll creators and voters
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-6">
              <TemplatePreview template={previewTemplate} />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Layout Type:</strong> {previewTemplate.layout_type}
                </div>
                <div>
                  <strong>Icon Set:</strong> {previewTemplate.icon_set}
                </div>
                <div>
                  <strong>Supported Types:</strong> {previewTemplate.supported_poll_types.join(', ')}
                </div>
                <div>
                  <strong>Status:</strong> {previewTemplate.is_active ? 'Active' : 'Disabled'}
                </div>
              </div>

              <div>
                <strong>Features:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.keys(previewTemplate.features).map(feature => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};