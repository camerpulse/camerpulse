import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin } from 'lucide-react';
import { Senator } from '@/hooks/useSenators';
import { Link } from 'react-router-dom';
import { URLBuilder } from '@/utils/slug';

interface SenatorCardProps {
  senator: Senator;
}

export const SenatorCard = ({ senator }: SenatorCardProps) => {
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

  return (
    <Link to={URLBuilder.senators.detail({
      id: senator.id,
      name: senator.name
    })}>
      <Card className="group h-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-20 w-20 ring-2 ring-muted group-hover:ring-primary transition-colors">
              <AvatarImage 
                src={senator.photo_url} 
                alt={senator.name}
                className="object-cover"
              />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/10 to-secondary/10">
                {getInitials(senator.name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                {senator.name}
              </h3>
              
              <Badge variant="secondary" className="text-xs">
                {senator.position}
              </Badge>

              {senator.region && (
                <div className="flex items-center justify-center text-muted-foreground text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {senator.region}
                </div>
              )}
            </div>

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

            {senator.about && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {senator.about}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};