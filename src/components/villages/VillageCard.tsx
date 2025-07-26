
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Users, 
  Star, 
  TrendingUp, 
  Award, 
  Crown,
  Eye,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Village {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  population_estimate: number | null;
  overall_rating: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
  governance_score: number;
  diaspora_engagement_score: number;
  total_ratings_count: number;
  created_at: string;
}

interface VillageCardProps {
  village: Village;
  rank?: number;
  showRank?: boolean;
  compact?: boolean;
}

export const VillageCard: React.FC<VillageCardProps> = ({ 
  village, 
  rank, 
  showRank = false, 
  compact = false 
}) => {
  const getRankBadge = (position: number) => {
    if (position === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (position === 2) return <Award className="h-4 w-4 text-gray-400" />;
    if (position === 3) return <Award className="h-4 w-4 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const daysAgo = Math.floor((Date.now() - new Date(village.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {showRank && rank && (
              <div className="flex-shrink-0">
                {getRankBadge(rank)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {village.village_name}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {village.subdivision}, {village.division}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {village.is_verified && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Crown className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {village.region}
            </Badge>
          </div>
        </div>

        {!compact && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className={`text-lg font-bold ${getScoreColor(village.overall_rating)}`}>
                {village.overall_rating.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Overall</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-lg font-bold text-blue-600">
                {village.infrastructure_score}/20
              </div>
              <div className="text-xs text-muted-foreground">Infrastructure</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-lg font-bold text-green-600">
                {village.education_score}/10
              </div>
              <div className="text-xs text-muted-foreground">Education</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {formatNumber(village.sons_daughters_count)}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {formatNumber(village.view_count)}
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              {village.total_ratings_count} ratings
            </div>
          </div>
          {village.population_estimate && (
            <div className="text-xs">
              Pop: {formatNumber(village.population_estimate)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Added {daysAgo} days ago
          </div>
          <div className="flex gap-2">
            <Link to={`/village/${village.id}`}>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </Link>
            {village.overall_rating > 7 && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Top Rated
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
