import React from 'react';
import { Users, Star, BookOpen, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CulturalConnectionCardProps {
  connection: any;
  currentVillageId: string;
}

export const CulturalConnectionCard: React.FC<CulturalConnectionCardProps> = ({
  connection,
  currentVillageId
}) => {
  const isVillageA = connection.village_a_id === currentVillageId;
  const connectedVillage = isVillageA ? connection.village_b : connection.village_a;

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case 'shared_language': return 'bg-blue-100 text-blue-800';
      case 'shared_dialect': return 'bg-cyan-100 text-cyan-800';
      case 'similar_traditions': return 'bg-purple-100 text-purple-800';
      case 'common_ancestry': return 'bg-green-100 text-green-800';
      case 'trade_customs': return 'bg-orange-100 text-orange-800';
      case 'art_styles': return 'bg-pink-100 text-pink-800';
      case 'music_traditions': return 'bg-indigo-100 text-indigo-800';
      case 'dance_forms': return 'bg-red-100 text-red-800';
      case 'craft_techniques': return 'bg-yellow-100 text-yellow-800';
      case 'food_culture': return 'bg-emerald-100 text-emerald-800';
      case 'architecture_style': return 'bg-stone-100 text-stone-800';
      case 'governance_system': return 'bg-violet-100 text-violet-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatConnectionType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSimilarityColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <h4 className="font-semibold">{connectedVillage?.village_name}</h4>
                <p className="text-sm text-muted-foreground">{connectedVillage?.region}</p>
              </div>
            </div>
            <Badge className={getConnectionTypeColor(connection.connection_type)}>
              {formatConnectionType(connection.connection_type)}
            </Badge>
          </div>

          {/* Similarity Score */}
          {connection.similarity_score && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cultural Similarity</span>
                <span className={`text-sm font-bold ${getSimilarityColor(connection.similarity_score)}`}>
                  {connection.similarity_score}%
                </span>
              </div>
              <Progress value={connection.similarity_score} className="h-2" />
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {connection.description}
          </p>

          {/* Historical Context */}
          {connection.historical_context && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <BookOpen className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Historical Context</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {connection.historical_context}
              </p>
            </div>
          )}

          {/* Evidence Types */}
          {connection.evidence_type && connection.evidence_type.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Evidence:</p>
              <div className="flex flex-wrap gap-1">
                {connection.evidence_type.map((evidence: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {formatConnectionType(evidence)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Verification Status */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              {connection.verified_by_scholars ? (
                <>
                  <Award className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Scholar Verified</span>
                </>
              ) : (
                <>
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">Community Knowledge</span>
                </>
              )}
            </div>
            
            {connection.verification_date && (
              <span className="text-xs text-muted-foreground">
                Verified {new Date(connection.verification_date).getFullYear()}
              </span>
            )}
          </div>

          {/* Research Sources Count */}
          {connection.research_sources && connection.research_sources.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {connection.research_sources.length} research source{connection.research_sources.length !== 1 ? 's' : ''} available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};