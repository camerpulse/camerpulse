import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown,
  MessageSquare, 
  Search, 
  Filter,
  Eye,
  Globe,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const SentimentAnalysis = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const overallSentiment = {
    positive: 58.3,
    negative: 24.7,
    neutral: 17.0,
    totalMentions: 1847,
    trend: 'positive',
    change: '+5.2%'
  };

  const topicSentiments = [
    {
      topic: 'Healthcare Reform',
      positive: 65.2,
      negative: 19.8,
      neutral: 15.0,
      totalMentions: 245,
      trend: 'positive',
      change: '+8.3%',
      keyPhrases: ['universal healthcare', 'rural access', 'quality improvement'],
      regions: ['Centre', 'Littoral', 'West']
    },
    {
      topic: 'Education Budget',
      positive: 42.1,
      negative: 38.9,
      neutral: 19.0,
      totalMentions: 189,
      trend: 'negative',
      change: '-12.1%',
      keyPhrases: ['teacher salaries', 'infrastructure', 'funding cuts'],
      regions: ['Northwest', 'Southwest', 'Far North']
    },
    {
      topic: 'Infrastructure Development',
      positive: 71.3,
      negative: 15.2,
      neutral: 13.5,
      totalMentions: 156,
      trend: 'positive',
      change: '+15.7%',
      keyPhrases: ['road construction', 'rural connectivity', 'job creation'],
      regions: ['East', 'Adamawa', 'North']
    },
    {
      topic: 'Digital Governance',
      positive: 55.6,
      negative: 28.4,
      neutral: 16.0,
      totalMentions: 134,
      trend: 'neutral',
      change: '+2.1%',
      keyPhrases: ['e-services', 'transparency', 'accessibility'],
      regions: ['Centre', 'Littoral']
    }
  ];

  const emotionAnalysis = [
    { emotion: 'Joy', percentage: 32.1, color: 'bg-yellow-500' },
    { emotion: 'Trust', percentage: 28.7, color: 'bg-blue-500' },
    { emotion: 'Concern', percentage: 18.9, color: 'bg-orange-500' },
    { emotion: 'Anger', percentage: 12.3, color: 'bg-red-500' },
    { emotion: 'Fear', percentage: 5.2, color: 'bg-purple-500' },
    { emotion: 'Surprise', percentage: 2.8, color: 'bg-green-500' }
  ];

  const sentimentSources = [
    { source: 'Social Media', percentage: 45.2, mentions: 834, sentiment: 'mixed' },
    { source: 'News Comments', percentage: 28.7, mentions: 530, sentiment: 'negative' },
    { source: 'Forum Posts', percentage: 15.6, mentions: 288, sentiment: 'positive' },
    { source: 'Poll Comments', percentage: 10.5, mentions: 195, sentiment: 'positive' }
  ];

  const geographicSentiment = [
    { region: 'Centre', positive: 62.3, negative: 22.1, mentions: 312 },
    { region: 'Littoral', positive: 58.7, negative: 25.4, mentions: 289 },
    { region: 'West', positive: 55.2, negative: 28.9, mentions: 234 },
    { region: 'Northwest', positive: 48.6, negative: 35.7, mentions: 198 },
    { region: 'Southwest', positive: 46.8, negative: 38.2, mentions: 187 },
    { region: 'North', positive: 53.4, negative: 31.2, mentions: 176 },
    { region: 'East', positive: 59.1, negative: 24.6, mentions: 165 },
    { region: 'Adamawa', positive: 51.7, negative: 33.8, mentions: 143 },
    { region: 'South', positive: 57.3, negative: 26.4, mentions: 132 },
    { region: 'Far North', positive: 49.2, negative: 36.1, mentions: 111 }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (positive: number, negative: number) => {
    if (positive > negative + 10) return 'text-green-600';
    if (negative > positive + 10) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Sentiment Analysis</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time public sentiment tracking across civic topics and regions
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search topics, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <div className="flex gap-2">
            {['24h', '7d', '30d', '90d'].map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>

        {/* Overall Sentiment Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Overall Public Sentiment
            </CardTitle>
            <CardDescription>
              Aggregated sentiment across all civic topics and sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Positive</span>
                  <span className="text-2xl font-bold text-green-600">{overallSentiment.positive}%</span>
                </div>
                <Progress value={overallSentiment.positive} className="h-3 bg-green-100" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Negative</span>
                  <span className="text-2xl font-bold text-red-600">{overallSentiment.negative}%</span>
                </div>
                <Progress value={overallSentiment.negative} className="h-3 bg-red-100" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Neutral</span>
                  <span className="text-2xl font-bold text-gray-600">{overallSentiment.neutral}%</span>
                </div>
                <Progress value={overallSentiment.neutral} className="h-3 bg-gray-100" />
              </div>
              
              <div className="space-y-3">
                <div className="text-sm font-medium">Total Mentions</div>
                <div className="text-2xl font-bold">{overallSentiment.totalMentions.toLocaleString()}</div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(overallSentiment.trend)}
                  <span className={`text-sm font-medium ${getSentimentColor(overallSentiment.positive, overallSentiment.negative)}`}>
                    {overallSentiment.change}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="w-fit">
            <TabsTrigger value="topics">By Topics</TabsTrigger>
            <TabsTrigger value="emotions">Emotions</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topicSentiments.map((topic, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{topic.topic}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(topic.trend)}
                        <Badge variant={topic.trend === 'positive' ? 'default' : topic.trend === 'negative' ? 'destructive' : 'secondary'}>
                          {topic.change}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {topic.totalMentions} mentions analyzed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sentiment Distribution */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Positive: {topic.positive}%</span>
                          <span>Negative: {topic.negative}%</span>
                          <span>Neutral: {topic.neutral}%</span>
                        </div>
                        
                        <div className="w-full bg-muted rounded-full h-3 flex overflow-hidden">
                          <div 
                            className="bg-green-500 h-full"
                            style={{ width: `${topic.positive}%` }}
                          />
                          <div 
                            className="bg-red-500 h-full"
                            style={{ width: `${topic.negative}%` }}
                          />
                          <div 
                            className="bg-gray-400 h-full"
                            style={{ width: `${topic.neutral}%` }}
                          />
                        </div>
                      </div>

                      {/* Key Phrases */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Key Phrases:</div>
                        <div className="flex flex-wrap gap-2">
                          {topic.keyPhrases.map((phrase, phraseIndex) => (
                            <Badge key={phraseIndex} variant="outline" className="text-xs">
                              {phrase}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Top Regions */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Active Regions:</div>
                        <div className="flex flex-wrap gap-2">
                          {topic.regions.map((region, regionIndex) => (
                            <Badge key={regionIndex} variant="secondary" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Detailed Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emotions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Emotion Distribution</CardTitle>
                  <CardDescription>
                    Emotional tone analysis across all civic discussions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emotionAnalysis.map((emotion, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{emotion.emotion}</span>
                          <span className="text-muted-foreground">{emotion.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`${emotion.color} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${emotion.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emotion Trends</CardTitle>
                  <CardDescription>
                    How emotions have changed over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Interactive emotion trend chart would appear here</p>
                      <p className="text-sm mt-2">Tracking emotional patterns over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment by Source</CardTitle>
                <CardDescription>
                  Analysis of sentiment across different information sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sentimentSources.map((source, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{source.source}</div>
                            <div className="text-sm text-muted-foreground">
                              {source.mentions} mentions ({source.percentage}%)
                            </div>
                          </div>
                        </div>
                        <Badge variant={
                          source.sentiment === 'positive' ? 'default' : 
                          source.sentiment === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {source.sentiment}
                        </Badge>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-500" />
                  Regional Sentiment Analysis
                </CardTitle>
                <CardDescription>
                  Sentiment distribution across Cameroon's regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geographicSentiment.map((region, index) => (
                    <div key={index} className="space-y-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{region.region}</div>
                        <div className="text-sm text-muted-foreground">
                          {region.mentions} mentions
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Positive</span>
                          <span className="font-medium text-green-600">{region.positive}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Negative</span>
                          <span className="font-medium text-red-600">{region.negative}%</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2 flex overflow-hidden">
                        <div 
                          className="bg-green-500 h-full"
                          style={{ width: `${region.positive}%` }}
                        />
                        <div 
                          className="bg-red-500 h-full"
                          style={{ width: `${region.negative}%` }}
                        />
                        <div 
                          className="bg-gray-400 h-full"
                          style={{ width: `${100 - region.positive - region.negative}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SentimentAnalysis;