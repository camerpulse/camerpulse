import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Target, Users, CalendarIcon, MapPin, Building, TrendingUp, 
  Clock, Share2, Award, ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { CamerJobsLayout } from '@/components/Layout/CamerJobsLayout';
import { useCampaignProgress } from '@/hooks/useHiring';

const CampaignPublicPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { data: campaignData, isLoading } = useCampaignProgress(campaignId || '');

  if (isLoading) {
    return (
      <CamerJobsLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </CamerJobsLayout>
    );
  }

  if (!campaignData) {
    return (
      <CamerJobsLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground">The campaign you're looking for doesn't exist or is not public.</p>
        </div>
      </CamerJobsLayout>
    );
  }

  const { campaign, hires, progress } = campaignData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const shareUrl = window.location.href;

  return (
    <CamerJobsLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary mb-4">
                {campaign.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(campaign.campaign_status)} text-white border-transparent`}
                >
                  {campaign.campaign_status.charAt(0).toUpperCase() + campaign.campaign_status.slice(1)}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{campaign.sponsor?.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {campaign.sponsor?.sponsor_type.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {campaign.sponsor?.website_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={campaign.sponsor.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Sponsor
                  </a>
                </Button>
              )}
            </div>
          </div>

          {campaign.sponsor?.logo_url && (
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={campaign.sponsor.logo_url} 
                alt={campaign.sponsor.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold">{campaign.sponsor.name}</p>
                <p className="text-sm text-muted-foreground">Campaign Sponsor</p>
              </div>
            </div>
          )}

          {campaign.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {campaign.description}
            </p>
          )}
        </div>

        {/* Progress Section */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Campaign Progress</h2>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {campaign.current_hires} / {campaign.target_hires} hires
                </Badge>
              </div>
              
              <Progress value={progress.percentage} className="h-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">{progress.percentage}%</div>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{campaign.current_hires}</div>
                  <p className="text-sm text-muted-foreground">People Hired</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">{progress.remaining}</div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Campaign Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Start Date</span>
                    <span>{format(new Date(campaign.start_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">End Date</span>
                    <span>{format(new Date(campaign.end_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Days Remaining</span>
                    <span className={progress.daysLeft > 0 ? 'text-green-600' : 'text-red-600'}>
                      {progress.daysLeft > 0 ? `${progress.daysLeft} days` : 'Campaign ended'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Hires */}
            {hires.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Success Stories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hires.slice(0, 5).map((hire, index) => (
                      <div key={hire.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{hire.job_title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {hire.region && (
                              <>
                                <MapPin className="h-3 w-3" />
                                <span>{hire.region}</span>
                              </>
                            )}
                            {hire.sector && (
                              <>
                                <span>•</span>
                                <span>{hire.sector}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {format(new Date(hire.hire_date), 'MMM dd')}
                        </Badge>
                      </div>
                    ))}
                    {hires.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground">
                        And {hires.length - 5} more successful placements...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Target Sectors */}
            {campaign.target_sectors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Target Sectors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {campaign.target_sectors.map(sector => (
                      <Badge key={sector} variant="secondary">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Target Regions */}
            {campaign.target_regions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Target Regions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {campaign.target_regions.map(region => (
                      <div key={region} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{region}</span>
                        <Badge variant="outline" className="text-xs">
                          {hires.filter(h => h.region === region).length} hires
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Budget (if available) */}
            {campaign.budget_allocated && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {campaign.budget_allocated.toLocaleString()} FCFA
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Allocated for this campaign
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Join This Movement</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Be part of this impactful campaign. Whether you're a job seeker, employer, or want to contribute, 
              there are many ways to get involved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/jobs/board">Find Jobs</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/jobs/company">Hire Talent</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CamerJobsLayout>
  );
};

export default CampaignPublicPage;