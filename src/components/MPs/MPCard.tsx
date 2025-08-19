import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Users, Star, Eye, MessageSquare } from 'lucide-react';
import { MP } from '@/hooks/useMPs';
import { useNavigate } from 'react-router-dom';
import { URLBuilder } from '@/utils/slugUtils';

interface MPCardProps {
  mp: MP;
}

export function MPCard({ mp }: MPCardProps) {
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
            <AvatarImage src={mp.profile_picture_url} alt={mp.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(mp.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg leading-tight">{mp.full_name}</h3>
                <p className="text-muted-foreground text-sm">Member of Parliament</p>
              </div>
              {mp.is_verified && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Verified
                </Badge>
              )}
            </div>
            
            {mp.constituency && (
              <div className="flex items-center gap-1 mt-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{mp.constituency}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(mp.political_parties?.name || mp.political_party) && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              {mp.political_parties?.logo_url && (
                <img 
                  src={mp.political_parties.logo_url} 
                  alt={mp.political_parties.name}
                  className="w-3 h-3"
                />
              )}
              {mp.political_parties?.acronym || mp.political_parties?.name || mp.political_party}
            </Badge>
          )}
          {mp.region && (
            <Badge variant="outline" className="text-xs">
              {mp.region}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Star className={`h-4 w-4 ${getRatingColor(mp.average_rating)}`} />
            <span className={getRatingColor(mp.average_rating)}>
              {mp.average_rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({mp.total_ratings} reviews)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{mp.follower_count} followers</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transparency</span>
            <span className="font-medium">{mp.transparency_score.toFixed(1)}/5</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Civic Engagement</span>
            <span className="font-medium">{mp.civic_engagement_score.toFixed(1)}/5</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Legislative Activity</span>
            <span className="font-medium">{mp.legislative_activity_score.toFixed(1)}/5</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate(URLBuilder.mps.detail({
              id: mp.id,
              name: mp.full_name
            }))}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Profile
          </Button>
          {mp.can_receive_messages && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`${URLBuilder.mps.detail({
                id: mp.id,
                name: mp.full_name
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