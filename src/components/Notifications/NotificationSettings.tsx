import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Clock, 
  Settings, 
  MessageCircle,
  Users,
  Vote,
  Megaphone,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Smartphone,
  Globe
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationSettings: React.FC = () => {
  const { settings, updateSettings, muteCategory, unmuteCategory } = useNotifications();

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    updateSettings({
      [`quiet_hours_${field}`]: value,
    });
  };

  const notificationCategories = [
    {
      title: 'Message Notifications',
      icon: <MessageCircle className="h-5 w-5" />,
      description: 'Direct messages and conversation notifications',
      settings: [
        {
          key: 'enable_message_notifications',
          label: 'Enable Message Notifications',
          description: 'Receive notifications for new messages',
        },
        {
          key: 'enable_message_popups',
          label: 'In-App Popups',
          description: 'Show popup notifications for new messages',
          dependsOn: 'enable_message_notifications',
        },
        {
          key: 'enable_message_push',
          label: 'Browser Push Notifications',
          description: 'Receive browser push notifications for messages',
          dependsOn: 'enable_message_notifications',
        },
        {
          key: 'enable_message_email',
          label: 'Email Notifications',
          description: 'Receive email notifications for important messages',
          dependsOn: 'enable_message_notifications',
        },
      ],
    },
    {
      title: 'Civic Engagement',
      icon: <Vote className="h-5 w-5" />,
      description: 'Events, polls, and civic activities near you',
      settings: [
        {
          key: 'enable_civic_notifications',
          label: 'Enable Civic Notifications',
          description: 'Master toggle for all civic-related notifications',
        },
        {
          key: 'enable_event_notifications',
          label: 'Event Notifications',
          description: 'Events happening in your region',
          dependsOn: 'enable_civic_notifications',
        },
        {
          key: 'enable_poll_notifications',
          label: 'Poll Notifications',
          description: 'New polls from politicians and institutions',
          dependsOn: 'enable_civic_notifications',
        },
        {
          key: 'enable_government_notifications',
          label: 'Government Notices',
          description: 'Official government announcements',
          dependsOn: 'enable_civic_notifications',
        },
        {
          key: 'enable_policy_notifications',
          label: 'Policy Updates',
          description: 'New laws and policy changes',
          dependsOn: 'enable_civic_notifications',
        },
      ],
    },
    {
      title: 'Political Intelligence',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Political analysis and tracking alerts',
      settings: [
        {
          key: 'enable_intelligence_notifications',
          label: 'Enable Intelligence Alerts',
          description: 'Master toggle for political intelligence notifications',
        },
        {
          key: 'enable_promise_tracking',
          label: 'Promise Tracking',
          description: 'Updates on political promises and fulfillment',
          dependsOn: 'enable_intelligence_notifications',
        },
        {
          key: 'enable_sentiment_alerts',
          label: 'Sentiment Alerts',
          description: 'Public sentiment trends and changes',
          dependsOn: 'enable_intelligence_notifications',
        },
        {
          key: 'enable_election_updates',
          label: 'Election Updates',
          description: 'Candidate declarations and voting deadlines',
          dependsOn: 'enable_intelligence_notifications',
        },
      ],
    },
    {
      title: 'System Notifications',
      icon: <Settings className="h-5 w-5" />,
      description: 'Account and platform notifications',
      settings: [
        {
          key: 'enable_system_notifications',
          label: 'Enable System Notifications',
          description: 'Platform updates and account notifications',
        },
        {
          key: 'enable_verification_notifications',
          label: 'Verification Updates',
          description: 'Account verification status changes',
          dependsOn: 'enable_system_notifications',
        },
        {
          key: 'enable_security_notifications',
          label: 'Security Alerts',
          description: 'Security-related notifications and warnings',
          dependsOn: 'enable_system_notifications',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Notification Categories */}
      {notificationCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category.icon}
              {category.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.settings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor={setting.key} className="text-base font-medium">
                    {setting.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  id={setting.key}
                  checked={settings[setting.key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => 
                    updateSettings({ [setting.key]: checked })
                  }
                  disabled={setting.dependsOn && !settings[setting.dependsOn as keyof typeof settings]}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Delivery Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Delivery Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-push" className="text-base font-medium">
                Browser Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive notifications even when not on the site
              </p>
            </div>
            <Switch
              id="enable-push"
              checked={settings.enable_push_notifications}
              onCheckedChange={(checked) => 
                updateSettings({ enable_push_notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-email-digest" className="text-base font-medium">
                Weekly Email Digest
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive a weekly summary of important notifications
              </p>
            </div>
            <Switch
              id="enable-email-digest"
              checked={settings.enable_email_digest}
              onCheckedChange={(checked) => 
                updateSettings({ enable_email_digest: checked })
              }
            />
          </div>

          {settings.enable_email_digest && (
            <div className="pl-4 border-l-2 border-muted">
              <Label htmlFor="digest-frequency">Digest Frequency</Label>
              <select
                id="digest-frequency"
                value={settings.email_digest_frequency}
                onChange={(e) => updateSettings({ email_digest_frequency: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set times when you don't want to receive notifications
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiet-start">Start Time</Label>
              <Input
                id="quiet-start"
                type="time"
                value={settings.quiet_hours_start || ''}
                onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="quiet-end">End Time</Label>
              <Input
                id="quiet-end"
                type="time"
                value={settings.quiet_hours_end || ''}
                onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {settings.quiet_hours_start && settings.quiet_hours_end && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <VolumeX className="h-4 w-4 inline mr-1" />
                Quiet hours: {settings.quiet_hours_start} - {settings.quiet_hours_end}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geo-Targeting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Location-Based Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="geo-filter" className="text-base font-medium">
                Enable Location-Based Filtering
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Only receive notifications relevant to your selected regions
              </p>
            </div>
            <Switch
              id="geo-filter"
              checked={settings.geo_filter_enabled}
              onCheckedChange={(checked) => 
                updateSettings({ geo_filter_enabled: checked })
              }
            />
          </div>

          {settings.geo_filter_enabled && (
            <div className="pl-4 border-l-2 border-muted">
              <Label>Preferred Regions</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select regions to receive location-specific notifications
              </p>
              <div className="flex flex-wrap gap-2">
                {['Centre', 'Littoral', 'West', 'Northwest', 'Southwest', 'North', 'Far North', 'Adamawa', 'East', 'South'].map(region => {
                  const isSelected = settings.preferred_regions.includes(region);
                  return (
                    <Button
                      key={region}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newRegions = isSelected 
                          ? settings.preferred_regions.filter(r => r !== region)
                          : [...settings.preferred_regions, region];
                        updateSettings({ preferred_regions: newRegions });
                      }}
                    >
                      {region}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Muted Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VolumeX className="h-5 w-5" />
            Muted Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settings.muted_categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No muted categories. You can mute notification types from the notification center.
            </p>
          ) : (
            <div className="space-y-2">
              {settings.muted_categories.map((category) => (
                <div key={category} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm font-medium">{category.replace('_', ' ')}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => unmuteCategory(category)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};