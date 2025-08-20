import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProductionFeed } from '@/hooks/useProductionFeed';
import { useRealTrendingTopics } from '@/hooks/useRealTrendingTopics';
import { useRealSuggestedFollows } from '@/hooks/useRealSuggestedFollows';
import { PostComposer } from '@/components/feed/PostComposer';
import { InfinitePostFeed } from '@/components/feed/InfinitePostFeed';
import {
  RefreshCw,
  TrendingUp,
  UserPlus,
  Globe,
  Calendar,
  Vote,
  Users,
  Building2,
  School,
  Hospital,
  Hash,
} from 'lucide-react';

export default function FeedTest() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Test data loading
  const { data: feedData, isLoading: feedLoading, error: feedError } = useProductionFeed();
  const { data: trending, isLoading: trendingLoading } = useRealTrendingTopics();
  const { data: suggestions, isLoading: suggestionsLoading } = useRealSuggestedFollows();

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Debug Info */}
        <div className="container mx-auto px-4 py-4">
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">Feed Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>User:</strong> {user ? `${user.email} (ID: ${user.id})` : 'Not logged in'}</p>
                  <p><strong>Feed Status:</strong> {feedLoading ? 'Loading...' : feedError ? 'Error' : 'Loaded'}</p>
                  <p><strong>Feed Items:</strong> {feedData?.pages?.reduce((acc, page) => acc + page.items.length, 0) || 0}</p>
                </div>
                <div>
                  <p><strong>Trending:</strong> {trendingLoading ? 'Loading...' : `${trending?.length || 0} topics`}</p>
                  <p><strong>Suggestions:</strong> {suggestionsLoading ? 'Loading...' : `${suggestions?.length || 0} users`}</p>
                  <p><strong>Admin:</strong> {isAdmin() ? 'Yes' : 'No'}</p>
                </div>
              </div>
              {feedError && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700">
                  <strong>Feed Error:</strong> {feedError instanceof Error ? feedError.message : 'Unknown error'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/')}>
                    Home
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/politicians')}>
                    <Users className="h-4 w-4 mr-2" />
                    Politicians
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/villages')}>
                    <Globe className="h-4 w-4 mr-2" />
                    Villages
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/events')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Events
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/polls')}>
                    <Vote className="h-4 w-4 mr-2" />  
                    Polls
                  </Button>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendingLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded mb-1" />
                          <div className="h-3 bg-muted rounded w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {trending?.slice(0, 5).map((topic, idx) => (
                        <div key={topic.name} className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">#{topic.name}</span>
                            <Badge variant="outline" className="text-xs">#{idx + 1}</Badge>
                          </div>
                          <div className="text-muted-foreground">{topic.count} mentions ({topic.change})</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Composer */}
              {user && <PostComposer />}

              {/* Feed */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Latest Updates</h2>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <InfinitePostFeed />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block">
              {/* Suggested Follows */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Suggested
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {suggestionsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-2 animate-pulse">
                          <div className="h-8 w-8 bg-muted rounded-full" />
                          <div className="space-y-1 flex-1">
                            <div className="h-3 bg-muted rounded" />
                            <div className="h-2 bg-muted rounded w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {suggestions?.slice(0, 4).map(suggestion => (
                        <div key={suggestion.id} className="flex items-center gap-2 text-xs">
                          <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                            {suggestion.type === 'government' && <Building2 className="h-3 w-3" />}
                            {suggestion.type === 'education' && <School className="h-3 w-3" />}
                            {suggestion.type === 'hospital' && <Hospital className="h-3 w-3" />}
                            {(!suggestion.type || suggestion.type === 'verified') && suggestion.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{suggestion.name}</div>
                            <div className="text-muted-foreground">@{suggestion.username}</div>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                            Follow
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Posts Today:</span>
                    <span className="font-medium">{feedData?.pages?.[0]?.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trending Topics:</span>
                    <span className="font-medium">{trending?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users:</span>
                    <span className="font-medium">1,234</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}