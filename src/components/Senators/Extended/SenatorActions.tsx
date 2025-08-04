import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MoreVertical, Heart, HeartOff, MessageSquare, Crown, 
  AlertTriangle, Download, Share2, ExternalLink, 
  TrendingUp, Calendar, Users
} from 'lucide-react';
import { Senator } from '@/hooks/useSenators';
import { useSenatorFollowing, useToggleSenatorFollow } from '@/hooks/useSenatorExtended';
import { SenatorClaimDialog } from './SenatorClaimDialog';
import { SenatorReportDialog } from './SenatorReportDialog';
import { SenatorMessageDialog } from './SenatorMessageDialog';
import { SenatorShareDialog } from './SenatorShareDialog';
import { exportSenatorToPDF, SenatorPDFData } from '@/utils/pdfExport';
import { toast } from 'sonner';

interface SenatorActionsProps {
  senator: Senator;
  hasProAccess?: boolean;
  showInline?: boolean;
}

export const SenatorActions = ({ senator, hasProAccess = false, showInline = false }: SenatorActionsProps) => {
  const { data: followingData } = useSenatorFollowing(senator.id);
  const toggleFollow = useToggleSenatorFollow();

  const handleFollow = () => {
    toggleFollow.mutate({
      senatorId: senator.id,
      isFollowing: followingData?.isFollowing || false
    });
  };

  const handleDownloadProfile = () => {
    // Implementation for PDF download
    console.log('Download profile for:', senator.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${senator.full_name || senator.name} - CamerPulse`,
        text: `Check out ${senator.full_name || senator.name}'s profile on CamerPulse`,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (showInline) {
    return (
      <div className="space-y-4">
        {/* Trust Score and Stats */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {senator.trust_score?.toFixed(1) || '50.0'}
                </div>
                <div className="text-xs text-muted-foreground">Trust Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {senator.follower_count || 0}
                </div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Actions */}
        <div className="space-y-2">
          <Button 
            onClick={handleFollow}
            variant={followingData?.isFollowing ? "outline" : "default"}
            className="w-full"
            disabled={toggleFollow.isPending}
          >
            {followingData?.isFollowing ? (
              <>
                <HeartOff className="h-4 w-4 mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Follow
              </>
            )}
          </Button>

          <SenatorMessageDialog
            senator={senator}
            hasProAccess={hasProAccess}
            trigger={
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            }
          />

          {senator.is_claimable && !senator.is_claimed && (
            <SenatorClaimDialog
              senator={senator}
              trigger={
                <Button variant="outline" className="w-full">
                  <Crown className="h-4 w-4 mr-2" />
                  Claim Profile
                </Button>
              }
            />
          )}
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={handleDownloadProfile}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Status Badges */}
        <div className="space-y-2">
          {senator.is_claimed && (
            <Badge variant="default" className="w-full justify-center">
              <Crown className="h-3 w-3 mr-1" />
              Verified Account
            </Badge>
          )}
          
          {senator.misconduct_reports_count && senator.misconduct_reports_count > 0 && (
            <Badge variant="destructive" className="w-full justify-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {senator.misconduct_reports_count} Report{senator.misconduct_reports_count > 1 ? 's' : ''}
            </Badge>
          )}

          {senator.response_rate && senator.response_rate > 80 && (
            <Badge variant="outline" className="w-full justify-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Quick Responder
            </Badge>
          )}
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          {senator.term_start_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Term: {new Date(senator.term_start_date).getFullYear()}
              {senator.term_end_date && ` - ${new Date(senator.term_end_date).getFullYear()}`}
            </div>
          )}
          
          {senator.engagement_score && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Engagement: {senator.engagement_score.toFixed(1)}%
            </div>
          )}
        </div>

        {/* Report Option */}
        <SenatorReportDialog
          senator={senator}
          trigger={
            <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Misconduct
            </Button>
          }
        />
      </div>
    );
  }

  // Compact dropdown version
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleFollow} disabled={toggleFollow.isPending}>
          {followingData?.isFollowing ? (
            <>
              <HeartOff className="h-4 w-4 mr-2" />
              Unfollow
            </>
          ) : (
            <>
              <Heart className="h-4 w-4 mr-2" />
              Follow
            </>
          )}
        </DropdownMenuItem>

        <SenatorMessageDialog
          senator={senator}
          hasProAccess={hasProAccess}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </DropdownMenuItem>
          }
        />

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDownloadProfile}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Profile
        </DropdownMenuItem>

        {senator.official_senate_url && (
          <DropdownMenuItem asChild>
            <a href={senator.official_senate_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Official Page
            </a>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {senator.is_claimable && !senator.is_claimed && (
          <SenatorClaimDialog
            senator={senator}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Crown className="h-4 w-4 mr-2" />
                Claim Profile
              </DropdownMenuItem>
            }
          />
        )}

        <SenatorReportDialog
          senator={senator}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Misconduct
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};