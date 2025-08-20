/**
 * CamerPulse Unified Feed - Civic & Social Engagement Hub
 * Mobile-first feed combining civic engagement and social interaction
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
import { InfinitePostFeed } from '@/components/feed/InfinitePostFeed';
import { AIRecommendations } from '@/components/feed/AIRecommendations';
import { RealtimeNotifications } from '@/components/feed/RealtimeNotifications';
import { SocialAnalytics } from '@/components/feed/SocialAnalytics';
import { AdminDashboard, UserManagement, ContentAnalytics, AutoModerationTools } from '@/components/admin';
import { SecurityAuditDashboard } from '@/components/security/SecurityAuditDashboard';
import { RateLimitMonitor } from '@/components/security/RateLimitMonitor';
import { useFeedRealtime } from '@/hooks/useFeedRealtime';
import {
  Users,
  Search,
  TrendingUp,
  Hash,
  BarChart3,
  RefreshCw,
  Bell,
  Zap,
  Globe,
  Building2,
  School,
  Hospital,
  Vote,
  Loader2,
  AlertCircle,
  Heart,
  MessageCircle,
  Calendar,
  Home,
  Plus
} from 'lucide-react';

// Static data for sidebars - will be replaced with real data in Phase 4
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
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showComposer, setShowComposer] = useState(false);

  // Auto-navigate to security dashboard for Phase 6
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/security');
      toast({
        title: "Accessing Security Dashboard",
        description: "Phase 6: Advanced security & permission system with audit logs",
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, toast]);
  
  // Use real data hooks
  // Use infinite scroll instead of paginated posts
  const { 
    data: legacyPosts, 
    isLoading: legacyLoading, 
    error: legacyError, 
    refetch: legacyRefetch,
    isFetching: legacyFetching 
  } = usePosts(3, 0); // Only fetch 3 for trending sidebar

  // Realtime sync for posts/interactions/comments (still needed for trending)
  useFeedRealtime(3, 0);

  const handleRefresh = () => {
    legacyRefetch();
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Fixed Top Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-cm-red">CamerPulse</h1>
              <Badge variant="secondary" className="bg-cm-green/10 text-cm-green">
                <Zap className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={legacyFetching}>
                <RefreshCw className={`w-4 h-4 ${legacyFetching ? 'animate-spin' : ''}`} />
              </Button>
              <RealtimeNotifications />
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-64 border-r border-border bg-card">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
              {/* Follow Suggestions */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Who to Follow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestedFollows.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          {suggestion.type === 'politician' && <Users className="w-4 h-4" />}
                          {suggestion.type === 'organization' && <Building2 className="w-4 h-4" />}
                          {suggestion.type === 'school' && <School className="w-4 h-4" />}
                          {suggestion.type === 'hospital' && <Hospital className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{suggestion.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(suggestion.followers / 1000).toFixed(0)}k followers
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Follow
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <AIRecommendations />

              {/* Trending Topics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={topic.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">#{topic.name}</p>
                        <p className="text-xs text-muted-foreground">{topic.count} discussions</p>
                      </div>
                      <div className="text-xs text-muted-foreground">#{index + 1}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Feed */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="p-4 space-y-6">
              {/* Search Bar - Desktop only */}
              <div className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search CamerPulse..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Phase 6: Advanced Security Dashboard */}
              <div className="space-y-8">
                <AdminDashboard />
                <SecurityAuditDashboard />
                <RateLimitMonitor />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:block w-80 border-l border-border bg-card">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
              {/* Civic Stats */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Civic Pulse Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-cm-green">72%</p>
                    <p className="text-xs text-muted-foreground">of youth believe in democracy</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-muted/30 rounded">
                      <p className="text-sm font-semibold">1.2M</p>
                      <p className="text-xs text-muted-foreground">Active Voters</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <p className="text-sm font-semibold">345</p>
                      <p className="text-xs text-muted-foreground">Live Polls</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Posts */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending Now
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {legacyPosts?.slice(0, 3).map((post) => (
                    <div key={post.id} className="p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <p className="text-xs line-clamp-2 mb-1">{post.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Heart className="w-3 h-3" />
                        <span>{post.like_count || 0}</span>
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.comment_count || 0}</span>
                      </div>
                    </div>
                  )) || []}
                </CardContent>
              </Card>

              {/* Social Analytics */}
              <SocialAnalytics />

              {/* Events */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-2 border rounded">
                    <p className="text-sm font-medium">National Assembly Session</p>
                    <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                  </div>
                  <div className="p-2 border rounded">
                    <p className="text-sm font-medium">Municipal Elections</p>
                    <p className="text-xs text-muted-foreground">Next month</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navigation - Mobile Only */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
          <div className="flex justify-around py-2">
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
                className={`flex flex-col items-center py-2 px-3 ${
                  activeTab === tab.key 
                    ? 'text-cm-red' 
                    : 'text-muted-foreground'
                }`}
              >
                <tab.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}