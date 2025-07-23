import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, User, Shield, Globe, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';

interface ProfileExtension {
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
  occupation?: string;
  organization?: string;
  website_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  preferred_language?: string;
  timezone?: string;
  notification_preferences?: any;
  privacy_settings?: any;
}

export const ProfileEdit: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileExtension, setProfileExtension] = useState<ProfileExtension>({});

  // Basic profile data
  const [basicData, setBasicData] = useState({
    username: profile?.username || '',
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
  });

  useEffect(() => {
    if (user) {
      fetchProfileExtension();
    }
  }, [user]);

  const fetchProfileExtension = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profile_extensions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfileExtension(data);
    } else if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile extension:', error);
    }
  };

  const handleBasicUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile(basicData);
      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your basic profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExtensionUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profile_extensions')
        .upsert({
          user_id: user.id,
          ...profileExtension
        });

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your extended profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateExtensionField = (field: keyof ProfileExtension, value: any) => {
    setProfileExtension(prev => ({ ...prev, [field]: value }));
  };

  const updateNotificationPreference = (key: string, value: boolean) => {
    const current = profileExtension.notification_preferences || {};
    updateExtensionField('notification_preferences', { ...current, [key]: value });
  };

  const updatePrivacySetting = (key: string, value: string) => {
    const current = profileExtension.privacy_settings || {};
    updateExtensionField('privacy_settings', { ...current, [key]: value });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <User className="h-8 w-8 mr-3 text-primary" />
          Edit Profile
        </h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact & Address</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>Update your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={basicData.username}
                    onChange={(e) => setBasicData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={basicData.display_name}
                    onChange={(e) => setBasicData(prev => ({ ...prev, display_name: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={basicData.bio}
                  onChange={(e) => setBasicData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profileExtension.date_of_birth || ''}
                    onChange={(e) => updateExtensionField('date_of_birth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={profileExtension.gender || ''} onValueChange={(value) => updateExtensionField('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleBasicUpdate} disabled={loading}>
                {loading ? 'Updating...' : 'Update Basic Info'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact & Address Information
              </CardTitle>
              <CardDescription>Update your contact details and address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={profileExtension.phone_number || ''}
                    onChange={(e) => updateExtensionField('phone_number', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={profileExtension.occupation || ''}
                    onChange={(e) => updateExtensionField('occupation', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={profileExtension.organization || ''}
                  onChange={(e) => updateExtensionField('organization', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address_line1">Address Line 1</Label>
                  <Input
                    id="address_line1"
                    value={profileExtension.address_line1 || ''}
                    onChange={(e) => updateExtensionField('address_line1', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address_line2">Address Line 2</Label>
                  <Input
                    id="address_line2"
                    value={profileExtension.address_line2 || ''}
                    onChange={(e) => updateExtensionField('address_line2', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileExtension.city || ''}
                    onChange={(e) => updateExtensionField('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select value={profileExtension.region || ''} onValueChange={(value) => updateExtensionField('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adamawa">Adamawa</SelectItem>
                      <SelectItem value="centre">Centre</SelectItem>
                      <SelectItem value="east">East</SelectItem>
                      <SelectItem value="far_north">Far North</SelectItem>
                      <SelectItem value="littoral">Littoral</SelectItem>
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="northwest">Northwest</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="southwest">Southwest</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={profileExtension.postal_code || ''}
                    onChange={(e) => updateExtensionField('postal_code', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website_url">Website</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={profileExtension.website_url || ''}
                      onChange={(e) => updateExtensionField('website_url', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin_url">LinkedIn</Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      value={profileExtension.linkedin_url || ''}
                      onChange={(e) => updateExtensionField('linkedin_url', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleExtensionUpdate} disabled={loading}>
                {loading ? 'Updating...' : 'Update Contact Info'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferred_language">Preferred Language</Label>
                  <Select value={profileExtension.preferred_language || 'en'} onValueChange={(value) => updateExtensionField('preferred_language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profileExtension.timezone || 'Africa/Douala'} onValueChange={(value) => updateExtensionField('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Douala">Africa/Douala</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={profileExtension.notification_preferences?.email || false}
                      onCheckedChange={(checked) => updateNotificationPreference('email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <Switch
                      id="sms-notifications"
                      checked={profileExtension.notification_preferences?.sms || false}
                      onCheckedChange={(checked) => updateNotificationPreference('sms', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <Switch
                      id="push-notifications"
                      checked={profileExtension.notification_preferences?.push || false}
                      onCheckedChange={(checked) => updateNotificationPreference('push', checked)}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleExtensionUpdate} disabled={loading}>
                {loading ? 'Updating...' : 'Update Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your privacy settings and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Privacy Settings</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <Select 
                      value={profileExtension.privacy_settings?.profile_visibility || 'public'} 
                      onValueChange={(value) => updatePrivacySetting('profile_visibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contact-visibility">Contact Information Visibility</Label>
                    <Select 
                      value={profileExtension.privacy_settings?.contact_visibility || 'limited'} 
                      onValueChange={(value) => updatePrivacySetting('contact_visibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Verification</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Verification Level: {profileExtension.account_verification_level || 0}/3
                  </p>
                  <p className="text-sm">
                    {profileExtension.account_verification_level === 0 && 'Basic account - no verification'}
                    {profileExtension.account_verification_level === 1 && 'Email verified'}
                    {profileExtension.account_verification_level === 2 && 'Phone verified'}
                    {profileExtension.account_verification_level === 3 && 'Fully verified'}
                  </p>
                </div>
              </div>

              <Button onClick={handleExtensionUpdate} disabled={loading}>
                {loading ? 'Updating...' : 'Update Privacy Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};