import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Vote, 
  Shield, 
  BarChart3, 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Lock, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Globe
} from 'lucide-react';

const EnhancedPolls = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const featuredPolls = [
    {
      id: 1,
      title: 'Healthcare System Reform in Cameroon',
      description: 'Should the government prioritize universal healthcare coverage?',
      totalVotes: 15420,
      timeLeft: '2 days',
      securityLevel: 'verified_only',
      region: 'National',
      demographic: 'All Adults',
      confidence: 92,
      participation: 78,
      trending: true
    },
    {
      id: 2,
      title: 'Public Transportation Infrastructure',
      description: 'Priority areas for new transport development in major cities',
      totalVotes: 8930,
      timeLeft: '5 days',
      securityLevel: 'open',
      region: 'Urban Areas',
      demographic: 'Working Adults',
      confidence: 85,
      participation: 65,
      trending: false
    },
    {
      id: 3,
      title: 'Education Budget Allocation 2025',
      description: 'How should education funds be distributed across regions?',
      totalVotes: 12150,
      timeLeft: '1 week',
      securityLevel: 'region_limited',
      region: 'All Regions',
      demographic: 'Parents & Educators',
      confidence: 88,
      participation: 72,
      trending: true
    }
  ];

  const pollCategories = [
    { id: 'all', label: 'All Polls', count: 143 },
    { id: 'governance', label: 'Governance', count: 45 },
    { id: 'infrastructure', label: 'Infrastructure', count: 32 },
    { id: 'education', label: 'Education', count: 28 },
    { id: 'healthcare', label: 'Healthcare', count: 23 },
    { id: 'environment', label: 'Environment', count: 15 }
  ];

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'verified_only': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'region_limited': return <Lock className="w-4 h-4 text-orange-500" />;
      case 'open': return <Globe className="w-4 h-4 text-green-500" />;
      default: return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSecurityLabel = (level: string) => {
    switch (level) {
      case 'verified_only': return 'Verified Only';
      case 'region_limited': return 'Region Limited';
      case 'open': return 'Open to All';
      default: return 'Unknown';
    }
  };

  const PollCard = ({ poll }: { poll: any }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {poll.trending && (
                <Badge className="bg-red-500 hover:bg-red-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center space-x-1">
                {getSecurityIcon(poll.securityLevel)}
                <span>{getSecurityLabel(poll.securityLevel)}</span>
              </Badge>
            </div>
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {poll.title}
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              {poll.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Poll Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Votes</div>
              <div className="text-lg font-semibold">{poll.totalVotes.toLocaleString()}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Time Left</div>
              <div className="text-lg font-semibold">{poll.timeLeft}</div>
            </div>
          </div>

          {/* Analytics Preview */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confidence Score</span>
              <span className="font-medium">{poll.confidence}%</span>
            </div>
            <Progress value={poll.confidence} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Participation Rate</span>
              <span className="font-medium">{poll.participation}%</span>
            </div>
            <Progress value={poll.participation} className="h-2" />
          </div>

          {/* Region and Demographic */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="bg-muted px-2 py-1 rounded">📍 {poll.region}</span>
            <span className="bg-muted px-2 py-1 rounded">👥 {poll.demographic}</span>
          </div>

          <div className="flex space-x-2">
            <Button className="flex-1">Vote Now</Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Vote className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Enhanced Polling System</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced polling with real-time analytics, verified participation, and demographic insights
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold">Verified Voting</div>
              <div className="text-sm text-muted-foreground">Secure participant verification</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold">Advanced Analytics</div>
              <div className="text-sm text-muted-foreground">Real-time insights & trends</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="font-semibold">Demographic Targeting</div>
              <div className="text-sm text-muted-foreground">Specific audience polling</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="font-semibold">Quality Assurance</div>
              <div className="text-sm text-muted-foreground">AI-powered validation</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <TabsList className="w-fit">
              <TabsTrigger value="active">Active Polls</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search polls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button>
                <Vote className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {pollCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedFilter === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(category.id)}
                className="h-8"
              >
                {category.label} ({category.count})
              </Button>
            ))}
          </div>

          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredPolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Polls</h3>
                <p className="text-muted-foreground">Check back later for scheduled polls.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Completed Polls Archive</h3>
                <p className="text-muted-foreground mb-4">
                  View results and analytics from past polls.
                </p>
                <Button variant="outline">Browse Archive</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedPolls;