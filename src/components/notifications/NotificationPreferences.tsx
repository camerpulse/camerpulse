import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare,
  Clock,
  Globe,
  Shield,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useUnifiedNotifications } from '@/hooks/useUnifiedNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences, loading } = useUnifiedNotifications();
  const { t, language, setLanguage } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Loading preferences...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePreferenceChange = async (key: string, value: any) => {
    try {
      setIsSaving(true);
      await updatePreferences({ [key]: value });
    } catch (error) {
      console.error('Failed to update preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const notificationTypes = [
    {
      key: 'civic_alerts',
      label: 'Civic Alerts',
      description: 'Election updates, government announcements',
      icon: <Bell className="h-4 w-4" />,
      category: 'Civic Engagement'
    },
    {
      key: 'political_updates',
      label: 'Political Updates',
      description: 'Political news and candidate information',
      icon: <Bell className="h-4 w-4" />,
      category: 'Civic Engagement'
    },
    {
      key: 'village_updates',
      label: 'Village Updates',
      description: 'Local community announcements and events',
      icon: <MessageSquare className="h-4 w-4" />,
      category: 'Community'
    },
    {
      key: 'petition_updates',
      label: 'Petition Updates',
      description: 'Updates on petitions you\'ve signed or created',
      icon: <Bell className="h-4 w-4" />,
      category: 'Civic Engagement'
    },
    {
      key: 'job_notifications',
      label: 'Job Notifications',
      description: 'New job postings and application updates',
      icon: <Bell className="h-4 w-4" />,
      category: 'Employment'
    },
    {
      key: 'marketplace_updates',
      label: 'Marketplace Updates',
      description: 'Order updates and marketplace activity',
      icon: <Bell className="h-4 w-4" />,
      category: 'Commerce'
    },
    {
      key: 'community_messages',
      label: 'Community Messages',
      description: 'Messages from community groups and forums',
      icon: <MessageSquare className="h-4 w-4" />,
      category: 'Community'
    },
    {
      key: 'admin_notices',
      label: 'Administrative Notices',
      description: 'Platform announcements and policy updates',
      icon: <Shield className="h-4 w-4" />,
      category: 'System'
    },
    {
      key: 'security_alerts',
      label: 'Security Alerts',
      description: 'Security-related notifications and warnings',
      icon: <Shield className="h-4 w-4" />,
      category: 'Security'
    },
  ];

  const groupedTypes = notificationTypes.reduce((acc, type) => {
    if (!acc[type.category]) acc[type.category] = [];
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof notificationTypes>);

  return (
    <div className="space-y-6">
      {/* Channel Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Delivery Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-blue-500" />
                <div>
                  <Label className="text-sm font-medium">In-App Notifications</Label>
                  <p className="text-xs text-muted-foreground">Notifications within CamerPulse</p>
                </div>
              </div>
              <Switch
                checked={preferences.in_app_enabled}
                onCheckedChange={(checked) => handlePreferenceChange('in_app_enabled', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-green-500" />
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Notifications via email</p>
                </div>
              </div>
              <Switch
                checked={preferences.email_enabled}
                onCheckedChange={(checked) => handlePreferenceChange('email_enabled', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-purple-500" />
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Browser and mobile push notifications</p>
                </div>
              </div>
              <Switch
                checked={preferences.push_enabled}
                onCheckedChange={(checked) => handlePreferenceChange('push_enabled', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                <div>
                  <Label className="text-sm font-medium">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">Text message notifications</p>
                  <Badge variant="outline" className="text-xs mt-1">Coming Soon</Badge>
                </div>
              </div>
              <Switch
                checked={preferences.sms_enabled}
                onCheckedChange={(checked) => handlePreferenceChange('sms_enabled', checked)}
                disabled={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedTypes).map(([category, types]) => (
              <div key={category}>
                <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  {category}
                </h4>
                <div className="space-y-3">
                  {types.map((type) => (
                    <div key={type.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {type.icon}
                        <div>
                          <Label className="text-sm font-medium">{type.label}</Label>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[type.key as keyof typeof preferences] as boolean}
                        onCheckedChange={(checked) => handlePreferenceChange(type.key, checked)}
                        disabled={isSaving}
                      />
                    </div>
                  ))}
                </div>
                {category !== 'Security' && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Fine-tune your notification experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Frequency */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Email Frequency</Label>
            <Select
              value={preferences.email_frequency}
              onValueChange={(value) => handlePreferenceChange('email_frequency', value)}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              How often you want to receive email notifications
            </p>
          </div>

          {/* Priority Threshold */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Priority Threshold</Label>
            <Select
              value={preferences.priority_threshold.toString()}
              onValueChange={(value) => handlePreferenceChange('priority_threshold', parseInt(value))}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Critical Only</SelectItem>
                <SelectItem value="2">High & Critical</SelectItem>
                <SelectItem value="3">Medium & Above</SelectItem>
                <SelectItem value="4">Low & Above</SelectItem>
                <SelectItem value="5">All Notifications</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Minimum priority level for notifications
            </p>
          </div>

          {/* Language Preference */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Language Preference</Label>
            <Select
              value={preferences.language_preference}
              onValueChange={(value) => {
                handlePreferenceChange('language_preference', value);
                setLanguage(value as 'en' | 'fr');
              }}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Language for notifications and interface
            </p>
          </div>

          {/* Auto Mark as Read */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Auto Mark as Read</Label>
            <Select
              value={preferences.auto_mark_read_after_days.toString()}
              onValueChange={(value) => handlePreferenceChange('auto_mark_read_after_days', parseInt(value))}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">After 7 days</SelectItem>
                <SelectItem value="14">After 14 days</SelectItem>
                <SelectItem value="30">After 30 days</SelectItem>
                <SelectItem value="60">After 60 days</SelectItem>
                <SelectItem value="0">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically mark old notifications as read
            </p>
          </div>

          {/* Quiet Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Quiet Hours Start</Label>
              <Select
                value={preferences.quiet_hours_start}
                onValueChange={(value) => handlePreferenceChange('quiet_hours_start', value)}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={hour} value={`${hour}:00:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Quiet Hours End</Label>
              <Select
                value={preferences.quiet_hours_end}
                onValueChange={(value) => handlePreferenceChange('quiet_hours_end', value)}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={hour} value={`${hour}:00:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            No notifications will be sent during quiet hours (push and email only)
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={isSaving}
        >
          Reset to Defaults
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handlePreferenceChange('in_app_enabled', false)}
            disabled={isSaving}
            className="text-red-600 hover:text-red-700"
          >
            <VolumeX className="h-4 w-4 mr-2" />
            Disable All
          </Button>
          
          <Button
            onClick={() => toast.success('Preferences saved successfully!')}
            disabled={isSaving}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Test Notification'}
          </Button>
        </div>
      </div>
    </div>
  );
};