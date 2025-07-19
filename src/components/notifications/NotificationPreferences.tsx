import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Bell, Smartphone, Phone, MessageSquare } from 'lucide-react';

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const eventTypes = {
    artist_profile_submitted: 'Profile Submission Confirmation',
    artist_verified: 'Artist Verification',
    artist_denied: 'Profile Corrections Needed',
    artist_new_follower: 'New Followers',
    artist_award_nomination: 'Award Nominations',
    artist_award_win: 'Award Wins',
    new_song_uploaded: 'New Music from Artists',
    song_milestone_reached: 'Stream Milestones',
    new_event_published: 'New Events',
    ticket_purchased: 'Ticket Confirmations',
    event_reminder_24h: 'Event Reminders',
    event_cancelled: 'Event Cancellations',
    voting_opens: 'Award Voting',
    voting_closes: 'Voting Results'
  };

  const channels = {
    email: { icon: Mail, label: 'Email' },
    in_app: { icon: Bell, label: 'In-App' },
    push: { icon: Smartphone, label: 'Push' },
    sms: { icon: Phone, label: 'SMS' },
    whatsapp: { icon: MessageSquare, label: 'WhatsApp' }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to view preferences"
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Convert array to nested object for easy lookup
      const prefsObj = {};
      (data || []).forEach(pref => {
        if (!prefsObj[pref.event_type]) {
          prefsObj[pref.event_type] = {};
        }
        prefsObj[pref.event_type][pref.channel] = pref.is_enabled;
      });

      // Fill in defaults for missing preferences
      Object.keys(eventTypes).forEach(eventType => {
        if (!prefsObj[eventType]) {
          prefsObj[eventType] = {};
        }
        Object.keys(channels).forEach(channel => {
          if (!(channel in prefsObj[eventType])) {
            prefsObj[eventType][channel] = true; // Default to enabled
          }
        });
      });

      setPreferences(prefsObj);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notification preferences"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (eventType, channel, enabled) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          event_type: eventType,
          channel: channel,
          is_enabled: enabled
        });

      if (error) throw error;

      // Update local state
      setPreferences(prev => ({
        ...prev,
        [eventType]: {
          ...prev[eventType],
          [channel]: enabled
        }
      }));

      toast({
        title: "Updated",
        description: `${channels[channel].label} notifications for ${eventTypes[eventType]} ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update preference"
      });
    }
  };

  const saveAllPreferences = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Convert preferences object to array format
      const prefsArray = [];
      Object.entries(preferences).forEach(([eventType, channels]) => {
        Object.entries(channels).forEach(([channel, enabled]) => {
          prefsArray.push({
            user_id: user.id,
            event_type: eventType,
            channel: channel,
            is_enabled: enabled
          });
        });
      });

      // Delete existing preferences and insert new ones
      const { error: deleteError } = await supabase
        .from('user_notification_preferences')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_notification_preferences')
        .insert(prefsArray);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "All notification preferences saved successfully"
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save preferences"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
        <p className="text-muted-foreground">
          Control how and when you receive notifications from CamerPlay
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Your Notifications</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive and through which channels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(eventTypes).map(([eventType, label]) => (
            <div key={eventType} className="space-y-4">
              <div>
                <h3 className="font-semibold text-base">{label}</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified when {label.toLowerCase()} occur
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(channels).map(([channel, { icon: Icon, label: channelLabel }]) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Switch
                      id={`${eventType}-${channel}`}
                      checked={preferences[eventType]?.[channel] || false}
                      onCheckedChange={(checked) => updatePreference(eventType, channel, checked)}
                    />
                    <div className="flex items-center space-x-1">
                      <Icon className="h-4 w-4" />
                      <Label htmlFor={`${eventType}-${channel}`} className="text-sm">
                        {channelLabel}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              Changes are saved automatically. You can also save all at once.
            </div>
            <Button onClick={saveAllPreferences} disabled={saving}>
              {saving ? 'Saving...' : 'Save All Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Settings</CardTitle>
          <CardDescription>Common notification preference combinations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const allEnabled = {};
                Object.keys(eventTypes).forEach(eventType => {
                  allEnabled[eventType] = {};
                  Object.keys(channels).forEach(channel => {
                    allEnabled[eventType][channel] = true;
                  });
                });
                setPreferences(allEnabled);
              }}
            >
              Enable All
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const emailOnly = {};
                Object.keys(eventTypes).forEach(eventType => {
                  emailOnly[eventType] = {};
                  Object.keys(channels).forEach(channel => {
                    emailOnly[eventType][channel] = channel === 'email';
                  });
                });
                setPreferences(emailOnly);
              }}
            >
              Email Only
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const allDisabled = {};
                Object.keys(eventTypes).forEach(eventType => {
                  allDisabled[eventType] = {};
                  Object.keys(channels).forEach(channel => {
                    allDisabled[eventType][channel] = false;
                  });
                });
                setPreferences(allDisabled);
              }}
            >
              Disable All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;