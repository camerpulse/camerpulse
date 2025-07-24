import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  Users,
  MapPin,
  Building2,
  TrendingUp,
  Heart,
  Star,
  Award,
  Shield,
  Vote,
  FileText,
  Search,
  Filter,
  Clock,
  MessageSquare,
  Eye,
  ThumbsUp,
  Calendar,
  Briefcase
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'village' | 'civic' | 'tender' | 'job' | 'rating' | 'comment';
  title: string;
  description: string;
  user: string;
  location: string;
  timestamp: string;
  engagement: {
    views: number;
    likes: number;
    comments: number;
  };
  category: string;
}

const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [loading, setLoading] = useState(true);

  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'village',
      title: 'New Village Profile Created',
      description: 'Bamenda Village profile was updated with new infrastructure photos and community projects.',
      user: 'Marie Nkomo',
      location: 'Bamenda, Northwest Region',
      timestamp: '2 hours ago',
      engagement: { views: 124, likes: 23, comments: 5 },
      category: 'Community'
    },
    {
      id: '2',
      type: 'civic',
      title: 'Mayor Rating Updated',
      description: 'New rating submitted for Mayor of Yaoundé 3rd with detailed feedback on road improvements.',
      user: 'Jean Fouda',
      location: 'Yaoundé 3rd, Centre Region',
      timestamp: '4 hours ago',
      engagement: { views: 89, likes: 12, comments: 8 },
      category: 'Governance'
    },
    {
      id: '3',
      type: 'tender',
      title: 'New Government Tender Published',
      description: 'Road construction project for Douala-Bafoussam highway now accepting bids.',
      user: 'Ministry of Public Works',
      location: 'Douala, Littoral Region',
      timestamp: '6 hours ago',
      engagement: { views: 456, likes: 67, comments: 23 },
      category: 'Infrastructure'
    },
    {
      id: '4',
      type: 'job',
      title: 'New Job Opportunity',
      description: 'Software Engineer position at MTN Cameroon with competitive salary and benefits.',
      user: 'MTN Cameroon',
      location: 'Douala, Littoral Region',
      timestamp: '8 hours ago',
      engagement: { views: 234, likes: 45, comments: 12 },
      category: 'Employment'
    },
    {
      id: '5',
      type: 'rating',
      title: 'Hospital Rating',
      description: 'Comprehensive review of Hôpital Général de Douala focusing on emergency services.',
      user: 'Dr. Paul Atangana',
      location: 'Douala, Littoral Region',
      timestamp: '1 day ago',
      engagement: { views: 167, likes: 34, comments: 15 },
      category: 'Healthcare'
    },
    {
      id: '6',
      type: 'comment',
      title: 'Community Discussion',
      description: 'Active discussion on improving education infrastructure in rural villages.',
      user: 'Community Forum',
      location: 'Multiple Regions',
      timestamp: '2 days ago',
      engagement: { views: 89, likes: 19, comments: 28 },
      category: 'Education'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities(mockActivities);
      setFilteredActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = activities;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType);
    }

    setFilteredActivities(filtered);
  }, [activities, searchQuery, selectedType]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'village': return Users;
      case 'civic': return Vote;
      case 'tender': return FileText;
      case 'job': return Briefcase;
      case 'rating': return Star;
      case 'comment': return MessageSquare;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'village': return 'text-primary';
      case 'civic': return 'text-accent';
      case 'tender': return 'text-secondary';
      case 'job': return 'text-blue-600';
      case 'rating': return 'text-yellow-600';
      case 'comment': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'village': return 'Village';
      case 'civic': return 'Civic';
      case 'tender': return 'Tender';
      case 'job': return 'Job';
      case 'rating': return 'Rating';
      case 'comment': return 'Discussion';
      default: return 'Activity';
    }
  };

  const activityTypes = [
    { value: 'all', label: 'All Activity' },
    { value: 'village', label: 'Villages' },
    { value: 'civic', label: 'Civic' },
    { value: 'tender', label: 'Tenders' },
    { value: 'job', label: 'Jobs' },
    { value: 'rating', label: 'Ratings' },
    { value: 'comment', label: 'Discussions' }
  ];

  const timeframes = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  const stats = [
    { label: 'Total Activities', value: '12.5K', icon: Activity },
    { label: 'Active Users', value: '2.8K', icon: Users },
    { label: 'Discussions', value: '856', icon: MessageSquare },
    { label: 'Engagements', value: '45.2K', icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Platform Activity
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Stay updated with real-time activities across the CamerPulse ecosystem. 
              See what's happening in villages, governance, jobs, and community discussions.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white text-gray-900"
              />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map(timeframe => (
                    <SelectItem key={timeframe.value} value={timeframe.value}>
                      {timeframe.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed">Activity Feed</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="my-activity">My Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Recent Activity ({filteredActivities.length})
              </h2>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                      <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  const iconColor = getActivityColor(activity.type);
                  
                  return (
                    <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${iconColor}`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {getTypeLabel(activity.type)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {activity.timestamp}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
                            <p className="text-muted-foreground mb-3">{activity.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {activity.user}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {activity.location}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {activity.engagement.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {activity.engagement.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {activity.engagement.comments}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {!loading && filteredActivities.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No activities found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trending">
            <Card>
              <CardHeader>
                <CardTitle>Trending Activities</CardTitle>
                <CardDescription>
                  Most popular activities in the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Trending content will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-activity">
            <Card>
              <CardHeader>
                <CardTitle>My Activity</CardTitle>
                <CardDescription>
                  Your recent contributions and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Your activity history will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ActivityPage;