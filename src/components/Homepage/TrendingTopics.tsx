import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Users2, 
  GraduationCap, 
  Building, 
  Heart,
  ArrowUpRight,
  Clock,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Topic {
  id: string;
  title: string;
  category: string;
  engagements: string;
  trend: 'rising' | 'falling' | 'stable';
  trendPercentage: number;
  timeframe: string;
  participants: number;
  region: string;
  hashtag: string;
  type: 'petition' | 'poll' | 'discussion' | 'news';
}

const mockTopics: Topic[] = [
  {
    id: '1',
    title: '2024 National Budget Allocation Transparency',
    category: 'Economy',
    engagements: '12.4K',
    trend: 'rising',
    trendPercentage: 89,
    timeframe: '2 hours',
    participants: 12400,
    region: 'National',
    hashtag: '#BudgetTransparency2024',
    type: 'discussion'
  },
  {
    id: '2',
    title: 'Youth Employment Crisis Solutions',
    category: 'Social',
    engagements: '8.7K',
    trend: 'rising',
    trendPercentage: 156,
    timeframe: '4 hours',
    participants: 8700,
    region: 'Littoral',
    hashtag: '#YouthJobsCM',
    type: 'petition'
  },
  {
    id: '3',
    title: 'Educational Infrastructure Reform Bill',
    category: 'Education',
    engagements: '6.2K',
    trend: 'rising',
    trendPercentage: 73,
    timeframe: '6 hours',
    participants: 6200,
    region: 'Centre',
    hashtag: '#EducationReform',
    type: 'poll'
  },
  {
    id: '4',
    title: 'Rural Healthcare Access Initiative',
    category: 'Healthcare',
    engagements: '4.9K',
    trend: 'stable',
    trendPercentage: 12,
    timeframe: '8 hours',
    participants: 4900,
    region: 'Far North',
    hashtag: '#HealthForAll',
    type: 'petition'
  },
  {
    id: '5',
    title: 'Infrastructure Development in Bamenda',
    category: 'Development',
    engagements: '3.8K',
    trend: 'falling',
    trendPercentage: -23,
    timeframe: '12 hours',
    participants: 3800,
    region: 'North West',
    hashtag: '#BamendaDev',
    type: 'discussion'
  },
  {
    id: '6',
    title: 'Environmental Protection Policies',
    category: 'Environment',
    engagements: '5.1K',
    trend: 'rising',
    trendPercentage: 45,
    timeframe: '5 hours',
    participants: 5100,
    region: 'East',
    hashtag: '#GreenCameroon',
    type: 'poll'
  }
];

const getTrendIcon = (trend: Topic['trend']) => {
  switch (trend) {
    case 'rising': return TrendingUp;
    case 'falling': return TrendingDown;
    default: return Clock;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Education': return GraduationCap;
    case 'Development': return Building;
    case 'Healthcare': return Heart;
    case 'Social': return Users2;
    default: return MessageCircle;
  }
};

const getTrendColor = (trend: Topic['trend']) => {
  switch (trend) {
    case 'rising': return 'text-green-500';
    case 'falling': return 'text-red-500';
    default: return 'text-muted-foreground';
  }
};

const getTypeColor = (type: Topic['type']) => {
  switch (type) {
    case 'petition': return 'bg-accent/10 text-accent';
    case 'poll': return 'bg-primary/10 text-primary';
    case 'discussion': return 'bg-secondary/10 text-secondary';
    case 'news': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const TopicCard: React.FC<{ topic: Topic; index: number }> = ({ topic, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const TrendIcon = getTrendIcon(topic.trend);
  const CategoryIcon = getCategoryIcon(topic.category);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Card 
      className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-0 bg-gradient-to-br from-card to-muted/20 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CategoryIcon className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="text-xs">
              {topic.category}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            <TrendIcon className={`h-4 w-4 ${getTrendColor(topic.trend)}`} />
            <span className={`text-sm font-semibold ${getTrendColor(topic.trend)}`}>
              {topic.trendPercentage > 0 ? '+' : ''}{topic.trendPercentage}%
            </span>
          </div>
        </div>

        <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {topic.title}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(topic.type)}`}>
              {topic.type.charAt(0).toUpperCase() + topic.type.slice(1)}
            </span>
            <Badge variant="outline" className="text-xs">
              {topic.region}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Users2 className="h-3 w-3 mr-1" />
                {topic.engagements}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {topic.timeframe}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-muted">
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-mono">
                {topic.hashtag}
              </span>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                >
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                >
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TrendingTopics: React.FC = () => {
  console.log('TrendingTopics rendering...');
  const [topics, setTopics] = useState(mockTopics);
  const [activeFilter, setActiveFilter] = useState<'all' | 'rising' | 'hot'>('all');

  const filters = [
    { key: 'all', label: 'All Topics', icon: MessageCircle },
    { key: 'rising', label: 'Rising', icon: TrendingUp },
    { key: 'hot', label: 'Hot', icon: Flame }
  ];

  const filteredTopics = topics.filter(topic => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'rising') return topic.trend === 'rising';
    if (activeFilter === 'hot') return topic.trendPercentage > 50;
    return true;
  });

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Flame className="h-10 w-10 mr-4 text-accent animate-pulse" />
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Trending Now
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hot topics and trending discussions shaping Cameroon's future
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-2 p-1 bg-muted/50 rounded-xl backdrop-blur-sm">
            {filters.map(filter => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? 'default' : 'ghost'}
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeFilter === filter.key 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => setActiveFilter(filter.key as any)}
              >
                <filter.icon className="h-4 w-4 mr-2" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTopics.map((topic, index) => (
            <TopicCard key={topic.id} topic={topic} index={index} />
          ))}
        </div>

        {/* View More */}
        <div className="text-center mt-12">
          <Link to="/civic-feed">
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-3 text-lg font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            >
              Explore All Discussions
              <ArrowUpRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};