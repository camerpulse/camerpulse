import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Vote, 
  Star, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Clock, 
  Users, 
  Zap,
  Crown,
  ArrowRight,
  PlayCircle,
  TrendingUp,
  Target,
  Sparkles,
  Award
} from 'lucide-react';

// Import preview images
import presidentialPollPreview from '@/assets/templates/presidential-poll-preview.jpg';
import businessSurveyPreview from '@/assets/templates/business-survey-preview.jpg';
import communityFeedbackPreview from '@/assets/templates/community-feedback-preview.jpg';
import interactiveQuizPreview from '@/assets/templates/interactive-quiz-preview.jpg';
import productRatingPreview from '@/assets/templates/product-rating-preview.jpg';
import eventPlanningPreview from '@/assets/templates/event-planning-preview.jpg';
import researchSurveyPreview from '@/assets/templates/research-survey-preview.jpg';
import flashPollPreview from '@/assets/templates/flash-poll-preview.jpg';

interface PollTemplate {
  id: string;
  name: string;
  description: string;
  category: 'political' | 'business' | 'community' | 'educational' | 'research';
  features: string[];
  preview: string;
  isPremium: boolean;
  icon: React.ComponentType<any>;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  responseTypes: string[];
  customizations: string[];
  analytics: string[];
  integrations: string[];
}

