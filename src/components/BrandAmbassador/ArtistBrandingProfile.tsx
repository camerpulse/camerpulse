import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Building, Users, Star, Clock } from 'lucide-react';

interface BrandingProfile {
  id?: string;
  is_active: boolean;
  branding_status: 'available' | 'not_available' | 'negotiable';
  current_brands: Array<{name: string; logo_url?: string; website?: string}>;
  past_partnerships: Array<{name: string; year: number; description: string; proof_url?: string}>;
  audience_types: string[];
  industry_interests: string[];
  minimum_contract_weeks?: number;
  minimum_fee_fcfa?: number;
  preferred_regions: string[];
  exclusivity_available: boolean;
  expected_deliverables: string[];
  bio_ambassador?: string;
  media_kit_url?: string;
  portfolio_links: Array<{name: string; url: string}>;
}

const AUDIENCE_TYPES = [
  'Youth (18-35)', 'Women', 'Men', 'Musicians', 'Diaspora', 'Christians', 
  'Students', 'Professionals', 'Entrepreneurs', 'Gamers', 'Sports Fans'
];

const INDUSTRY_INTERESTS = [
  'Fashion', 'Telecom', 'Skincare & Hair', 'Food & Beverage', 'Agriculture',
  'Education', 'Finance', 'NGOs', 'Events', 'Technology', 'Automotive', 'Real Estate'
];

const REGIONS = ['National', 'Local (Douala)', 'Local (Yaounde)', 'International', 'CEMAC Region'];

const DELIVERABLES = [
  'Social Media Posts', 'Product Photoshoots', 'Event Appearances', 
  'Video Content', 'Live Streams', 'Product Reviews', 'Press Interviews'
];

