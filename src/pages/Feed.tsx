/**
 * CamerPulse Unified Feed - Civic & Social Engagement Hub
 * Mobile-first feed combining civic engagement and social interaction
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
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
  AlertCircle
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
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use real data hooks
  const { 
    data: posts, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = usePosts(20, 0);

  const handleRefresh = () => {
    refetch();
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
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isFetching}>
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
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

              {/* Post Composer */}
              <PostComposer />

              {/* Posts Feed */}
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="h-4 bg-muted rounded animate-pulse w-24" />
                              <div className="h-3 bg-muted rounded animate-pulse w-16" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded animate-pulse w-full" />
                              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                              <div className="h-8 bg-muted rounded animate-pulse w-16" />
                              <div className="h-8 bg-muted rounded animate-pulse w-16" />
                              <div className="h-8 bg-muted rounded animate-pulse w-16" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                    <h3 className="text-lg font-semibold mb-2">Failed to load posts</h3>
                    <p className="text-muted-foreground mb-4">
                      {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </p>
                    <Button onClick={handleRefresh} disabled={isFetching}>
                      {isFetching && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  
                  {/* Load More - Phase 3 will replace with infinite scroll */}
                  <div className="flex justify-center py-6">
                    <Button variant="outline" size="lg" disabled>
                      Load Older Posts (Coming Soon)
                    </Button>
                  </div>
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to share your civic voice with the community!
                    </p>
                  </CardContent>
                </Card>
              )}
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
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <p className="text-xs line-clamp-2 mb-1">{post.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Heart className="w-3 h-3" />
                        <span>{post.likes}</span>
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

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