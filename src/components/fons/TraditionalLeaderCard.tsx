import React from 'react';
import { Crown, Users, MapPin, Star, Shield, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

interface TraditionalLeaderCardProps {
  leader: {
    id: string;
    full_name: string;
    title: string;
    region: string;
    village_name?: string;
    portrait_url?: string;
    overall_rating: number;
    total_ratings: number;
    is_verified: boolean;
    slug: string;
    biography?: string;
  };
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export const TraditionalLeaderCard: React.FC<TraditionalLeaderCardProps> = ({
  leader,
  size = 'medium',
  showDetails = true
}) => {
  const getTitleInfo = (title: string) => {
    const titles = {
      'fon': { label: 'Fon', emoji: '👑', color: 'bg-purple-600' },
      'chief': { label: 'Chief', emoji: '🏛️', color: 'bg-blue-600' },
      'sultan': { label: 'Sultan', emoji: '🕌', color: 'bg-green-600' },
      'lamido': { label: 'Lamido', emoji: '⚔️', color: 'bg-red-600' },
      'emir': { label: 'Emir', emoji: '🌟', color: 'bg-yellow-600' },
      'oba': { label: 'Oba', emoji: '👑', color: 'bg-indigo-600' },
      'sarki': { label: 'Sarki', emoji: '🏰', color: 'bg-gray-600' },
      'etsu': { label: 'Etsu', emoji: '🔱', color: 'bg-cyan-600' },
      'mai': { label: 'Mai', emoji: '⭐', color: 'bg-orange-600' }
    };
    return titles[title] || { label: title, emoji: '👑', color: 'bg-amber-600' };
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-amber-400/50 text-amber-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-muted-foreground" />);
    }

    return stars;
  };

  const titleInfo = getTitleInfo(leader.title);
  const cardHeight = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64'
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-amber-200 bg-gradient-to-b from-white to-amber-50/30 overflow-hidden">
      {/* Portrait Section */}
      <div className={`relative ${cardHeight[size]} bg-gradient-to-b from-amber-100 to-orange-100 overflow-hidden`}>
        {leader.portrait_url ? (
          <img 
            src={leader.portrait_url} 
            alt={leader.full_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Avatar className={`${size === 'large' ? 'w-24 h-24' : size === 'medium' ? 'w-16 h-16' : 'w-12 h-12'} border-4 border-amber-300`}>
              <AvatarFallback className="bg-amber-200 text-amber-800 text-lg font-bold">
                {leader.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        {/* Decorative African Pattern Border */}
        <div className="absolute inset-0 border-4 border-amber-300/30 pointer-events-none" />
        
        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {leader.is_verified && (
            <Badge className="bg-emerald-600 text-white text-xs">
              <Shield className="h-2 w-2 mr-1" />
              Verified
            </Badge>
          )}
          <Badge className={`${titleInfo.color} text-white text-xs`}>
            <span className="mr-1">{titleInfo.emoji}</span>
            {titleInfo.label}
          </Badge>
        </div>
        
        {/* Rating Badge */}
        {leader.total_ratings > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
            <Star className="h-2 w-2 fill-amber-400 text-amber-400 mr-1" />
            <span className="text-xs font-medium text-amber-900">
              {leader.overall_rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Cowrie Shell Decorations */}
        <div className="absolute bottom-2 left-2 flex space-x-1 opacity-60">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-amber-300 rounded-full" />
          ))}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-bold text-lg text-amber-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
              {leader.full_name}
            </h3>
            <div className="flex items-center text-amber-700 text-sm">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {leader.village_name || 'Multiple Villages'}, {leader.region}
              </span>
            </div>
          </div>
          
          {showDetails && leader.total_ratings > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(leader.overall_rating)}
              </div>
              <span className="text-xs text-amber-700">
                ({leader.total_ratings} review{leader.total_ratings !== 1 ? 's' : ''})
              </span>
            </div>
          )}
          
          {showDetails && leader.biography && size !== 'small' && (
            <p className="text-sm text-amber-800 line-clamp-2 opacity-80">
              {leader.biography}
            </p>
          )}
          
          <div className="pt-2">
            <Link to={`/fons/${leader.slug}`}>
              <Button 
                size={size === 'small' ? 'sm' : 'default'}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Crown className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Alternative compact horizontal card for lists
export const TraditionalLeaderListCard: React.FC<TraditionalLeaderCardProps> = ({ leader }) => {
  const getTitleInfo = (title: string) => {
    const titles = {
      'fon': { label: 'Fon', emoji: '👑', color: 'bg-purple-600' },
      'chief': { label: 'Chief', emoji: '🏛️', color: 'bg-blue-600' },
      'sultan': { label: 'Sultan', emoji: '🕌', color: 'bg-green-600' },
      'lamido': { label: 'Lamido', emoji: '⚔️', color: 'bg-red-600' }
    };
    return titles[title] || { label: title, emoji: '👑', color: 'bg-amber-600' };
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-muted-foreground" />);
    }

    return stars;
  };

  const titleInfo = getTitleInfo(leader.title);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-amber-200 bg-gradient-to-r from-white to-amber-50/30">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-16 h-16 border-2 border-amber-300">
              <AvatarImage src={leader.portrait_url} />
              <AvatarFallback className="bg-amber-200 text-amber-800 font-bold">
                {leader.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            {/* Decorative corner elements */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full opacity-60" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg text-amber-900 truncate">
                  {leader.full_name}
                </h3>
                <div className="flex items-center text-amber-700 text-sm">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {leader.village_name || 'Multiple Villages'}, {leader.region}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                {leader.is_verified && (
                  <Badge className="bg-emerald-600 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge className={`${titleInfo.color} text-white`}>
                  <span className="mr-1">{titleInfo.emoji}</span>
                  {titleInfo.label}
                </Badge>
              </div>
            </div>
            
            {leader.total_ratings > 0 && (
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center">
                  {renderStars(leader.overall_rating)}
                </div>
                <span className="text-sm text-amber-700">
                  {leader.overall_rating.toFixed(1)} ({leader.total_ratings} reviews)
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              {leader.biography && (
                <p className="text-sm text-amber-800 line-clamp-1 flex-1 mr-4">
                  {leader.biography}
                </p>
              )}
              
              <Link to={`/fons/${leader.slug}`}>
                <Button 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};