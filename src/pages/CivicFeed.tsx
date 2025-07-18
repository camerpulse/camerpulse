import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/Layout/AppLayout';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  Globe,
  MapPin,
  Filter,
  RefreshCw,
  Users,
  Star,
  Vote,
  Plus,
  Bell,
  Search,
  Eye,
  Bookmark,
  Flag,
  MoreHorizontal,
  UserPlus,
  Camera,
  Video,
  Hash,
  AtSign,
  ChevronLeft,
  ChevronRight,
  Crown,
  Briefcase,
  GraduationCap,
  Building2,
  Landmark,
  Calendar,
  AlertTriangle,
  DollarSign,
  Megaphone,
  Activity,
  Menu,
  X,
  Radio
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Enhanced interfaces
interface FeedPost {
  id: string;
  content: string;
  type: 'text' | 'poll' | 'media' | 'event' | 'debate';
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    type: 'user' | 'politician' | 'company' | 'institution' | 'minister' | 'mp' | 'artist';
    title?: string;
    followers?: number;
  };
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  engagement: {
    user_liked: boolean;
    user_shared: boolean;
    user_saved: boolean;
  };
  location?: {
    region: string;
    city?: string;
  };
  media?: {
    type: 'image' | 'video' | 'link';
    url: string;
    thumbnail?: string;
  };
  created_at: string;
  hashtags?: string[];
  mentions?: string[];
}

interface FollowSuggestion {
  id: string;
  name: string;
  username: string;
  avatar: string;
  type: 'politician' | 'minister' | 'mp' | 'artist' | 'company' | 'school' | 'hospital' | 'ngo';
  title?: string;
  followers: number;
  verified: boolean;
  description?: string;
}

interface Poll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  total_votes: number;
  expires_at: string;
  created_by: string;
  region?: string;
}

const CivicFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [followSuggestions, setFollowSuggestions] = useState<FollowSuggestion[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-refresh and sliding content
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [liveMode, setLiveMode] = useState(true);

  // Mock data
  const mockPosts: FeedPost[] = [
    {
      id: '1',
      content: 'The road infrastructure in Douala needs immediate attention. Citizens are calling for action from local authorities. #DoualaDevelopment #Infrastructure',
      type: 'text',
      author: {
        id: 'u1',
        name: 'Marie Ngozi',
        username: 'mariengozi',
        avatar: '/api/placeholder/40/40',
        verified: true,
        type: 'user',
        followers: 1250
      },
      metrics: { likes: 42, comments: 8, shares: 12, views: 340 },
      engagement: { user_liked: false, user_shared: false, user_saved: false },
      location: { region: 'Littoral', city: 'Douala' },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      hashtags: ['DoualaDevelopment', 'Infrastructure']
    },
    {
      id: '2',
      content: 'Education reform is crucial for Cameroon\'s future. We must invest in our schools and teachers to build a stronger nation.',
      type: 'text',
      author: {
        id: 'p1',
        name: 'Hon. Paul Atanga Nji',
        username: 'paulatanganji',
        avatar: '/api/placeholder/40/40',
        verified: true,
        type: 'minister',
        title: 'Minister of Territorial Administration',
        followers: 15000
      },
      metrics: { likes: 89, comments: 23, shares: 34, views: 1200 },
      engagement: { user_liked: true, user_shared: false, user_saved: true },
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];

  const mockSuggestions: FollowSuggestion[] = [
    {
      id: 's1',
      name: 'Paul Biya',
      username: 'presidentbiya',
      avatar: '/api/placeholder/40/40',
      type: 'politician',
      title: 'President of Cameroon',
      followers: 500000,
      verified: true,
      description: 'Official account of the President'
    },
    {
      id: 's2',
      name: 'University of Yaoundé I',
      username: 'uniyaounde1',
      avatar: '/api/placeholder/40/40',
      type: 'school',
      title: 'Leading University',
      followers: 25000,
      verified: true,
      description: 'Premier university in Cameroon'
    },
    {
      id: 's3',
      name: 'Charlotte Dipanda',
      username: 'charlottedipanda',
      avatar: '/api/placeholder/40/40',
      type: 'artist',
      title: 'Musician & Cultural Ambassador',
      followers: 80000,
      verified: true,
      description: 'International recording artist'
    }
  ];

  const mockPolls: Poll[] = [
    {
      id: 'p1',
      question: 'What should be the government\'s top priority for 2024?',
      options: [
        { id: 'o1', text: 'Infrastructure Development', votes: 245 },
        { id: 'o2', text: 'Education Reform', votes: 189 },
        { id: 'o3', text: 'Healthcare Improvement', votes: 167 },
        { id: 'o4', text: 'Economic Growth', votes: 134 }
      ],
      total_votes: 735,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'CamerPulse Research',
      region: 'National'
    },
    {
      id: 'p2',
      question: 'How would you rate the current state of roads in your region?',
      options: [
        { id: 'o1', text: 'Excellent', votes: 23 },
        { id: 'o2', text: 'Good', votes: 78 },
        { id: 'o3', text: 'Fair', votes: 156 },
        { id: 'o4', text: 'Poor', votes: 289 }
      ],
      total_votes: 546,
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      created_by: 'Infrastructure Watch',
      region: 'All Regions'
    }
  ];

  // Initialize data
  useEffect(() => {
    const loadFeedData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPosts(mockPosts);
        setFollowSuggestions(mockSuggestions);
        setActivePoll(mockPolls[0]);
      } catch (error) {
        toast({
          title: "Error loading feed",
          description: "Failed to load civic feed content",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFeedData();
  }, [toast]);

  // Auto-rotate suggestions and polls
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      setCurrentSuggestionIndex(prev => 
        prev >= followSuggestions.length - 1 ? 0 : prev + 1
      );
      setCurrentPollIndex(prev => 
        prev >= mockPolls.length - 1 ? 0 : prev + 1
      );
      setActivePoll(mockPolls[currentPollIndex]);
    }, 15000); // Rotate every 15 seconds

    return () => clearInterval(interval);
  }, [liveMode, followSuggestions.length, currentPollIndex, mockPolls]);

  // Handle post creation
  const createPost = useCallback(async () => {
    if (!newPost.trim()) return;

    setPosting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const post: FeedPost = {
        id: `post_${Date.now()}`,
        content: newPost,
        type: 'text',
        author: {
          id: user?.id || 'current_user',
          name: user?.user_metadata?.full_name || 'You',
          username: user?.user_metadata?.username || 'you',
          avatar: user?.user_metadata?.avatar_url || '/api/placeholder/40/40',
          verified: false,
          type: 'user',
          followers: 0
        },
        metrics: { likes: 0, comments: 0, shares: 0, views: 1 },
        engagement: { user_liked: false, user_shared: false, user_saved: false },
        created_at: new Date().toISOString(),
        hashtags: newPost.match(/#\w+/g)?.map(tag => tag.slice(1)) || [],
        mentions: newPost.match(/@\w+/g)?.map(mention => mention.slice(1)) || []
      };

      setPosts(prev => [post, ...prev]);
      setNewPost('');
      
      toast({
        title: "Post created!",
        description: "Your civic voice has been shared with the community.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  }, [newPost, user, toast]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Feed refreshed",
        description: "Latest civic updates loaded",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to refresh feed",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

  // Post engagement handlers
  const handleLike = useCallback(async (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const wasLiked = post.engagement.user_liked;
        return {
          ...post,
          metrics: {
            ...post.metrics,
            likes: wasLiked ? post.metrics.likes - 1 : post.metrics.likes + 1
          },
          engagement: {
            ...post.engagement,
            user_liked: !wasLiked
          }
        };
      }
      return post;
    }));
  }, []);

  const handleFollow = useCallback(async (userId: string) => {
    // Simulate follow action
    toast({
      title: "Following!",
      description: "You are now following this account.",
    });
  }, [toast]);

  // Filtered posts
  const filteredPosts = posts.filter(post => {
    if (activeFilter !== 'all' && post.type !== activeFilter) return false;
    if (selectedRegion !== 'all' && post.location?.region !== selectedRegion) return false;
    if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getAuthorIcon = (type: string) => {
    switch (type) {
      case 'politician':
      case 'minister':
      case 'mp':
        return <Crown className="h-3 w-3 text-primary" />;
      case 'company':
        return <Briefcase className="h-3 w-3 text-blue-500" />;
      case 'school':
        return <GraduationCap className="h-3 w-3 text-green-500" />;
      case 'hospital':
        return <Building2 className="h-3 w-3 text-red-500" />;
      case 'artist':
        return <Star className="h-3 w-3 text-purple-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading Civic Feed...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold bg-gradient-civic bg-clip-text text-transparent">
                Civic Feed
              </h1>
              {liveMode && (
                <Badge variant="secondary" className="animate-pulse">
                  <Radio className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Quick Access</h2>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Mobile sidebar content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Follow Suggestions</h3>
                  <div className="space-y-3">
                    {followSuggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={suggestion.avatar} />
                          <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium truncate">{suggestion.name}</p>
                            {suggestion.verified && <Star className="h-3 w-3 text-primary fill-current" />}
                            {getAuthorIcon(suggestion.type)}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{suggestion.title}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleFollow(suggestion.id)}>
                          <UserPlus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                {/* Live Poll */}
                {activePoll && (
                  <Card className="shadow-lg border-primary/10">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Vote className="h-4 w-4 text-primary" />
                        Live Poll
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {activePoll.total_votes} votes
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm font-medium">{activePoll.question}</p>
                      <div className="space-y-2">
                        {activePoll.options.map((option) => {
                          const percentage = (option.votes / activePoll.total_votes) * 100;
                          return (
                            <div key={option.id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>{option.text}</span>
                                <span>{Math.round(percentage)}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Button size="sm" className="w-full">
                        Vote Now
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Trending Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Trending Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { tag: 'Education2024', posts: 234 },
                      { tag: 'CameroonUnited', posts: 189 },
                      { tag: 'Infrastructure', posts: 156 },
                      { tag: 'YouthEmpowerment', posts: 123 }
                    ].map((trend, index) => (
                      <div key={trend.tag} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">#{trend.tag}</p>
                          <p className="text-xs text-muted-foreground">{trend.posts} posts</p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-6">
              <div className="space-y-6">
                {/* Create Post */}
                <Card className="shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {user?.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="What's happening in Cameroon? Share your civic thoughts..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="min-h-[100px] resize-none border-none focus:ring-0 text-base"
                          maxLength={500}
                        />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                              <Camera className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                              <Vote className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                              <Hash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{newPost.length}/500</span>
                            <Button 
                              onClick={createPost}
                              disabled={!newPost.trim() || posting}
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                            >
                              {posting ? 'Posting...' : 'Post'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-auto min-w-[150px]">
                      <MapPin className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="Centre">Centre</SelectItem>
                      <SelectItem value="Littoral">Littoral</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="Northwest">Northwest</SelectItem>
                      <SelectItem value="Southwest">Southwest</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    {[
                      { key: 'all', label: 'All', icon: Globe },
                      { key: 'text', label: 'Posts', icon: MessageCircle },
                      { key: 'poll', label: 'Polls', icon: Vote },
                      { key: 'media', label: 'Media', icon: Camera },
                      { key: 'event', label: 'Events', icon: Calendar }
                    ].map(filter => (
                      <Button
                        key={filter.key}
                        variant={activeFilter === filter.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter(filter.key)}
                        className="flex-shrink-0"
                      >
                        <filter.icon className="h-3 w-3 mr-1" />
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Posts */}
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Post Header */}
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base">{post.author.name}</h3>
                                {post.author.verified && (
                                  <Star className="h-4 w-4 text-primary fill-current" />
                                )}
                                {getAuthorIcon(post.author.type)}
                                <span className="text-muted-foreground">@{post.author.username}</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-muted-foreground text-sm">
                                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              {post.author.title && (
                                <p className="text-sm text-muted-foreground">{post.author.title}</p>
                              )}
                            </div>
                            
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Post Content */}
                          <div className="text-base leading-relaxed">
                            {post.content}
                          </div>

                          {/* Post Media */}
                          {post.media && (
                            <div className="rounded-lg overflow-hidden border border-border">
                              {post.media.type === 'image' ? (
                                <img 
                                  src={post.media.url} 
                                  alt="Post media"
                                  className="w-full h-auto max-h-96 object-cover"
                                />
                              ) : post.media.type === 'video' ? (
                                <video 
                                  src={post.media.url}
                                  poster={post.media.thumbnail}
                                  controls
                                  className="w-full h-auto max-h-96"
                                />
                              ) : null}
                            </div>
                          )}

                          {/* Post Location */}
                          {post.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {post.location.city}, {post.location.region}
                            </div>
                          )}

                          {/* Post Engagement */}
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center gap-6">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleLike(post.id)}
                                className={`hover:bg-red-50 hover:text-red-600 ${
                                  post.engagement.user_liked ? 'text-red-600' : 'text-muted-foreground'
                                }`}
                              >
                                <Heart className={`h-4 w-4 mr-1 ${post.engagement.user_liked ? 'fill-current' : ''}`} />
                                {post.metrics.likes}
                              </Button>
                              
                              <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {post.metrics.comments}
                              </Button>
                              
                              <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600">
                                <Share2 className="h-4 w-4 mr-1" />
                                {post.metrics.shares}
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {post.metrics.views}
                              </span>
                              
                              <Button variant="ghost" size="sm">
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                {/* Follow Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Who to Follow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {followSuggestions.slice(currentSuggestionIndex, currentSuggestionIndex + 3).map((suggestion) => (
                      <div key={suggestion.id} className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={suggestion.avatar} />
                            <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="font-medium text-sm">{suggestion.name}</h4>
                              {suggestion.verified && <Star className="h-3 w-3 text-primary fill-current" />}
                              {getAuthorIcon(suggestion.type)}
                            </div>
                            <p className="text-xs text-muted-foreground">{suggestion.title}</p>
                            <p className="text-xs text-muted-foreground">{suggestion.followers.toLocaleString()} followers</p>
                            
                            <Button 
                              size="sm" 
                              className="mt-2 w-full"
                              onClick={() => handleFollow(suggestion.id)}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Follow
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Live Updates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Live Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">National Assembly</span>
                      </div>
                      <p className="text-muted-foreground text-xs">Session starting in 2 hours</p>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Local Elections</span>
                      </div>
                      <p className="text-muted-foreground text-xs">Registration deadline: 30 days</p>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Budget Hearing</span>
                      </div>
                      <p className="text-muted-foreground text-xs">Public consultation open</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CivicFeed;