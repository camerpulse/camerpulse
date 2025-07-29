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
import { useFeed } from '@/hooks/useFeed';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
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
  Eye,
  Hash,
  UserPlus,
  Flame,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PeopleToFollowSidebar } from '@/components/feed/PeopleToFollowSidebar';
import { RecommendationCarousel } from '@/components/feed/RecommendationCarousel';
import { PoliticalFiguresCarousel } from '@/components/feed/PoliticalFiguresCarousel';
import { PoliticalFiguresSidebar } from '@/components/feed/PoliticalFiguresSidebar';

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

// Enhanced mock feed data with diverse user posts
const generateAdvancedFeedData = (): FeedItem[] => [
  {
    id: '1',
    type: 'pulse',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    user: {
      id: '1',
      name: 'Amina Nkomo',
      username: 'amina_dev',
      avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      verified: false,
      role: 'Software Developer',
      location: 'Douala, Littoral'
    },
    content: {
      description: "Just finished building a new feature for our local fintech app! Excited to see how it helps small businesses in Cameroon manage their finances better. Tech can really transform lives! 💻🇨🇲 #TechForGood #Cameroon #Fintech",
      tags: ['TechForGood', 'Cameroon', 'Fintech', 'Development'],
      priority: 'medium',
      category: 'Technology'
    },
    engagement: {
      likes: 324,
      comments: 45,
      shares: 23,
      views: 1250,
      isLiked: false
    },
    metadata: {
      score: 0.87,
      relevanceFactors: ['user_content', 'tech_related', 'local_impact'],
      source: 'user'
    }
  },
  {
    id: '2',
    type: 'pulse',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    user: {
      id: '2',
      name: 'Dr. Marie Fouda',
      username: 'dr_marie',
      avatar: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
      verified: true,
      role: 'Medical Doctor',
      location: 'Yaoundé, Centre'
    },
    content: {
      description: "Proud to announce that our rural health clinic reached 1000 patients this month! Access to healthcare is a fundamental right. Thank you to all the volunteers and staff who make this possible. #Healthcare #RuralHealth #Community",
      tags: ['Healthcare', 'RuralHealth', 'Community', 'PublicService'],
      priority: 'high',
      category: 'Healthcare'
    },
    engagement: {
      likes: 892,
      comments: 67,
      shares: 145,
      views: 2890,
      isLiked: true
    },
    metadata: {
      score: 0.92,
      relevanceFactors: ['verified_user', 'healthcare', 'community_impact'],
      source: 'user',
      region: 'Centre'
    }
  },
  {
    id: '3',
    type: 'pulse',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: {
      id: '3',
      name: 'Minister Paul Atanga Nji',
      username: 'paulatanganji',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      verified: true,
      role: 'Minister',
      location: 'Bamenda, Northwest'
    },
    content: {
      description: 'Major infrastructure development announced for the Northwest region. This will create thousands of jobs and improve connectivity. Road construction begins next month. #Infrastructure #Development #NorthwestRegion',
      tags: ['Infrastructure', 'Development', 'NorthwestRegion', 'Jobs'],
      priority: 'high',
      category: 'Government Announcement'
    },
    engagement: {
      likes: 1247,
      comments: 189,
      shares: 356,
      views: 8670,
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
    id: '4',
    type: 'pulse',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    user: {
      id: '4',
      name: 'Jean-Baptiste Owona',
      username: 'jb_farmer',
      avatar: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1',
      verified: false,
      role: 'Farmer',
      location: 'Mbalmayo, Centre'
    },
    content: {
      description: "Great harvest this season! Our cooperative produced 50 tons of cocoa. Climate-smart farming techniques are really paying off. Looking forward to selling at fair prices through the new digital marketplace. 🌱 #Agriculture #Cocoa #FairTrade #ClimateChangei",
      media: ['https://images.unsplash.com/photo-1582562124811-c09040d0a901'],
      tags: ['Agriculture', 'Cocoa', 'FairTrade', 'ClimateChange'],
      priority: 'medium',
      category: 'Agriculture'
    },
    engagement: {
      likes: 456,
      comments: 78,
      shares: 89,
      views: 1890,
      isLiked: false
    },
    metadata: {
      score: 0.83,
      relevanceFactors: ['agricultural_content', 'economic_impact', 'sustainability'],
      source: 'user',
      region: 'Centre'
    }
  },
  {
    id: '5',
    type: 'poll',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
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
  
  // Real data hooks
  const { 
    feedItems: realFeedItems, 
    loading: feedLoading, 
    createFeedItem, 
    engageWithItem 
  } = useFeed();
  
  const { trendingTopics, loading: topicsLoading } = useTrendingTopics(8);
  
  // Local state for UI
  const [feedItems, setFeedItems] = useState<FeedItem[]>(generateAdvancedFeedData());
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newPost, setNewPost] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [politicalFigures, setPoliticalFigures] = useState<any[]>([]);

  // Combine real and mock data for demo
  const combinedFeedItems = useMemo(() => {
    const mockItems = generateAdvancedFeedData();
    const realItems = realFeedItems.map(item => ({
      id: item.id,
      type: item.item_type as any,
      timestamp: item.created_at,
      user: {
        id: item.author_id,
        name: 'CamerPulse User',
        verified: false,
        role: 'User'
      },
      content: {
        title: item.title,
        description: item.content,
        tags: item.tags || [],
        priority: item.priority as any,
        category: item.category
      },
      engagement: {
        likes: item.likes_count || 0,
        comments: item.comments_count || 0,
        shares: item.shares_count || 0,
        views: item.views_count || 0
      },
      metadata: {
        score: item.engagement_score || 0.5,
        source: 'user'
      }
    }));
    
    return [...realItems, ...mockItems];
  }, [realFeedItems]);

  // Apply advanced algorithm
  const algorithmFeed = useAdvancedFeedAlgorithm(combinedFeedItems, user);

  // Fetch recommendations for carousel
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;
      
      // Import supabase to fetch recommendations
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .eq('profile_visibility', 'public')
        .limit(8);
      
      if (data) setRecommendations(data);
    };

    const fetchPoliticalFigures = async () => {
      // Mock political figures data
      const mockPoliticalFigures = [
        {
          id: '1',
          user_id: 'pol-1',
          name: 'Hon. Paul Atanga Nji',
          username: 'paulatanganji',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
          position: 'Minister of Territorial Administration',
          party_affiliation: 'CPDM',
          region: 'Northwest',
          figure_type: 'politician',
          average_rating: 4.2,
          total_ratings: 1247,
          influence_score: 95,
          verification_status: 'verified',
          bio: 'Serving the people of Cameroon with dedication.'
        },
        {
          id: '2',
          user_id: 'mp-1',
          name: 'Hon. Cavaye Yeguie Djibril',
          username: 'cavayeyeguie',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          position: 'Speaker of National Assembly',
          party_affiliation: 'CPDM',
          region: 'Far North',
          figure_type: 'mp',
          average_rating: 4.0,
          total_ratings: 892,
          influence_score: 88,
          verification_status: 'verified',
          bio: 'Leading parliamentary proceedings.'
        },
        {
          id: '3',
          user_id: 'senator-1',
          name: 'Sen. Marcel Niat Njifenji',
          username: 'marcelniat',
          avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
          position: 'Senate President',
          party_affiliation: 'CPDM',
          region: 'Centre',
          figure_type: 'senator',
          average_rating: 4.1,
          total_ratings: 634,
          influence_score: 85,
          verification_status: 'verified',
          bio: 'Championing legislative excellence.'
        },
        {
          id: '4',
          user_id: 'chief-1',
          name: 'HRH Fon Angwafor III',
          username: 'fonangwafor',
          avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
          position: 'Fon of Mankon',
          party_affiliation: 'Traditional Authority',
          region: 'Northwest',
          figure_type: 'chief',
          average_rating: 4.5,
          total_ratings: 456,
          influence_score: 72,
          verification_status: 'verified',
          bio: 'Preserving culture and promoting peace.'
        }
      ];
      setPoliticalFigures(mockPoliticalFigures);
    };

    fetchRecommendations();
    fetchPoliticalFigures();
  }, [user]);

  // Filter and search logic with enhanced animations
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

    // Animate content changes
    setFilteredItems([]);
    setTimeout(() => setFilteredItems(filtered), 100);
  }, [algorithmFeed, activeFilter, searchTerm]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    setLoading(true);

    // Create new item with enhanced data
    const newItem: FeedItem = {
      id: Date.now().toString(),
      type: 'pulse',
      timestamp: new Date().toISOString(),
      user: {
        id: user?.id || 'current-user',
        name: user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'You',
        username: user?.user_metadata?.username || 'you',
        avatar: user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
        verified: false,
        role: 'Community Member',
        location: user?.user_metadata?.location || 'Cameroon'
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
        views: 1,
        isLiked: false
      },
      metadata: {
        score: 0.7,
        relevanceFactors: ['user_content', 'fresh_content'],
        source: 'user'
      }
    };

    // Try to create in database
    const result = await createFeedItem({
      item_type: 'pulse',
      content: newPost,
      tags: newItem.content.tags,
      category: 'User Post',
      metadata: newItem.metadata
    });

    // Add to local state for immediate feedback
    setFeedItems([newItem, ...feedItems]);
    setNewPost('');
    setShowComposer(false);
    setLoading(false);
    
    toast({
      title: "🎉 Post published!",
      description: "Your content has been added to the CamerPulse feed and is now live.",
      duration: 3000,
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    
    // Animate out current content
    setFilteredItems([]);
    
    setTimeout(() => {
      const refreshedData = generateAdvancedFeedData();
      setFeedItems(refreshedData);
      setLoading(false);
      
      toast({
        title: "✨ Feed refreshed",
        description: "Latest content loaded with advanced AI algorithm.",
        duration: 2000,
      });
    }, 800);
  };

  const handleEngagement = async (itemId: string, type: 'like' | 'comment' | 'share' | 'view') => {
    // Optimistic update for immediate feedback
    setFilteredItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              engagement: {
                ...item.engagement,
                [type === 'like' ? 'likes' : `${type}s`]: item.engagement[type === 'like' ? 'likes' : `${type}s` as keyof typeof item.engagement] as number + 1,
                isLiked: type === 'like' ? !item.engagement.isLiked : item.engagement.isLiked
              }
            }
          : item
      )
    );

    // Try to update in database
    await engageWithItem(itemId, type);
    
    if (type === 'like') {
      toast({
        title: "❤️ Liked!",
        description: "Your engagement helps improve our algorithm.",
        duration: 1500,
      });
    }
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
        {/* Enhanced Animated Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 transition-all duration-300">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 animate-fade-in">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent animate-pulse">
                  CamerPulse Feed
                </h1>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 hover-scale">
                  <Zap className="w-3 h-3 mr-1 animate-pulse" />
                  AI-Powered
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh} 
                  disabled={loading}
                  className="hover-scale transition-all duration-200"
                >
                  <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${loading ? 'animate-spin' : 'hover:rotate-180'}`} />
                </Button>
                <Button variant="ghost" size="icon" className="hover-scale relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </Button>
              </div>
            </div>

            {/* Enhanced Search & Filters with Animations */}
            <div className="mt-4 space-y-3 animate-fade-in">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search across all platform features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary transition-all duration-300 hover:border-primary/50"
                />
              </div>

              {/* Enhanced Filter Tabs with Smooth Transitions */}
              <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-muted/50 backdrop-blur-sm">
                  {[
                    { value: 'all', label: 'All', icon: Globe },
                    { value: 'pulse', label: 'Pulse', icon: MessageCircle },
                    { value: 'poll', label: 'Polls', icon: Vote },
                    { value: 'music', label: 'Music', icon: Music },
                    { value: 'job', label: 'Jobs', icon: Building2 },
                    { value: 'debt_alert', label: 'Alerts', icon: AlertTriangle },
                    { value: 'election_forecast', label: 'Elections', icon: BarChart3 },
                    { value: 'civic_event', label: 'Events', icon: Calendar }
                  ].map((tab, index) => (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value} 
                      className="text-xs transition-all duration-200 hover-scale data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <tab.icon className="w-3 h-3 mr-1" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebars */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              
              {/* Enhanced Trending Topics with Animations */}
              
              <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                    Trending in Cameroon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topicsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-4 bg-muted animate-pulse rounded" style={{ animationDelay: `${i * 100}ms` }} />
                      ))}
                    </div>
                  ) : (
                    trendingTopics.slice(0, 8).map((topic, index) => (
                      <div 
                        key={topic.id} 
                        className="flex items-center justify-between py-1 hover:bg-muted/50 rounded-lg px-2 transition-all duration-200 cursor-pointer group animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium w-4">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">#{topic.topic_name}</p>
                            <p className="text-xs text-muted-foreground">{topic.mention_count.toLocaleString()} mentions</p>
                          </div>
                        </div>
                        <TrendingUp className="w-3 h-3 text-green-500 group-hover:scale-110 transition-transform" />
                      </div>
                    ))
                  )}
                  <Button variant="ghost" className="w-full text-xs mt-3 hover-scale">
                    View All Trends
                  </Button>
                </CardContent>
              </Card>

              {/* Enhanced Suggested Users */}
              <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-500" />
                    Suggested Follows
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Hon. Cavaye Yeguie Djibril', role: 'National Assembly Speaker', verified: true },
                    { name: 'Dr. Manaouda Malachie', role: 'Minister of Health', verified: true },
                    { name: 'Prof. Fame Ndongo', role: 'Minister of Higher Education', verified: true },
                    { name: 'Cameroon Startup Hub', role: 'Innovation Center', verified: false }
                  ].map((user, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between hover:bg-muted/50 rounded-lg p-2 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        </div>
                        {user.verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="text-xs hover-scale">
                        Follow
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-xs mt-3 hover-scale">
                    See More Suggestions
                  </Button>
                </CardContent>
              </Card>

            </div>

            {/* Enhanced Main Feed with Smooth Animations */}
            <div className="lg:col-span-3 space-y-6">
              {/* Enhanced Post Composer */}
              <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                <CardContent className="p-4">
                  {showComposer ? (
                    <div className="space-y-4 animate-scale-in">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user?.user_metadata?.display_name?.[0] || user?.user_metadata?.full_name?.[0] || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'You'}</p>
                          <p className="text-xs text-muted-foreground">Share with the community</p>
                        </div>
                      </div>
                      <Textarea
                        placeholder="What's happening in Cameroon? Share your thoughts, experiences, or insights..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[120px] resize-none border-primary/20 focus:border-primary transition-all duration-300"
                        maxLength={1000}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="hover-scale">
                            <Camera className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover-scale">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover-scale">
                            <Vote className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover-scale">
                            <Hash className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {1000 - newPost.length} characters left
                          </span>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowComposer(false)}
                              className="hover-scale"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreatePost}
                              disabled={!newPost.trim() || loading}
                              className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300 hover-scale"
                            >
                              {loading ? (
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                                  <Zap className="w-4 h-4 mr-2" />
                                </div>
                              )}
                              Pulse
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-primary/30 cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary-glow/5 transition-all duration-300 group animate-fade-in"
                      onClick={() => setShowComposer(true)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-white font-semibold text-sm">
                          {user?.user_metadata?.display_name?.[0] || user?.user_metadata?.full_name?.[0] || 'U'}
                        </span>
                      </div>
                      <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors">
                        What's happening in Cameroon?
                      </span>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary hover-scale">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Feed Items with Staggered Animations */}
              <div className="space-y-6">
                {loading && filteredItems.length === 0 ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Card key={i} className="border-border/50 animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-muted rounded-full" />
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-muted rounded w-1/3" />
                              <div className="h-3 bg-muted rounded w-1/4" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded" />
                            <div className="h-4 bg-muted rounded w-3/4" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  filteredItems.map((item, index) => {
                    const IconComponent = getFeedItemIcon(item.type);
                    return (
                      <div key={item.id}>
                        <Card 
                          className="border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover-scale animate-fade-in group"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {item.user?.avatar ? (
                                  <img 
                                    src={item.user.avatar} 
                                    alt={item.user.name}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <IconComponent className="w-5 h-5 text-white" />
                                  </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center">
                                  <IconComponent className="w-2.5 h-2.5 text-muted-foreground" />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{item.user?.name}</h4>
                                  {item.user?.verified && (
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                      ✓ Verified
                                    </Badge>
                                  )}
                                  <Badge className={`text-xs transition-all duration-200 ${getPriorityColor(item.content.priority)}`}>
                                    {item.content.priority}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {item.user?.role} • {item.user?.location} • {formatDistanceToNow(new Date(item.timestamp))} ago
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="hover-scale opacity-0 group-hover:opacity-100 transition-all duration-300"
                                onClick={() => handleEngagement(item.id, 'view')}
                              >
                                <Bookmark className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="hover-scale opacity-0 group-hover:opacity-100 transition-all duration-300"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {item.content.title && (
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{item.content.title}</h3>
                          )}
                          <p className="text-sm mb-3 leading-relaxed">{item.content.description}</p>
                          
                          {item.content.media && item.content.media.length > 0 && (
                            <div className="mb-3 rounded-lg overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                              <img 
                                src={item.content.media[0]} 
                                alt="Post media"
                                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}

                          {item.content.tags && item.content.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.content.tags.map((tag, tagIndex) => (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer hover-scale"
                                  style={{ animationDelay: `${tagIndex * 50}ms` }}
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Enhanced Engagement Bar */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                              <button 
                                className={`flex items-center gap-1 md:gap-2 hover:text-red-500 transition-all duration-200 hover-scale min-h-[44px] px-2 md:px-3 rounded-lg touch-manipulation ${item.engagement.isLiked ? 'text-red-500' : ''}`}
                                onClick={() => handleEngagement(item.id, 'like')}
                              >
                                <Heart className={`w-3 h-3 md:w-4 md:h-4 ${item.engagement.isLiked ? 'fill-current' : ''}`} />
                                <span className="font-medium">{item.engagement.likes.toLocaleString()}</span>
                              </button>
                              <button 
                                className="flex items-center gap-1 md:gap-2 hover:text-blue-500 transition-all duration-200 hover-scale min-h-[44px] px-2 md:px-3 rounded-lg touch-manipulation"
                                onClick={() => handleEngagement(item.id, 'comment')}
                              >
                                <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="font-medium">{item.engagement.comments.toLocaleString()}</span>
                              </button>
                              <button 
                                className="flex items-center gap-1 md:gap-2 hover:text-green-500 transition-all duration-200 hover-scale min-h-[44px] px-2 md:px-3 rounded-lg touch-manipulation"
                                onClick={() => handleEngagement(item.id, 'share')}
                              >
                                <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="font-medium">{item.engagement.shares.toLocaleString()}</span>
                              </button>
                              <span className="flex items-center gap-1 md:gap-2 text-muted-foreground/70">
                                <Eye className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="text-xs md:text-sm">{item.engagement.views.toLocaleString()}</span>
                              </span>
                            </div>
                            {item.content.actionUrl && (
                              <Button variant="outline" size="sm" className="hover-scale min-h-[44px] touch-manipulation">
                                <span className="text-xs md:text-sm">View Details</span>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                        </Card>
                        {/* Insert recommendation carousel every 3rd post */}
                        {(index + 1) % 3 === 0 && recommendations.length > 0 && (
                          <RecommendationCarousel recommendations={recommendations} />
                        )}
                        {/* Insert political figures carousel every 5th post */}
                        {(index + 1) % 5 === 0 && politicalFigures.length > 0 && (
                          <PoliticalFiguresCarousel figures={politicalFigures} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Enhanced Load More */}
              <div className="text-center mt-8 animate-fade-in">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto hover-scale bg-gradient-to-r from-background to-muted hover:from-primary hover:to-primary-glow hover:text-primary-foreground transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Load More Content
                </Button>
              </div>
            </div>

            {/* Right Sidebar - People to Follow & Political Figures */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              <PeopleToFollowSidebar />
              <PoliticalFiguresSidebar />
              
              {/* Enhanced Live Activity */}
              <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-500 animate-pulse" />
                    Live Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { action: 'New poll created', time: '2 min ago', icon: Vote, color: 'text-blue-500' },
                    { action: 'Minister posted update', time: '5 min ago', icon: Shield, color: 'text-green-500' },
                    { action: 'Job posting in Douala', time: '12 min ago', icon: Building2, color: 'text-orange-500' },
                    { action: 'Health alert issued', time: '18 min ago', icon: Heart, color: 'text-red-500' },
                    { action: 'New music release', time: '25 min ago', icon: Music, color: 'text-purple-500' }
                  ].map((activity, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 py-2 hover:bg-muted/50 rounded-lg px-2 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className={`w-6 h-6 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center`}>
                        <activity.icon className={`w-3 h-3 text-white`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Enhanced Quick Stats */}
              <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Platform Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Active Users', value: '12.4K', change: '+5%', color: 'text-green-500' },
                    { label: 'Posts Today', value: '1,234', change: '+12%', color: 'text-blue-500' },
                    { label: 'Active Polls', value: '45', change: '+2', color: 'text-purple-500' },
                    { label: 'Jobs Posted', value: '156', change: '+8', color: 'text-orange-500' }
                  ].map((stat, index) => (
                    <div 
                      key={stat.label}
                      className="flex justify-between items-center hover:bg-muted/50 rounded-lg p-2 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{stat.value}</span>
                        <span className={`text-xs ${stat.color}`}>{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Enhanced Quick Actions */}
              <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'Create Poll', icon: Vote, gradient: 'from-blue-500 to-blue-600' },
                    { label: 'Post Job', icon: Building2, gradient: 'from-green-500 to-green-600' },
                    { label: 'Add Event', icon: Calendar, gradient: 'from-purple-500 to-purple-600' },
                    { label: 'Share Music', icon: Music, gradient: 'from-pink-500 to-pink-600' }
                  ].map((action, index) => (
                    <Button 
                      key={action.label}
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start hover-scale transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary-glow/10 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <action.icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Platform Sections */}
              <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover-scale bg-gradient-to-br from-background via-background to-primary/5">
                <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-t-lg">
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <Hash className="w-5 h-5" />
                    Platform Sections
                    <Badge variant="secondary" className="ml-auto text-xs">8</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-4">
                  {[
                    { label: 'Villages', icon: MapPin, href: '/villages', count: '2.4k', color: 'text-green-500' },
                    { label: 'Petitions', icon: Scale, href: '/petitions', count: '142', color: 'text-orange-500' },
                    { label: 'Sentiment', icon: BarChart3, href: '/sentiment', count: 'Live', color: 'text-blue-500', isLive: true },
                    { label: 'Companies', icon: Building2, href: '/companies', count: '856', color: 'text-purple-500' },
                    { label: 'Politicians', icon: Users, href: '/politicians', count: '324', color: 'text-red-500' },
                    { label: 'Political Parties', icon: Crown, href: '/political-parties', count: '12', color: 'text-yellow-500' },
                    { label: 'MPs', icon: Shield, href: '/mps', count: '180', color: 'text-indigo-500' },
                    { label: 'Senators', icon: BookOpen, href: '/senators', count: '100', color: 'text-cyan-500' }
                  ].map((section, index) => (
                    <div 
                      key={section.label}
                      className="group relative animate-fade-in"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start hover-scale transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary-glow/15 hover:shadow-md group-hover:translate-x-1"
                        onClick={() => window.location.href = section.href}
                      >
                        <section.icon className={`w-4 h-4 mr-3 transition-colors duration-200 ${section.color} group-hover:scale-110`} />
                        <span className="flex-1 text-left font-medium">{section.label}</span>
                        <div className="flex items-center gap-2">
                          {section.isLive && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          )}
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 border-primary/20 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-200"
                          >
                            {section.count}
                          </Badge>
                        </div>
                      </Button>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}