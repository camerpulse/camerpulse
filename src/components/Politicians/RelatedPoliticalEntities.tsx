import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, Users, ArrowRight, ExternalLink } from 'lucide-react';
import { useRelatedPoliticalEntities } from '@/hooks/usePoliticalEntityRelations';
import { Link } from 'react-router-dom';

interface RelatedPoliticalEntitiesProps {
  entityId: string;
  entityType: 'senator' | 'minister' | 'mp' | 'politician';
  entityName: string;
}

export const RelatedPoliticalEntities: React.FC<RelatedPoliticalEntitiesProps> = ({
  entityId,
  entityType,
  entityName,
}) => {
  const { data: relatedData, isLoading } = useRelatedPoliticalEntities(entityId, entityType);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Related Political Figures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading related entities...</div>
        </CardContent>
      </Card>
    );
  }

  if (!relatedData?.sameParty?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Related Political Figures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No related political figures found in the same party.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEntityPath = (entity: any) => {
    switch (entity.entity_type) {
      case 'senator':
        return `/senators/${entity.id}`;
      case 'minister':
        return `/ministers/${entity.id}`;
      case 'mp':
        return `/mps/${entity.id}`;
      case 'politician':
        return `/politicians/${entity.id}`;
      default:
        return '#';
    }
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'senator':
        return 'Senator';
      case 'minister':
        return 'Minister';
      case 'mp':
        return 'MP';
      case 'politician':
        return 'Politician';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Same Party Members
        </CardTitle>
        {relatedData.sameParty[0]?.political_party && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {relatedData.sameParty[0].political_party.logo_url && (
                <img 
                  src={relatedData.sameParty[0].political_party.logo_url} 
                  alt={relatedData.sameParty[0].political_party.name}
                  className="w-4 h-4"
                />
              )}
              {relatedData.sameParty[0].political_party.acronym || relatedData.sameParty[0].political_party.name}
            </Badge>
            {relatedData.politicalPartyId && (
              <Link to={`/political-parties/${relatedData.politicalPartyId}`}>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  View Party <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {relatedData.sameParty.map((entity) => (
            <Link key={entity.id} to={getEntityPath(entity)}>
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={entity.profile_picture_url} 
                      alt={entity.name}
                    />
                    <AvatarFallback>
                      {entity.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{entity.name}</h4>
                      {entity.is_verified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{getEntityTypeLabel(entity.entity_type)}</span>
                      {entity.position && entity.position !== entity.name && (
                        <>
                          <span>•</span>
                          <span className="truncate">{entity.position}</span>
                        </>
                      )}
                      {entity.region && (
                        <>
                          <span>•</span>
                          <span>{entity.region}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {entity.average_rating && entity.average_rating > 0 && (
                    <div className="flex items-center text-xs">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{entity.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {relatedData.sameParty.length >= 10 && (
          <div className="mt-4 text-center">
            <Link to={`/political-parties/${relatedData.politicalPartyId}`}>
              <Button variant="outline" size="sm">
                View All Party Members
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};