import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  MapPin, 
  Star, 
  TrendingUp, 
  ExternalLink,
  Calendar,
  Award,
  Eye,
  Globe
} from 'lucide-react';
import { PoliticalParty } from '@/hooks/usePoliticalData';

interface PoliticalPartyCardProps {
  party: PoliticalParty;
  showFullDetails?: boolean;
  showStats?: boolean;
}

export const PoliticalPartyCard: React.FC<PoliticalPartyCardProps> = ({
  party,
  showFullDetails = false,
  showStats = true,
}) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    if (rating >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getIdeologyColor = (ideology: string) => {
    const lower = ideology?.toLowerCase() || '';
    if (lower.includes('left')) return 'destructive';
    if (lower.includes('right')) return 'default';
    if (lower.includes('center')) return 'secondary';
    return 'outline';
  };

  const partySlug = party.slug || party.name.toLowerCase().replace(/\s+/g, '-');
  const totalMembers = party.mps_count + party.senators_count + party.mayors_count;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-4">
          {party.logo_url && (
            <div className="flex-shrink-0">
              <img 
                src={party.logo_url} 
                alt={`${party.name} logo`}
                className="w-16 h-16 object-contain rounded-lg border border-border"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link 
                  to={`/political-parties/${partySlug}`}
                  className="block hover:text-primary transition-colors"
                >
                  <CardTitle className="text-lg group-hover:text-primary line-clamp-1">
                    {party.name}
                  </CardTitle>
                </Link>
                
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {party.acronym && (
                    <Badge variant="outline" className="text-sm">
                      {party.acronym}
                    </Badge>
                  )}
                  
                  {party.ideology && (
                    <Badge variant={getIdeologyColor(party.ideology)} className="text-xs">
                      {party.ideology}
                    </Badge>
                  )}
                  
                  {party.political_leaning && (
                    <Badge variant="secondary" className="text-xs">
                      {party.political_leaning}
                    </Badge>
                  )}
                  
                  <Badge 
                    variant={party.is_active ? 'default' : 'destructive'} 
                    className="text-xs"
                  >
                    {party.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Location and Founded */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
          {party.headquarters_region && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{party.headquarters_city}, {party.headquarters_region}</span>
            </div>
          )}
          
          {party.founding_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Founded {new Date(party.founding_date).getFullYear()}</span>
            </div>
          )}
        </div>

        {/* Mission/Vision */}
        {(party.mission || party.vision) && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {party.mission || party.vision}
          </p>
        )}

        {/* Leadership */}
        {party.party_president && (
          <div className="mb-3">
            <div className="text-sm text-muted-foreground">
              <strong>President:</strong> {party.party_president}
            </div>
            {party.secretary_general && (
              <div className="text-sm text-muted-foreground">
                <strong>Secretary General:</strong> {party.secretary_general}
              </div>
            )}
          </div>
        )}

        {/* Membership Stats */}
        {showStats && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Representatives</span>
              <span className="text-sm font-semibold">{totalMembers}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">MPs</div>
                <div className="text-lg font-bold text-primary">{party.mps_count}</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">Senators</div>
                <div className="text-lg font-bold text-primary">{party.senators_count}</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">Mayors</div>
                <div className="text-lg font-bold text-primary">{party.mayors_count}</div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Ratings */}
        {showFullDetails && party.total_ratings > 0 && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className={`text-sm font-semibold ${getRatingColor(party.approval_rating)}`}>
                  {party.approval_rating.toFixed(1)}/5
                </span>
                <span className="text-xs text-muted-foreground">({party.total_ratings})</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">Trust</div>
                <div className={getRatingColor(party.trust_rating)}>
                  {party.trust_rating.toFixed(1)}/5
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Transparency</div>
                <div className={getRatingColor(party.transparency_rating)}>
                  {party.transparency_rating.toFixed(1)}/5
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Development</div>
                <div className={getRatingColor(party.development_rating)}>
                  {party.development_rating.toFixed(1)}/5
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Link to={`/political-parties/${partySlug}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            {party.official_website && (
              <Button variant="ghost" size="sm" asChild>
                <a 
                  href={party.official_website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};