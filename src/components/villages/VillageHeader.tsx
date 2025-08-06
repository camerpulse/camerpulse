import React from 'react';
import { 
  MapPin, Star, Crown, Heart, MessageCircle, Facebook, 
  Share2, Eye, Phone, Mail, Globe, UserPlus, CheckCircle,
  Map, Navigation, Clock, Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface VillageHeaderProps {
  village: any;
  userMembership: any;
  onJoinVillage: () => void;
  onShare: () => void;
}

export const VillageHeader: React.FC<VillageHeaderProps> = ({
  village,
  userMembership,
  onJoinVillage,
  onShare
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-primary text-primary" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-primary/50 text-primary" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  return (
    <div className="relative">
      {/* Hero Background */}
      <div className="h-80 bg-gradient-to-br from-primary via-secondary to-accent relative overflow-hidden">
        {village.village_image && (
          <img 
            src={village.village_image} 
            alt={village.village_name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Header Content */}
        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                    {village.village_name}
                  </h1>
                  {village.is_verified && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Crown className="h-4 w-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center text-lg opacity-90 mb-3">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{village.subdivision}, {village.division}, {village.region}</span>
                </div>

                {village.village_motto && (
                  <blockquote className="text-lg italic opacity-90 mb-4 max-w-2xl">
                    "{village.village_motto}"
                  </blockquote>
                )}

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    {renderStars(village.overall_rating)}
                    <span className="ml-2 font-medium">
                      {village.overall_rating.toFixed(1)} ({village.total_ratings_count} reviews)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {village.view_count?.toLocaleString() || 0} views
                  </div>
                  {village.year_founded && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Founded {village.year_founded}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full sm:w-auto sm:min-w-0">
                {!userMembership ? (
                  <Button 
                    onClick={onJoinVillage}
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-semibold w-full sm:w-auto"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Join Village
                  </Button>
                ) : (
                  <Button 
                    size="lg"
                    variant="secondary"
                    className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
                    disabled
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {userMembership.status === 'verified' ? 'Verified Member' : 'Pending Verification'}
                  </Button>
                )}
                
                <div className="flex gap-2 justify-center sm:justify-start">
                  {village.whatsapp_link && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-white border-white/50 hover:bg-white hover:text-primary flex-shrink-0"
                      asChild
                    >
                      <a href={village.whatsapp_link} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {village.facebook_link && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-white border-white/50 hover:bg-white hover:text-primary flex-shrink-0"
                      asChild
                    >
                      <a href={village.facebook_link} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onShare}
                    className="text-white border-white/50 hover:bg-white hover:text-primary flex-shrink-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Bar */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            {village.village_phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`tel:${village.village_phone}`} className="hover:text-primary">
                  {village.village_phone}
                </a>
              </div>
            )}
            {village.village_email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${village.village_email}`} className="hover:text-primary">
                  {village.village_email}
                </a>
              </div>
            )}
            {village.traditional_languages?.length > 0 && (
              <div className="flex items-center">
                <Languages className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{village.traditional_languages.join(', ')}</span>
              </div>
            )}
            {village.gps_latitude && village.gps_longitude && (
              <div className="flex items-center">
                <Navigation className="h-4 w-4 mr-2 text-muted-foreground" />
                <a 
                  href={`https://maps.google.com/?q=${village.gps_latitude},${village.gps_longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  View on Map
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};