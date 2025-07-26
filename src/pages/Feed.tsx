/**
 * CamerPulse Feed Page - Complete Redesign
 * Mobile-first social media feed with civic enhancements
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PulseCard, UserAvatar, CivicTag, PollCard, OfficialCard } from '@/components/camerpulse';
import type { Pulse, Poll, Official, Company, CivicUser } from '@/components/camerpulse/types';
import {
  Home,
  Vote,
  MessageCircle,
  Users,
  Plus,
  Search,
  TrendingUp,
  Hash,
  MapPin,
  Calendar,
  BarChart3,
  Bookmark,
  RefreshCw,
  Camera,
  Video,
  Settings,
  Bell,
  Filter,
  Zap,
  Globe,
  Building2,
  School,
  Hospital,
  Heart
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mock data - replace with real API calls
const mockPulses: Pulse[] = [
  {
    id: '1',
    user: {
      id: '1',
      name: 'Minister Paul Atanga Nji',
      username: 'paulatanganji',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      verified: true,
      isDiaspora: false,
      location: 'Bamenda, Northwest',
      role: 'Minister'
    },
    content: 'Major infrastructure development announced for the Northwest region. This will create thousands of jobs and improve connectivity. What are your thoughts on this initiative? #Infrastructure #Development #NorthwestRegion',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 234,
    comments: 45,
    shares: 28,
    sentiment: 'positive',
    hashtags: ['Infrastructure', 'Development', 'NorthwestRegion'],
    isLiked: false
  },
  {
    id: '2',
    user: {
      id: '2',
      name: 'Marie Tchoungui',
      username: 'marietchoungui',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b4',
      verified: false,
      isDiaspora: true,
      location: 'Douala, Littoral'
    },
    content: 'Citizens of Douala are reporting water shortages in several neighborhoods. We need immediate action from CAMWATER. This affects thousands of families. #WaterCrisis #Douala #PublicServices',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    likes: 156,
    comments: 67,
    shares: 89,
    sentiment: 'negative',
    hashtags: ['WaterCrisis', 'Douala', 'PublicServices'],
    isLiked: true
  },
  {
    id: '3',
    user: {
      id: '3',
      name: 'Cameroon Education Watch',
      username: 'cameducationwatch',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
      verified: true,
      isDiaspora: false,
      role: 'Organization'
    },
    content: 'Education budget allocation for 2024 shows 18% increase. This is a positive step towards improving our schools nationwide. We need to ensure proper implementation and monitoring. #Education #Budget2024',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likes: 89,
    comments: 23,
    shares: 34,
    sentiment: 'positive',
    hashtags: ['Education', 'Budget2024'],
    isLiked: false
  }
];

const mockPolls: Poll[] = [
  {
    id: 'poll1',
    question: 'What should be the government\'s top priority for 2024?',
    options: [
      { id: '1', text: 'Infrastructure Development', votes: 342, percentage: 45 },
      { id: '2', text: 'Healthcare Improvement', votes: 234, percentage: 31 },
      { id: '3', text: 'Education Reform', votes: 123, percentage: 16 },
      { id: '4', text: 'Economic Growth', votes: 61, percentage: 8 }
    ],
    totalVotes: 760,
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    creator: { id: '1', name: 'CamerPulse Team', verified: true },
    category: 'Government Policy'
  }
];

const mockOfficials: Official[] = [
  {
    id: '1',
    name: 'Paul Biya',
    role: 'President',
    region: 'National',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    approvalRating: 52,
    civicScore: 7.2,
    termStatus: 'active',
    isCurrentlyInOffice: true,
    party: 'CPDM'
  },
  {
    id: '2',
    name: 'Joseph Dion Ngute',
    role: 'Prime Minister',
    region: 'National',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    approvalRating: 48,
    civicScore: 6.8,
    termStatus: 'active',
    isCurrentlyInOffice: true
  }
];

const trendingTopics = [
  { name: 'Infrastructure', count: 1247 },
  { name: 'Education', count: 892 },
  { name: 'Healthcare', count: 634 },
  { name: 'Economy', count: 521 },
  { name: 'Security', count: 387 }
];

const suggestedFollows = [
  { id: '1', name: 'Paul Biya', type: 'politician', followers: 1200000, verified: true },
  { id: '2', name: 'Transparency International', type: 'organization', followers: 45000, verified: true },
  { id: '3', name: 'University of Yaounde', type: 'school', followers: 89000, verified: true },
  { id: '4', name: 'Central Hospital Yaounde', type: 'hospital', followers: 23000, verified: true }
];

export default function Feed() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Pulse[]>(mockPulses);
  const [polls] = useState<Poll[]>(mockPolls);
  const [officials] = useState<Official[]>(mockOfficials);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showComposer, setShowComposer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In real app, fetch new posts here
      console.log('Auto-refreshing feed...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const newPulse: Pulse = {
      id: Date.now().toString(),
      user: {
        id: user?.id || 'current-user',
        name: user?.user_metadata?.display_name || 'You',
        username: user?.user_metadata?.username || 'you',
        verified: false,
        isDiaspora: false
      },
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      sentiment: 'neutral',
      hashtags: newPost.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [],
      isLiked: false
    };

    setPosts([newPulse, ...posts]);
    setNewPost('');
    setShowComposer(false);
    
    toast({
      title: "Pulse published!",
      description: "Your civic voice has been shared with the community."
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Feed refreshed",
        description: "Latest content loaded successfully."
      });
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Fixed Top Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border safe-area-padding">
          <div className="flex items-center justify-between px-4 py-3 min-h-[60px]">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-cm-red font-grotesk tracking-tight">CamerPulse</h1>
              <Badge variant="secondary" className="bg-cm-green/10 text-cm-green font-medium text-xs px-2 py-1">
                <Zap className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 touch-manipulation">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading} className="h-10 w-10 touch-manipulation">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 touch-manipulation">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-64 border-r border-border bg-card">
            <div className="sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto p-4 scroll-smooth-mobile">
              {/* Follow Suggestions */}
              <Card className="mb-6 shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 font-grotesk font-semibold">
                    <Users className="w-4 h-4" />
                    Who to Follow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestedFollows.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                          {suggestion.type === 'politician' && <Users className="w-4 h-4 text-primary" />}
                          {suggestion.type === 'organization' && <Building2 className="w-4 h-4 text-accent" />}
                          {suggestion.type === 'school' && <School className="w-4 h-4 text-secondary" />}
                          {suggestion.type === 'hospital' && <Hospital className="w-4 h-4 text-destructive" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium font-inter">{suggestion.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {(suggestion.followers / 1000).toFixed(0)}k followers
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="font-medium hover:bg-primary hover:text-primary-foreground transition-all">
                        Follow
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 font-grotesk font-semibold">
                    <Hash className="w-4 h-4" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={topic.name} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium font-inter">#{topic.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{topic.count} discussions</p>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono bg-primary/10 px-2 py-1 rounded-full">#{index + 1}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Feed */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="p-4 space-y-6 pb-safe-bottom">
              {/* Search Bar - Desktop only */}
              <div className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search CamerPulse..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 font-inter border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Post Composer */}
              <Card className="border-primary/20 shadow-elegant bg-gradient-to-br from-background to-muted/30">
                <CardContent className="p-4">
                  {showComposer ? (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <UserAvatar 
                          user={{
                            id: 'current',
                            name: user?.user_metadata?.display_name || 'You',
                            avatar: user?.user_metadata?.avatar_url
                          }} 
                          size="default"
                        />
                        <div className="flex-1">
                          <Textarea
                            placeholder="What's happening in Cameroon? Share your civic thoughts..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="min-h-[120px] resize-none border-primary/20 focus:border-primary font-inter text-base"
                            maxLength={500}
                          />
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-muted-foreground font-mono">{newPost.length}/500</span>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-10 w-10 touch-manipulation">
                                <Camera className="w-5 h-5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-10 w-10 touch-manipulation">
                                <Video className="w-5 h-5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-10 w-10 touch-manipulation">
                                <Vote className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowComposer(false)} className="font-medium">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreatePost}
                          disabled={!newPost.trim()}
                          className="bg-primary hover:bg-primary/90 font-medium px-6"
                        >
                          Share Pulse
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-primary/30 cursor-pointer hover:bg-muted/50 transition-all duration-200 touch-manipulation"
                      onClick={() => setShowComposer(true)}
                    >
                      <UserAvatar 
                        user={{
                          id: 'current',
                          name: user?.user_metadata?.display_name || 'You',
                          avatar: user?.user_metadata?.avatar_url
                        }} 
                        size="default"
                      />
                      <span className="flex-1 text-muted-foreground font-inter">What's happening in Cameroon?</span>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 h-10 w-10 p-0 touch-manipulation">
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Polls Section */}
              {polls.length > 0 && (
                <Card className="border-cm-green/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-cm-green">
                      <Vote className="w-5 h-5" />
                      Active Civic Polls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {polls.slice(0, 1).map((poll) => (
                        <PollCard key={poll.id} poll={poll} />
                      ))}
                      <Button variant="outline" size="sm" className="w-full">
                        View All Polls
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts Feed */}
              <div className="space-y-6">
                {posts.map((post, index) => (
                  <div key={post.id}>
                    <PulseCard 
                      pulse={post}
                      onLike={(id) => console.log('Liked:', id)}
                      onComment={(id) => console.log('Comment:', id)}
                      onShare={(id) => console.log('Share:', id)}
                    />
                    
                    {/* Insert civic content every 3 posts */}
                    {index === 2 && (
                      <Card className="border-cm-yellow/20 bg-cm-yellow/5">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Featured Officials
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4">
                            {officials.slice(0, 2).map((official) => (
                              <div key={official.id} className="p-3 border rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                  <UserAvatar user={official} size="sm" />
                                  <div>
                                    <p className="font-medium text-sm">{official.name}</p>
                                    <p className="text-xs text-muted-foreground">{official.role}</p>
                                  </div>
                                  <CivicTag type="official" label="Official" size="sm" />
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span>Approval: {official.approvalRating}%</span>
                                  <span>Civic Score: {official.civicScore}/10</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="flex justify-center py-6">
                <Button variant="outline" size="lg">
                  Load Older Posts
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:block w-80 border-l border-border bg-card">
            <div className="sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto p-4 scroll-smooth-mobile">
              {/* Civic Stats */}
              <Card className="mb-6 shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 font-grotesk font-semibold">
                    <Globe className="w-4 h-4" />
                    Civic Pulse Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <p className="text-3xl font-bold text-primary font-grotesk">72%</p>
                    <p className="text-xs text-muted-foreground font-inter">of youth believe in democracy</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20">
                      <p className="text-lg font-bold text-accent font-grotesk">1.2M</p>
                      <p className="text-xs text-muted-foreground font-inter">Active Voters</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20">
                      <p className="text-lg font-bold text-secondary font-grotesk">345</p>
                      <p className="text-xs text-muted-foreground font-inter">Live Polls</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Posts */}
              <Card className="mb-6 shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 font-grotesk font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    Trending Now
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-all border border-border/50 hover:border-primary/20">
                      <p className="text-xs line-clamp-2 mb-2 font-inter">{post.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span className="font-mono">{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span className="font-mono">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Events */}
              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 font-grotesk font-semibold">
                    <Calendar className="w-4 h-4" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border border-primary/20 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all">
                    <p className="text-sm font-medium font-inter">National Assembly Session</p>
                    <p className="text-xs text-muted-foreground font-mono">Tomorrow, 10:00 AM</p>
                  </div>
                  <div className="p-3 border border-secondary/20 rounded-lg bg-gradient-to-r from-secondary/5 to-transparent hover:from-secondary/10 transition-all">
                    <p className="text-sm font-medium font-inter">Municipal Elections</p>
                    <p className="text-xs text-muted-foreground font-mono">Next month</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navigation - Mobile Only */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50 safe-area-padding">
          <div className="flex justify-around py-3 px-safe-left pr-safe-right pb-safe-bottom">
            {[
              { icon: Home, label: 'Home', key: 'home' },
              { icon: Vote, label: 'Polls', key: 'polls' },
              { icon: MessageCircle, label: 'Messages', key: 'messages' },
              { icon: Users, label: 'Following', key: 'following' },
              { icon: Plus, label: 'Create', key: 'create' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === 'create') setShowComposer(true);
                }}
                className={`flex flex-col items-center py-2 px-2 rounded-lg min-h-[60px] min-w-[60px] touch-manipulation transition-all ${
                  activeTab === tab.key 
                    ? 'text-primary bg-primary/10 font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <tab.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium font-inter">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}