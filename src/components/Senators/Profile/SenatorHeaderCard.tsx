import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, UserPlus, ExternalLink, Download, Eye } from 'lucide-react';
import { QRCodeModal } from '@/components/camerpulse/QRCodeModal';
import { SenatorExportModal } from '../SenatorExportModal';
import { SenatorPresenceIndicator } from '../SenatorPresenceIndicator';
import { useSenatorFollowing } from '@/hooks/useSenatorFollowing';
import { Senator } from '@/hooks/useSenators';

interface SenatorHeaderCardProps {
  senator: Senator;
}

export function SenatorHeaderCard({ senator }: SenatorHeaderCardProps) {
  const { isFollowing, follow, unfollow, isFollowPending, isUnfollowPending, followerCount } = useSenatorFollowing(senator.id);
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getPartyLogo = (party: string) => {
    // This would typically map to actual party logos
    const partyLogos: Record<string, string> = {
      'CPDM': '/party-logos/cpdm.png',
      'SDF': '/party-logos/sdf.png',
      'UNDP': '/party-logos/undp.png',
    };
    return partyLogos[party] || null;
  };

  const getProfileUrl = () => {
    return `${window.location.origin}/senator/${senator.id}`;
  };

  return (
    <Card className="border-none bg-gradient-to-br from-background via-background to-muted/30">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Profile Photo */}
          <div className="relative">
            <Avatar className="h-32 w-32 ring-4 ring-primary/20 shadow-xl">
              <AvatarImage 
                src={senator.photo_url} 
                alt={senator.full_name || senator.name}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/20 to-secondary/20">
                {getInitials(senator.full_name || senator.name)}
              </AvatarFallback>
            </Avatar>
            {senator.is_verified && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Senator Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 leading-tight">
                {senator.full_name || senator.name}
              </h1>
              <Badge variant="secondary" className="text-base px-4 py-2 font-medium">
                {senator.position}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="text-sm">
                📍 {senator.region}
              </Badge>
              {senator.constituency && (
                <Badge variant="outline" className="text-sm">
                  🏛️ {senator.constituency}
                </Badge>
              )}
            </div>

            {/* Political Party */}
            {(senator.political_party || senator.party_affiliation) && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {getPartyLogo(senator.political_party || senator.party_affiliation || '') && (
                  <img 
                    src={getPartyLogo(senator.political_party || senator.party_affiliation || '')} 
                    alt={senator.political_party || senator.party_affiliation}
                    className="h-8 w-8 rounded"
                  />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Political Party</p>
                  <p className="font-semibold">{senator.political_party || senator.party_affiliation}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => {
                    // Navigate to party page when implemented
                    console.log('Navigate to party:', senator.political_party || senator.party_affiliation);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <SenatorPresenceIndicator senatorId={senator.id} />
            
            <Button 
              onClick={() => isFollowing ? unfollow() : follow()}
              disabled={isFollowPending || isUnfollowPending}
              variant={isFollowing ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {isFollowing ? `Following (${followerCount})` : 'Follow Senator'}
            </Button>
            
            <SenatorExportModal senator={senator} />
            
            <QRCodeModal
              url={getProfileUrl()}
              title={senator.full_name || senator.name}
              description={`${senator.position} - ${senator.region}`}
            >
              <Button variant="outline" size="icon" title="QR Code">
                <QrCode className="h-4 w-4" />
              </Button>
            </QRCodeModal>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}