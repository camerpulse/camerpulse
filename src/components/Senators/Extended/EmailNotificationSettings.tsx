import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Settings, 
  Clock, 
  Bell,
  CheckCircle,
  Info
} from 'lucide-react';
import { useEmailNotifications, EmailPreferences } from '@/hooks/useEmailNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface EmailNotificationTestProps {
  onClose?: () => void;
}

export const EmailNotificationSettings: React.FC<EmailNotificationTestProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { 
    sendNotification,
    getEmailPreferences, 
    updateEmailPreferences, 
    getNotificationHistory,
    isLoading 
  } = useEmailNotifications();
  
  const [preferences, setPreferences] = useState<EmailPreferences>({
    senator_claim_notifications: true,
    senator_report_notifications: true,
    senator_message_notifications: true,
    general_notifications: true,
    email_frequency: 'immediate'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;
    
    const userPreferences = await getEmailPreferences(user.id);
    if (userPreferences) {
      setPreferences(userPreferences);
    }
  };

  const handlePreferenceChange = async (key: keyof EmailPreferences, value: boolean | string) => {
    if (!user?.id) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    setIsSaving(true);
    await updateEmailPreferences(user.id, { [key]: value });
    setIsSaving(false);
  };

  const sendTestEmail = async () => {
    if (!user?.email) return;

    setIsSaving(true);
    try {
      const success = await sendNotification({
        type: 'general',
        recipientEmail: user.email,
        recipientName: user.user_metadata?.full_name || 'User',
        data: {
          title: 'Email Notification Test',
          message: 'This is a test email to confirm your email notifications are working correctly.',
          actionUrl: window.location.origin
        }
      });

      if (success) {
        setTestEmailSent(true);
      }
    } catch (error) {
      console.error('Test email failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to manage email notifications.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure your email notification preferences for senator-related activities. 
              You can change these settings at any time.
            </AlertDescription>
          </Alert>

          {/* Test Email Section */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Test Email Notifications
            </h4>
            <p className="text-sm text-muted-foreground">
              Send a test email to <strong>{user.email}</strong> to verify your notifications are working.
            </p>
            <Button 
              onClick={sendTestEmail} 
              disabled={isSaving || !user.email}
              variant="outline"
              size="sm"
            >
              {isSaving ? 'Sending...' : 'Send Test Email'}
            </Button>
            {testEmailSent && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-600">
                  Test email sent successfully! Check your inbox.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="font-medium">Notification Types</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Senator Claim Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Updates about senator profile claims you've submitted
                  </p>
                </div>
                <Switch
                  checked={preferences.senator_claim_notifications}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('senator_claim_notifications', checked)
                  }
                  disabled={isSaving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Senator Report Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications when reports are filed for senators you follow
                  </p>
                </div>
                <Switch
                  checked={preferences.senator_report_notifications}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('senator_report_notifications', checked)
                  }
                  disabled={isSaving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Senator Message Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Messages sent to senators you're authorized to manage
                  </p>
                </div>
                <Switch
                  checked={preferences.senator_message_notifications}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('senator_message_notifications', checked)
                  }
                  disabled={isSaving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>General Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    System updates and general announcements
                  </p>
                </div>
                <Switch
                  checked={preferences.general_notifications}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('general_notifications', checked)
                  }
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Email Frequency */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Email Frequency
            </h4>
            <Select
              value={preferences.email_frequency}
              onValueChange={(value) => 
                handlePreferenceChange('email_frequency', value as 'immediate' | 'daily' | 'weekly')
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose how often you want to receive email notifications
            </p>
          </div>

          {isSaving && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Saving preferences...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notification System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Email notifications are now active!</strong> The system includes:
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Claim Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Get notified when your senator profile claims are reviewed and status updates.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Report Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Receive updates when reports are filed for senators you're following.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Message Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Get notified of new messages sent to senators you manage.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Beautiful Templates</h4>
                <p className="text-sm text-muted-foreground">
                  Professional email templates with proper branding and formatting.
                </p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Email preferences and history tracking will be fully available 
                once the database tables are created. For now, you can test the email sending functionality.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};