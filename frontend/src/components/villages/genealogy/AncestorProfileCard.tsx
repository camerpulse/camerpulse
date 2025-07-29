import React from 'react';
import { Calendar, MapPin, Crown, Shield, Eye, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VillageAncestor } from '@/hooks/useVillageGenealogy';

interface AncestorProfileCardProps {
  ancestor: VillageAncestor;
  onClick?: () => void;
}

export const AncestorProfileCard: React.FC<AncestorProfileCardProps> = ({
  ancestor,
  onClick
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLifespan = () => {
    if (ancestor.birth_year && ancestor.death_year) {
      return `${ancestor.birth_year} - ${ancestor.death_year}`;
    } else if (ancestor.birth_year) {
      return `Born ${ancestor.birth_year}`;
    }
    return null;
  };

  const getPrivacyIcon = () => {
    switch (ancestor.privacy_level) {
      case 'public':
        return <Eye className="h-3 w-3" />;
      case 'village':
        return <MapPin className="h-3 w-3" />;
      case 'family':
        return <Shield className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getPrivacyColor = () => {
    switch (ancestor.privacy_level) {
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'village':
        return 'bg-blue-100 text-blue-800';
      case 'family':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            {ancestor.photo_urls && ancestor.photo_urls.length > 0 ? (
              <AvatarImage src={ancestor.photo_urls[0]} alt={ancestor.full_name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(ancestor.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-semibold text-sm leading-tight truncate">
                {ancestor.full_name}
              </h4>
              <div className="flex items-center gap-1 ml-2">
                {ancestor.verified_by_elders && (
                  <Crown className="h-3 w-3 text-amber-500" />
                )}
                <div className={`p-1 rounded-full ${getPrivacyColor()}`}>
                  {getPrivacyIcon()}
                </div>
              </div>
            </div>

            {getLifespan() && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Calendar className="h-3 w-3" />
                {getLifespan()}
              </div>
            )}

            <div className="space-y-1">
              {ancestor.occupation && (
                <Badge variant="secondary" className="text-xs">
                  {ancestor.occupation}
                </Badge>
              )}
              
              {ancestor.traditional_title && (
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {ancestor.traditional_title}
                </Badge>
              )}
            </div>

            {ancestor.notable_achievements && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {ancestor.notable_achievements}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};