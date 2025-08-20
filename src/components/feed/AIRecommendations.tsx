import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Brain,
  TrendingUp,
  Users,
  BookOpen,
  Sparkles,
  ThumbsUp,
  Eye,
  ArrowRight,
  Zap
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'user' | 'topic' | 'post' | 'event';
  title: string;
  description: string;
  reason: string;
  confidence: number;
  metadata: {
    avatar_url?: string;
    verified?: boolean;
    engagement_count?: number;
    category?: string;
  };
}

export const AIRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user]);

  const generateRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Simulate AI-powered recommendations based on user activity
      // In real implementation, this would call an AI service
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          type: 'user',
          title: 'Follow Dr. Sarah Mbamalu',
          description: 'Healthcare expert with insights on rural medicine',
          reason: 'Based on your interest in healthcare topics',
          confidence: 0.89,
          metadata: {
            avatar_url: '/api/placeholder/40/40',
            verified: true,
            engagement_count: 1245
          }
        },
        {
          id: '2',
          type: 'topic',
          title: 'Infrastructure Development',
          description: 'Hot discussions about road construction in Northwest',
          reason: 'Trending in your region',
          confidence: 0.76,
          metadata: {
            category: 'Infrastructure',
            engagement_count: 892
          }
        },
        {
          id: '3',
          type: 'post',
          title: 'New Education Policy Impact',
          description: 'Analysis of recent changes to university admission criteria',
          reason: 'Similar to posts you engaged with',
          confidence: 0.82,
          metadata: {
            engagement_count: 156,
            category: 'Education'
          }
        },
        {
          id: '4',
          type: 'event',
          title: 'Town Hall Meeting - Douala',
          description: 'Mayor addressing urban planning concerns',
          reason: 'Events in your area of interest',
          confidence: 0.71,
          metadata: {
            category: 'Civic Engagement'
          }
        }
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const handleAccept = async (recommendation: Recommendation) => {
    // Track recommendation acceptance
    try {
      await supabase.from('user_engagement_metrics').upsert({
        user_id: user?.id,
        date_tracked: new Date().toISOString().split('T')[0],
        total_notifications_received: 1,
        notifications_clicked: 1
      });
    } catch (error) {
      console.error('Error tracking recommendation:', error);
    }
    
    handleDismiss(recommendation.id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'topic': return <TrendingUp className="w-4 h-4" />;
      case 'post': return <BookOpen className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-500/10 text-blue-600';
      case 'topic': return 'bg-green-500/10 text-green-600';
      case 'post': return 'bg-purple-500/10 text-purple-600';
      case 'event': return 'bg-orange-500/10 text-orange-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  if (!user || isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 animate-pulse" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const visibleRecommendations = recommendations.filter(r => !dismissed.has(r.id));

  if (visibleRecommendations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            All caught up! Check back later for new recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4" />
          AI Recommendations
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Smart
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleRecommendations.slice(0, 3).map((rec) => (
          <div key={rec.id} className="space-y-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor(rec.type)}`}>
                {getTypeIcon(rec.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{rec.title}</h4>
                  {rec.metadata.verified && (
                    <Badge variant="secondary" className="h-4 px-1 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {rec.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{rec.reason}</span>
                    <Badge variant="outline" className="h-4 px-1 text-xs">
                      {Math.round(rec.confidence * 100)}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => handleAccept(rec)}
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => handleDismiss(rec.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
            {rec.metadata.engagement_count && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-11">
                <ThumbsUp className="w-3 h-3" />
                <span>{rec.metadata.engagement_count} interactions</span>
              </div>
            )}
          </div>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-8 text-xs"
          onClick={generateRecommendations}
        >
          <Brain className="w-3 h-3 mr-1" />
          Refresh Recommendations
        </Button>
      </CardContent>
    </Card>
  );
};