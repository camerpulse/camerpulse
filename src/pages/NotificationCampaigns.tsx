import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, Send, Users, TrendingUp, Clock, 
  BarChart3, CheckCircle, AlertCircle 
} from 'lucide-react';

interface NotificationCampaign {
  id: string;
  campaign_name: string;
  status: string;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  started_at: string | null;
  completed_at: string | null;
}

const NotificationCampaigns: React.FC = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    message: '',
    audience: 'all',
    channels: ['email']
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = () => {
    // Mock campaigns data
    const mockCampaigns = [
      {
        id: '1',
        campaign_name: 'Weekly Civic Update',
        status: 'completed',
        sent_count: 1250,
        delivered_count: 1200,
        opened_count: 840,
        clicked_count: 120,
        started_at: new Date(Date.now() - 86400000).toISOString(),
        completed_at: new Date(Date.now() - 43200000).toISOString()
      },
      {
        id: '2',
        campaign_name: 'Emergency Alert System',
        status: 'running',
        sent_count: 2100,
        delivered_count: 2050,
        opened_count: 1890,
        clicked_count: 340,
        started_at: new Date(Date.now() - 3600000).toISOString(),
        completed_at: null
      },
      {
        id: '3',
        campaign_name: 'Poll Results Notification',
        status: 'scheduled',
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        started_at: null,
        completed_at: null
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const createCampaign = () => {
    if (!newCampaign.name || !newCampaign.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const campaign: NotificationCampaign = {
      id: Date.now().toString(),
      campaign_name: newCampaign.name,
      status: 'draft',
      sent_count: 0,
      delivered_count: 0,
      opened_count: 0,
      clicked_count: 0,
      started_at: null,
      completed_at: null
    };

    setCampaigns(prev => [campaign, ...prev]);
    setNewCampaign({ name: '', message: '', audience: 'all', channels: ['email'] });
    setShowCreateForm(false);

    toast({
      title: "Success",
      description: "Campaign created successfully"
    });
  };

  const launchCampaign = (campaignId: string) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === campaignId 
          ? { 
              ...campaign, 
              status: 'running',
              started_at: new Date().toISOString()
            }
          : campaign
      )
    );

    toast({
      title: "Campaign Launched",
      description: "Your notification campaign has been launched"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'scheduled': return 'bg-yellow-500';
      case 'paused': return 'bg-orange-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <TrendingUp className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const calculateOpenRate = (campaign: NotificationCampaign) => {
    return campaign.delivered_count > 0 
      ? Math.round((campaign.opened_count / campaign.delivered_count) * 100)
      : 0;
  };

  const calculateClickRate = (campaign: NotificationCampaign) => {
    return campaign.opened_count > 0 
      ? Math.round((campaign.clicked_count / campaign.opened_count) * 100)
      : 0;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notification Campaigns</h1>
            <p className="text-muted-foreground">Create and manage targeted notification campaigns</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Send className="h-4 w-4" />
            Create Campaign
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground">Active campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Messages Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.reduce((sum, c) => sum + c.sent_count, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Open Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">Average open rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                Click Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12%</div>
              <p className="text-xs text-muted-foreground">Average click rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Campaign Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input
                    placeholder="Enter campaign name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select 
                    value={newCampaign.audience} 
                    onValueChange={(value) => setNewCampaign(prev => ({ ...prev, audience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="citizens">Citizens Only</SelectItem>
                      <SelectItem value="officials">Officials Only</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Message Content</label>
                <Textarea
                  placeholder="Enter your notification message"
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={createCampaign}>Create Campaign</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      {campaign.campaign_name}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status.toUpperCase()}
                      </Badge>
                      {campaign.started_at && (
                        <span className="text-sm text-muted-foreground">
                          Started: {new Date(campaign.started_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {campaign.status === 'draft' && (
                    <Button 
                      onClick={() => launchCampaign(campaign.id)}
                      size="sm"
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Launch
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Messages Sent</div>
                    <div className="text-2xl font-bold">{campaign.sent_count.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Delivered</div>
                    <div className="text-2xl font-bold text-green-600">{campaign.delivered_count.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {campaign.sent_count > 0 ? Math.round((campaign.delivered_count / campaign.sent_count) * 100) : 0}% delivery rate
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Opened</div>
                    <div className="text-2xl font-bold text-blue-600">{campaign.opened_count.toLocaleString()}</div>
                    <div className="flex items-center gap-2">
                      <Progress value={calculateOpenRate(campaign)} className="flex-1" />
                      <span className="text-xs text-muted-foreground">{calculateOpenRate(campaign)}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Clicked</div>
                    <div className="text-2xl font-bold text-purple-600">{campaign.clicked_count.toLocaleString()}</div>
                    <div className="flex items-center gap-2">
                      <Progress value={calculateClickRate(campaign)} className="flex-1" />
                      <span className="text-xs text-muted-foreground">{calculateClickRate(campaign)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationCampaigns;