import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  Users, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap
} from 'lucide-react';

interface NotificationCampaign {
  id: string;
  title: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients: number;
  sentAt?: string;
  scheduledAt?: string;
  message: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'petition_update' | 'signature_milestone' | 'petition_success' | 'custom';
  subject: string;
  content: string;
}

export function PetitionNotifications() {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    type: 'email' as const,
    message: '',
    subject: '',
    targetAudience: 'all' as 'all' | 'signers' | 'creators' | 'region',
    petitionId: '',
    scheduleType: 'immediate' as 'immediate' | 'scheduled',
    scheduledDate: '',
    scheduledTime: '',
    webhookUrl: '', // For Zapier integration
  });
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  const fetchCampaigns = async () => {
    // Mock data
    const mockCampaigns: NotificationCampaign[] = [
      {
        id: '1',
        title: 'Weekly Petition Update',
        type: 'email',
        status: 'sent',
        recipients: 1234,
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Thank you for signing our petition. Here\'s an update on our progress...'
      },
      {
        id: '2',
        title: 'Milestone Celebration - 5000 Signatures!',
        type: 'email',
        status: 'sent',
        recipients: 5000,
        sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'We did it! Thanks to your support, we\'ve reached 5,000 signatures...'
      },
      {
        id: '3',
        title: 'Urgent Action Required',
        type: 'whatsapp',
        status: 'scheduled',
        recipients: 2567,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        message: 'Your petition needs immediate attention. The vote is tomorrow!'
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const fetchTemplates = async () => {
    const mockTemplates: NotificationTemplate[] = [
      {
        id: '1',
        name: 'Petition Update',
        type: 'petition_update',
        subject: 'Update on your petition: {{petition_title}}',
        content: 'Dear {{signer_name}},\n\nWe have an important update regarding the petition "{{petition_title}}" that you signed...'
      },
      {
        id: '2',
        name: 'Signature Milestone',
        type: 'signature_milestone',
        subject: 'We reached {{milestone}} signatures!',
        content: 'Amazing news! The petition "{{petition_title}}" has reached {{current_signatures}} signatures...'
      },
      {
        id: '3',
        name: 'Petition Success',
        type: 'petition_success',
        subject: 'Victory! {{petition_title}} was successful!',
        content: 'We\'re thrilled to announce that the petition "{{petition_title}}" has been successful...'
      }
    ];
    setTemplates(mockTemplates);
  };

  const handleSendCampaign = async () => {
    if (!newCampaign.title || !newCampaign.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // If Zapier webhook is provided, trigger it
      if (newCampaign.webhookUrl) {
        await fetch(newCampaign.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify({
            campaign: newCampaign,
            timestamp: new Date().toISOString(),
            triggered_from: "petition_platform",
          }),
        });
      }

      // Mock sending campaign
      const campaign: NotificationCampaign = {
        id: Date.now().toString(),
        title: newCampaign.title,
        type: newCampaign.type,
        status: newCampaign.scheduleType === 'immediate' ? 'sent' : 'scheduled',
        recipients: Math.floor(Math.random() * 1000) + 100,
        message: newCampaign.message,
        ...(newCampaign.scheduleType === 'immediate' 
          ? { sentAt: new Date().toISOString() }
          : { scheduledAt: new Date(`${newCampaign.scheduledDate}T${newCampaign.scheduledTime}`).toISOString() }
        )
      };

      setCampaigns(prev => [campaign, ...prev]);
      setShowNewCampaign(false);
      setNewCampaign({
        title: '',
        type: 'email',
        message: '',
        subject: '',
        targetAudience: 'all',
        petitionId: '',
        scheduleType: 'immediate',
        scheduledDate: '',
        scheduledTime: '',
        webhookUrl: '',
      });

      toast({
        title: "Success",
        description: newCampaign.scheduleType === 'immediate' 
          ? "Campaign sent successfully!" 
          : "Campaign scheduled successfully!",
      });
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: "Failed to send campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'push': return <Send className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Center</h2>
          <p className="text-muted-foreground">Manage petition communications and updates</p>
        </div>
        <Button onClick={() => setShowNewCampaign(true)}>
          <Send className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">12,450</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp Messages</p>
                <p className="text-2xl font-bold">3,267</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
                <p className="text-2xl font-bold">8,901</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter campaign title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Message Type</Label>
                <Select 
                  value={newCampaign.type} 
                  onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newCampaign.type === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message Content *</Label>
              <Textarea
                id="message"
                value={newCampaign.message}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your message content..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select 
                  value={newCampaign.targetAudience} 
                  onValueChange={(value) => setNewCampaign(prev => ({ ...prev, targetAudience: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="signers">Petition Signers</SelectItem>
                    <SelectItem value="creators">Petition Creators</SelectItem>
                    <SelectItem value="region">Specific Region</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Select 
                  value={newCampaign.scheduleType} 
                  onValueChange={(value) => setNewCampaign(prev => ({ ...prev, scheduleType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Send Immediately</SelectItem>
                    <SelectItem value="scheduled">Schedule for Later</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newCampaign.scheduleType === 'scheduled' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Schedule Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newCampaign.scheduledDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Schedule Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newCampaign.scheduledTime}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="webhook">Zapier Webhook URL (Optional)</Label>
              <Input
                id="webhook"
                value={newCampaign.webhookUrl}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
              />
              <p className="text-xs text-muted-foreground">
                Connect with Zapier to trigger external automations when this campaign is sent
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSendCampaign} disabled={loading}>
                {loading ? 'Sending...' : (newCampaign.scheduleType === 'immediate' ? 'Send Now' : 'Schedule Campaign')}
              </Button>
              <Button variant="outline" onClick={() => setShowNewCampaign(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(campaign.type)}
                    {getStatusIcon(campaign.status)}
                  </div>
                  <div>
                    <h4 className="font-medium">{campaign.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {campaign.message}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{campaign.recipients.toLocaleString()} recipients</p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.sentAt 
                        ? `Sent ${new Date(campaign.sentAt).toLocaleDateString()}`
                        : campaign.scheduledAt 
                        ? `Scheduled for ${new Date(campaign.scheduledAt).toLocaleDateString()}`
                        : 'Draft'
                      }
                    </p>
                  </div>
                  <Badge variant={
                    campaign.status === 'sent' ? 'default' :
                    campaign.status === 'scheduled' ? 'secondary' :
                    campaign.status === 'failed' ? 'destructive' : 'outline'
                  }>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Message Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {template.content}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}