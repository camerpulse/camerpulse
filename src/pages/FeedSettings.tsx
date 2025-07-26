import React, { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { FeedPreferences } from '@/components/feed/FeedPreferences';
import { PersonalizedFeed } from '@/components/feed/PersonalizedFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  TrendingUp, 
  BarChart3, 
  Users, 
  MapPin,
  Calendar,
  Zap,
  Vote
} from 'lucide-react';
import { useFeedAlgorithm } from '@/hooks/useFeedAlgorithm';

export default function FeedSettings() {
  const { userPreferences, civicEventsActive } = useFeedAlgorithm();
  const [activeTab, setActiveTab] = useState('preferences');

  const calculateCivicEngagementScore = () => {
    if (!userPreferences) return 0;
    
    let score = 0;
    score += (userPreferences.civic_content_weight || 0) * 40;
    score += (userPreferences.local_content_preference || 0) * 20;
    
    switch (userPreferences.political_engagement_level) {
      case 'high': score += 25; break;
      case 'moderate': score += 15; break;
      case 'low': score += 5; break;
      default: score += 10;
    }
    
    if (userPreferences.preferred_regions && userPreferences.preferred_regions.length > 0) {
      score += Math.min(10, userPreferences.preferred_regions.length * 2);
    }
    
    const weights = [
      userPreferences.civic_content_weight || 0,
      userPreferences.entertainment_weight || 0,
      userPreferences.job_content_weight || 0,
      userPreferences.artist_content_weight || 0
    ];
    
    const maxWeight = Math.max(...weights);
    if (maxWeight < 0.7) {
      score += 5; // Bonus for balanced content consumption
    }
    
    return Math.min(100, Math.max(0, score));
  };

  const civicScore = calculateCivicEngagementScore();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-sans">Feed Management</h1>
              <p className="text-muted-foreground font-sans">
                Customize your CamerPulse experience and track your civic engagement
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {civicEventsActive && (
                <Badge variant="destructive" className="font-sans animate-pulse">
                  <Vote className="w-3 h-3 mr-1" />
                  Civic Events Active
                </Badge>
              )}
              <Badge variant="secondary" className="font-sans">
                <Zap className="w-3 h-3 mr-1" />
                Civic Score: {Math.round(civicScore)}%
              </Badge>
            </div>
          </div>

          {/* Stats Overview */}
          {userPreferences && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Vote className="w-4 h-4 text-primary" />
                    <span className="font-sans text-sm font-medium">Civic Content</span>
                  </div>
                  <p className="text-2xl font-bold font-sans">
                    {Math.round((userPreferences.civic_content_weight || 0) * 100)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="font-sans text-sm font-medium">Local Priority</span>
                  </div>
                  <p className="text-2xl font-bold font-sans">
                    {Math.round((userPreferences.local_content_preference || 0) * 100)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="font-sans text-sm font-medium">Engagement</span>
                  </div>
                  <p className="text-2xl font-bold font-sans capitalize">
                    {userPreferences.political_engagement_level || 'Moderate'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="font-sans text-sm font-medium">Regions</span>
                  </div>
                  <p className="text-2xl font-bold font-sans">
                    {userPreferences.preferred_regions?.length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preferences" className="font-sans">
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="preview" className="font-sans">
                <TrendingUp className="w-4 h-4 mr-2" />
                Feed Preview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-sans">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="mt-6">
              <FeedPreferences />
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Feed Preview</CardTitle>
                  <p className="text-sm text-muted-foreground font-sans">
                    Preview how your personalized feed will look with current preferences
                  </p>
                </CardHeader>
                <CardContent>
                  <PersonalizedFeed 
                    className="max-h-[600px] overflow-y-auto"
                    showPreferences={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Civic Engagement Analytics</CardTitle>
                  <p className="text-sm text-muted-foreground font-sans">
                    Track your civic engagement and content interaction patterns
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Civic Engagement Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-sans font-semibold">Civic Engagement Score</h3>
                        <Badge variant={civicScore >= 70 ? 'default' : civicScore >= 40 ? 'secondary' : 'outline'}>
                          {Math.round(civicScore)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${civicScore}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 font-sans">
                        Based on your content preferences, engagement level, and regional interest
                      </p>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h3 className="font-sans font-semibold mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {civicScore < 40 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm font-sans">
                              💡 Consider increasing civic content weight to stay more informed about local governance
                            </p>
                          </div>
                        )}
                        
                        {!userPreferences?.preferred_regions?.length && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-sans">
                              🗺️ Select preferred regions to get more relevant local content
                            </p>
                          </div>
                        )}
                        
                        {userPreferences?.political_engagement_level === 'low' && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-sans">
                              📈 Consider increasing political engagement level to participate more in civic discussions
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}