
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
    if (position === 1) return (
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
          <Crown className="h-6 w-6 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
      </div>
    );
    if (position === 2) return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-md">
        <Award className="h-5 w-5 text-white" />
      </div>
    );
    if (position === 3) return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md">
        <Award className="h-5 w-5 text-white" />
      </div>
    );
    return (
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
        #{position}
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-emerald-600 bg-emerald-50';
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 7) return 'text-lime-600 bg-lime-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return '🏆';
    if (score >= 7) return '⭐';
    if (score >= 6) return '👍';
    if (score >= 5) return '👌';
    return '📈';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const daysAgo = Math.floor((Date.now() - new Date(village.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const isRecent = daysAgo <= 7;
  const isTopRated = village.overall_rating >= 8;
  const isPopular = village.view_count > 1000;

  return (
    <Card className={`
      group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2
      ${isTopRated ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-accent/5' : ''}
      ${compact ? 'hover:shadow-md hover:-translate-y-1' : ''}
    `}>
      {/* Header Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 opacity-60" />
      
      {/* Top Status Indicators */}
      <div className="absolute top-3 right-3 flex gap-1">
        {isRecent && (
          <Badge className="bg-blue-500 text-white text-xs px-2 py-1 animate-pulse">
            New
          </Badge>
        )}
        {isPopular && (
          <Badge className="bg-orange-500 text-white text-xs px-2 py-1">
            🔥 Popular
          </Badge>
        )}
      </div>

      <CardContent className="p-6 relative z-10">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6">
          {showRank && rank && (
            <div className="flex-shrink-0 pt-1">
              {getRankBadge(rank)}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-xl group-hover:text-primary transition-colors leading-tight">
                  {village.village_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1 text-primary/60" />
                    <span className="font-medium">{village.subdivision}</span>
                    <span className="text-muted-foreground/70 mx-1">•</span>
                    <span>{village.division}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {village.is_verified && (
                  <Badge className="bg-primary text-white shadow-md">
                    <Crown className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant="outline" className="border-primary/30 text-primary font-medium">
                  {village.region}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Scores Section */}
        {!compact && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className={`text-center p-4 rounded-xl transition-all hover:scale-105 ${getScoreColor(village.overall_rating)}`}>
              <div className="text-2xl mb-1">{getScoreIcon(village.overall_rating)}</div>
              <div className="text-xl font-bold">
                {village.overall_rating.toFixed(1)}
              </div>
              <div className="text-xs font-medium uppercase tracking-wide">Overall</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl transition-all hover:scale-105">
              <div className="text-2xl mb-1">🏗️</div>
              <div className="text-xl font-bold text-blue-600">
                {village.infrastructure_score}
              </div>
              <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Infrastructure</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl transition-all hover:scale-105">
              <div className="text-2xl mb-1">🎓</div>
              <div className="text-xl font-bold text-green-600">
                {village.education_score}
              </div>
              <div className="text-xs font-medium text-green-600 uppercase tracking-wide">Education</div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="font-bold text-lg">{formatNumber(village.sons_daughters_count)}</div>
            <div className="text-xs text-muted-foreground">Community</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="font-bold text-lg">{formatNumber(village.view_count)}</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="font-bold text-lg">{village.total_ratings_count}</div>
            <div className="text-xs text-muted-foreground">Ratings</div>
          </div>
        </div>

        {/* Population & Time */}
        <div className="flex items-center justify-between text-sm mb-6">
          {village.population_estimate && (
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-secondary"></div>
              <span className="font-medium">Population: {formatNumber(village.population_estimate)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}</span>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {village.overall_rating >= 8 && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <TrendingUp className="h-3 w-3 mr-1" />
                Top Rated
              </Badge>
            )}
            {village.infrastructure_score >= 15 && (
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                <Award className="h-3 w-3 mr-1" />
                Developed
              </Badge>
            )}
          </div>
          
          <Link to={`/village/${village.id}`}>
            <Button 
              className="group/btn bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
              size="sm"
            >
              <span className="mr-2">Explore</span>
              <MessageSquare className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
