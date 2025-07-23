import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Star, TrendingUp, MapPin, Calendar, DollarSign, Eye, Settings } from 'lucide-react';

export const RecommendationEngine: React.FC = () => {
  const { recommendations, preferences, loading, generateRecommendations } = useRecommendations();

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'tender':
        return <DollarSign className="h-4 w-4" />;
      case 'business':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.6) return 'text-warning';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Star className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Recommendations</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Star className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Recommendations</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={generateRecommendations}>
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Recommendation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Personalized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold">{recommendations.length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Match Score</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="flex flex-wrap gap-1">
                <span className="text-sm text-muted-foreground">None set</span>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Grid */}
      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse tenders and businesses to help us learn your preferences
            </p>
            <Button onClick={generateRecommendations}>
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getRecommendationIcon('tender')}
                    <Badge variant="outline" className="capitalize">
                      tender
                    </Badge>
                  </div>
                  <div className={`text-sm font-medium ${getScoreColor(0.8)}`}>
                    80%
                  </div>
                </div>
                <CardTitle className="text-lg">Sample Recommendation</CardTitle>
                <CardDescription>Based on your activity and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Based on your recent activity
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendation Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendation Insights</CardTitle>
          <CardDescription>
            Understanding how we personalize content for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Your Interests</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Construction</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={75} className="w-16 h-2" />
                    <span className="text-xs text-muted-foreground">75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">IT Services</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={60} className="w-16 h-2" />
                    <span className="text-xs text-muted-foreground">60%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Healthcare</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={45} className="w-16 h-2" />
                    <span className="text-xs text-muted-foreground">45%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Activity Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tenders Viewed</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span>Documents Downloaded</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Searches Performed</span>
                  <span className="font-medium">15</span>
                </div>
                <div className="flex justify-between">
                  <span>Businesses Viewed</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};