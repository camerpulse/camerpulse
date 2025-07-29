import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FileText, 
  Star, 
  Users, 
  TrendingUp, 
  Vote,
  Calendar,
  BarChart3,
  Heart,
  Building,
  MapPin,
  Plus,
  Copy,
  Eye,
  Edit,
  Trash2,
  Search
} from 'lucide-react';

interface PollTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  poll_config: {
    title: string;
    description: string;
    options: string[];
    settings: {
      allow_multiple_votes?: boolean;
      show_results_before_voting?: boolean;
      require_authentication?: boolean;
      poll_type?: string;
    };
  };
  usage_count: number;
  rating: number;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

const TEMPLATE_CATEGORIES = [
  { id: 'political', name: 'Political', icon: Vote },
  { id: 'social', name: 'Social Issues', icon: Users },
  { id: 'economic', name: 'Economic', icon: TrendingUp },
  { id: 'community', name: 'Community', icon: Heart },
  { id: 'business', name: 'Business', icon: Building },
  { id: 'regional', name: 'Regional', icon: MapPin },
  { id: 'custom', name: 'Custom', icon: FileText }
];

const PREDEFINED_TEMPLATES: Omit<PollTemplate, 'id' | 'created_by' | 'created_at' | 'usage_count' | 'rating'>[] = [
  {
    name: "Presidential Election Poll",
    description: "Standard template for presidential candidate preference polling",
    category: "political",
    tags: ["election", "president", "candidates"],
    poll_config: {
      title: "Presidential Election - Who has your vote?",
      description: "Cast your vote for your preferred presidential candidate",
      options: [
        "Candidate A - Party X",
        "Candidate B - Party Y", 
        "Candidate C - Independent",
        "Undecided"
      ],
      settings: {
        require_authentication: true,
        show_results_before_voting: false,
        poll_type: "single_choice"
      }
    },
    is_public: true
  },
  {
    name: "Municipal Budget Priority",
    description: "Template for community input on municipal budget allocation",
    category: "community",
    tags: ["budget", "municipal", "priority", "community"],
    poll_config: {
      title: "Municipal Budget Priorities - Where should we invest?",
      description: "Help prioritize how our municipality should allocate its budget",
      options: [
        "Road Infrastructure",
        "Education & Schools",
        "Healthcare Facilities",
        "Public Safety",
        "Parks & Recreation",
        "Economic Development"
      ],
      settings: {
        allow_multiple_votes: true,
        require_authentication: false,
        poll_type: "multiple_choice"
      }
    },
    is_public: true
  },
  {
    name: "Economic Policy Support",
    description: "Gauge public support for various economic policies",
    category: "economic",
    tags: ["economy", "policy", "support"],
    poll_config: {
      title: "Economic Policy Support - What policies do you support?",
      description: "Rate your support for the following economic policies",
      options: [
        "Tax reform initiative",
        "Small business support program",
        "Infrastructure investment",
        "Education funding increase",
        "Healthcare system improvement"
      ],
      settings: {
        poll_type: "rating_scale",
        require_authentication: true
      }
    },
    is_public: true
  },
  {
    name: "Community Event Planning",
    description: "Template for community event planning and preferences",
    category: "community",
    tags: ["event", "community", "planning"],
    poll_config: {
      title: "Community Event Planning - What type of event interests you?",
      description: "Help us plan community events that everyone will enjoy",
      options: [
        "Cultural Festival",
        "Sports Tournament",
        "Educational Workshop",
        "Music Concert",
        "Food Fair",
        "Art Exhibition"
      ],
      settings: {
        allow_multiple_votes: true,
        show_results_before_voting: true,
        poll_type: "multiple_choice"
      }
    },
    is_public: true
  },
  {
    name: "Regional Development Priority",
    description: "Template for regional development and infrastructure priorities",
    category: "regional",
    tags: ["development", "regional", "infrastructure"],
    poll_config: {
      title: "Regional Development Priorities - What should be our focus?",
      description: "Rank the importance of various regional development projects",
      options: [
        "Highway construction",
        "Hospital expansion",
        "University campus",
        "Industrial park",
        "Tourism development",
        "Agricultural support"
      ],
      settings: {
        poll_type: "ranked_choice",
        require_authentication: true
      }
    },
    is_public: true
  }
];

export const PollTemplateSystem: React.FC = () => {
  const [templates, setTemplates] = useState<PollTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom',
    tags: '',
    poll_config: {
      title: '',
      description: '',
      options: ['', ''],
      settings: {}
    }
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      // For now, use predefined templates with mock data
      const mockTemplates: PollTemplate[] = PREDEFINED_TEMPLATES.map((template, index) => ({
        ...template,
        id: `template_${index}`,
        created_by: 'system',
        created_at: new Date().toISOString(),
        usage_count: Math.floor(Math.random() * 100) + 10,
        rating: 4 + Math.random()
      }));

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const createPollFromTemplate = async (template: PollTemplate) => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .insert([{
          title: template.poll_config.title,
          description: template.poll_config.description,
          options: template.poll_config.options,
          creator_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Poll created from template successfully!');
      
      // Update usage count (in real implementation)
      // await supabase
      //   .from('poll_templates')
      //   .update({ usage_count: template.usage_count + 1 })
      //   .eq('id', template.id);

    } catch (error) {
      console.error('Error creating poll from template:', error);
      toast.error('Failed to create poll from template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const addOption = () => {
    setNewTemplate(prev => ({
      ...prev,
      poll_config: {
        ...prev.poll_config,
        options: [...prev.poll_config.options, '']
      }
    }));
  };

  const updateOption = (index: number, value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      poll_config: {
        ...prev.poll_config,
        options: prev.poll_config.options.map((option, i) => i === index ? value : option)
      }
    }));
  };

  const removeOption = (index: number) => {
    if (newTemplate.poll_config.options.length > 2) {
      setNewTemplate(prev => ({
        ...prev,
        poll_config: {
          ...prev.poll_config,
          options: prev.poll_config.options.filter((_, i) => i !== index)
        }
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Poll Template System</h2>
          <p className="text-muted-foreground">
            Create polls quickly using pre-built templates or create your own
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a reusable poll template that can be used by you and others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Poll Template"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="templateDescription">Description</Label>
                <Textarea
                  id="templateDescription"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe when and how this template should be used"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pollTitle">Poll Title</Label>
                <Input
                  id="pollTitle"
                  value={newTemplate.poll_config.title}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev,
                    poll_config: { ...prev.poll_config, title: e.target.value }
                  }))}
                  placeholder="What is your poll question?"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Poll Options</Label>
                {newTemplate.poll_config.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {newTemplate.poll_config.options.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Template creation feature coming soon!');
                setShowCreateDialog(false);
              }}>
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {TEMPLATE_CATEGORIES.map(category => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const CategoryIcon = TEMPLATE_CATEGORIES.find(cat => cat.id === template.category)?.icon || FileText;
          
          return (
            <Card key={template.id} className="hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                    <Badge variant="outline">
                      {TEMPLATE_CATEGORIES.find(cat => cat.id === template.category)?.name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    {template.rating.toFixed(1)}
                  </div>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Poll Preview:</h4>
                    <p className="text-sm font-medium">{template.poll_config.title}</p>
                    <div className="mt-2 space-y-1">
                      {template.poll_config.options.slice(0, 3).map((option, index) => (
                        <div key={index} className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          {option}
                        </div>
                      ))}
                      {template.poll_config.options.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{template.poll_config.options.length - 3} more options
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {template.usage_count} uses
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => createPollFromTemplate(template)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or create a new template
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};