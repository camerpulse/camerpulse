import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Award, CheckCircle, Shield, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CredibilityScoreCardProps {
  score: number;
  level: 'high' | 'moderate' | 'low';
  entityType: 'issuer' | 'bidder';
  entityName: string;
  stats?: {
    tenders_posted?: number;
    tenders_awarded?: number;
    bids_submitted?: number;
    bids_won?: number;
    win_ratio?: number;
    delivery_success_rate?: number;
    fraud_flags_count?: number;
    complaints_count?: number;
    average_rating?: number;
    badges?: string[];
  };
  compact?: boolean;
}

export function CredibilityScoreCard({ 
  score, 
  level, 
  entityType, 
  entityName, 
  stats = {},
  compact = false 
}: CredibilityScoreCardProps) {
  const getScoreColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-700 bg-green-100';
      case 'moderate': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getScoreIcon = (level: string) => {
    switch (level) {
      case 'high': return <CheckCircle className="h-5 w-5" />;
      case 'moderate': return <Shield className="h-5 w-5" />;
      case 'low': return <AlertTriangle className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Gold Vendor': return <Trophy className="h-3 w-3" />;
      case 'Verified Technical Partner': return <Award className="h-3 w-3" />;
      case 'High Trust Score': return <Shield className="h-3 w-3" />;
      default: return null;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg">
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium", getScoreColor(level))}>
          {getScoreIcon(level)}
          <span>{score}/100</span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{entityName}</p>
          <p className="text-xs text-muted-foreground capitalize">{level} credibility</p>
        </div>
        {stats.badges && stats.badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {stats.badges.slice(0, 2).map((badge, index) => (
              <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                {getBadgeIcon(badge)}
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{entityName}</span>
          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium", getScoreColor(level))}>
            {getScoreIcon(level)}
            <span>{score}/100</span>
          </div>
        </CardTitle>
        <CardDescription>
          {entityType === 'issuer' ? 'Tender Issuer' : 'Bidder'} Credibility Profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Credibility Score</span>
            <span className="font-medium">{score}/100</span>
          </div>
          <div className="relative">
            <Progress value={score} className="h-2" />
            <div 
              className={cn("absolute top-0 left-0 h-2 rounded-full transition-all", getProgressColor(level))}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {level === 'high' && "🟢 Highly credible - Excellent track record"}
            {level === 'moderate' && "🟡 Moderate credibility - Generally reliable"}
            {level === 'low' && "🔴 Low credibility - Exercise caution"}
          </p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {entityType === 'issuer' ? (
            <>
              <div>
                <p className="text-muted-foreground">Tenders Posted</p>
                <p className="font-semibold">{stats.tenders_posted || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tenders Awarded</p>
                <p className="font-semibold">{stats.tenders_awarded || 0}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-muted-foreground">Bids Submitted</p>
                <p className="font-semibold">{stats.bids_submitted || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bids Won</p>
                <p className="font-semibold">{stats.bids_won || 0}</p>
              </div>
            </>
          )}
          
          {stats.win_ratio !== undefined && (
            <div>
              <p className="text-muted-foreground">Win Ratio</p>
              <p className="font-semibold">{(stats.win_ratio * 100).toFixed(1)}%</p>
            </div>
          )}
          
          {stats.delivery_success_rate !== undefined && (
            <div>
              <p className="text-muted-foreground">Success Rate</p>
              <p className="font-semibold">{(stats.delivery_success_rate * 100).toFixed(1)}%</p>
            </div>
          )}
          
          {stats.average_rating !== undefined && (
            <div>
              <p className="text-muted-foreground">Avg Rating</p>
              <p className="font-semibold">{stats.average_rating.toFixed(1)}/5</p>
            </div>
          )}
        </div>

        {/* Warning Indicators */}
        {(stats.fraud_flags_count || 0) > 0 || (stats.complaints_count || 0) > 0 ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Warning Indicators</span>
            </div>
            <div className="mt-2 text-sm text-red-600">
              {(stats.fraud_flags_count || 0) > 0 && (
                <p>• {stats.fraud_flags_count} fraud flag{stats.fraud_flags_count !== 1 ? 's' : ''}</p>
              )}
              {(stats.complaints_count || 0) > 0 && (
                <p>• {stats.complaints_count} complaint{stats.complaints_count !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        ) : null}

        {/* Badges */}
        {stats.badges && stats.badges.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Achievement Badges</p>
            <div className="flex flex-wrap gap-2">
              {stats.badges.map((badge, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {getBadgeIcon(badge)}
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}