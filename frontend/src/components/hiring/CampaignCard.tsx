import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, Target, Users, MapPin, Building, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useCampaignProgress } from '@/hooks/useHiring';
import type { HiringCampaign } from '@/types/hiring';

interface CampaignCardProps {
  campaign: HiringCampaign;
  onClick?: () => void;
  showDetails?: boolean;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  onClick, 
  showDetails = false 
}) => {
  const { data: campaignData } = useCampaignProgress(campaign.id);
  const progress = campaignData?.progress;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{campaign.name}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {getStatusText(campaign.campaign_status)}
              </Badge>
              {campaign.sponsor && (
                <Badge variant="secondary" className="text-xs">
                  {campaign.sponsor.sponsor_type.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
          {campaign.sponsor?.logo_url && (
            <img 
              src={campaign.sponsor.logo_url} 
              alt={campaign.sponsor.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
        </div>
        
        {campaign.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {campaign.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Progress
            </span>
            <span className="font-medium">
              {campaign.current_hires} / {campaign.target_hires} hires
            </span>
          </div>
          <Progress 
            value={progress?.percentage || 0} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress?.percentage || 0}% complete</span>
            {progress?.remaining !== undefined && (
              <span>{progress.remaining} remaining</span>
            )}
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {progress?.daysLeft !== undefined ? (
                progress.daysLeft > 0 ? `${progress.daysLeft} days left` : 'Ended'
              ) : (
                format(new Date(campaign.end_date), 'MMM dd, yyyy')
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">
              {campaign.sponsor?.name || 'Unknown Sponsor'}
            </span>
          </div>
        </div>

        {/* Sectors and Regions */}
        {(campaign.target_sectors.length > 0 || campaign.target_regions.length > 0) && (
          <div className="space-y-2">
            {campaign.target_sectors.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {campaign.target_sectors.slice(0, 3).map(sector => (
                  <Badge key={sector} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
                {campaign.target_sectors.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{campaign.target_sectors.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            {campaign.target_regions.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>
                  {campaign.target_regions.slice(0, 2).join(', ')}
                  {campaign.target_regions.length > 2 && ` +${campaign.target_regions.length - 2} more`}
                </span>
              </div>
            )}
          </div>
        )}

        {showDetails && (
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignCard;