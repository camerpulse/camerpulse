import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Star, MapPin, Award, TrendingUp, Shield, 
  Users, FileText, CheckCircle, AlertTriangle,
  ExternalLink, Crown, Gavel
} from 'lucide-react';
import { Senator } from '@/hooks/useSenators';
import { Link } from 'react-router-dom';

interface EnhancedSenatorCardProps {
  senator: Senator;
}

export const EnhancedSenatorCard = ({ senator }: EnhancedSenatorCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    if (rating >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    if (score >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const getTransparencyColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const isLeadership = senator.position?.includes('Président') || senator.position?.includes('Vice-président');
  const isSecretary = senator.position?.includes('Secrétaire') || senator.position?.includes('Questeur');

  const badges = senator.badges ? (Array.isArray(senator.badges) ? senator.badges : JSON.parse(senator.badges)) : [];

  return (
    <Link to={`/senators/${senator.id}`}>
      <Card className="group h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
        {/* Performance indicator strip */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1 ${
            (senator.performance_score || 0) >= 75 ? 'bg-green-500' :
            (senator.performance_score || 0) >= 50 ? 'bg-yellow-500' :
            (senator.performance_score || 0) >= 25 ? 'bg-orange-500' : 'bg-red-500'
          }`}
        />

        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar with status indicator */}
            <div className="relative">
              <Avatar className="h-20 w-20 ring-2 ring-muted group-hover:ring-primary transition-colors">
                <AvatarImage 
                  src={senator.photo_url} 
                  alt={senator.full_name || senator.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/10 to-secondary/10">
                  {getInitials(senator.full_name || senator.name)}
                </AvatarFallback>
              </Avatar>
              
              {/* Leadership crown indicator */}
              {isLeadership && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
              
              {/* Verification status */}
              {senator.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {/* Name and Basic Info */}
            <div className="space-y-2 w-full">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                {senator.full_name || senator.name}
              </h3>
              
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge 
                  variant={isLeadership ? "default" : isSecretary ? "secondary" : "outline"} 
                  className="text-xs"
                >
                  {senator.position.length > 30 ? 
                    senator.position.substring(0, 30) + '...' : 
                    senator.position
                  }
                </Badge>
              </div>

              {/* Region and Party */}
              <div className="space-y-1">
                {senator.region && (
                  <div className="flex items-center justify-center text-muted-foreground text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {senator.region}
                  </div>
                )}
                
                {(senator.political_parties?.name || senator.political_party || senator.party_affiliation) && (
                  <div className="flex items-center justify-center text-muted-foreground text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      {senator.political_parties?.logo_url && (
                        <img 
                          src={senator.political_parties.logo_url} 
                          alt={senator.political_parties.name}
                          className="w-3 h-3"
                        />
                      )}
                      {senator.political_parties?.acronym || senator.political_parties?.name || senator.political_party || senator.party_affiliation}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="w-full space-y-3">
              {/* Rating */}
              <div className="flex items-center justify-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className={`h-4 w-4 fill-current ${getRatingColor(senator.average_rating)}`} />
                  <span className="font-medium text-sm">
                    {senator.average_rating ? senator.average_rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  ({senator.total_ratings} reviews)
                </span>
              </div>

              {/* Performance Score */}
              {senator.performance_score !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Performance</span>
                    <span className={`font-medium ${getPerformanceColor(senator.performance_score)}`}>
                      {senator.performance_score.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={senator.performance_score} className="h-2" />
                </div>
              )}

              {/* Transparency Score */}
              {senator.transparency_score !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      <span className="text-muted-foreground">Transparency</span>
                    </div>
                    <span className={`font-medium ${getTransparencyColor(senator.transparency_score)}`}>
                      {senator.transparency_score.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={senator.transparency_score} className="h-2" />
                </div>
              )}

              {/* Bills Activity */}
              {((senator.bills_proposed_count || 0) > 0 || (senator.bills_passed_count || 0) > 0) && (
                <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                  {(senator.bills_proposed_count || 0) > 0 && (
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      {senator.bills_proposed_count} proposed
                    </div>
                  )}
                  {(senator.bills_passed_count || 0) > 0 && (
                    <div className="flex items-center">
                      <Gavel className="h-3 w-3 mr-1" />
                      {senator.bills_passed_count} passed
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {badges.slice(0, 2).map((badge: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs px-2 py-0.5"
                  >
                    {badge}
                  </Badge>
                ))}
                {badges.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{badges.length - 2} more
                  </Badge>
                )}
              </div>
            )}

            {/* Bio Preview */}
            {senator.about && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {senator.about}
              </p>
            )}

            {/* Official Link */}
            {senator.official_senate_url && (
              <div className="flex items-center text-xs text-primary hover:text-primary/80 transition-colors">
                <ExternalLink className="h-3 w-3 mr-1" />
                Official Profile
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};