import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createComponentLogger } from '@/utils/logger';
import {
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  UserX,
  Download,
  Upload
} from 'lucide-react';

const logger = createComponentLogger('SettingsPage');

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile settings
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: '',
    location: '',
    website: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    civicAlerts: true,
    pollNotifications: true,
    politicianUpdates: false,
    weeklyDigest: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showLocation: false,
    showActivity: true,
    allowDirectMessages: true,
    dataSharing: false,
    analyticsTracking: true
  });

  // App preferences
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    region: 'CM',
    autoRefresh: true,
    compactView: false,
    accessibilityMode: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement profile update API call
      logger.info('Profile updated', { userId: user?.id });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      logger.error('Profile update failed', { error: error.message });
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement notification settings API call
      logger.info('Notification settings updated', { userId: user?.id });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      logger.error('Notification settings update failed', { error: error.message });
      toast({
        title: "Update Failed",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      // TODO: Implement data export
      logger.info('Data export requested', { userId: user?.id });
      toast({
        title: "Export Started",
        description: "Your data export has been initiated. You'll receive an email when ready.",
      });
    } catch (error) {
      logger.error('Data export failed', { error: error.message });
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    try {
      // TODO: Implement account deletion
      logger.warn('Account deletion requested', { userId: user?.id });
      toast({
        title: "Account Deletion",
        description: "Account deletion request has been submitted.",
        variant: "destructive",
      });
    } catch (error) {
      logger.error('Account deletion failed', { error: error.message });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Globe className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or WEBP. Max 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({...prev, firstName: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({...prev, lastName: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({...prev, email: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({...prev, bio: e.target.value}))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Region"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({...prev, location: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://yoursite.com"
                      value={profile.website}
                      onChange={(e) => setProfile(prev => ({...prev, website: e.target.value}))}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({...prev, emailNotifications: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({...prev, pushNotifications: checked}))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Civic Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Important civic announcements and alerts
                      </p>
                    </div>
                    <Switch
                      checked={notifications.civicAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({...prev, civicAlerts: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Poll Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        New polls and voting opportunities
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pollNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({...prev, pollNotifications: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Politician Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Updates from politicians you follow
                      </p>
                    </div>
                    <Switch
                      checked={notifications.politicianUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({...prev, politicianUpdates: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly summary of civic activities
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({...prev, weeklyDigest: checked}))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Quiet Hours</Label>
                      <Switch
                        checked={notifications.quietHours}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({...prev, quietHours: checked}))
                        }
                      />
                    </div>

                    {notifications.quietHours && (
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div className="space-y-2">
                          <Label htmlFor="quietStart">Start Time</Label>
                          <Input
                            id="quietStart"
                            type="time"
                            value={notifications.quietStart}
                            onChange={(e) => 
                              setNotifications(prev => ({...prev, quietStart: e.target.value}))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quietEnd">End Time</Label>
                          <Input
                            id="quietEnd"
                            type="time"
                            value={notifications.quietEnd}
                            onChange={(e) => 
                              setNotifications(prev => ({...prev, quietEnd: e.target.value}))
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Notifications'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select
                      value={privacy.profileVisibility}
                      onValueChange={(value) => 
                        setPrivacy(prev => ({...prev, profileVisibility: value}))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="members">Members Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Location</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your location on your profile
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showLocation}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({...prev, showLocation: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Activity</Label>
                      <p className="text-sm text-muted-foreground">
                        Show your civic activity to others
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showActivity}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({...prev, showActivity: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Let other users send you messages
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowDirectMessages}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({...prev, allowDirectMessages: checked}))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Share anonymized data for research
                      </p>
                    </div>
                    <Switch
                      checked={privacy.dataSharing}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({...prev, dataSharing: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics Tracking</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve CamerPulse with usage analytics
                      </p>
                    </div>
                    <Switch
                      checked={privacy.analyticsTracking}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({...prev, analyticsTracking: checked}))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">Data Management</h4>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={handleExportData}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        className={showDeleteConfirm ? 'bg-destructive' : ''}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        {showDeleteConfirm ? 'Confirm Delete' : 'Delete Account'}
                      </Button>
                    </div>
                    {showDeleteConfirm && (
                      <p className="text-sm text-muted-foreground">
                        Click again to confirm account deletion. This action cannot be undone.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>
                  Customize your CamerPulse experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) => 
                        setPreferences(prev => ({...prev, theme: value}))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center">
                            <Smartphone className="h-4 w-4 mr-2" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) => 
                          setPreferences(prev => ({...prev, language: value}))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Region</Label>
                      <Select
                        value={preferences.region}
                        onValueChange={(value) => 
                          setPreferences(prev => ({...prev, region: value}))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CM">Cameroon</SelectItem>
                          <SelectItem value="CF">Central Africa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Refresh</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically refresh content
                      </p>
                    </div>
                    <Switch
                      checked={preferences.autoRefresh}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({...prev, autoRefresh: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact View</Label>
                      <p className="text-sm text-muted-foreground">
                        Show more content in less space
                      </p>
                    </div>
                    <Switch
                      checked={preferences.compactView}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({...prev, compactView: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Accessibility Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enhanced accessibility features
                      </p>
                    </div>
                    <Switch
                      checked={preferences.accessibilityMode}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({...prev, accessibilityMode: checked}))
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => toast({ title: "Preferences saved!" })}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}