export const ArtistBrandingProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<BrandingProfile>({
    is_active: true,
    branding_status: 'available',
    current_brands: [],
    past_partnerships: [],
    audience_types: [],
    industry_interests: [],
    preferred_regions: [],
    exclusivity_available: false,
    expected_deliverables: [],
    portfolio_links: []
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('artist_branding_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile({
          ...data,
          current_brands: Array.isArray(data.current_brands) ? data.current_brands as Array<{name: string; logo_url?: string; website?: string}> : [],
          past_partnerships: Array.isArray(data.past_partnerships) ? data.past_partnerships as Array<{name: string; year: number; description: string; proof_url?: string}> : [],
          portfolio_links: Array.isArray(data.portfolio_links) ? data.portfolio_links as Array<{name: string; url: string}> : []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load your branding profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Get artist membership info
      const { data: artistData } = await supabase
        .from('artist_memberships')
        .select('artist_id_number')
        .eq('user_id', user.id)
        .single();

      if (!artistData) {
        toast({
          title: "Error",
          description: "You must be a verified artist to create a branding profile",
          variant: "destructive"
        });
        return;
      }

      const profileData = {
        ...profile,
        user_id: user.id,
        artist_id: artistData.artist_id_number
      };

      const { error } = await supabase
        .from('artist_branding_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your branding profile has been saved successfully!"
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save your branding profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addBrand = () => {
    setProfile(prev => ({
      ...prev,
      current_brands: [...prev.current_brands, { name: '', website: '' }]
    }));
  };

  const removeBrand = (index: number) => {
    setProfile(prev => ({
      ...prev,
      current_brands: prev.current_brands.filter((_, i) => i !== index)
    }));
  };

  const updateBrand = (index: number, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      current_brands: prev.current_brands.map((brand, i) => 
        i === index ? { ...brand, [field]: value } : brand
      )
    }));
  };

  const addPartnership = () => {
    setProfile(prev => ({
      ...prev,
      past_partnerships: [...prev.past_partnerships, { name: '', year: new Date().getFullYear(), description: '' }]
    }));
  };

  const removePartnership = (index: number) => {
    setProfile(prev => ({
      ...prev,
      past_partnerships: prev.past_partnerships.filter((_, i) => i !== index)
    }));
  };

  const updatePartnership = (index: number, field: string, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      past_partnerships: prev.past_partnerships.map((partnership, i) => 
        i === index ? { ...partnership, [field]: value } : partnership
      )
    }));
  };

  const toggleArrayItem = (array: string[], item: string, field: keyof BrandingProfile) => {
    const newArray = array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
    
    setProfile(prev => ({ ...prev, [field]: newArray }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Brand Ambassador Profile
          </CardTitle>
          <CardDescription>
            Set up your profile to get discovered by companies looking for brand ambassadors.
            This will make you visible on our Brand Ambassador Portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Status */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Profile Status</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={profile.is_active}
                onCheckedChange={(checked) => 
                  setProfile(prev => ({ ...prev, is_active: checked as boolean }))
                }
              />
              <Label htmlFor="is_active">Make my profile visible to companies</Label>
            </div>
            
            <Select 
              value={profile.branding_status} 
              onValueChange={(value: 'available' | 'not_available' | 'negotiable') => 
                setProfile(prev => ({ ...prev, branding_status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select availability status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">✅ Available</SelectItem>
                <SelectItem value="negotiable">⚠️ Negotiable</SelectItem>
                <SelectItem value="not_available">❌ Not Available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Brands */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Current Brand Partnerships</Label>
              <Button onClick={addBrand} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </div>
            {profile.current_brands.map((brand, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Brand Name</Label>
                  <Input
                    value={brand.name}
                    onChange={(e) => updateBrand(index, 'name', e.target.value)}
                    placeholder="Brand name"
                  />
                </div>
                <div className="flex-1">
                  <Label>Website</Label>
                  <Input
                    value={brand.website || ''}
                    onChange={(e) => updateBrand(index, 'website', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <Button onClick={() => removeBrand(index)} size="sm" variant="destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Past Partnerships */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Past Brand Partnerships</Label>
              <Button onClick={addPartnership} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Partnership
              </Button>
            </div>
            {profile.past_partnerships.map((partnership, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <Label>Brand Name</Label>
                  <Input
                    value={partnership.name}
                    onChange={(e) => updatePartnership(index, 'name', e.target.value)}
                    placeholder="Brand name"
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={partnership.year}
                    onChange={(e) => updatePartnership(index, 'year', parseInt(e.target.value))}
                    placeholder="2024"
                  />
                </div>
                <Button onClick={() => removePartnership(index)} size="sm" variant="destructive">
                  <X className="h-4 w-4" />
                </Button>
                <div className="col-span-3">
                  <Label>Description</Label>
                  <Textarea
                    value={partnership.description}
                    onChange={(e) => updatePartnership(index, 'description', e.target.value)}
                    placeholder="Describe your role and achievements with this brand..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Audience Types */}
          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Your Audience
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AUDIENCE_TYPES.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`audience-${type}`}
                    checked={profile.audience_types.includes(type)}
                    onCheckedChange={() => toggleArrayItem(profile.audience_types, type, 'audience_types')}
                  />
                  <Label htmlFor={`audience-${type}`} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Interests */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Industry Interests</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INDUSTRY_INTERESTS.map(industry => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${industry}`}
                    checked={profile.industry_interests.includes(industry)}
                    onCheckedChange={() => toggleArrayItem(profile.industry_interests, industry, 'industry_interests')}
                  />
                  <Label htmlFor={`industry-${industry}`} className="text-sm">{industry}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Contract Conditions */}
          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Contract Conditions
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Minimum Contract Duration (weeks)</Label>
                <Input
                  type="number"
                  value={profile.minimum_contract_weeks || ''}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    minimum_contract_weeks: parseInt(e.target.value) || undefined 
                  }))}
                  placeholder="4"
                />
              </div>
              <div>
                <Label>Minimum Fee (FCFA)</Label>
                <Input
                  type="number"
                  value={profile.minimum_fee_fcfa || ''}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    minimum_fee_fcfa: parseInt(e.target.value) || undefined 
                  }))}
                  placeholder="500000"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exclusivity"
                checked={profile.exclusivity_available}
                onCheckedChange={(checked) => 
                  setProfile(prev => ({ ...prev, exclusivity_available: checked as boolean }))
                }
              />
              <Label htmlFor="exclusivity">Open to exclusivity agreements</Label>
            </div>
          </div>

          {/* Preferred Regions */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Preferred Regions</Label>
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map(region => (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox
                    id={`region-${region}`}
                    checked={profile.preferred_regions.includes(region)}
                    onCheckedChange={() => toggleArrayItem(profile.preferred_regions, region, 'preferred_regions')}
                  />
                  <Label htmlFor={`region-${region}`} className="text-sm">{region}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Deliverables */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Expected Deliverables</Label>
            <div className="grid grid-cols-2 gap-2">
              {DELIVERABLES.map(deliverable => (
                <div key={deliverable} className="flex items-center space-x-2">
                  <Checkbox
                    id={`deliverable-${deliverable}`}
                    checked={profile.expected_deliverables.includes(deliverable)}
                    onCheckedChange={() => toggleArrayItem(profile.expected_deliverables, deliverable, 'expected_deliverables')}
                  />
                  <Label htmlFor={`deliverable-${deliverable}`} className="text-sm">{deliverable}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Brand Ambassador Bio</Label>
            <Textarea
              value={profile.bio_ambassador || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, bio_ambassador: e.target.value }))}
              placeholder="Tell companies why you'd be a great brand ambassador..."
              rows={4}
            />
          </div>

          {/* Media Kit */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Media Kit URL</Label>
            <Input
              value={profile.media_kit_url || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, media_kit_url: e.target.value }))}
              placeholder="https://drive.google.com/... (optional)"
            />
          </div>

          <Button onClick={saveProfile} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Branding Profile'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};