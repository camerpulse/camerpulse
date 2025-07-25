/**
 * Advanced Feed Algorithm - CamerPulse Platform
 * Combines all platform features into an intelligent feed experience
 * Mobile-first responsive design with comprehensive content aggregation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Home,
  TrendingUp,
  Users,
  Vote,
  MessageCircle,
  Plus,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Music,
  Building2,
  Crown,
  Heart,
  Globe,
  Zap,
  Target,
  AlertTriangle,
  DollarSign,
  Scale,
  BookOpen,
  Shield,
  MapPin,
  Camera,
  Video,
  Share2,
  Bookmark,
  RefreshCw,
  Bell,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Advanced Feed Item Types
interface FeedItem {
  id: string;
  type: 'pulse' | 'poll' | 'music' | 'job' | 'politician_update' | 'civic_event' | 'debt_alert' | 'election_forecast' | 'company_update' | 'village_news' | 'hospital_alert' | 'education_news' | 'marketplace_item';
  timestamp: string;
  user?: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    verified?: boolean;
    role?: string;
    location?: string;
  };
  content: {
    title?: string;
    description: string;
    media?: string[];
    tags?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    actionUrl?: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  metadata?: {
    score?: number;
    relevanceFactors?: string[];
    source?: string;
    region?: string;
    entityType?: string;
  };
}

// Mock comprehensive feed data
const generateAdvancedFeedData = (): FeedItem[] => [
  {
    id: '1',
    type: 'pulse',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: {
      id: '1',
      name: 'Minister Paul Atanga Nji',
      username: 'paulatanganji',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      verified: true,
      role: 'Minister',
      location: 'Bamenda, Northwest'
    },
    content: {
      description: 'Major infrastructure development announced for the Northwest region. This will create thousands of jobs and improve connectivity. #Infrastructure #Development #NorthwestRegion',
      tags: ['Infrastructure', 'Development', 'NorthwestRegion'],
      priority: 'high',
      category: 'Government Announcement'
    },
    engagement: {
      likes: 1247,
      comments: 89,
      shares: 156,
      views: 5670,
      isLiked: false
    },
    metadata: {
      score: 0.95,
      relevanceFactors: ['high_engagement', 'official_source', 'regional_relevance'],
      source: 'government',
      region: 'Northwest'
    }
  },
  {
    id: '2',
    type: 'poll',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    user: {
      id: '2',
      name: 'CamerPulse Community',
      verified: true,
      role: 'Platform'
    },
    content: {
      title: 'National Healthcare Priority Survey',
      description: 'What should be the government\'s top healthcare priority for 2024? Your voice matters in shaping policy decisions.',
      tags: ['Healthcare', 'Policy', 'Survey'],
      priority: 'medium',
      category: 'Civic Poll',
      actionUrl: '/polls/healthcare-2024'
    },
    engagement: {
      likes: 567,
      comments: 234,
      shares: 89,
      views: 3450
    },
    metadata: {
      score: 0.88,
      relevanceFactors: ['active_poll', 'civic_engagement', 'policy_related'],
      source: 'platform'
    }
  },
  {
    id: '3',
    type: 'debt_alert',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    user: {
      id: '3',
      name: 'National Debt Monitor',
      verified: true,
      role: 'System'
    },
    content: {
      title: 'Debt Alert: Monthly Update',
      description: 'Cameroon\'s national debt increased by 2.3% this month. Current debt-to-GDP ratio: 42.7%. Transparency report available.',
      tags: ['NationalDebt', 'Economics', 'Transparency'],
      priority: 'urgent',
      category: 'Economic Alert',
      actionUrl: '/national-debt'
    },
    engagement: {
      likes: 234,
      comments: 145,
      shares: 67,
      views: 2890
    },
    metadata: {
      score: 0.92,
      relevanceFactors: ['urgent_priority', 'economic_impact', 'transparency'],
      source: 'system',
      entityType: 'economic_indicator'
    }
  },
  {
    id: '4',
    type: 'music',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: {
      id: '4',
      name: 'Charlotte Dipanda',
      username: 'charlotte_dipanda',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b4',
      verified: true,
      role: 'Artist',
      location: 'Douala, Littoral'
    },
    content: {
      title: 'New Single: "Unity in Diversity"',
      description: 'Proud to release my new song celebrating Cameroon\'s cultural diversity. Available now on CamerPlay. 🇨🇲',
      media: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'],
      tags: ['NewMusic', 'CamerPlay', 'Unity', 'Culture'],
      priority: 'medium',
      category: 'Entertainment',
      actionUrl: '/camerplay/track/unity-diversity'
    },
    engagement: {
      likes: 2340,
      comments: 567,
      shares: 890,
      views: 12450
    },
    metadata: {
      score: 0.85,
      relevanceFactors: ['artist_content', 'cultural_relevance', 'high_engagement'],
      source: 'camerplay'
    }
  },
  {
    id: '5',
    type: 'job',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    user: {
      id: '5',
      name: 'Cameroon Development Corporation',
      verified: true,
      role: 'Company',
      location: 'Buea, Southwest'
    },
    content: {
      title: '500 New Jobs Available',
      description: 'CDC is hiring across multiple sectors: Agriculture, Engineering, Administration. Apply now for opportunities in Southwest region.',
      tags: ['Jobs', 'Agriculture', 'Engineering', 'Southwest'],
      priority: 'high',
      category: 'Employment',
      actionUrl: '/jobs/cdc-hiring-2024'
    },
    engagement: {
      likes: 890,
      comments: 456,
      shares: 234,
      views: 7890
    },
    metadata: {
      score: 0.87,
      relevanceFactors: ['job_opportunity', 'regional_relevance', 'economic_impact'],
      source: 'company',
      region: 'Southwest'
    }
  },
  {
    id: '6',
    type: 'election_forecast',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    user: {
      id: '6',
      name: 'Election Analytics AI',
      verified: true,
      role: 'System'
    },
    content: {
      title: 'Municipal Elections Forecast',
      description: 'AI analysis predicts tight races in 15 municipalities. Youth voter registration up 34%. Interactive map available.',
      tags: ['Elections', 'Forecast', 'Youth', 'Municipal'],
      priority: 'medium',
      category: 'Political Analysis',
      actionUrl: '/election-forecast/municipal-2024'
    },
    engagement: {
      likes: 445,
      comments: 234,
      shares: 123,
      views: 3567
    },
    metadata: {
      score: 0.83,
      relevanceFactors: ['election_related', 'ai_analysis', 'civic_importance'],
      source: 'system',
      entityType: 'election_data'
    }
  }
];

// Smart Feed Algorithm
const useAdvancedFeedAlgorithm = (items: FeedItem[], userPreferences?: any) => {
  return useMemo(() => {
    // Score-based ranking with multiple factors
    const scoredItems = items.map(item => ({
      ...item,
      algorithmScore: calculateFeedScore(item, userPreferences)
    }));

    // Sort by algorithm score
    return scoredItems.sort((a, b) => b.algorithmScore - a.algorithmScore);
  }, [items, userPreferences]);
};

const calculateFeedScore = (item: FeedItem, userPreferences?: any): number => {
  let score = item.metadata?.score || 0.5;
  
  // Time decay factor (newer content gets higher score)
  const hoursSincePost = (Date.now() - new Date(item.timestamp).getTime()) / (1000 * 60 * 60);
  const timeDecay = Math.exp(-hoursSincePost / 24); // 24-hour half-life
  
  // Engagement boost
  const engagementFactor = Math.log(1 + item.engagement.likes + item.engagement.comments * 2 + item.engagement.shares * 3) / 10;
  
  // Priority boost
  const priorityMultiplier = {
    urgent: 1.5,
    high: 1.2,
    medium: 1.0,
    low: 0.8
  }[item.content.priority || 'medium'];
  
  // Content type diversity
  const typeBoost = item.type === 'poll' ? 1.1 : item.type === 'debt_alert' ? 1.3 : 1.0;
  
  return score * timeDecay * (1 + engagementFactor) * priorityMultiplier * typeBoost;
};

export default function AdvancedFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [feedItems, setFeedItems] = useState<FeedItem[]>(generateAdvancedFeedData());
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newPost, setNewPost] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(false);

  // Apply advanced algorithm
  const algorithmFeed = useAdvancedFeedAlgorithm(feedItems, user);

  // Filter and search logic
  useEffect(() => {
    let filtered = algorithmFeed;

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  }, [algorithmFeed, activeFilter, searchTerm]);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const newItem: FeedItem = {
      id: Date.now().toString(),
      type: 'pulse',
      timestamp: new Date().toISOString(),
      user: {
        id: user?.id || 'current-user',
        name: user?.user_metadata?.display_name || 'You',
        username: user?.user_metadata?.username || 'you',
        verified: false
      },
      content: {
        description: newPost,
        tags: newPost.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [],
        priority: 'medium',
        category: 'User Post'
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0
      },
      metadata: {
        score: 0.7,
        relevanceFactors: ['user_content'],
        source: 'user'
      }
    };

    setFeedItems([newItem, ...feedItems]);
    setNewPost('');
    setShowComposer(false);
    
    toast({
      title: "Post published!",
      description: "Your content has been added to the CamerPulse feed."
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    setTimeout(() => {
      setFeedItems(generateAdvancedFeedData());
      setLoading(false);
      toast({
        title: "Feed refreshed",
        description: "Latest content loaded with advanced algorithm."
      });
    }, 1000);
  };

  const getFeedItemIcon = (type: string) => {
    const icons = {
      pulse: MessageCircle,
      poll: Vote,
      music: Music,
      job: Building2,
      politician_update: Users,
      civic_event: Calendar,
      debt_alert: AlertTriangle,
      election_forecast: BarChart3,
      company_update: Building2,
      village_news: Crown,
      hospital_alert: Heart,
      education_news: BookOpen,
      marketplace_item: DollarSign
    };
    return icons[type as keyof typeof icons] || MessageCircle;
  };

  const getPriorityColor = (priority?: string) => {
    const colors = {
      urgent: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-blue-600 bg-blue-50 border-blue-200',
      low: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Advanced Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  CamerPulse Feed
                </h1>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  <Zap className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Advanced Search & Filters */}
            <div className="mt-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search across all platform features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              {/* Filter Tabs */}
              <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-muted/50">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="pulse" className="text-xs">Pulse</TabsTrigger>
                  <TabsTrigger value="poll" className="text-xs">Polls</TabsTrigger>
                  <TabsTrigger value="music" className="text-xs">Music</TabsTrigger>
                  <TabsTrigger value="job" className="text-xs">Jobs</TabsTrigger>
                  <TabsTrigger value="debt_alert" className="text-xs">Alerts</TabsTrigger>
                  <TabsTrigger value="election_forecast" className="text-xs">Elections</TabsTrigger>
                  <TabsTrigger value="civic_event" className="text-xs">Events</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Post Composer */}
          <Card className="mb-6 border-primary/20 shadow-sm">
            <CardContent className="p-4">
              {showComposer ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts with the CamerPulse community..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[120px] resize-none border-primary/20 focus:border-primary"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Vote className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowComposer(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Publish
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-primary/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setShowComposer(true)}
                >
                  <span className="flex-1 text-muted-foreground">What's happening in Cameroon?</span>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Feed Items */}
          <div className="space-y-6">
            {filteredItems.map((item, index) => {
              const IconComponent = getFeedItemIcon(item.type);
              return (
                <Card key={item.id} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{item.user?.name}</h4>
                            {item.user?.verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                            <Badge className={`text-xs ${getPriorityColor(item.content.priority)}`}>
                              {item.content.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {item.user?.role} • {formatDistanceToNow(new Date(item.timestamp))} ago
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {item.content.title && (
                      <h3 className="font-semibold text-lg mb-2">{item.content.title}</h3>
                    )}
                    <p className="text-sm mb-3 leading-relaxed">{item.content.description}</p>
                    
                    {item.content.media && item.content.media.length > 0 && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img 
                          src={item.content.media[0]} 
                          alt="Post media"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    {item.content.tags && item.content.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.content.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Engagement Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {item.engagement.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {item.engagement.comments.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {item.engagement.shares.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.engagement.views.toLocaleString()}
                        </span>
                      </div>
                      {item.content.actionUrl && (
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" className="w-full sm:w-auto">
              Load More Content
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}