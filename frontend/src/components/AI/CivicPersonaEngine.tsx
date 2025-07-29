import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  TrendingUp, 
  MapPin, 
  Brain, 
  AlertTriangle, 
  Eye,
  UserCheck,
  Target,
  Flame,
  Smile,
  Frown,
  Meh,
  Heart,
  Megaphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Persona Types with their characteristics
const PERSONA_TYPES = {
  angry_voter: {
    name: 'The Angry Voter',
    icon: Flame,
    color: 'bg-red-500',
    description: 'Consistently expresses anger and frustration with government',
    emotions: ['anger', 'frustration', 'outrage'],
    keywords: ['corrupt', 'incompetent', 'failed', 'disgrace', 'useless']
  },
  sarcastic_dissenter: {
    name: 'The Sarcastic Dissenter',
    icon: Smile,
    color: 'bg-purple-500',
    description: 'Uses humor and sarcasm to critique political situations',
    emotions: ['sarcasm', 'humor', 'cynicism'],
    keywords: ['obviously', 'brilliant', 'genius', 'perfect', 'amazing']
  },
  hopeful_patriot: {
    name: 'The Hopeful Patriot',
    icon: Heart,
    color: 'bg-green-500',
    description: 'Maintains optimism and faith in national progress',
    emotions: ['hope', 'pride', 'optimism'],
    keywords: ['progress', 'development', 'unity', 'forward', 'better']
  },
  apathetic_observer: {
    name: 'The Apathetic Observer',
    icon: Meh,
    color: 'bg-gray-500',
    description: 'Shows disengagement and lack of emotional investment',
    emotions: ['indifference', 'detachment', 'neutrality'],
    keywords: ['whatever', 'same', 'nothing new', 'typical', 'expected']
  },
  civic_mobilizer: {
    name: 'The Civic Mobilizer',
    icon: Megaphone,
    color: 'bg-blue-500',
    description: 'Actively encourages civic engagement and action',
    emotions: ['determination', 'urgency', 'motivation'],
    keywords: ['action', 'vote', 'unite', 'change', 'together', 'organize']
  }
};

interface PersonaProfile {
  persona_type: keyof typeof PERSONA_TYPES;
  region: string;
  post_count: number;
  dominant_emotions: string[];
  influence_score: number;
  last_active: string;
  topics: string[];
  emotional_trend: 'stable' | 'escalating' | 'declining';
}

interface PersonaCluster {
  region: string;
  persona_distribution: Record<string, number>;
  total_users: number;
  top_influencers: Array<{
    id: string;
    persona_type: string;
    influence_score: number;
    alias: string;
  }>;
}

interface PersonaAlert {
  id: string;
  persona_type: string;
  region: string;
  alert_type: 'tone_shift' | 'activity_spike' | 'influence_surge';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

const CivicPersonaEngine = () => {
  const [personaProfiles, setPersonaProfiles] = useState<PersonaProfile[]>([]);
  const [personaClusters, setPersonaClusters] = useState<PersonaCluster[]>([]);
  const [personaAlerts, setPersonaAlerts] = useState<PersonaAlert[]>([]);
  const [nationalDistribution, setNationalDistribution] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof PERSONA_TYPES | null>(null);

  useEffect(() => {
    loadPersonaData();
    const interval = setInterval(loadPersonaData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadPersonaData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate persona analysis based on sentiment data
      const { data: sentimentData } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (sentimentData) {
        const analysisResults = analyzeUserPersonas(sentimentData);
        setPersonaProfiles(analysisResults.profiles);
        setPersonaClusters(analysisResults.clusters);
        setNationalDistribution(analysisResults.distribution);
        setPersonaAlerts(generatePersonaAlerts(analysisResults.profiles));
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading persona data:', error);
      setIsLoading(false);
    }
  };

  const analyzeUserPersonas = (sentimentData: any[]): {
    profiles: PersonaProfile[];
    clusters: PersonaCluster[];
    distribution: Record<string, number>;
  } => {
    // Group by author/region for persona analysis
    const userGroups: Record<string, any[]> = {};
    const regionGroups: Record<string, any[]> = {};

    sentimentData.forEach(item => {
      const userId = item.author_handle || `user_${item.id.slice(0, 8)}`;
      const region = item.region_detected || 'Unknown';

      if (!userGroups[userId]) userGroups[userId] = [];
      if (!regionGroups[region]) regionGroups[region] = [];

      userGroups[userId].push(item);
      regionGroups[region].push(item);
    });

    // Analyze individual personas
    const profiles: PersonaProfile[] = Object.entries(userGroups)
      .filter(([_, posts]) => posts.length >= 3) // Minimum posts for pattern recognition
      .map(([userId, posts]) => {
        const emotionalProfile = analyzeEmotionalPattern(posts);
        const persona = classifyPersona(emotionalProfile, posts);
        
        return {
          persona_type: persona,
          region: posts[0].region_detected || 'Unknown',
          post_count: posts.length,
          dominant_emotions: emotionalProfile.dominantEmotions,
          influence_score: calculateInfluenceScore(posts),
          last_active: posts[0].created_at,
          topics: extractTopics(posts),
          emotional_trend: determineEmotionalTrend(posts)
        };
      });

    // Generate regional clusters
    const clusters: PersonaCluster[] = Object.entries(regionGroups).map(([region, posts]) => {
      const regionPersonas = profiles.filter(p => p.region === region);
      const distribution: Record<string, number> = {};
      
      Object.keys(PERSONA_TYPES).forEach(type => {
        distribution[type] = regionPersonas.filter(p => p.persona_type === type).length;
      });

      const topInfluencers = regionPersonas
        .sort((a, b) => b.influence_score - a.influence_score)
        .slice(0, 5)
        .map((p, idx) => ({
          id: `influencer_${idx}`,
          persona_type: p.persona_type,
          influence_score: p.influence_score,
          alias: `${p.persona_type}_${region}_${idx + 1}`
        }));

      return {
        region,
        persona_distribution: distribution,
        total_users: regionPersonas.length,
        top_influencers: topInfluencers
      };
    });

    // Calculate national distribution
    const distribution: Record<string, number> = {};
    Object.keys(PERSONA_TYPES).forEach(type => {
      distribution[type] = profiles.filter(p => p.persona_type === type).length;
    });

    return { profiles, clusters, distribution };
  };

  const analyzeEmotionalPattern = (posts: any[]) => {
    const emotions: Record<string, number> = {};
    const sentimentScores: number[] = [];

    posts.forEach(post => {
      if (post.emotional_tone) {
        post.emotional_tone.forEach((emotion: string) => {
          emotions[emotion] = (emotions[emotion] || 0) + 1;
        });
      }
      if (post.sentiment_score !== null) {
        sentimentScores.push(post.sentiment_score);
      }
    });

    const dominantEmotions = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    const avgSentiment = sentimentScores.length > 0 
      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length 
      : 0;

    return { dominantEmotions, avgSentiment, emotions };
  };

  const classifyPersona = (emotionalProfile: any, posts: any[]): keyof typeof PERSONA_TYPES => {
    const { dominantEmotions, avgSentiment } = emotionalProfile;
    
    // Check content for persona indicators
    const contentText = posts.map(p => p.content_text.toLowerCase()).join(' ');
    
    // Angry Voter: High negative sentiment + anger emotions
    if (avgSentiment < -0.4 && dominantEmotions.includes('anger')) {
      return 'angry_voter';
    }
    
    // Hopeful Patriot: Positive sentiment + hope/pride emotions
    if (avgSentiment > 0.3 && (dominantEmotions.includes('hope') || dominantEmotions.includes('pride'))) {
      return 'hopeful_patriot';
    }
    
    // Civic Mobilizer: Action-oriented content
    if (PERSONA_TYPES.civic_mobilizer.keywords.some(keyword => contentText.includes(keyword))) {
      return 'civic_mobilizer';
    }
    
    // Sarcastic Dissenter: Negative but with humor indicators
    if (avgSentiment < -0.2 && PERSONA_TYPES.sarcastic_dissenter.keywords.some(keyword => contentText.includes(keyword))) {
      return 'sarcastic_dissenter';
    }
    
    // Default to Apathetic Observer
    return 'apathetic_observer';
  };

  const calculateInfluenceScore = (posts: any[]): number => {
    // Simple influence calculation based on engagement and content volume
    const baseScore = posts.length * 10;
    const engagementBonus = posts.reduce((sum, post) => {
      const engagement = (post.engagement_metrics?.likes || 0) + 
                       (post.engagement_metrics?.shares || 0) + 
                       (post.engagement_metrics?.comments || 0);
      return sum + engagement;
    }, 0);
    
    return Math.min(100, baseScore + engagementBonus * 0.1);
  };

  const extractTopics = (posts: any[]): string[] => {
    const topics = new Set<string>();
    posts.forEach(post => {
      if (post.content_category) {
        post.content_category.forEach((category: string) => topics.add(category));
      }
    });
    return Array.from(topics).slice(0, 5);
  };

  const determineEmotionalTrend = (posts: any[]): 'stable' | 'escalating' | 'declining' => {
    if (posts.length < 5) return 'stable';
    
    const recentPosts = posts.slice(0, Math.floor(posts.length / 2));
    const olderPosts = posts.slice(Math.floor(posts.length / 2));
    
    const recentAvg = recentPosts.reduce((sum, p) => sum + (p.sentiment_score || 0), 0) / recentPosts.length;
    const olderAvg = olderPosts.reduce((sum, p) => sum + (p.sentiment_score || 0), 0) / olderPosts.length;
    
    const difference = recentAvg - olderAvg;
    
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'escalating' : 'declining';
  };

  const generatePersonaAlerts = (profiles: PersonaProfile[]): PersonaAlert[] => {
    const alerts: PersonaAlert[] = [];
    
    // Alert for tone shifts
    profiles.forEach((profile, idx) => {
      if (profile.emotional_trend === 'escalating' && profile.persona_type === 'angry_voter') {
        alerts.push({
          id: `alert_${idx}`,
          persona_type: profile.persona_type,
          region: profile.region,
          alert_type: 'tone_shift',
          description: `Angry Voter persona showing escalating sentiment in ${profile.region}`,
          severity: profile.influence_score > 70 ? 'high' : 'medium',
          created_at: new Date().toISOString()
        });
      }
      
      if (profile.persona_type === 'civic_mobilizer' && profile.influence_score > 80) {
        alerts.push({
          id: `alert_mobilizer_${idx}`,
          persona_type: profile.persona_type,
          region: profile.region,
          alert_type: 'influence_surge',
          description: `High-influence Civic Mobilizer detected in ${profile.region}`,
          severity: 'medium',
          created_at: new Date().toISOString()
        });
      }
    });
    
    return alerts;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-blue-400';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Analyzing civic personas and behavioral patterns...</p>
        </div>
      </div>
    );
  }

  const totalUsers = Object.values(nationalDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-primary" />
            <span>Civic Persona Engine</span>
          </CardTitle>
          <CardDescription>
            Behavioral and emotional profiling of civic engagement patterns across Cameroon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(PERSONA_TYPES).map(([key, persona]) => {
              const count = nationalDistribution[key] || 0;
              const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
              const IconComponent = persona.icon;
              
              return (
                <Card 
                  key={key} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedPersona === key ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPersona(selectedPersona === key ? null : key as keyof typeof PERSONA_TYPES)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-full ${persona.color} flex items-center justify-center mx-auto mb-2`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{persona.name}</h3>
                    <div className="text-2xl font-bold text-primary">{count}</div>
                    <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    <Progress value={percentage} className="mt-2 h-1" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Persona Details */}
      {selectedPersona && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>{PERSONA_TYPES[selectedPersona].name} Analysis</span>
            </CardTitle>
            <CardDescription>
              {PERSONA_TYPES[selectedPersona].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Regional Distribution</h4>
                <div className="space-y-2">
                  {personaClusters
                    .filter(cluster => cluster.persona_distribution[selectedPersona] > 0)
                    .sort((a, b) => b.persona_distribution[selectedPersona] - a.persona_distribution[selectedPersona])
                    .slice(0, 5)
                    .map(cluster => (
                      <div key={cluster.region} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{cluster.region}</span>
                        </div>
                        <Badge variant="outline">
                          {cluster.persona_distribution[selectedPersona]} users
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Top Influencers</h4>
                <div className="space-y-2">
                  {personaClusters
                    .flatMap(cluster => cluster.top_influencers)
                    .filter(influencer => influencer.persona_type === selectedPersona)
                    .sort((a, b) => b.influence_score - a.influence_score)
                    .slice(0, 5)
                    .map(influencer => (
                      <div key={influencer.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{influencer.alias}</span>
                        </div>
                        <Badge variant="outline">
                          {influencer.influence_score.toFixed(1)} influence
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regional Clusters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Regional Persona Clusters</span>
          </CardTitle>
          <CardDescription>
            Geographic distribution of civic personas across Cameroon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personaClusters.slice(0, 6).map(cluster => (
              <Card key={cluster.region}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{cluster.region}</CardTitle>
                  <CardDescription>{cluster.total_users} active civic users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(cluster.persona_distribution)
                      .filter(([_, count]) => count > 0)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([personaType, count]) => {
                        const persona = PERSONA_TYPES[personaType as keyof typeof PERSONA_TYPES];
                        const percentage = (count / cluster.total_users) * 100;
                        
                        return (
                          <div key={personaType} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${persona.color}`} />
                              <span className="text-sm">{persona.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {count} ({percentage.toFixed(0)}%)
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Persona Alerts */}
      {personaAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Persona Behavior Alerts</span>
            </CardTitle>
            <CardDescription>
              Significant behavioral or emotional shifts detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personaAlerts.map(alert => (
                <Alert key={alert.id}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{PERSONA_TYPES[alert.persona_type as keyof typeof PERSONA_TYPES].name}</strong> - {alert.description}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">
                          {alert.region}
                        </Badge>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Persona Engine Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Profiled Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{personaClusters.length}</div>
              <div className="text-sm text-muted-foreground">Regional Clusters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{personaAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Active</div>
              <div className="text-sm text-muted-foreground">System Status</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CivicPersonaEngine;