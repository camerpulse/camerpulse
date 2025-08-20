import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostComposer } from '@/components/feed/PostComposer';
import { InfinitePostFeed } from '@/components/feed/InfinitePostFeed';
import { usePosts } from '@/hooks/usePosts';
import {
  Search,
  TrendingUp,
  Users,
  Hash,
  Globe,
  Calendar,
  Building2,
  School,
  Hospital,
  Shield,
  Bell,
  Settings,
  UserPlus,
  Home,
  Plus,
  MessageCircle,
  Vote,
  RefreshCw,
} from 'lucide-react';

// Real trending topics - you can fetch these from a dedicated table later
const trendingTopics = [
  { name: 'CameroonElections', count: 2847, change: '+12%' },
  { name: 'Infrastructure', count: 1573, change: '+8%' },
  { name: 'Education', count: 1247, change: '+15%' },
  { name: 'Healthcare', count: 892, change: '+5%' },
  { name: 'Economy', count: 634, change: '-2%' },
];

// Suggested follows - you can fetch these from profiles table later
const suggestedFollows = [
  { id: '1', name: 'Ministry of Health', username: 'minsante_cm', type: 'government', verified: true },
  { id: '2', name: 'University of Yaoundé I', username: 'uy1_official', type: 'education', verified: true },
  { id: '3', name: 'Transparency CM', username: 'transparency_cm', type: 'ngo', verified: true },
  { id: '4', name: 'Douala Port Authority', username: 'douala_port', type: 'infrastructure', verified: true },
];

export default function Feed() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showPostComposer, setShowPostComposer] = useState(false);

  // Get post data for stats
  const { data: recentPosts, refetch: refetchPosts, isFetching } = usePosts(5, 0);

  const handleRefresh = () => {
    refetchPosts();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-primary">CamerPulse</h1>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Live
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearch} className="hidden md:flex">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search CamerPulse..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </form>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isFetching}
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                
                {user && (
                  <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                
                {isAdmin() && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/security')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Navigation */}
                <Card>
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      <Button
                        variant={activeTab === 'home' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('home')}
                      >
                        <Home className="h-4 w-4 mr-3" />
                        Home
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/polls')}
                      >
                        <Vote className="h-4 w-4 mr-3" />
                        Polls
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/politicians')}
                      >
                        <Users className="h-4 w-4 mr-3" />
                        Politicians
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/villages')}
                      >
                        <Globe className="h-4 w-4 mr-3" />
                        Villages
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/events')}
                      >
                        <Calendar className="h-4 w-4 mr-3" />
                        Events
                      </Button>
                    </nav>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Trending in Cameroon
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <div key={topic.name} className="cursor-pointer hover:bg-muted/50 p-2 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">#{topic.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {topic.count.toLocaleString()} posts
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <p className={`text-xs ${topic.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                              {topic.change}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Composer */}
              {user ? (
                <PostComposer />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">Join the Conversation</h3>
                    <p className="text-muted-foreground mb-4">
                      Sign in to share your voice and engage with your community
                    </p>
                    <Button onClick={() => navigate('/auth')}>
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Posts Feed */}
              <InfinitePostFeed limit={20} />
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Who to Follow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Who to Follow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {suggestedFollows.map((suggestion) => (
                      <div key={suggestion.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                            {suggestion.type === 'government' && <Building2 className="h-4 w-4" />}
                            {suggestion.type === 'education' && <School className="h-4 w-4" />}
                            {suggestion.type === 'ngo' && <Users className="h-4 w-4" />}
                            {suggestion.type === 'infrastructure' && <Hospital className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium">{suggestion.name}</p>
                              {suggestion.verified && (
                                <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">@{suggestion.username}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Follow
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Civic Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Civic Pulse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">76%</p>
                      <p className="text-sm text-muted-foreground">Civic Engagement</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <p className="text-lg font-semibold">1.2M</p>
                        <p className="text-xs text-muted-foreground">Active Citizens</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <p className="text-lg font-semibold">345</p>
                        <p className="text-xs text-muted-foreground">Live Polls</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                {recentPosts && recentPosts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recentPosts.slice(0, 3).map((post) => (
                        <div 
                          key={post.id} 
                          className="cursor-pointer hover:bg-muted/50 p-2 rounded"
                          onClick={() => navigate(`/post/${post.id}`)}
                        >
                          <p className="text-sm line-clamp-2 mb-1">{post.content}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{post.like_count || 0} likes</span>
                            <span>•</span>
                            <span>{post.comment_count || 0} comments</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
          <div className="flex justify-around py-2">
            {[
              { icon: Home, label: 'Home', key: 'home', action: () => setActiveTab('home') },
              { icon: Search, label: 'Search', key: 'search', action: () => navigate('/search') },
              { icon: Plus, label: 'Post', key: 'post', action: () => setShowPostComposer(true) },
              { icon: Vote, label: 'Polls', key: 'polls', action: () => navigate('/polls') },
              { icon: Users, label: 'Profile', key: 'profile', action: () => navigate('/profile') },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={tab.action}
                className={`flex flex-col items-center py-2 px-3 ${
                  activeTab === tab.key ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <tab.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Post Composer Modal */}
        {showPostComposer && (
          <div className="lg:hidden fixed inset-0 bg-background z-50 p-4">
            <PostComposer onClose={() => setShowPostComposer(false)} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}