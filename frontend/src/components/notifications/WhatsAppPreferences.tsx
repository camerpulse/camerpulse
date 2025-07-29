import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Smartphone, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  MessageSquare,
  Bell,
  Save
} from 'lucide-react';

interface WhatsAppPreferences {
  id?: string;
  phone_number: string | null;
  whatsapp_enabled: boolean;
  country_code: string;
  verified_at: string | null;
  opt_in_date: string | null;
}

const WhatsAppPreferences = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<WhatsAppPreferences>({
    phone_number: null,
    whatsapp_enabled: false,
    country_code: '+237',
    verified_at: null,
    opt_in_date: null
  });
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_whatsapp_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data);
        setPhoneNumber(data.phone_number || '');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to save preferences",
          variant: "destructive"
        });
        return;
      }

      // Validate phone number format
      if (preferences.whatsapp_enabled && !phoneNumber.trim()) {
        toast({
          title: "Error",
          description: "Please enter a valid phone number",
          variant: "destructive"
        });
        return;
      }

      // Format phone number
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `${preferences.country_code}${phoneNumber.replace(/^0+/, '')}`;

      const updateData = {
        user_id: user.id,
        phone_number: preferences.whatsapp_enabled ? formattedPhone : null,
        whatsapp_enabled: preferences.whatsapp_enabled,
        country_code: preferences.country_code,
        verified_at: null, // Reset verification when changing number
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_whatsapp_preferences')
        .upsert(updateData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "WhatsApp preferences saved successfully"
      });

      await loadPreferences();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const requestVerification = async () => {
    if (!preferences.phone_number) {
      toast({
        title: "Error",
        description: "Please save your phone number first",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, this would send a verification code via WhatsApp
    toast({
      title: "Verification Requested",
      description: "Phone verification feature will be implemented soon. For now, your number is saved."
    });
  };

  const getVerificationStatus = () => {
    if (preferences.verified_at) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    } else if (preferences.phone_number) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Pending Verification
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          Not Set
        </Badge>
      );
    }
  };

  const criticalEvents = [
    { name: 'Ticket Purchase Confirmation', description: 'Instant QR code delivery' },
    { name: 'Event Reminders (24h)', description: 'Last-minute notifications' },
    { name: 'Event Cancellations', description: 'Emergency notices' },
    { name: 'Award Voting Alerts', description: 'Time-sensitive voting windows' },
    { name: 'New Music from Followed Artists', description: 'Instant release alerts' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            <span>WhatsApp Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">WhatsApp Status</p>
                <p className="text-sm text-muted-foreground">
                  {preferences.whatsapp_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            {getVerificationStatus()}
          </div>

          {/* Enable/Disable WhatsApp */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Enable WhatsApp Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive critical alerts via WhatsApp for instant delivery
                </p>
              </div>
              <Switch
                checked={preferences.whatsapp_enabled}
                onCheckedChange={(checked) => 
                  setPreferences({ ...preferences, whatsapp_enabled: checked })
                }
              />
            </div>

            {preferences.whatsapp_enabled && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <div className="flex space-x-2">
                    <select 
                      className="w-20 px-2 py-2 border rounded-md"
                      value={preferences.country_code}
                      onChange={(e) => 
                        setPreferences({ ...preferences, country_code: e.target.value })
                      }
                    >
                      <option value="+237">+237</option>
                      <option value="+234">+234</option>
                      <option value="+235">+235</option>
                      <option value="+241">+241</option>
                    </select>
                    <Input
                      id="phone-number"
                      placeholder="Enter your WhatsApp number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your number without the country code (e.g., 671234567)
                  </p>
                </div>

                {preferences.phone_number && !preferences.verified_at && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Phone number verification required to receive WhatsApp notifications
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={requestVerification}
                    >
                      Request Verification
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* What You'll Receive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>What You'll Receive on WhatsApp</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Only critical, time-sensitive notifications are sent via WhatsApp to ensure the best experience.
          </p>
          <div className="space-y-3">
            {criticalEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-sm">{event.name}</p>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacy & Opt-out</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Your phone number is securely stored and only used for notifications</p>
            <p>• You can disable WhatsApp notifications at any time</p>
            <p>• We comply with WhatsApp's messaging policies</p>
            <p>• No promotional messages - only critical event notifications</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppPreferences;