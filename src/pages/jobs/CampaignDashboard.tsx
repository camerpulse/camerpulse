import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, Users, CalendarIcon, MapPin, Building, TrendingUp, 
  Clock, Plus, BarChart3, Settings 
} from 'lucide-react';
import { format } from 'date-fns';
import { CamerJobsLayout } from '@/components/Layout/CamerJobsLayout';
import { useActiveCampaigns } from '@/hooks/useHiring';
import CampaignCard from '@/components/hiring/CampaignCard';
import CampaignCreationForm from '@/components/hiring/CampaignCreationForm';

const CampaignDashboard = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  const { data: campaigns, isLoading } = useActiveCampaigns();

  const totalTargetHires = campaigns?.reduce((sum, c) => sum + c.target_hires, 0) || 0;
  const totalCurrentHires = campaigns?.reduce((sum, c) => sum + c.current_hires, 0) || 0;
  const overallProgress = totalTargetHires > 0 ? Math.round((totalCurrentHires / totalTargetHires) * 100) : 0;

  if (showCreateForm) {
    return (
      <CamerJobsLayout>
        <div className="container mx-auto px-4 py-8">
          <CampaignCreationForm
            onSuccess={() => {
              setShowCreateForm(false);
              // Could add refetch here
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </CamerJobsLayout>
    );
  }

  return (
    <CamerJobsLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              🎯 Campaign Management
            </h1>
            <p className="text-muted-foreground">
              Create, track, and manage hiring campaigns across Cameroon
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns?.length || 0}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Target</p>
                  <p className="text-2xl font-bold">{totalTargetHires.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hires Achieved</p>
                  <p className="text-2xl font-bold">{totalCurrentHires.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold">{overallProgress}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress Bar */}
        {totalTargetHires > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Platform-wide Campaign Progress</h3>
                  <Badge variant="outline">
                    {totalCurrentHires} / {totalTargetHires} hires
                  </Badge>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{overallProgress}% of all campaign targets achieved</span>
                  <span>{totalTargetHires - totalCurrentHires} hires remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Campaigns</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-2 bg-muted rounded"></div>
                        <div className="flex gap-2">
                          <div className="h-5 bg-muted rounded w-16"></div>
                          <div className="h-5 bg-muted rounded w-20"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    showDetails
                    onClick={() => setSelectedCampaign(campaign.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Active Campaigns</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first hiring campaign to start making an impact
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Completed Campaigns</h3>
                <p className="text-muted-foreground">
                  View historical campaign performance and success stories
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Detailed analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4" />
                    <p>Regional breakdown coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CamerJobsLayout>
  );
};

export default CampaignDashboard;