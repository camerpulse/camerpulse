import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Image, 
  Volume2, 
  Video, 
  FileText,
  TrendingUp,
  BarChart3,
  Eye,
  Users,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface MultimodalStats {
  total_analyzed: number;
  by_media_type: {
    text: number;
    image: number;
    audio: number;
    video: number;
    multimodal: number;
  };
  avg_confidence: number;
  top_emotions: Array<{
    emotion: string;
    count: number;
  }>;
}

export const MultimodalDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['multimodal-stats'],
    queryFn: async (): Promise<MultimodalStats> => {
      const { data, error } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('media_type, confidence_score, emotional_tone');

      if (error) throw error;

      const logs = data || [];
      const mediaTypeCounts = {
        text: logs.filter(l => l.media_type === 'text').length,
        image: logs.filter(l => l.media_type === 'image').length,
        audio: logs.filter(l => l.media_type === 'audio').length,
        video: logs.filter(l => l.media_type === 'video').length,
        multimodal: logs.filter(l => l.media_type === 'multimodal').length,
      };

      const avgConfidence = logs.reduce((acc, log) => acc + (log.confidence_score || 0), 0) / (logs.length || 1);

      // Count emotions
      const emotionCounts: Record<string, number> = {};
      logs.forEach(log => {
        if (log.emotional_tone) {
          log.emotional_tone.forEach((emotion: string) => {
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          });
        }
      });

      const topEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([emotion, count]) => ({ emotion, count }));

      return {
        total_analyzed: logs.length,
        by_media_type: mediaTypeCounts,
        avg_confidence: avgConfidence,
        top_emotions: topEmotions
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'audio': return <Volume2 className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'text-blue-600';
      case 'image': return 'text-green-600';
      case 'audio': return 'text-purple-600';
      case 'video': return 'text-red-600';
      case 'multimodal': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return <div>Loading multimodal analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyzed</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_analyzed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Multimodal content pieces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats?.avg_confidence || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Analysis accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Types</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats?.by_media_type || {}).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Media Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Media Type Analysis</CardTitle>
          <CardDescription>
            Distribution of content types processed by the multimodal emotion engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats?.by_media_type || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={getMediaTypeColor(type)}>
                    {getMediaTypeIcon(type)}
                  </div>
                  <span className="font-medium capitalize">{type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32">
                    <Progress value={(count / (stats?.total_analyzed || 1)) * 100} className="h-2" />
                  </div>
                  <Badge variant="outline" className="min-w-[60px] text-center">
                    {count}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Emotions */}
      <Card>
        <CardHeader>
          <CardTitle>Top Detected Emotions</CardTitle>
          <CardDescription>
            Most frequently detected emotions across all content types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.top_emotions?.map((emotion, index) => (
              <div key={emotion.emotion} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="font-medium capitalize">{emotion.emotion}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24">
                    <Progress 
                      value={(emotion.count / (stats.top_emotions[0]?.count || 1)) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <Badge variant="secondary" className="min-w-[50px] text-center">
                    {emotion.count}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Multimodal Processing Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span>Visual Analysis</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Facial expression recognition</li>
                <li>• Crowd emotion detection</li>
                <li>• Scene context analysis</li>
                <li>• Protest and rally monitoring</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span>Audio Analysis</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Voice tone detection</li>
                <li>• Multi-language support</li>
                <li>• Speech pattern analysis</li>
                <li>• Regional dialect identification</li>
              </ul>
            </div>
          </div>

          <Alert className="mt-4">
            <Brain className="h-4 w-4" />
            <AlertDescription>
              The multimodal emotion processor integrates AI-powered analysis across text, image, audio, and video 
              content to provide comprehensive emotional intelligence for civic monitoring.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};