const ADVANCED_POLL_TEMPLATES: PollTemplate[] = [
  {
    id: 'presidential-election',
    name: 'Presidential Election Poll',
    description: 'Comprehensive election polling with candidate profiles, regional analysis, and real-time tracking.',
    category: 'political',
    features: [
      'Candidate photo cards',
      'Regional vote tracking',
      'Real-time results',
      'Electoral predictions',
      'Demographic analysis',
      'Fraud protection'
    ],
    preview: presidentialPollPreview,
    isPremium: true,
    icon: Vote,
    difficulty: 'advanced',
    estimatedTime: '10-15 min setup',
    responseTypes: ['Single choice', 'Ranked voting', 'Confidence rating'],
    customizations: ['Custom candidate photos', 'Regional mapping', 'Party colors', 'Custom questions'],
    analytics: ['Geographic heatmaps', 'Demographic breakdowns', 'Trend analysis', 'Prediction models'],
    integrations: ['Social media sharing', 'News APIs', 'Electoral databases', 'SMS notifications']
  },
  {
    id: 'business-survey',
    name: 'Corporate Business Survey',
    description: 'Professional survey template for business intelligence, employee feedback, and market research.',
    category: 'business',
    features: [
      'Multi-section layout',
      'Progress indicators',
      'Conditional logic',
      'Professional branding',
      'Export capabilities',
      'Team collaboration'
    ],
    preview: businessSurveyPreview,
    isPremium: true,
    icon: BarChart3,
    difficulty: 'intermediate',
    estimatedTime: '5-10 min setup',
    responseTypes: ['Multiple choice', 'Rating scales', 'Text input', 'File uploads'],
    customizations: ['Company branding', 'Custom logos', 'Color schemes', 'Email templates'],
    analytics: ['Executive dashboards', 'Report generation', 'Trend analysis', 'Team insights'],
    integrations: ['CRM systems', 'Email marketing', 'Slack notifications', 'Google Workspace']
  },
  {
    id: 'community-feedback',
    name: 'Community Engagement Hub',
    description: 'Interactive community feedback system with emoji reactions, discussions, and moderation tools.',
    category: 'community',
    features: [
      'Emoji reactions',
      'Comment threads',
      'Moderation tools',
      'Community rankings',
      'Location tagging',
      'Mobile optimized'
    ],
    preview: communityFeedbackPreview,
    isPremium: false,
    icon: MessageSquare,
    difficulty: 'beginner',
    estimatedTime: '3-5 min setup',
    responseTypes: ['Emoji reactions', 'Text comments', 'Photo uploads', 'Location check-ins'],
    customizations: ['Community themes', 'Reaction sets', 'Moderation rules', 'Notification settings'],
    analytics: ['Engagement metrics', 'Sentiment analysis', 'Geographic distribution', 'Active users'],
    integrations: ['Facebook groups', 'WhatsApp', 'Telegram', 'Discord bots']
  },
  {
    id: 'interactive-quiz',
    name: 'Gamified Interactive Quiz',
    description: 'Engaging quiz template with scoring, leaderboards, and educational content delivery.',
    category: 'educational',
    features: [
      'Point scoring system',
      'Leaderboards',
      'Timer functionality',
      'Instant feedback',
      'Achievement badges',
      'Social sharing'
    ],
    preview: interactiveQuizPreview,
    isPremium: false,
    icon: Award,
    difficulty: 'intermediate',
    estimatedTime: '8-12 min setup',
    responseTypes: ['Multiple choice', 'True/false', 'Drag & drop', 'Audio responses'],
    customizations: ['Scoring systems', 'Badge designs', 'Timer settings', 'Difficulty levels'],
    analytics: ['Performance tracking', 'Learning outcomes', 'Completion rates', 'Knowledge gaps'],
    integrations: ['Learning management systems', 'Certificates', 'Social media', 'Email results']
  },
  {
    id: 'product-rating',
    name: 'Product Review & Rating',
    description: 'E-commerce focused template for product reviews, comparisons, and customer feedback.',
    category: 'business',
    features: [
      'Star rating system',
      'Photo/video reviews',
      'Product comparisons',
      'Verified purchases',
      'Review moderation',
      'Seller responses'
    ],
    preview: productRatingPreview,
    isPremium: true,
    icon: Star,
    difficulty: 'intermediate',
    estimatedTime: '6-8 min setup',
    responseTypes: ['Star ratings', 'Photo uploads', 'Video reviews', 'Comparison tables'],
    customizations: ['Product catalogs', 'Rating criteria', 'Review templates', 'Verification badges'],
    analytics: ['Rating distributions', 'Review sentiment', 'Product insights', 'Customer satisfaction'],
    integrations: ['E-commerce platforms', 'Payment systems', 'Inventory management', 'Customer support']
  },
  {
    id: 'event-planning',
    name: 'Event Planning & RSVP',
    description: 'Comprehensive event planning tool with calendar integration, attendance tracking, and logistics.',
    category: 'community',
    features: [
      'Calendar integration',
      'RSVP tracking',
      'Attendee management',
      'Reminder system',
      'Venue coordination',
      'Guest communications'
    ],
    preview: eventPlanningPreview,
    isPremium: false,
    icon: Calendar,
    difficulty: 'beginner',
    estimatedTime: '4-6 min setup',
    responseTypes: ['RSVP status', 'Availability slots', 'Preference selection', 'Contact info'],
    customizations: ['Event themes', 'Invitation designs', 'Reminder schedules', 'Venue details'],
    analytics: ['Attendance forecasts', 'Response rates', 'Demographic insights', 'Engagement tracking'],
    integrations: ['Google Calendar', 'Outlook', 'Zoom meetings', 'Payment processing']
  },
  {
    id: 'research-survey',
    name: 'Academic Research Survey',
    description: 'Scientific research template with advanced statistics, data validation, and academic formatting.',
    category: 'research',
    features: [
      'Statistical analysis',
      'Data validation',
      'Research ethics',
      'Academic formatting',
      'Participant consent',
      'Anonymization'
    ],
    preview: researchSurveyPreview,
    isPremium: true,
    icon: TrendingUp,
    difficulty: 'advanced',
    estimatedTime: '15-20 min setup',
    responseTypes: ['Likert scales', 'Semantic differentials', 'Open text', 'File uploads'],
    customizations: ['IRB compliance', 'Citation formats', 'Statistical methods', 'Consent forms'],
    analytics: ['Statistical significance', 'Correlation analysis', 'Regression models', 'Publication reports'],
    integrations: ['SPSS', 'R/Python', 'Academic databases', 'Citation managers']
  },
  {
    id: 'flash-poll',
    name: 'Flash Poll & Live Voting',
    description: 'Real-time polling for live events, breaking news, and instant audience engagement.',
    category: 'community',
    features: [
      'Real-time voting',
      'Live result updates',
      'Countdown timers',
      'Audience engagement',
      'Social integration',
      'Mobile-first design'
    ],
    preview: flashPollPreview,
    isPremium: false,
    icon: Zap,
    difficulty: 'beginner',
    estimatedTime: '1-2 min setup',
    responseTypes: ['Quick tap voting', 'Emoji reactions', 'Yes/No responses', 'Scale ratings'],
    customizations: ['Timer durations', 'Live themes', 'Result animations', 'Sharing options'],
    analytics: ['Real-time metrics', 'Response velocity', 'Engagement peaks', 'Social reach'],
    integrations: ['Live streaming', 'Social media', 'TV broadcasts', 'Event platforms']
  }
];

