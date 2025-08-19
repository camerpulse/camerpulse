import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Users, Star, Eye, MessageSquare } from 'lucide-react';
import { Minister } from '@/hooks/useMinisters';
import { useNavigate } from 'react-router-dom';
import { URLBuilder } from '@/utils/slugUtils';

interface MinisterCardProps {
  minister: Minister;
}

export function MinisterCard({ minister }: MinisterCardProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={minister.profile_picture_url} alt={minister.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(minister.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg leading-tight">{minister.full_name}</h3>
                <p className="text-muted-foreground text-sm">{minister.position_title}</p>
              </div>
              {minister.is_verified && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 mt-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{minister.ministry}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(minister.political_parties?.name || minister.political_party) && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              {minister.political_parties?.logo_url && (
                <img 
                  src={minister.political_parties.logo_url} 
                  alt={minister.political_parties.name}
                  className="w-3 h-3"
                />
              )}
              {minister.political_parties?.acronym || minister.political_parties?.name || minister.political_party}
            </Badge>
          )}
          {minister.region && (
            <Badge variant="outline" className="text-xs">
              {minister.region}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Star className={`h-4 w-4 ${getRatingColor(minister.average_rating)}`} />
            <span className={getRatingColor(minister.average_rating)}>
              {minister.average_rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({minister.total_ratings} reviews)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{minister.follower_count} followers</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transparency</span>
            <span className="font-medium">{minister.transparency_score.toFixed(1)}/5</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Civic Engagement</span>
            <span className="font-medium">{minister.civic_engagement_score.toFixed(1)}/5</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Performance</span>
            <span className="font-medium">{minister.performance_score.toFixed(1)}/5</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate(URLBuilder.ministers.detail({
              id: minister.id,
              name: minister.full_name
            }))}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Profile
          </Button>
          {minister.can_receive_messages && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`${URLBuilder.ministers.detail({
                id: minister.id,
                name: minister.full_name
              })}?action=message`)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}