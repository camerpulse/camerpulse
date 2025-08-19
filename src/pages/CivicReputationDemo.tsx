import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CivicDashboard, 
  CivicLeaderboard, 
  RatingSystem, 
  ReputationCard, 
  AdminReputationTools 
} from '@/components/civic-reputation';
import { 
  Shield, 
  Award, 
  Star, 
  Users, 
  Settings,
  BarChart3,
  MessageSquare
} from 'lucide-react';

const CivicReputationDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState('dashboard');

  const demoEntities = [
    {
      id: '1',
      type: 'ministry' as const,
      name: 'Ministry of Health',
      description: 'National health ministry responsible for healthcare policy and services'
    },
    {
      id: '2',
      type: 'politician' as const,
      name: 'Hon. Jean Mballa',
      description: 'Member of Parliament representing Yaounde 4th constituency'
    },
    {
      id: '3',
      type: 'government_agency' as const,
      name: 'Yaounde Central Hospital',
      description: 'Major public hospital serving the capital region'
    }
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Real-time Scoring',
      description: 'Dynamic reputation scores based on transparency, performance, citizen ratings, and engagement metrics'
    },
    {
      icon: Award,
      title: 'Reputation Badges',
      description: 'Visual badges ranging from Excellent to Flagged based on overall performance'
    },
    {
      icon: Users,
      title: 'Citizen Participation',
      description: 'Direct citizen ratings with multi-dimensional feedback on various aspects'
    },
    {
      icon: Shield,
      title: 'Fraud Protection',
      description: 'Built-in abuse detection and admin moderation tools to ensure authentic ratings'
    },
    {
      icon: Star,
      title: 'Leaderboards',
      description: 'Regional and categorical rankings to promote healthy competition and improvement'
    },
    {
      icon: MessageSquare,
      title: 'Detailed Feedback',
      description: 'Comment system with sentiment analysis and verified reviewer badges'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              CamerPulse Civic Reputation System
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              A comprehensive platform for evaluating and ranking civic entities based on transparency, 
              performance, engagement, and citizen trust metrics.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Real-time Scoring
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Fraud Protection
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Multi-dimensional Ratings
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Regional Leaderboards
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Interactive Demo</h2>
            <p className="text-muted-foreground">
              Explore the different components of the civic reputation system
            </p>
          </div>

          <Tabs value={selectedDemo} onValueChange={setSelectedDemo} className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="rating">Rating System</TabsTrigger>
              <TabsTrigger value="cards">Reputation Cards</TabsTrigger>
              <TabsTrigger value="admin">Admin Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Civic Reputation Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Comprehensive overview of civic performance metrics, trending entities, and regional comparisons.
                  </p>
                  <CivicDashboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Civic Leaderboard System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Rankings and performance comparisons across different categories and regions.
                  </p>
                  <CivicLeaderboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rating" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Rating System Demo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Multi-dimensional rating system allowing citizens to provide detailed feedback.
                  </p>
                  <div className="space-y-6">
                    {demoEntities.map((entity) => (
                      <div key={entity.id}>
                        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                          <h3 className="font-semibold text-lg">{entity.name}</h3>
                          <p className="text-sm text-muted-foreground">{entity.description}</p>
                          <Badge variant="outline" className="mt-2 capitalize">
                            {entity.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <RatingSystem
                          entityType={entity.type}
                          entityId={entity.id}
                          entityName={entity.name}
                          region="centre"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Reputation Cards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Compact and detailed reputation cards for displaying entity performance.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {demoEntities.map((entity) => (
                      <div key={entity.id} className="space-y-4">
                        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                          <h3 className="font-semibold">{entity.name}</h3>
                          <Badge variant="outline" className="mt-2 capitalize">
                            {entity.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Mini Card</h4>
                          <ReputationCard
                            entityType={entity.type}
                            entityId={entity.id}
                            entityName={entity.name}
                            showFullDetails={false}
                          />
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Full Details Card</h4>
                          <ReputationCard
                            entityType={entity.type}
                            entityId={entity.id}
                            entityName={entity.name}
                            showFullDetails={true}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Admin Management Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Comprehensive admin tools for managing the reputation system, handling abuse reports, and making manual adjustments.
                  </p>
                  <AdminReputationTools />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Implementation Info */}
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Implementation Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Scoring Algorithm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Transparency</span>
                    <span className="font-mono">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance</span>
                    <span className="font-mono">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Citizen Rating</span>
                    <span className="font-mono">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement</span>
                    <span className="font-mono">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Speed</span>
                    <span className="font-mono">10%</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Negative Flags</span>
                    <span className="font-mono">-5% each</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reputation Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-500 text-white">EXCELLENT</Badge>
                    <span className="text-sm">85-100 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-500 text-white">TRUSTED</Badge>
                    <span className="text-sm">70-84 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-yellow-500 text-white">UNDER WATCH</Badge>
                    <span className="text-sm">40-69 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-red-500 text-white">FLAGGED</Badge>
                    <span className="text-sm">0-39 points</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Entity Types Supported</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    'Ministries', 'Politicians', 'Government Agencies', 
                    'Political Parties', 'Civil Society Orgs', 'Media Outlets',
                    'Election Events', 'Policy Documents', 'Government Statements'
                  ].map((type) => (
                    <Badge key={type} variant="outline" className="justify-center">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicReputationDemo;