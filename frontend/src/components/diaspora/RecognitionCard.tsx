import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Trophy, Heart, Globe } from 'lucide-react';

interface Recognition {
  id: string;
  recognition_type: string;
  recognition_title: string;
  recognition_description?: string;
  recognition_level: string;
  points_awarded: number;
  achievement_date: string;
  diaspora_profiles?: {
    full_name: string;
    country_of_residence: string;
  };
}

interface RecognitionCardProps {
  recognition: Recognition;
  detailed?: boolean;
}

export const RecognitionCard: React.FC<RecognitionCardProps> = ({ recognition, detailed = false }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'village_builder_badge':
        return <Heart className="h-5 w-5" />;
      case 'civic_hero_monthly':
        return <Trophy className="h-5 w-5" />;
      case 'top_contributor':
        return <Star className="h-5 w-5" />;
      case 'community_champion':
        return <Award className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze':
        return 'bg-amber-600 text-white';
      case 'silver':
        return 'bg-gray-400 text-white';
      case 'gold':
        return 'bg-yellow-500 text-white';
      case 'platinum':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'village_builder_badge':
        return 'text-red-600 bg-red-50';
      case 'civic_hero_monthly':
        return 'text-purple-600 bg-purple-50';
      case 'top_contributor':
        return 'text-yellow-600 bg-yellow-50';
      case 'community_champion':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!detailed) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${getTypeColor(recognition.recognition_type)}`}>
              {getIcon(recognition.recognition_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm line-clamp-1">
                  {recognition.recognition_title}
                </h4>
                <Badge variant="secondary" className={`text-xs ${getLevelColor(recognition.recognition_level)}`}>
                  {recognition.recognition_level}
                </Badge>
              </div>
              {recognition.diaspora_profiles && (
                <p className="text-xs text-muted-foreground">
                  {recognition.diaspora_profiles.full_name}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(recognition.achievement_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${getTypeColor(recognition.recognition_type)}`}>
            {getIcon(recognition.recognition_type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">
                {recognition.recognition_title}
              </h3>
              <Badge className={`${getLevelColor(recognition.recognition_level)}`}>
                {recognition.recognition_level}
              </Badge>
            </div>
            
            {recognition.recognition_description && (
              <p className="text-muted-foreground mb-3">
                {recognition.recognition_description}
              </p>
            )}

            {recognition.diaspora_profiles && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">{recognition.diaspora_profiles.full_name}</span>
                <span>from {recognition.diaspora_profiles.country_of_residence}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Achieved: {new Date(recognition.achievement_date).toLocaleDateString()}
              </span>
              {recognition.points_awarded > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{recognition.points_awarded} points</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};