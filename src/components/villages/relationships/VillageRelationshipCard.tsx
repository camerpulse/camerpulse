import React from 'react';
import { Calendar, MapPin, Users, ArrowRight, Clock, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VillageRelationshipCardProps {
  relationship: any;
  currentVillageId: string;
}

export const VillageRelationshipCard: React.FC<VillageRelationshipCardProps> = ({
  relationship,
  currentVillageId
}) => {
  const isSource = relationship.source_village_id === currentVillageId;
  const connectedVillage = isSource ? relationship.target_village : relationship.source_village;

  const getRelationshipTypeColor = (type: string) => {
    switch (type) {
      case 'sister_village': return 'bg-pink-100 text-pink-800';
      case 'trade_partner': return 'bg-green-100 text-green-800';
      case 'historical_alliance': return 'bg-blue-100 text-blue-800';
      case 'cultural_exchange': return 'bg-purple-100 text-purple-800';
      case 'marriage_alliance': return 'bg-red-100 text-red-800';
      case 'neighboring_village': return 'bg-yellow-100 text-yellow-800';
      case 'diaspora_connection': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'historical': return 'bg-blue-100 text-blue-800';
      case 'dormant': return 'bg-gray-100 text-gray-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'renewed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRelationshipType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <h4 className="font-semibold">{connectedVillage?.village_name}</h4>
                <p className="text-sm text-muted-foreground">{connectedVillage?.region}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={getRelationshipTypeColor(relationship.relationship_type)}>
                {formatRelationshipType(relationship.relationship_type)}
              </Badge>
              <Badge variant="outline" className={getStatusColor(relationship.relationship_status)}>
                {formatRelationshipType(relationship.relationship_status)}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {relationship.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {relationship.description}
            </p>
          )}

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {relationship.established_year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>Est. {relationship.established_year}</span>
              </div>
            )}
            
            {relationship.distance_km && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>{relationship.distance_km} km away</span>
              </div>
            )}

            {relationship.travel_time_hours && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{relationship.travel_time_hours}h travel</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span>{formatRelationshipType(relationship.contact_frequency)}</span>
            </div>
          </div>

          {/* Current Activities */}
          {relationship.current_activities && relationship.current_activities.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Current Activities:</p>
              <div className="flex flex-wrap gap-1">
                {relationship.current_activities.slice(0, 3).map((activity: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {activity}
                  </Badge>
                ))}
                {relationship.current_activities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{relationship.current_activities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Transport Methods */}
          {relationship.transport_methods && relationship.transport_methods.length > 0 && (
            <div className="flex items-center gap-2">
              <Car className="h-3 w-3 text-muted-foreground" />
              <div className="flex gap-1">
                {relationship.transport_methods.map((method: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Strength Indicator */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">Relationship Strength</span>
            <div className="flex gap-1">
              {['weak', 'medium', 'strong', 'very_strong'].map((level, index) => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${
                    ['weak', 'medium', 'strong', 'very_strong'].indexOf(relationship.relationship_strength) >= index
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};