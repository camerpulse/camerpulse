import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, Globe, MapPin, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileManager: React.FC = () => {
  const { profile, updateProfile, loading } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    phone_number: profile?.phone_number || '',
    website_url: profile?.website_url || '',
    is_diaspora: profile?.is_diaspora || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    const { error } = await updateProfile(formData);

    if (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } else {
      toast.success('Profile updated successfully');
    }

    setUpdating(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Manage your public profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="How you want to be known"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="+237..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="is_diaspora">Diaspora Member</Label>
              <p className="text-sm text-muted-foreground">
                Are you a member of the Cameroonian diaspora?
              </p>
            </div>
            <Switch
              id="is_diaspora"
              checked={formData.is_diaspora}
              onCheckedChange={(checked) => handleInputChange('is_diaspora', checked)}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{profile?.email}</Badge>
              <span className="text-xs text-muted-foreground">
                (cannot be changed)
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Username</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">@{profile?.username}</Badge>
              <span className="text-xs text-muted-foreground">
                (cannot be changed)
              </span>
            </div>
          </div>

          <Button type="submit" disabled={updating} className="w-full">
            {updating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};