interface AdvancedPollTemplatesProps {
  onSelectTemplate?: (template: PollTemplate) => void;
  showCreateButton?: boolean;
}

export const AdvancedPollTemplates: React.FC<AdvancedPollTemplatesProps> = ({
  onSelectTemplate,
  showCreateButton = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PollTemplate | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates', icon: Target },
    { id: 'political', label: 'Political', icon: Vote },
    { id: 'business', label: 'Business', icon: BarChart3 },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'educational', label: 'Educational', icon: Award },
    { id: 'research', label: 'Research', icon: TrendingUp }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? ADVANCED_POLL_TEMPLATES 
    : ADVANCED_POLL_TEMPLATES.filter(template => template.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800';
      case 'intermediate': return 'bg-amber-100 text-amber-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectTemplate = (template: PollTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate?.(template);
  };

  const TemplateCard: React.FC<{ template: PollTemplate }> = ({ template }) => {
    const Icon = template.icon;
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden">
        <div className="relative">
          <img 
            src={template.preview} 
            alt={`${template.name} preview`}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {template.isPremium && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            <Badge className={getDifficultyColor(template.difficulty)}>
              {template.difficulty}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {template.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {template.estimatedTime}
                </span>
              </div>
            </div>
          </div>
          
          <CardDescription className="text-sm leading-relaxed">
            {template.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Key Features
              </h5>
              <div className="flex flex-wrap gap-1">
                {template.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {template.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {template.name}
                    </DialogTitle>
                    <DialogDescription>
                      Detailed preview and specifications
                    </DialogDescription>
                  </DialogHeader>
                  <TemplateDetailView template={template} />
                </DialogContent>
              </Dialog>
              
              {showCreateButton && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleSelectTemplate(template)}
                >
                  Use Template
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TemplateDetailView: React.FC<{ template: PollTemplate }> = ({ template }) => {
    const Icon = template.icon;
    
    return (
      <div className="space-y-6">
        <div className="relative rounded-lg overflow-hidden">
          <img 
            src={template.preview} 
            alt={`${template.name} preview`}
            className="w-full h-64 object-cover"
          />
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Template Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Difficulty:</span>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Setup Time:</span>
                    <span className="text-sm">{template.estimatedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Premium:</span>
                    <span className="text-sm">{template.isPremium ? 'Yes' : 'Free'}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Response Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {template.responseTypes.map((type) => (
                      <div key={type} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {type}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{template.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Core Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {template.features.map((feature) => (
                      <div key={feature} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Customizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {template.customizations.map((customization) => (
                      <div key={customization} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {customization}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {template.analytics.map((analytic) => (
                    <div key={analytic} className="text-sm flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      {analytic}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Available Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {template.integrations.map((integration) => (
                    <div key={integration} className="text-sm flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {integration}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {showCreateButton && (
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              className="flex-1"
              onClick={() => handleSelectTemplate(template)}
            >
              <Icon className="w-4 h-4 mr-2" />
              Create Poll with this Template
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Advanced Poll Templates
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Professional, responsive poll templates designed for every use case. 
          Each template includes advanced features, analytics, and customization options.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </Button>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found for the selected category.</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedPollTemplates;