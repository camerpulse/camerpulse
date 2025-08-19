import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Radio,
  Filter,
  Clock,
  MapPin,
  Users,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  AlertTriangle,
  Zap,
  Smile,
  Frown,
  Angry,
  Eye,
  Target,
  Shield,
  Volume2,
  Search,
  RefreshCw,
  Play,
  Pause,
  Image,
  Video
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
// French locale removed - English only

interface CivicPost {
  id: string;
  content_text: string;
  platform: 'twitter' | 'facebook' | 'tiktok' | 'pulse';
  author_handle?: string;
  created_at: string;
  sentiment_polarity: string;
  sentiment_score?: number;
  emotional_tone?: string[];
  confidence_score?: number;
  region_detected?: string;
  hashtags?: string[];
  mentions?: string[];
  keywords_detected?: string[];
  engagement_metrics?: any;
  threat_level?: string;
  flagged_for_review?: boolean;
  content_category?: string[];
  author_influence_score?: number;
}

const emotionIcons: Record<string, { icon: React.ComponentType<any>; color: string; emoji: string }> = {
  anger: { icon: Angry, color: 'text-red-500', emoji: '😡' },
  fear: { icon: Shield, color: 'text-purple-500', emoji: '😨' },
  joy: { icon: Smile, color: 'text-yellow-500', emoji: '😊' },
  sadness: { icon: Frown, color: 'text-blue-500', emoji: '😢' },
  sarcasm: { icon: Eye, color: 'text-gray-500', emoji: '🙄' },
  hope: { icon: Heart, color: 'text-green-500', emoji: '🤞' },
  frustration: { icon: Zap, color: 'text-orange-500', emoji: '😤' },
  excitement: { icon: TrendingUp, color: 'text-pink-500', emoji: '🎉' }
};

const platformIcons = {
  twitter: '🐦',
  facebook: '📘',
  tiktok: '🎵',
  pulse: '💭'
};

const threatLevelConfig = {
  none: { color: 'text-green-600', bg: 'bg-green-50', emoji: '✅', label: 'Safe' },
  low: { color: 'text-yellow-600', bg: 'bg-yellow-50', emoji: '⚠️', label: 'Caution' },
  medium: { color: 'text-orange-600', bg: 'bg-orange-50', emoji: '🔸', label: 'Moderate' },
  high: { color: 'text-red-600', bg: 'bg-red-50', emoji: '🚨', label: 'High' },
  critical: { color: 'text-red-800', bg: 'bg-red-100', emoji: '🔴', label: 'Critical' }
};

const regions = [
  'All Regions',
  'Centre',
  'Littoral',
  'Ouest',
  'Nord-Ouest',
  'Sud-Ouest',
  'Est',
  'Adamaoua',
  'Nord',
  'Far North',
  'Sud',
  'Diaspora - USA',
  'Diaspora - France',
  'Diaspora - UK',
  'Diaspora - Canada',
  'Diaspora - Germany'
];

 const topics = [
   'All Topics',
   'Politics',
   'Economy',
   'Security',
   'Health',
   'Education',
   'Infrastructure',
   'Corruption',
   'Elections',
   'Society',
   'Sports',
   'Culture'
 ];

export const CivicFeed: React.FC = () => {
  const [posts, setPosts] = useState<CivicPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'facebook', 'tiktok', 'pulse']);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchCivicPosts();
    
    if (isLive) {
      intervalRef.current = setInterval(fetchCivicPosts, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedRegion, selectedTopic, timeFilter, searchQuery, selectedPlatforms, isLive]);

  const fetchCivicPosts = async () => {
    try {
      setLoading(true);
      
      // Get current time and calculate time filter
      const now = new Date();
      const timeThresholds = {
        '1h': new Date(now.getTime() - 60 * 60 * 1000),
        '6h': new Date(now.getTime() - 6 * 60 * 60 * 1000),
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };

      let query = supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .gte('created_at', timeThresholds[timeFilter as keyof typeof timeThresholds].toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply platform filter
      if (selectedPlatforms.length < 4) {
        query = query.in('platform', selectedPlatforms);
      }

      // Apply region filter
      if (selectedRegion !== 'All Regions') {
        if (selectedRegion.startsWith('Diaspora')) {
          const country = selectedRegion.split(' - ')[1];
          query = query.ilike('region_detected', `%${country}%`);
        } else {
          query = query.eq('region_detected', selectedRegion);
        }
      }

      // Apply topic filter through keywords
       if (selectedTopic !== 'All Topics') {
         const topicKeywords = {
           'Politics': ['politics', 'government', 'minister', 'president'],
           'Economy': ['economy', 'business', 'work', 'employment'],
           'Security': ['security', 'police', 'crime', 'violence'],
           'Health': ['health', 'hospital', 'doctor', 'disease'],
           'Education': ['school', 'university', 'education', 'student'],
           'Infrastructure': ['road', 'electricity', 'water', 'transport'],
           'Corruption': ['corruption', 'embezzlement', 'scandal'],
           'Elections': ['election', 'vote', 'campaign', 'candidate'],
           'Society': ['society', 'community', 'family'],
           'Sports': ['sport', 'football', 'basketball'],
           'Culture': ['culture', 'music', 'art', 'tradition']
         };
        
        const keywords = topicKeywords[selectedTopic as keyof typeof topicKeywords] || [];
        if (keywords.length > 0) {
          query = query.overlaps('keywords_detected', keywords);
        }
      }

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.ilike('content_text', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedPosts: CivicPost[] = (data || []).map((item: any) => ({
        id: item.id,
        content_text: item.content_text,
        platform: item.platform,
        author_handle: item.author_handle,
        created_at: item.created_at,
        sentiment_polarity: item.sentiment_polarity,
        sentiment_score: item.sentiment_score,
        emotional_tone: item.emotional_tone || [],
        confidence_score: item.confidence_score,
        region_detected: item.region_detected,
        hashtags: item.hashtags || [],
        mentions: item.mentions || [],
        keywords_detected: item.keywords_detected || [],
        engagement_metrics: item.engagement_metrics,
        threat_level: item.threat_level || 'none',
        flagged_for_review: item.flagged_for_review,
        content_category: item.content_category || [],
        author_influence_score: item.author_influence_score || 0
      }));

      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching civic posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getEmotionDisplay = (emotions: string[]) => {
    if (!emotions || emotions.length === 0) return null;
    
    return emotions.slice(0, 3).map((emotion, index) => {
      const config = emotionIcons[emotion.toLowerCase()];
      if (!config) return null;
      
      return (
        <span key={index} className={`inline-flex items-center gap-1 ${config.color}`}>
          {config.emoji}
          <span className="text-xs capitalize">{emotion}</span>
        </span>
      );
    });
  };

  const getThreatDisplay = (level: string) => {
    const config = threatLevelConfig[level as keyof typeof threatLevelConfig] || threatLevelConfig.none;
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        {config.emoji} {config.label}
      </Badge>
    );
  };

  const getSentimentColor = (polarity: string, score?: number) => {
    switch (polarity) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radio className="h-6 w-6" />
            Civic Feed - Real-time Stream
          </h2>
          <p className="text-muted-foreground">
            Monitoring civic discussions across platforms
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant={isLive ? "destructive" : "default"}
            onClick={toggleLiveMode}
            className="flex items-center gap-2"
          >
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isLive ? 'Pause' : 'Live'}
          </Button>
          <Button
            variant="outline"
            onClick={fetchCivicPosts}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? '/* animate-spin - disabled */' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters and Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Region Filter */}
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {region}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Topic Filter */}
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>
                    <span className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {topic}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Time Filter */}
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last Hour
                  </span>
                </SelectItem>
                <SelectItem value="6h">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last 6 Hours
                  </span>
                </SelectItem>
                <SelectItem value="24h">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last 24 Hours
                  </span>
                </SelectItem>
                <SelectItem value="7d">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last 7 Days
                  </span>
                </SelectItem>
                <SelectItem value="30d">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last 30 Days
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Platform Toggle */}
            <div className="flex gap-1">
              {(['twitter', 'facebook', 'tiktok', 'pulse'] as const).map(platform => (
                <Button
                  key={platform}
                  variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePlatform(platform)}
                  className="flex-1 text-xs"
                >
                  {platformIcons[platform]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Indicator */}
      {isLive && (
        <Alert className="border-red-200 bg-red-50">
          <Radio className="h-4 w-4 text-red-600 /* animate-pulse - disabled */" />
          <AlertDescription className="text-red-800">
            Live mode enabled - Auto-refresh every 10 seconds
          </AlertDescription>
        </Alert>
      )}

      {/* Posts Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Civic Stream ({posts.length} discussions)</span>
            {loading && <RefreshCw className="h-4 w-4 /* animate-spin - disabled */" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea ref={scrollAreaRef} className="h-[800px] pr-4">
            {loading && posts.length === 0 ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="/* animate-pulse - disabled */">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-24 h-4 bg-muted rounded"></div>
                          <div className="w-full h-4 bg-muted rounded"></div>
                          <div className="w-3/4 h-4 bg-muted rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No discussions found</h3>
                <p className="text-muted-foreground">
                  No discussions match your filter criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {platformIcons[post.platform]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {platformIcons[post.platform]} {post.platform.toUpperCase()}
                              </Badge>
                              {post.author_handle && (
                                <span>@{post.author_handle}</span>
                              )}
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(post.created_at), { 
                                addSuffix: true, 
                                // locale: fr // Removed - English only 
                              })}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getThreatDisplay(post.threat_level || 'none')}
                              {post.flagged_for_review && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="space-y-2">
                            <p className="text-sm leading-relaxed">{post.content_text}</p>
                            
                            {/* Location */}
                            {post.region_detected && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {post.region_detected}
                              </div>
                            )}
                          </div>

                          {/* Emotions */}
                          {post.emotional_tone && post.emotional_tone.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {getEmotionDisplay(post.emotional_tone)}
                            </div>
                          )}

                          {/* Hashtags */}
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {post.hashtags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{post.hashtags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-muted">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className={`flex items-center gap-1 ${getSentimentColor(post.sentiment_polarity, post.sentiment_score)}`}>
                                <TrendingUp className="h-3 w-3" />
                                {post.sentiment_score?.toFixed(2) || '0.00'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {((post.confidence_score || 0) * 100).toFixed(0)}%
                              </span>
                              {post.author_influence_score && post.author_influence_score > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Influence: {post.author_influence_score.toFixed(1)}
                                </span>
                              )}
                            </div>
                            
                            {post.engagement_metrics && (
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {post.engagement_metrics.likes && (
                                  <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {post.engagement_metrics.likes}
                                  </span>
                                )}
                                {post.engagement_metrics.comments && (
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    {post.engagement_metrics.comments}
                                  </span>
                                )}
                                {post.engagement_metrics.shares && (
                                  <span className="flex items-center gap-1">
                                    <Share2 className="h-3 w-3" />
                                    {post.engagement_metrics.shares}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};