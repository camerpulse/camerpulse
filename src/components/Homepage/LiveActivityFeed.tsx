import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ChevronRight, 
  Megaphone, 
  Vote, 
  Shield, 
  Users, 
  TrendingUp,
  Clock,
  MapPin,
  Flame,
  Eye
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'petition' | 'poll' | 'transparency' | 'discussion' | 'alert';
  title: string;
  activity: string;
  location: string;
  time: string;
  trend: 'up' | 'stable' | 'hot';
  engagement: number;
  verified: boolean;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'petition',
    title: 'Support Youth Employment Initiative in Douala',
    activity: '1,247 signatures',
    location: 'Littoral Region',
    time: '2 hours ago',
    trend: 'up',
    engagement: 87,
    verified: true
  },
  {
    id: '2',
    type: 'poll',
    title: 'Should Cameroon invest more in renewable energy infrastructure?',
    activity: '3,421 votes',
    location: 'National',
    time: '4 hours ago',
    trend: 'hot',
    engagement: 94,
    verified: true
  },
  {
    id: '3',
    type: 'transparency',
    title: 'Ministry of Health budget transparency update',
    activity: '92% transparency score',
    location: 'Centre Region',
    time: '6 hours ago',
    trend: 'stable',
    engagement: 78,
    verified: true
  },
  {
    id: '4',
    type: 'discussion',
    title: 'Local infrastructure development in Bamenda',
    activity: '234 participants',
    location: 'North West Region',
    time: '8 hours ago',
    trend: 'up',
    engagement: 65,
    verified: false
  }
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'petition': return Megaphone;
    case 'poll': return Vote;
    case 'transparency': return Shield;
    case 'discussion': return Users;
    default: return Activity;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'petition': return 'text-accent';
    case 'poll': return 'text-primary';
    case 'transparency': return 'text-secondary';
    case 'discussion': return 'text-muted-foreground';
    default: return 'text-primary';
  }
};

const getTrendIcon = (trend: ActivityItem['trend']) => {
  switch (trend) {
    case 'hot': return Flame;
    case 'up': return TrendingUp;
    default: return Activity;
  }
};

const LiveActivityItem: React.FC<{ activity: ActivityItem; index: number }> = ({ 
  activity, 
  index 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ActivityIcon = getActivityIcon(activity.type);
  const TrendIcon = getTrendIcon(activity.trend);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 200);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border-l-4 border-l-primary cursor-pointer group transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl bg-muted group-hover:scale-110 transition-transform duration-300 ${getActivityColor(activity.type)}`}>
            <ActivityIcon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {activity.title}
              </h3>
              <div className="flex items-center space-x-1 ml-2">
                {activity.verified && (
                  <Shield className="h-3 w-3 text-primary" />
                )}
                <TrendIcon className={`h-3 w-3 ${
                  activity.trend === 'hot' ? 'text-red-500' : 
                  activity.trend === 'up' ? 'text-green-500' : 'text-muted-foreground'
                }`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">
                {activity.activity}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {activity.location}
                  </span>
                </div>
                
                <Badge 
                  variant="secondary" 
                  className="text-xs flex items-center"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {activity.engagement}% engaged
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const LiveActivityFeed: React.FC = () => {
  console.log('LiveActivityFeed rendering...');
  const [activities, setActivities] = useState(mockActivities);
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setActivities(prev => {
        const updated = prev.map(activity => ({
          ...activity,
          engagement: Math.min(100, activity.engagement + Math.floor(Math.random() * 3))
        }));
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <section className="py-16 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Activity className="h-7 w-7 text-primary" />
                <h2 className="text-3xl font-bold">Live Activity</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}></div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {isLive ? 'LIVE' : 'PAUSED'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-lg">
              Real-time civic engagement across Cameroon
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="hidden sm:flex"
            >
              {isLive ? 'Pause' : 'Resume'} Live Feed
            </Button>
            <Link to="/civic-feed">
              <Button variant="outline" className="group">
                View All
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity, index) => (
            <LiveActivityItem 
              key={activity.id} 
              activity={activity} 
              index={index}
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Now', value: '12.4K', icon: Users },
            { label: 'Today\'s Polls', value: '847', icon: Vote },
            { label: 'New Petitions', value: '23', icon: Megaphone },
            { label: 'Transparency Updates', value: '156', icon: Shield }
          ].map((stat, index) => (
            <Card key={index} className="text-center border-0 bg-gradient-to-br from-card to-muted/30">
              <CardContent className="p-4">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};