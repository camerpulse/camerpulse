import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Wand2, FileText, Image, Video, MessageSquare, 
  Clock, CheckCircle, Zap, Globe, Sparkles
} from 'lucide-react';

interface AIContentGenerationModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const AIContentGenerationModule: React.FC<AIContentGenerationModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState('article');

  const contentTemplates = [
    {
      id: 1,
      name: 'Political Update Article',
      description: 'Generate comprehensive political news articles',
      category: 'news',
      prompt: 'Write a balanced political update about recent developments in Cameroon',
      estimatedTime: '2-3 minutes',
      wordCount: '500-800 words'
    },
    {
      id: 2,
      name: 'Community Announcement',
      description: 'Create community-focused announcements',
      category: 'community',
      prompt: 'Create an engaging community announcement for upcoming local events',
      estimatedTime: '1-2 minutes',
      wordCount: '200-400 words'
    },
    {
      id: 3,
      name: 'Economic Analysis Report',
      description: 'Generate economic trend analysis',
      category: 'economics',
      prompt: 'Analyze current economic trends affecting Cameroon regions',
      estimatedTime: '3-5 minutes',
      wordCount: '800-1200 words'
    },
    {
      id: 4,
      name: 'Social Media Post',
      description: 'Create engaging social media content',
      category: 'social',
      prompt: 'Generate viral social media content about civic engagement',
      estimatedTime: '30 seconds',
      wordCount: '50-100 words'
    }
  ];

  const generationHistory = [
    {
      id: 1,
      type: 'Article',
      title: 'Economic Development in North Region',
      status: 'completed',
      createdAt: '2024-01-15 14:30',
      wordCount: 847,
      aiModel: 'GPT-4',
      engagementScore: 8.4,
      usage: 'Published on main site'
    },
    {
      id: 2,
      type: 'Social Post',
      title: 'Youth Engagement Campaign',
      status: 'completed',
      createdAt: '2024-01-15 13:45',
      wordCount: 89,
      aiModel: 'GPT-4',
      engagementScore: 9.2,
      usage: 'Posted on social media'
    },
    {
      id: 3,
      type: 'Report',
      title: 'Infrastructure Assessment',
      status: 'generating',
      createdAt: '2024-01-15 14:50',
      wordCount: 0,
      aiModel: 'GPT-4',
      engagementScore: 0,
      usage: 'In progress'
    }
  ];

  const automationRules = [
    {
      id: 1,
      name: 'Daily News Summary',
      description: 'Generate daily news summaries from trending topics',
      trigger: 'Daily at 6:00 AM',
      status: 'active',
      lastRun: '2024-01-15 06:00',
      successRate: 98.5,
      contentGenerated: 245
    },
    {
      id: 2,
      name: 'Weekly Regional Report',
      description: 'Compile weekly reports for each region',
      trigger: 'Weekly on Mondays',
      status: 'active',
      lastRun: '2024-01-15 00:00',
      successRate: 96.2,
      contentGenerated: 48
    },
    {
      id: 3,
      name: 'Breaking News Alerts',
      description: 'Auto-generate urgent news notifications',
      trigger: 'On high-priority events',
      status: 'active',
      lastRun: '2024-01-14 16:30',
      successRate: 94.8,
      contentGenerated: 89
    }
  ];

  const mediaGeneration = [
    {
      id: 1,
      type: 'Image',
      prompt: 'Cameroon landscape with modern infrastructure',
      status: 'completed',
      url: '/generated/landscape-001.jpg',
      createdAt: '2024-01-15 14:25',
      style: 'Photorealistic',
      resolution: '1024x768'
    },
    {
      id: 2,
      type: 'Video',
      prompt: 'Political campaign announcement animation',
      status: 'processing',
      url: null,
      createdAt: '2024-01-15 14:40',
      style: 'Professional',
      resolution: '1920x1080'
    },
    {
      id: 3,
      type: 'Audio',
      prompt: 'News broadcast voice narration',
      status: 'completed',
      url: '/generated/narration-001.mp3',
      createdAt: '2024-01-15 13:50',
      style: 'Professional',
      duration: '2:35'
    }
  ];

  const handleGenerateContent = async () => {
    logActivity('ai_content_generate', { 
      type: generationType, 
      prompt: prompt.substring(0, 100) 
    });
  };

  const handleUseTemplate = (template: any) => {
    setPrompt(template.prompt);
    logActivity('template_used', { template_id: template.id });
  };

  const handleToggleAutomation = (ruleId: number) => {
    logActivity('automation_toggle', { rule_id: ruleId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'generating':
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="AI Content Generation"
        description="Generate articles, media, and automated content using advanced AI models"
        icon={Wand2}
        iconColor="text-purple-600"
        onRefresh={() => {
          logActivity('ai_content_refresh', { timestamp: new Date() });
        }}
      />

      {/* AI Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Content Generated"
          value="1,247"
          icon={FileText}
          trend={{ value: 23.4, isPositive: true, period: "this month" }}
          description="Total AI-generated pieces"
        />
        <StatCard
          title="Active Automations"
          value="8"
          icon={Zap}
          description="Running AI workflows"
          badge={{ text: "All Active", variant: "default" }}
        />
        <StatCard
          title="Success Rate"
          value="96.8%"
          icon={CheckCircle}
          trend={{ value: 1.2, isPositive: true, period: "this week" }}
          description="Content quality score"
        />
        <StatCard
          title="Time Saved"
          value="340h"
          icon={Clock}
          trend={{ value: 45, isPositive: true, period: "monthly" }}
          description="Automated generation"
        />
      </div>

      {/* AI Content Generation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content Generation</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="media">Media Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generate New Content
                </CardTitle>
                <CardDescription>
                  Create AI-powered content for your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Content Type</label>
                  <select 
                    value={generationType} 
                    onChange={(e) => setGenerationType(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="article">Article</option>
                    <option value="social-post">Social Media Post</option>
                    <option value="report">Report</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Content Prompt</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what content you want to generate..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <Button onClick={handleGenerateContent} className="w-full">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Content
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generation History</CardTitle>
                <CardDescription>
                  Recent AI-generated content and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generationHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.wordCount} words • {item.aiModel}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                        {item.engagementScore > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Score: {item.engagementScore}/10
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Templates
              </CardTitle>
              <CardDescription>
                Pre-designed templates for common content types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentTemplates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description}
                        </p>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-3">
                      <p>⏱️ {template.estimatedTime}</p>
                      <p>📝 {template.wordCount}</p>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => handleUseTemplate(template)}
                      className="w-full"
                    >
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automation Rules
              </CardTitle>
              <CardDescription>
                Automated content generation workflows and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>
                      </div>
                      <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                        {rule.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Trigger:</span>
                        <p className="font-medium">{rule.trigger}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <p className="font-medium">{rule.successRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Generated:</span>
                        <p className="font-medium">{rule.contentGenerated}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Run:</span>
                        <p className="font-medium">{rule.lastRun}</p>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleAutomation(rule.id)}
                    >
                      {rule.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Media Generation
              </CardTitle>
              <CardDescription>
                AI-powered image, video, and audio content creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mediaGeneration.map((media) => (
                  <div key={media.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        media.type === 'Image' ? 'bg-green-100' :
                        media.type === 'Video' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {media.type === 'Image' ? <Image className="h-6 w-6 text-green-600" /> :
                         media.type === 'Video' ? <Video className="h-6 w-6 text-blue-600" /> :
                         <MessageSquare className="h-6 w-6 text-purple-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{media.type} Generation</h4>
                        <p className="text-sm text-muted-foreground">
                          {media.prompt.substring(0, 50)}...
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Style: {media.style}</span>
                          <span>
                            {media.type === 'Audio' ? 
                              `Duration: ${media.duration}` : 
                              `Resolution: ${media.resolution}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(media.status)}
                      <Badge variant={media.status === 'completed' ? 'default' : 'secondary'}>
                        {media.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};