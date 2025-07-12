import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Star,
  MapPin,
  Users,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';

interface Politician {
  id: string;
  name: string;
  bio?: string;
  region?: string;
  role_title?: string;
  party?: string;
  profile_image_url?: string;
  civic_score: number;
  verified: boolean;
  average_rating?: number;
  total_ratings?: number;
  integrity_rating?: number;
  development_impact_rating?: number;
  transparency_rating?: number;
  follower_count?: number;
  level_of_office?: string;
  political_party?: {
    name: string;
    acronym: string;
  };
  promises_summary?: {
    fulfilled: number;
    unfulfilled: number;
    in_progress: number;
    total: number;
  };
}

interface PoliticianComparisonModalProps {
  politicians: Politician[];
  isOpen: boolean;
  onClose: () => void;
}

export const PoliticianComparisonModal: React.FC<PoliticianComparisonModalProps> = ({
  politicians,
  isOpen,
  onClose
}) => {
  if (politicians.length !== 2) return null;

  const [politician1, politician2] = politicians;

  const getWinner = (value1: number, value2: number) => {
    if (value1 > value2) return 'left';
    if (value2 > value1) return 'right';
    return 'tie';
  };

  const getPromisePercentage = (politician: Politician) => {
    if (!politician.promises_summary || politician.promises_summary.total === 0) return 0;
    return (politician.promises_summary.fulfilled / politician.promises_summary.total) * 100;
  };

  const ComparisonRow = ({ 
    label, 
    value1, 
    value2, 
    format = 'number',
    max = 5 
  }: {
    label: string;
    value1: number;
    value2: number;
    format?: 'number' | 'percentage' | 'rating';
    max?: number;
  }) => {
    const winner = getWinner(value1, value2);
    
    const formatValue = (value: number) => {
      switch (format) {
        case 'percentage':
          return `${value.toFixed(1)}%`;
        case 'rating':
          return `${value.toFixed(1)}/${max}`;
        default:
          return value.toString();
      }
    };

    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
        <div className={`text-center ${winner === 'left' ? 'font-bold text-green-600' : ''}`}>
          {formatValue(value1)}
        </div>
        <div className="text-center text-sm font-medium text-gray-600">
          {label}
        </div>
        <div className={`text-center ${winner === 'right' ? 'font-bold text-green-600' : ''}`}>
          {formatValue(value2)}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparaison des politiciens</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Comparison */}
          <div className="grid grid-cols-2 gap-6">
            {[politician1, politician2].map((politician, index) => (
              <Card key={politician.id} className="text-center">
                <CardContent className="pt-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={politician.profile_image_url} />
                    <AvatarFallback className="bg-cameroon-yellow text-cameroon-primary text-xl">
                      {politician.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{politician.name}</h3>
                    {politician.verified && (
                      <Badge className="bg-blue-500 text-white">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-cameroon-primary mb-1">
                    {politician.role_title}
                  </p>
                  
                  {politician.political_party && (
                    <p className="text-sm text-gray-600 mb-2">
                      {politician.political_party.name}
                    </p>
                  )}
                  
                  <div className="flex justify-center gap-2">
                    {politician.region && (
                      <Badge variant="secondary">
                        <MapPin className="w-3 h-3 mr-1" />
                        {politician.region}
                      </Badge>
                    )}
                    {politician.level_of_office && (
                      <Badge variant="outline">{politician.level_of_office}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metrics Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Comparaison des performances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <ComparisonRow
                  label="Score Civique"
                  value1={politician1.civic_score}
                  value2={politician2.civic_score}
                  format="number"
                  max={100}
                />
                
                <ComparisonRow
                  label="Note Moyenne"
                  value1={politician1.average_rating || 0}
                  value2={politician2.average_rating || 0}
                  format="rating"
                  max={5}
                />
                
                <ComparisonRow
                  label="Intégrité"
                  value1={politician1.integrity_rating || 0}
                  value2={politician2.integrity_rating || 0}
                  format="rating"
                  max={5}
                />
                
                <ComparisonRow
                  label="Impact Développement"
                  value1={politician1.development_impact_rating || 0}
                  value2={politician2.development_impact_rating || 0}
                  format="rating"
                  max={5}
                />
                
                <ComparisonRow
                  label="Transparence"
                  value1={politician1.transparency_rating || 0}
                  value2={politician2.transparency_rating || 0}
                  format="rating"
                  max={5}
                />
                
                <ComparisonRow
                  label="Suiveurs"
                  value1={politician1.follower_count || 0}
                  value2={politician2.follower_count || 0}
                  format="number"
                />
                
                <ComparisonRow
                  label="Évaluations"
                  value1={politician1.total_ratings || 0}
                  value2={politician2.total_ratings || 0}
                  format="number"
                />
                
                <ComparisonRow
                  label="Promesses tenues (%)"
                  value1={getPromisePercentage(politician1)}
                  value2={getPromisePercentage(politician2)}
                  format="percentage"
                />
              </div>
            </CardContent>
          </Card>

          {/* Promises Comparison */}
          <div className="grid grid-cols-2 gap-6">
            {[politician1, politician2].map((politician) => (
              <Card key={`promises-${politician.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{politician.name} - Promesses</CardTitle>
                </CardHeader>
                <CardContent>
                  {politician.promises_summary && politician.promises_summary.total > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total des promesses</span>
                        <span className="font-bold">{politician.promises_summary.total}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Tenues: {politician.promises_summary.fulfilled}</span>
                          <div className="ml-auto text-sm text-gray-500">
                            {politician.promises_summary.total > 0 
                              ? ((politician.promises_summary.fulfilled / politician.promises_summary.total) * 100).toFixed(1)
                              : 0
                            }%
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">En cours: {politician.promises_summary.in_progress}</span>
                          <div className="ml-auto text-sm text-gray-500">
                            {politician.promises_summary.total > 0 
                              ? ((politician.promises_summary.in_progress / politician.promises_summary.total) * 100).toFixed(1)
                              : 0
                            }%
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm">Non tenues: {politician.promises_summary.unfulfilled}</span>
                          <div className="ml-auto text-sm text-gray-500">
                            {politician.promises_summary.total > 0 
                              ? ((politician.promises_summary.unfulfilled / politician.promises_summary.total) * 100).toFixed(1)
                              : 0
                            }%
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Taux de réalisation</span>
                          <span>{getPromisePercentage(politician).toFixed(1)}%</span>
                        </div>
                        <Progress value={getPromisePercentage(politician)} className="h-2" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">Aucune promesse enregistrée</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bio Comparison */}
          <div className="grid grid-cols-2 gap-6">
            {[politician1, politician2].map((politician) => (
              <Card key={`bio-${politician.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{politician.name} - Biographie</CardTitle>
                </CardHeader>
                <CardContent>
                  {politician.bio ? (
                    <p className="text-sm text-gray-700">{politician.bio}</p>
                  ) : (
                    <p className="text-center text-gray-500 py-4">Aucune biographie disponible</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};