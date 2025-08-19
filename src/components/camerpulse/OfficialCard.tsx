/**
 * OfficialCard Component
 * 
 * Unified card for displaying political officials with civic metrics
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserAvatar } from './UserAvatar';
import { CivicTag } from './CivicTag';
import { RatingStars } from './RatingStars';
import { FollowButton } from './FollowButton';
import { 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  ExternalLink,
  MapPin,
  Building,
  Calendar
} from 'lucide-react';
import { Official } from './types';

interface OfficialCardProps {
  official: Official;
  onMessage?: (officialId: string) => void;
  onViewProfile?: (officialId: string) => void;
  onRate?: (officialId: string, rating: number) => void;
  showActions?: boolean;
  className?: string;
}

export const OfficialCard: React.FC<OfficialCardProps> = ({
  official,
  onMessage,
  onViewProfile,
  onRate,
  showActions = true,
  className = ''
}) => {
  const getApprovalColor = (rating: number) => {
    if (rating >= 70) return 'text-cm-green';
    if (rating >= 50) return 'text-cm-yellow';
    return 'text-cm-red';
  };

  const getTrendIcon = () => {
    // This would typically come from trend data
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    return trend === 'up' 
      ? <TrendingUp className="w-4 h-4 text-cm-green" />
      : <TrendingDown className="w-4 h-4 text-cm-red" />;
  };

  const promisePercentage = official.totalPromises 
    ? (official.promisesKept! / official.totalPromises) * 100 
    : 0;

  return (
    <Card className={`hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <UserAvatar 
            user={official} 
            size="lg" 
            onClick={() => onViewProfile?.(official.id)}
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-foreground">{official.name}</h3>
              <CivicTag 
                type={official.isCurrentlyInOffice ? "official" : "custom"} 
                label={official.isCurrentlyInOffice ? "En fonction" : "Ancien"} 
                size="sm" 
              />
            </div>
            
            <p className="text-sm font-medium text-primary mb-1">{official.role}</p>
            {official.party && (
              <CivicTag type="party" label={official.party} size="sm" className="mb-2" />
            )}
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{official.region}</span>
            </div>

            {/* AI Verification Status */}
            {official.aiVerificationStatus && (
              <div className="mt-2">
                <CivicTag 
                  type={official.aiVerificationStatus === 'verified' ? 'verified' : 'warning'} 
                  label={`IA: ${official.aiVerificationStatus}`} 
                  size="sm" 
                />
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              <span className={`text-2xl font-bold ${getApprovalColor(official.approvalRating)}`}>
                {official.approvalRating}%
              </span>
              {getTrendIcon()}
            </div>
            <p className="text-xs text-muted-foreground">Approbation</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4 mb-4">
          {/* Approval Rating */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Approbation publique</span>
              <span className="text-sm text-muted-foreground">{official.approvalRating}%</span>
            </div>
            <Progress value={official.approvalRating} className="h-2" />
          </div>

          {/* Civic Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Civic Score</span>
              <span className="text-sm text-muted-foreground">{official.civicScore}/100</span>
            </div>
            <Progress value={official.civicScore} className="h-2" />
          </div>

          {/* Promise Tracker */}
          {official.totalPromises && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Promises Kept</span>
                <span className="text-sm text-muted-foreground">
                  {official.promisesKept}/{official.totalPromises}
                </span>
              </div>
              <Progress value={promisePercentage} className="h-2" />
            </div>
          )}
        </div>

        {/* Rating Section */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Votre évaluation</span>
            <RatingStars 
              rating={0} 
              size="sm" 
              onRatingChange={(rating) => onRate?.(official.id, rating)}
            />
          </div>
        </div>

        {/* Term Status */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Building className="w-4 h-4 text-primary" />
            <span className="font-medium">Statut:</span>
            <CivicTag 
              type={official.termStatus === 'active' ? 'success' : 'pending'} 
              label={
                official.termStatus === 'active' && official.isCurrentlyInOffice 
                  ? 'En fonction' 
                  : official.termStatus === 'expired' 
                    ? 'Mandat terminé'
                    : official.termStatus === 'deceased'
                      ? 'Décédé'
                      : 'Statut inconnu'
              } 
              size="sm" 
            />
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onMessage?.(official.id)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewProfile?.(official.id)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Profil
            </Button>
            
            <FollowButton 
              targetUserId={official.id} 
              targetUsername={official.name}
              size="sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};