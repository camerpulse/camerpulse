import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Star,
  Vote,
  BookOpen,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  civic_score: number;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        setProfile(data);
        setEditData({
          display_name: data.display_name || '',
          bio: data.bio || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: editData.display_name,
          bio: editData.bio
        })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive'
        });
        return;
      }

      setProfile(prev => prev ? {
        ...prev,
        display_name: editData.display_name,
        bio: editData.bio
      } : null);

      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      display_name: profile?.display_name || '',
      bio: profile?.bio || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
                <AvatarFallback className="text-2xl">
                  {profile?.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {isEditing ? (
                    <Input
                      value={editData.display_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Enter display name"
                      className="text-xl font-bold"
                    />
                  ) : (
                    profile?.display_name || 'Anonymous User'
                  )}
                </CardTitle>
                <CardDescription className="flex items-center space-x-2 mt-2">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground mt-1">
                  {profile?.bio || 'No bio provided yet.'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats & Achievement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{profile?.civic_score || 0}</div>
            <p className="text-sm text-muted-foreground">Civic Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Vote className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Petitions Signed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Courses Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground">{user?.id}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your civic engagement history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity to display.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start engaging with petitions, education, and your community to see your activity here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}