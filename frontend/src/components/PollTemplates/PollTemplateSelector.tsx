import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target, BarChart3, Smile, Radar, Timer, 
  ArrowLeftRight, Map, PlayCircle, Mic, 
  Search, Crown, Check
} from 'lucide-react';

interface PollTemplate {
  id: string;
  template_name: string;
  style_name: string;
  description: string;
  layout_type: string;
  color_theme: any;
  icon_set: string;
  is_premium: boolean;
  supported_poll_types: string[];
  features: any;
}

interface PollTemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: PollTemplate) => void;
  pollType?: string;
  selectedTemplateId?: string;
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

export const PollTemplateSelector: React.FC<PollTemplateSelectorProps> = ({
  open,
  onOpenChange,
  onSelectTemplate,
  pollType = 'standard',
  selectedTemplateId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch available templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['poll_templates_public'],
    queryFn: async (): Promise<PollTemplate[]> => {
      const { data, error } = await supabase
        .from('poll_templates')
        .select('*')
        .eq('is_active', true)
        .order('template_name');

      if (error) throw error;
      return data || [];
    }
  });

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.style_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      categoryFilter === 'all' ||
      template.icon_set === categoryFilter ||
      (categoryFilter === 'premium' && template.is_premium);

    const matchesPollType = 
      template.supported_poll_types.includes(pollType) ||
      template.supported_poll_types.includes('standard');

    return matchesSearch && matchesCategory && matchesPollType;
  });

  // Group templates by category
  const categorizedTemplates = filteredTemplates.reduce((acc, template) => {
    const category = template.icon_set;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, PollTemplate[]>);

  const TemplateCard: React.FC<{ template: PollTemplate }> = ({ template }) => {
    const IconComponent = templateIcons[template.icon_set as keyof typeof templateIcons] || Target;
    const isSelected = selectedTemplateId === template.id;
    const colorTheme = template.color_theme;

    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
          isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-lg'
        }`}
        onClick={() => onSelectTemplate(template)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: colorTheme.secondary }}
              >
                <IconComponent 
                  className="h-4 w-4"
                  style={{ color: colorTheme.primary }}
                />
              </div>
              <div>
                <CardTitle className="text-sm">{template.style_name}</CardTitle>
                <CardDescription className="text-xs">
                  {template.layout_type} layout
                </CardDescription>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              {template.is_premium && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
              {isSelected && (
                <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Mini Preview */}
          <div 
            className="h-20 rounded border p-2 text-xs flex flex-col justify-center"
            style={{
              backgroundColor: colorTheme.background,
              borderColor: colorTheme.primary,
              color: colorTheme.text
            }}
          >
            <div className="font-medium mb-1">Sample Poll</div>
            
            {template.layout_type === 'emoji' && (
              <div className="flex gap-1 text-lg">
                <span>👍🏽</span><span>👎🏽</span><span>🤷🏽‍♂️</span>
              </div>
            )}
            
            {template.layout_type === 'chart' && (
              <div className="space-y-1">
                <div 
                  className="h-1 rounded"
                  style={{ backgroundColor: colorTheme.primary, width: '70%' }}
                />
                <div 
                  className="h-1 rounded"
                  style={{ backgroundColor: colorTheme.secondary, width: '45%' }}
                />
              </div>
            )}
            
            {template.layout_type === 'timer' && (
              <div className="text-center">
                <div 
                  className="text-sm font-bold"
                  style={{ color: colorTheme.primary }}
                >
                  02:45
                </div>
              </div>
            )}
            
            {!['emoji', 'chart', 'timer'].includes(template.layout_type) && (
              <div className="space-y-1">
                <div 
                  className="h-1 rounded"
                  style={{ backgroundColor: colorTheme.secondary, width: '100%' }}
                />
                <div 
                  className="h-1 rounded"
                  style={{ backgroundColor: colorTheme.secondary, width: '80%' }}
                />
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {Object.keys(template.features).slice(0, 2).map(feature => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </Badge>
            ))}
          </div>

          {/* Supported poll types */}
          <div className="text-xs text-muted-foreground">
            Supports: {template.supported_poll_types.slice(0, 2).join(', ')}
            {template.supported_poll_types.length > 2 && '...'}
          </div>
        </CardContent>
      </Card>
    );
  };

  const categories = [
    { id: 'all', name: 'All Templates', icon: Target },
    { id: 'government', name: 'Government', icon: Target },
    { id: 'voting', name: 'Voting', icon: BarChart3 },
    { id: 'emoji', name: 'Reactions', icon: Smile },
    { id: 'timer', name: 'Urgent', icon: Timer },
    { id: 'media', name: 'Visual', icon: PlayCircle },
    { id: 'premium', name: 'Premium', icon: Crown }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Choose a Poll Template</DialogTitle>
          <DialogDescription>
            Select a template that best fits your poll style and audience.
            All templates are mobile-optimized and responsive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          {/* Search and Filter */}
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
          </div>

          <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-1 text-xs"
                >
                  <category.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={categoryFilter} className="mt-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="h-40" />
                    </Card>
                  ))}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-medium text-lg mb-1">No templates found</h3>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or category filter.
                  </p>
                </div>
              ) : categoryFilter === 'all' ? (
                // Show all templates grouped by category
                <div className="space-y-6">
                  {Object.entries(categorizedTemplates).map(([category, categoryTemplates]) => (
                    <div key={category}>
                      <h3 className="font-semibold mb-3 capitalize">
                        {category} Templates ({categoryTemplates.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryTemplates.map(template => (
                          <TemplateCard key={template.id} template={template} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Show filtered templates
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Selected template info */}
          {selectedTemplateId && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Selected Template</h4>
                  <p className="text-sm text-muted-foreground">
                    {templates.find(t => t.id === selectedTemplateId)?.style_name}
                  </p>
                </div>
                <Button onClick={() => onOpenChange(false)}>
                  Use This Template
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};