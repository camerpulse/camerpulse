import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Phone, Send, Users, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'project_update' | 'investment_opportunity' | 'town_hall' | 'alert';
  channels: string[];
  recipients: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledFor?: Date;
  sentAt?: Date;
}

export const NotificationSystem: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Healthcare Project in Douala',
      message: 'A new hospital construction project has been funded by diaspora investments.',
      type: 'project_update',
      channels: ['email', 'sms', 'in_app'],
      recipients: 'all_diaspora',
      status: 'sent',
      sentAt: new Date('2024-07-15T10:00:00Z')
    },
    {
      id: '2',
      title: 'Virtual Town Hall: Education Reform',
      message: 'Join us for a discussion on education reform initiatives.',
      type: 'town_hall',
      channels: ['email', 'in_app'],
      recipients: 'education_interested',
      status: 'scheduled',
      scheduledFor: new Date('2024-07-25T15:00:00Z')
    }
  ]);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'project_update' as const,
    channels: [] as string[],
    recipients: 'all_diaspora',
    scheduleFor: ''
  });

  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: true,
    inAppEnabled: true,
    pushEnabled: true,
    frequency: 'immediate'
  });

  const handleChannelToggle = (channel: string, enabled: boolean) => {
    if (enabled) {
      setNewNotification(prev => ({
        ...prev,
        channels: [...prev.channels, channel]
      }));
    } else {
      setNewNotification(prev => ({
        ...prev,
        channels: prev.channels.filter(c => c !== channel)
      }));
    }
  };

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message || newNotification.channels.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one channel.",
        variant: "destructive"
      });
      return;
    }

    const notification: Notification = {
      id: Date.now().toString(),
      ...newNotification,
      status: newNotification.scheduleFor ? 'scheduled' : 'sent',
      scheduledFor: newNotification.scheduleFor ? new Date(newNotification.scheduleFor) : undefined,
      sentAt: newNotification.scheduleFor ? undefined : new Date()
    };

    setNotifications(prev => [notification, ...prev]);
    setNewNotification({
      title: '',
      message: '',
      type: 'project_update',
      channels: [],
      recipients: 'all_diaspora',
      scheduleFor: ''
    });

    toast({
      title: "Notification Created",
      description: newNotification.scheduleFor ? "Notification scheduled successfully" : "Notification sent successfully"
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project_update': return <Globe className="h-4 w-4" />;
      case 'investment_opportunity': return <Users className="h-4 w-4" />;
      case 'town_hall': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Create Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newNotification.type}
                onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project_update">Project Update</SelectItem>
                  <SelectItem value="investment_opportunity">Investment Opportunity</SelectItem>
                  <SelectItem value="town_hall">Town Hall</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={newNotification.message}
              onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Notification message"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="space-y-2">
                {[
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'sms', label: 'SMS', icon: Phone },
                  { id: 'in_app', label: 'In-App', icon: Bell },
                  { id: 'push', label: 'Push', icon: MessageSquare }
                ].map(({ id, label, icon: Icon }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Switch
                      checked={newNotification.channels.includes(id)}
                      onCheckedChange={(checked) => handleChannelToggle(id, checked)}
                    />
                    <Icon className="h-4 w-4" />
                    <Label>{label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients</Label>
              <Select
                value={newNotification.recipients}
                onValueChange={(value) => setNewNotification(prev => ({ ...prev, recipients: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_diaspora">All Diaspora</SelectItem>
                  <SelectItem value="project_investors">Project Investors</SelectItem>
                  <SelectItem value="region_specific">Region Specific</SelectItem>
                  <SelectItem value="education_interested">Education Interested</SelectItem>
                  <SelectItem value="healthcare_interested">Healthcare Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule (Optional)</Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={newNotification.scheduleFor}
              onChange={(e) => setNewNotification(prev => ({ ...prev, scheduleFor: e.target.value }))}
            />
          </div>

          <Button onClick={handleSendNotification} className="w-full">
            {newNotification.scheduleFor ? 'Schedule Notification' : 'Send Notification'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(notification.type)}
                    <h3 className="font-medium">{notification.title}</h3>
                  </div>
                  <Badge className={getStatusColor(notification.status)}>
                    {notification.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Channels: {notification.channels.join(', ')}</span>
                  <span>Recipients: {notification.recipients}</span>
                  {notification.sentAt && (
                    <span>Sent: {notification.sentAt.toLocaleDateString()}</span>
                  )}
                  {notification.scheduledFor && (
                    <span>Scheduled: {notification.scheduledFor.toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'emailEnabled', label: 'Email Notifications', icon: Mail },
              { key: 'smsEnabled', label: 'SMS Notifications', icon: Phone },
              { key: 'inAppEnabled', label: 'In-App Notifications', icon: Bell },
              { key: 'pushEnabled', label: 'Push Notifications', icon: MessageSquare }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <Label>{label}</Label>
                </div>
                <Switch
                  checked={settings[key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [key]: checked }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};