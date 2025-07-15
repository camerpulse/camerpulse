import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { VerificationBadge } from '@/components/AI/VerificationBadge';
import { AIVerificationModal } from '@/components/AI/AIVerificationModal';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Users, 
  Star,
  Shield,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

interface PoliticianProps {
  id: string;
  name: string;
  role: string;
  party: string;
  region: string;
  avatar?: string;
  approvalRating: number;
  sentimentTrend: 'up' | 'down' | 'stable';
  civicScore: number;
  promisesKept: number;
  totalPromises: number;
  isVerified: boolean;
  lastActive?: string;
  bio: string;
  // AI Verification
  aiVerificationStatus?: "verified" | "unverified" | "disputed" | "pending";
  aiVerificationScore?: number;
  // Term Status
  termStatus?: 'active' | 'expired' | 'deceased' | 'unknown';
  isCurrentlyInOffice?: boolean;
  termStartDate?: string;
  termEndDate?: string;
}

export const PoliticianCard = ({ politician }: { politician: PoliticianProps }) => {
  const getApprovalColor = (rating: number) => {
    if (rating >= 70) return 'bg-cm-green';
    if (rating >= 50) return 'bg-cm-yellow';
    return 'bg-cm-red';
  };

  const getTrendIcon = () => {
    switch (politician.sentimentTrend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-cm-green" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-cm-red" />;
      default: return <div className="w-4 h-4 bg-muted rounded-full"></div>;
    }
  };

  const promisePercentage = (politician.promisesKept / politician.totalPromises) * 100;

  return (
    <Card className="border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={politician.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {politician.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground">{politician.name}</h3>
              {politician.isVerified && (
                <Badge className="bg-cm-yellow text-cm-yellow-foreground px-2 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              {politician.termStatus && politician.isCurrentlyInOffice !== undefined && (
                <Badge 
                  variant={
                    politician.termStatus === 'active' && politician.isCurrentlyInOffice 
                      ? "default" 
                      : politician.termStatus === 'expired' 
                        ? "secondary" 
                        : politician.termStatus === 'deceased'
                          ? "destructive"
                          : "outline"
                  }
                  className="px-2 py-1"
                >
                  {politician.termStatus === 'active' && politician.isCurrentlyInOffice && "In Office"}
                  {politician.termStatus === 'expired' && "Former Official"}
                  {politician.termStatus === 'deceased' && "Deceased"}
                  {politician.termStatus === 'unknown' && "Status Unknown"}
                </Badge>
              )}
              {politician.aiVerificationStatus && (
                <AIVerificationModal
                  targetId={politician.id}
                  targetType="politician"
                  targetName={politician.name}
                >
                  <VerificationBadge 
                    status={politician.aiVerificationStatus}
                    score={politician.aiVerificationScore}
                    className="cursor-pointer"
                  />
                </AIVerificationModal>
              )}
            </div>
            
            <p className="text-sm text-primary font-medium">{politician.role}</p>
            <p className="text-sm text-muted-foreground">{politician.party}</p>
            
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{politician.region}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-2xl font-bold text-foreground">{politician.approvalRating}%</span>
              {getTrendIcon()}
            </div>
            <p className="text-xs text-muted-foreground">Approval Rating</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {politician.bio}
        </p>

        {/* Metrics */}
        <div className="space-y-4 mb-4">
          {/* Approval Rating Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Public Approval</span>
              <span className="text-sm text-muted-foreground">{politician.approvalRating}%</span>
            </div>
            <Progress 
              value={politician.approvalRating} 
              className={`h-2 ${getApprovalColor(politician.approvalRating)}`}
            />
          </div>

          {/* Civic Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Civic Score</span>
              <span className="text-sm text-muted-foreground">{politician.civicScore}/100</span>
            </div>
            <Progress 
              value={politician.civicScore} 
              className="h-2 bg-primary"
            />
          </div>

          {/* Promise Tracker */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Promises Kept</span>
              <span className="text-sm text-muted-foreground">
                {politician.promisesKept}/{politician.totalPromises}
              </span>
            </div>
            <Progress 
              value={promisePercentage} 
              className="h-2 bg-cm-green"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Star className="w-5 h-5 text-accent mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{politician.civicScore}</div>
            <div className="text-xs text-muted-foreground">Civic Score</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{politician.approvalRating}%</div>
            <div className="text-xs text-muted-foreground">Approval</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          
          <Button variant="default" size="sm" className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </div>

        {/* Last Active */}
        {politician.lastActive && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Last active: {politician.lastActive}
          </p>
        )}
      </CardContent>
    </Card>
  );
};