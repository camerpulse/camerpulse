import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostComposer } from '@/components/feed/PostComposer';
import { InfinitePostFeed } from '@/components/feed/InfinitePostFeed';
import { useRealTrendingTopics } from '@/hooks/useRealTrendingTopics';
import { useRealSuggestedFollows } from '@/hooks/useRealSuggestedFollows';
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


export default function Feed() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showPostComposer, setShowPostComposer] = useState(false);

  // Get real data from database
  const { data: trendingTopics, isLoading: loadingTrending } = useRealTrendingTopics();
  const { data: suggestedFollows, isLoading: loadingSuggestions } = useRealSuggestedFollows();


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
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4" />
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
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    <Button
                      variant={activeTab === 'home' ? 'default' : 'ghost'}
                      className="w-full justify-start hover:scale-105 transition-transform"
                      onClick={() => setActiveTab('home')}
                    >
                      <Home className="h-4 w-4 mr-3" />
                      Home Feed
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:scale-105 transition-transform"
                      onClick={() => navigate('/polls')}
                    >
                      <Vote className="h-4 w-4 mr-3" />
                      Active Polls
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:scale-105 transition-transform"
                      onClick={() => navigate('/politicians')}
                    >
                      <Users className="h-4 w-4 mr-3" />
                      Politicians
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:scale-105 transition-transform"
                      onClick={() => navigate('/villages')}
                    >
                      <Globe className="h-4 w-4 mr-3" />
                      Villages
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:scale-105 transition-transform"
                      onClick={() => navigate('/events')}
                    >
                      <Calendar className="h-4 w-4 mr-3" />
                      Events
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:scale-105 transition-transform"
                      onClick={() => navigate('/hospitals')}
                    >
                      <Hospital className="h-4 w-4 mr-3" />
                      Hospitals
                    </Button>
                  </nav>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    Trending in Cameroon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loadingTrending ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse p-2">
                          <div className="h-4 w-3/4 bg-muted rounded mb-1" />
                          <div className="h-3 w-1/2 bg-muted rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    trendingTopics?.map((topic, index) => (
                      <div 
                        key={topic.name} 
                        className="cursor-pointer hover:bg-primary/5 p-3 rounded-lg transition-colors border hover:border-primary/20"
                        onClick={() => navigate(`/search?q=${encodeURIComponent('#' + topic.name)}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">#{topic.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {topic.count.toLocaleString()} mentions
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <Badge variant="outline" className="text-xs mb-1">
                              #{index + 1}
                            </Badge>
                            <p className={`text-xs font-medium ${
                              topic.change.startsWith('+') ? 'text-green-600' : 
                              topic.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {topic.change}
                            </p>
                          </div>
                        </div>
                      </div>
                      )) || []
                    )}
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
              <InfinitePostFeed />
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
              {/* Who to Follow */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-500" />
                    Suggested Follows
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingSuggestions ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="h-12 w-12 bg-muted rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-3/4 bg-muted rounded" />
                            <div className="h-3 w-1/2 bg-muted rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    suggestedFollows?.map((suggestion) => (
                      <div 
                        key={suggestion.id} 
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => suggestion.username !== 'system' && navigate(`/profile/${suggestion.username}`)}
                      >
                        <Avatar className="h-12 w-12 ring-2 ring-background">
                          <AvatarImage src={suggestion.avatar_url} />
                          <AvatarFallback className="bg-primary/10">
                            {suggestion.type === 'government' && <Building2 className="h-4 w-4" />}
                            {suggestion.type === 'education' && <School className="h-4 w-4" />}  
                            {suggestion.type === 'ngo' && <Users className="h-4 w-4" />}
                            {suggestion.type === 'hospital' && <Hospital className="h-4 w-4" />}
                            {(!suggestion.type || suggestion.type === 'verified' || suggestion.type === 'official') && 
                              suggestion.name.charAt(0)
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <p className="text-sm font-medium truncate">{suggestion.name}</p>
                            {suggestion.verified && (
                              <Badge variant="secondary" className="text-xs px-1.5 bg-blue-100 text-blue-800">✓</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">@{suggestion.username}</p>
                          {suggestion.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{suggestion.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="shrink-0 hover:scale-105 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement follow functionality
                            console.log('Follow:', suggestion.username);
                          }}
                        >
                          Follow
                        </Button>
                      </div>
                      )) || []
                    )}
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

                {/* Civic Engagement Stats */}
                <Card className="shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Civic Pulse Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">78%</p>
                      <p className="text-sm text-muted-foreground">Civic Engagement</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-background/30 rounded-lg">
                        <p className="text-lg font-semibold text-foreground">1.3M</p>
                        <p className="text-xs text-muted-foreground">Active Users</p>
                      </div>
                      <div className="text-center p-3 bg-background/30 rounded-lg">
                        <p className="text-lg font-semibold text-foreground">459</p>
                        <p className="text-xs text-muted-foreground">Live Events</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start hover:scale-105 transition-transform"
                        onClick={() => navigate('/events')}
                      >
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        Browse Events
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start hover:scale-105 transition-transform"
                        onClick={() => navigate('/villages')}
                      >
                        <Globe className="h-4 w-4 mr-2 text-green-500" />
                        Explore Villages
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start hover:scale-105 transition-transform"
                        onClick={() => navigate('/polls')}
                      >
                        <Vote className="h-4 w-4 mr-2 text-purple-500" />
                        Active Polls
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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