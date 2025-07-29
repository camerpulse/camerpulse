/**
 * TrendingSidebar Component
 * 
 * Right sidebar for trending content and civic stats
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserAvatar } from './UserAvatar';
import { CivicTag } from './CivicTag';
import { 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Calendar, 
  Users, 
  Vote, 
  Heart, 
  MessageCircle,
  Share2,
  ExternalLink,
  MapPin,
  Clock,
  Zap
} from 'lucide-react';
import type { Pulse, Official } from './types';

interface TrendingItem {
  id: string;
  title: string;
  description?: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

interface CivicStat {
  label: string;
  value: string | number;
  description: string;
  color?: string;
  icon?: React.ElementType;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location?: string;
  type: 'election' | 'assembly' | 'meeting' | 'other';
}

interface TrendingSidebarProps {
  trendingPosts?: Pulse[];
  trendingTopics?: TrendingItem[];
  civicStats?: CivicStat[];
  upcomingEvents?: UpcomingEvent[];
  featuredOfficials?: Official[];
  className?: string;
}

const defaultCivicStats: CivicStat[] = [
  { 
    label: 'Youth Democracy Belief', 
    value: '72%', 
    description: 'believe in democratic process',
    color: 'text-cm-green',
    icon: Vote
  },
  { 
    label: 'Active Voters', 
    value: '1.2M', 
    description: 'registered on platform',
    color: 'text-cm-yellow',
    icon: Users
  },
  { 
    label: 'Live Polls', 
    value: '345', 
    description: 'currently active',
    color: 'text-cm-red',
    icon: BarChart3
  }
];

const defaultTrendingTopics: TrendingItem[] = [
  { id: '1', title: 'Infrastructure', count: 1247, trend: 'up', category: 'Government' },
  { id: '2', title: 'Education', count: 892, trend: 'up', category: 'Social' },
  { id: '3', title: 'Healthcare', count: 634, trend: 'stable', category: 'Social' },
  { id: '4', title: 'Economy', count: 521, trend: 'down', category: 'Economic' },
  { id: '5', title: 'Security', count: 387, trend: 'up', category: 'Safety' }
];

const defaultUpcomingEvents: UpcomingEvent[] = [
  { 
    id: '1', 
    title: 'National Assembly Session', 
    date: 'Tomorrow, 10:00 AM',
    location: 'Yaoundé',
    type: 'assembly' 
  },
  { 
    id: '2', 
    title: 'Municipal Elections', 
    date: 'Next month',
    type: 'election' 
  },
  { 
    id: '3', 
    title: 'Town Hall Meeting', 
    date: 'Dec 20, 2024',
    location: 'Douala',
    type: 'meeting' 
  }
];

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  trendingPosts = [],
  trendingTopics = defaultTrendingTopics,
  civicStats = defaultCivicStats,
  upcomingEvents = defaultUpcomingEvents,
  featuredOfficials = [],
  className = ''
}) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'election': return Vote;
      case 'assembly': return Users;
      case 'meeting': return MessageCircle;
      default: return Calendar;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Civic Pulse Stats */}
      <Card className="border-cm-green/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-cm-green" />
            Civic Pulse Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main featured stat */}
          <div className="text-center p-4 bg-gradient-civic/10 rounded-lg border border-cm-green/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-cm-green" />
              <span className="text-2xl font-bold text-cm-green">72%</span>
            </div>
            <p className="text-xs text-muted-foreground">of youth believe in democracy</p>
          </div>
          
          {/* Grid stats */}
          <div className="grid grid-cols-2 gap-3">
            {civicStats.slice(1).map((stat, index) => {
              const IconComponent = stat.icon || BarChart3;
              return (
                <div key={index} className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <IconComponent className={`w-4 h-4 ${stat.color}`} />
                    <span className={`text-sm font-semibold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="border-cm-yellow/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cm-yellow" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.slice(0, 5).map((topic, index) => (
            <div key={topic.id} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded cursor-pointer">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{getTrendIcon(topic.trend)}</span>
                  <p className="text-sm font-medium">#{topic.title}</p>
                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{topic.count.toLocaleString()} discussions</p>
                  <Badge variant="outline" className="text-xs">
                    {topic.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2">
            View All Trends
          </Button>
        </CardContent>
      </Card>

      {/* Trending Posts */}
      {trendingPosts.length > 0 && (
        <Card className="border-cm-red/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cm-red" />
              Trending Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="p-3 hover:bg-muted/50 rounded cursor-pointer border border-border/50">
                <div className="flex items-start gap-2 mb-2">
                  <UserAvatar user={post.user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{post.user.name}</p>
                    <p className="text-xs text-muted-foreground">@{post.user.username}</p>
                  </div>
                </div>
                <p className="text-xs line-clamp-2 mb-2">{post.content}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    <span>{post.shares}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.slice(0, 3).map((event) => {
            const EventIcon = getEventIcon(event.type);
            return (
              <div key={event.id} className="p-3 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-2">
                  <EventIcon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{event.location}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
          <Button variant="outline" size="sm" className="w-full">
            View All Events
          </Button>
        </CardContent>
      </Card>

      {/* Featured Officials */}
      {featuredOfficials.length > 0 && (
        <Card className="border-cm-green/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-cm-green" />
              Featured Officials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredOfficials.slice(0, 2).map((official) => (
              <div key={official.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <UserAvatar user={official} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{official.name}</p>
                    <p className="text-xs text-muted-foreground">{official.role}</p>
                  </div>
                  <CivicTag type="official" label="Official" size="sm" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Approval Rating</span>
                    <span className="font-medium">{official.approvalRating}%</span>
                  </div>
                  <Progress value={official.approvalRating} className="h-1" />
                  <div className="flex justify-between text-xs">
                    <span>Civic Score</span>
                    <span className="font-medium">{official.civicScore}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};