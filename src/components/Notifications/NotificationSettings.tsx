import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Volume2, VolumeX, Clock, Settings } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationSettings: React.FC = () => {
  const { settings, updateSettings } = useNotifications();

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    updateSettings({
      [`quiet_hours_${field}`]: value,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Message Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-all" className="text-base font-medium">
                Enable All Notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Master switch for all message notifications
              </p>
            </div>
            <Switch
              id="enable-all"
              checked={settings.enable_all_notifications}
              onCheckedChange={(checked) => 
                updateSettings({ enable_all_notifications: checked })
              }
            />
          </div>

          {/* Popup Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-popups" className="text-base font-medium">
                In-App Popups
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Show popup notifications when receiving messages
              </p>
            </div>
            <Switch
              id="enable-popups"
              checked={settings.enable_message_popups}
              onCheckedChange={(checked) => 
                updateSettings({ enable_message_popups: checked })
              }
              disabled={!settings.enable_all_notifications}
            />
          </div>

          {/* Push Notifications */}
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
              disabled={!settings.enable_all_notifications}
            />
          </div>
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

      {/* Muted Conversations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VolumeX className="h-5 w-5" />
            Muted Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settings.muted_conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No muted conversations. You can mute conversations from the messenger.
            </p>
          ) : (
            <div className="space-y-2">
              {settings.muted_conversations.map((conversationId) => (
                <div key={conversationId} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm font-mono">{conversationId}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const updated = settings.muted_conversations.filter(id => id !== conversationId);
                      updateSettings({ muted_conversations: updated });
                    }}
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