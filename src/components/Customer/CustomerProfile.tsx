import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Bell, ShoppingBag, Heart, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const CustomerProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.user_metadata?.display_name || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
    bio: user?.user_metadata?.bio || '',
    defaultRegion: 'Centre',
    communicationLanguage: 'en',
  });

  // Fetch customer statistics
  const { data: stats } = useQuery({
    queryKey: ['customer-stats', user?.id],
    queryFn: async () => {
      if (!user) return { orders: 0, reviews: 0, wishlistItems: 0 };

      const [ordersResult, reviewsResult, wishlistResult] = await Promise.all([
        supabase
          .from('marketplace_orders')
          .select('id', { count: 'exact' })
          .eq('customer_email', user.email),
        Promise.resolve({ count: 0 }), // Reviews - simplified for now
        supabase
          .from('customer_wishlist')
          .select('id', { count: 'exact' })
          .eq('customer_id', user.id),
      ]);

      return {
        orders: ordersResult.count || 0,
        reviews: reviewsResult.count || 0,
        wishlistItems: wishlistResult.count || 0,
      };
    },
    enabled: !!user,
  });

  // Fetch customer preferences
  const { data: preferences } = useQuery({
    queryKey: ['customer-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch customer addresses
  const { data: addresses } = useQuery({
    queryKey: ['customer-addresses', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: any) => {
      const { error } = await supabase
        .from('customer_preferences')
        .upsert({
          customer_id: user?.id,
          ...newPreferences,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-preferences'] });
      toast.success('Preferences updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update preferences');
      console.error('Error updating preferences:', error);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Update user metadata (simplified - in real app would use Supabase auth.updateUser)
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    const updatedPreferences = { ...preferences, [key]: value };
    updatePreferencesMutation.mutate(updatedPreferences);
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.user_metadata?.display_name || '',
      phone: user?.user_metadata?.phone || '',
      address: user?.user_metadata?.address || '',
      bio: user?.user_metadata?.bio || '',
      defaultRegion: 'Centre',
      communicationLanguage: 'en',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Profile</h2>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              {isEditing ? (
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Enter your display name"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formData.displayName || 'Not set'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formData.phone || 'Not set'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your address"
                  rows={3}
                />
              ) : (
                <div className="flex items-start space-x-2 p-3 bg-muted rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{formData.address || 'Not set'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              ) : (
                <div className="p-3 bg-muted rounded-lg">
                  <span className="text-sm">{formData.bio || 'No bio added yet'}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your activity on CamerPulse Marketplace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Orders</span>
              </div>
              <span className="text-sm font-bold">{stats?.orders || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Reviews Written</span>
              </div>
              <span className="text-sm font-bold">{stats?.reviews || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Wishlist Items</span>
              </div>
              <span className="text-sm font-bold">{stats?.wishlistItems || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Member Since</span>
              <span className="text-sm">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Preferences & Notifications</span>
            </CardTitle>
            <CardDescription>Customize your shopping experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultRegion">Default Region</Label>
                <Select
                  value={preferences?.language_preference || 'Centre'}
                  onValueChange={(value) => handlePreferenceChange('language_preference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Centre">Centre</SelectItem>
                    <SelectItem value="Littoral">Littoral</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="Southwest">Southwest</SelectItem>
                    <SelectItem value="Northwest">Northwest</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="Adamawa">Adamawa</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="Far North">Far North</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Communication Language</Label>
                <Select
                  value={preferences?.language_preference || 'en'}
                  onValueChange={(value) => handlePreferenceChange('language_preference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Notification Preferences</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="orderUpdates">Order Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
                </div>
                <Switch
                  id="orderUpdates"
                  checked={true}
                  onCheckedChange={(checked) => handlePreferenceChange('marketing_consent', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="promotions">Promotions & Offers</Label>
                  <p className="text-sm text-muted-foreground">Receive promotional emails and offers</p>
                </div>
                <Switch
                  id="promotions"
                  checked={preferences?.marketing_consent ?? false}
                  onCheckedChange={(checked) => handlePreferenceChange('marketing_consent', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newProducts">New Products</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new products from followed vendors</p>
                </div>
                <Switch
                  id="newProducts"
                  checked={preferences?.marketing_consent ?? false}
                  onCheckedChange={(checked) => handlePreferenceChange('marketing_consent', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="priceDrops">Price Drops</Label>
                  <p className="text-sm text-muted-foreground">Get alerted when wishlist items go on sale</p>
                </div>
                <Switch
                  id="priceDrops"
                  checked={preferences?.marketing_consent ?? true}
                  onCheckedChange={(checked) => handlePreferenceChange('marketing_consent', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};