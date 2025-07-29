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
import { 
  Users, 
  Crown, 
  Shield, 
  Building2, 
  Star, 
  MessageCircle, 
  UserPlus,
  MapPin,
  Heart,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FollowButton } from '@/components/Social/FollowButton';
import { toast } from 'sonner';

interface PoliticalFigure {
  id: string;
  user_id: string;
  name: string;
  username: string;
  avatar_url: string;
  position: string;
  party_affiliation: string;
  region: string;
  figure_type: 'politician' | 'mp' | 'senator' | 'chief' | 'king' | 'party_official';
  average_rating: number;
  total_ratings: number;
  influence_score: number;
  verification_status: string;
  bio: string;
}

interface PoliticalFiguresCarouselProps {
  figures: PoliticalFigure[];
  title?: string;
}

export const PoliticalFiguresCarousel: React.FC<PoliticalFiguresCarouselProps> = ({ 
  figures,
  title = "Political Figures to Follow"
}) => {
  const { user } = useAuth();

  if (!figures.length) return null;

  const getFigureIcon = (type: string) => {
    const iconMap = {
      'politician': Users,
      'mp': Shield,
      'senator': Crown,
      'chief': Crown,
      'king': Crown,
      'party_official': Building2,
    };
    return iconMap[type as keyof typeof iconMap] || Users;
  };

  const getFigureTypeDisplay = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'politician': { label: 'Politician', color: 'bg-blue-100 text-blue-800' },
      'mp': { label: 'Member of Parliament', color: 'bg-green-100 text-green-800' },
      'senator': { label: 'Senator', color: 'bg-purple-100 text-purple-800' },
      'chief': { label: 'Traditional Chief', color: 'bg-orange-100 text-orange-800' },
      'king': { label: 'Traditional King', color: 'bg-yellow-100 text-yellow-800' },
      'party_official': { label: 'Party Official', color: 'bg-red-100 text-red-800' },
    };
    return typeMap[type] || { label: 'Official', color: 'bg-gray-100 text-gray-800' };
  };

  const handleMessage = (figureId: string, figureName: string) => {
    toast.success(`Opening conversation with ${figureName}`);
    // TODO: Implement messaging system
  };

  const handleRate = (figureId: string, figureName: string) => {
    toast.success(`Rate ${figureName}`);
    // TODO: Implement rating system
  };

  return (
    <Card className="my-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
            Engage with Leaders
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {figures.map((figure) => {
              const typeInfo = getFigureTypeDisplay(figure.figure_type);
              const IconComponent = getFigureIcon(figure.figure_type);
              
              return (
                <CarouselItem 
                  key={figure.id} 
                  className="pl-2 md:pl-4 basis-1/2 md:basis-1/4"
                >
                  <Card className="h-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 hover:bg-white transition-all duration-200 hover:shadow-lg border border-blue-200/30 hover:border-blue-300">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex flex-col items-center text-center space-y-3 flex-1">
                        <div className="relative">
                          <Avatar className="h-14 w-14 ring-2 ring-blue-200">
                            <AvatarImage 
                              src={figure.avatar_url} 
                              alt={figure.name}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
                              {figure.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-blue-200">
                            <IconComponent className="h-3 w-3 text-blue-600" />
                          </div>
                        </div>

                        <div className="space-y-1 min-h-[4rem] flex flex-col justify-center">
                          <h4 className="font-semibold text-sm line-clamp-1">
                            {figure.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {figure.position}
                          </p>
                          <p className="text-xs text-blue-600 font-medium line-clamp-1">
                            {figure.party_affiliation}
                          </p>
                        </div>

                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${typeInfo.color} border-0`}
                        >
                          {typeInfo.label}
                        </Badge>

                        {figure.region && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{figure.region}</span>
                          </div>
                        )}

                        {figure.average_rating > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{figure.average_rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({figure.total_ratings})</span>
                          </div>
                        )}

                        {figure.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {figure.bio}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 flex items-center gap-1"
                            onClick={() => handleMessage(figure.id, figure.name)}
                          >
                            <MessageCircle className="h-3 w-3" />
                            Message
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 flex items-center gap-1"
                            onClick={() => handleRate(figure.id, figure.name)}
                          >
                            <Star className="h-3 w-3" />
                            Rate
                          </Button>
                        </div>
                        <FollowButton
                          targetUserId={figure.user_id}
                          targetUsername={figure.username}
                          variant="default"
                          size="sm"
                          className="w-full text-xs h-7"
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