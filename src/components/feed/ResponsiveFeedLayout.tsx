import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useRealTrendingTopics } from '@/hooks/useRealTrendingTopics';
import { useRealSuggestedFollows } from '@/hooks/useRealSuggestedFollows';
import { useFollowUser } from '@/hooks/useEnhancedPostInteractions';
import { FEED_ALGORITHMS, FeedAlgorithm } from '@/hooks/useFeedAlgorithm';
import {
  TrendingUp,
  UserPlus,
  Globe,
  Calendar,
  Vote,
  Hash,
  Building2,
  School,
  Hospital,
  Users,
  Menu,
  X,
  Home,
  Settings,
  Bell,
  Search,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ResponsiveFeedLayoutProps {
  children: React.ReactNode;
  selectedAlgorithm?: FeedAlgorithm;
  onAlgorithmChange?: (algorithm: FeedAlgorithm) => void;
}

export const ResponsiveFeedLayout: React.FC<ResponsiveFeedLayoutProps> = ({
  children,
  selectedAlgorithm = 'recommended',
  onAlgorithmChange,
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: trendingTopics, isLoading: loadingTrending } = useRealTrendingTopics();
  const { data: suggestedFollows, isLoading: loadingSuggestions } = useRealSuggestedFollows();
  const followMutation = useFollowUser();

  const handleFollow = (userId: string, isFollowing: boolean) => {
    followMutation.mutate({ targetUserId: userId, isFollowing });
  };

  const LeftSidebar = () => (
    <div className="space-y-6">
      {/* Navigation */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <nav className="space-y-1">
            <Button
              variant="default"
              className="w-full justify-start hover:scale-105 transition-transform"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4 mr-3" />
              Home Feed
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:scale-105 transition-transform"
              onClick={() => {
                navigate('/polls');
                setMobileMenuOpen(false);
              }}
            >
              <Vote className="h-4 w-4 mr-3" />
              Active Polls
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:scale-105 transition-transform"
              onClick={() => {
                navigate('/politicians');
                setMobileMenuOpen(false);
              }}
            >
              <Users className="h-4 w-4 mr-3" />
              Politicians
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:scale-105 transition-transform"
              onClick={() => {
                navigate('/villages');
                setMobileMenuOpen(false);
              }}
            >
              <Globe className="h-4 w-4 mr-3" />
              Villages
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:scale-105 transition-transform"
              onClick={() => {
                navigate('/events');
                setMobileMenuOpen(false);
              }}
            >
              <Calendar className="h-4 w-4 mr-3" />
              Events
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:scale-105 transition-transform"
              onClick={() => {
                navigate('/hospitals');
                setMobileMenuOpen(false);
              }}
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
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent('#' + topic.name)}`);
                  setMobileMenuOpen(false);
                }}
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
  );

  const RightSidebar = () => (
    <div className="space-y-6">
      {/* Feed Algorithm Selector */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Feed Algorithm</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAlgorithm} onValueChange={onAlgorithmChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FEED_ALGORITHMS.map((algorithm) => (
                <SelectItem key={algorithm.type} value={algorithm.type}>
                  <div className="flex items-center gap-2">
                    <span>{algorithm.icon}</span>
                    <div>
                      <div className="font-medium">{algorithm.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {algorithm.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Suggested Follows */}
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
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <Avatar 
                  className="h-12 w-12 ring-2 ring-background cursor-pointer"
                  onClick={() => {
                    if (suggestion.username !== 'system') {
                      navigate(`/profile/${suggestion.username}`);
                      setMobileMenuOpen(false);
                    }
                  }}
                >
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2 w-full hover:scale-105 transition-transform"
                    onClick={() => handleFollow(suggestion.id, false)}
                    disabled={followMutation.isPending}
                  >
                    Follow
                  </Button>
                </div>
              </div>
            )) || []
          )}
        </CardContent>
      </Card>

      {/* Civic Stats */}
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
              onClick={() => {
                navigate('/events');
                setMobileMenuOpen(false);
              }}
            >
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              Browse Events
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:scale-105 transition-transform"
              onClick={() => {
                navigate('/villages');
                setMobileMenuOpen(false);
              }}
            >
              <Globe className="h-4 w-4 mr-2 text-green-500" />
              Explore Villages
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:scale-105 transition-transform"
              onClick={() => {
                navigate('/polls');
                setMobileMenuOpen(false);
              }}
            >
              <Vote className="h-4 w-4 mr-2 text-purple-500" />
              Active Polls
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <LeftSidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Mobile Menu */}
          <div className="lg:hidden mb-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4 mr-2" />
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>CamerPulse Menu</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full mt-6">
                  <LeftSidebar />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>

          {children}
        </div>

        {/* Desktop Right Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};