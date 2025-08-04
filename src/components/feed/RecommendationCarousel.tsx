import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { MapPin, UserPlus, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FollowButton } from '@/components/Social/FollowButton';

interface RecommendedUser {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  location: string;
  profession: string;
  civic_influence_score: number;
  verification_status: string;
  profile_type: string;
}

interface RecommendationCarouselProps {
  recommendations: RecommendedUser[];
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({ 
  recommendations 
}) => {
  const { user } = useAuth();

  if (!recommendations.length) return null;

  const getProfileTypeDisplay = (profileType: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'politician': { label: 'Politician', color: 'bg-blue-100 text-blue-800' },
      'public_official': { label: 'Official', color: 'bg-green-100 text-green-800' },
      'ministry': { label: 'Ministry', color: 'bg-purple-100 text-purple-800' },
      'normal_user': { label: 'Citizen', color: 'bg-gray-100 text-gray-800' },
      'diaspora': { label: 'Diaspora', color: 'bg-orange-100 text-orange-800' },
    };
    return typeMap[profileType] || { label: 'User', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <Card className="my-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Discover People to Follow
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Based on your interests
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {recommendations.map((profile) => {
              const typeInfo = getProfileTypeDisplay(profile.profile_type);
              
              return (
                <CarouselItem 
                  key={profile.id} 
                  className="pl-2 md:pl-4 basis-1/2 md:basis-1/4"
                >
                  <Card className="h-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/50 hover:bg-background/90 transition-all duration-200 hover:shadow-md border border-border/50">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex flex-col items-center text-center space-y-3 flex-1">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                          <AvatarImage 
                            src={profile.avatar_url} 
                            alt={profile.display_name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {profile.display_name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1 min-h-[3rem] flex flex-col justify-center">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {profile.display_name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {profile.username}
                          </p>
                        </div>

                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${typeInfo.color} border-0`}
                        >
                          {typeInfo.label}
                        </Badge>

                        {profile.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{profile.location}</span>
                          </div>
                        )}

                        {profile.civic_influence_score > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{profile.civic_influence_score}</span>
                          </div>
                        )}

                        {profile.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {profile.bio}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50">
                        <FollowButton
                          targetUserId={profile.user_id}
                          targetUsername={profile.username}
                          variant="default"
                          size="sm"
                          className="w-full text-xs h-8"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
};