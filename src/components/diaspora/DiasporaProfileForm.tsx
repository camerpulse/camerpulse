import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Globe, User, Building, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DiasporaProfile {
  id?: string;
  full_name: string;
  country_of_residence: string;
  home_village_town_city: string;
  home_region: string;
  profession_sector?: string;
  diaspora_association?: string;
  years_abroad?: number;
  preferred_donation_interests?: string[];
  civic_interests?: string[];
}

interface DiasporaProfileFormProps {
  existingProfile?: DiasporaProfile;
  onSuccess: () => void;
}

const CAMEROON_REGIONS = [
  'Adamawa',
  'Centre',
  'East',
  'Far North',
  'Littoral',
  'North',
  'Northwest',
  'South',
  'Southwest',
  'West'
];

const DONATION_INTERESTS = [
  'Education',
  'Healthcare',
  'Infrastructure',
  'Agriculture',
  'Technology',
  'Clean Water',
  'Women Empowerment',
  'Youth Development',
  'Economic Development',
  'Emergency Relief'
];

const CIVIC_INTERESTS = [
  'Local Governance',
  'Policy Advocacy',
  'Community Development',
  'Cultural Preservation',
  'Environmental Protection',
  'Human Rights',
  'Anti-corruption',
  'Election Monitoring',
  'Civic Education',
  'Peace Building'
];

export const DiasporaProfileForm: React.FC<DiasporaProfileFormProps> = ({
  existingProfile,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: existingProfile?.full_name || '',
    country_of_residence: existingProfile?.country_of_residence || '',
    home_village_town_city: existingProfile?.home_village_town_city || '',
    home_region: existingProfile?.home_region || '',
    profession_sector: existingProfile?.profession_sector || '',
    diaspora_association: existingProfile?.diaspora_association || '',
    years_abroad: existingProfile?.years_abroad || '',
    preferred_donation_interests: existingProfile?.preferred_donation_interests || [],
    civic_interests: existingProfile?.civic_interests || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        full_name: formData.full_name,
        country_of_residence: formData.country_of_residence,
        home_village_town_city: formData.home_village_town_city,
        home_region: formData.home_region,
        profession_sector: formData.profession_sector || null,
        diaspora_association: formData.diaspora_association || null,
        years_abroad: formData.years_abroad ? parseInt(formData.years_abroad.toString()) : null,
        preferred_donation_interests: formData.preferred_donation_interests,
        civic_interests: formData.civic_interests
      };

      let result;
      if (existingProfile?.id) {
        result = await supabase
          .from('diaspora_profiles')
          .update(profileData)
          .eq('id', existingProfile.id);
      } else {
        result = await supabase
          .from('diaspora_profiles')
          .insert([profileData]);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Profile Updated",
        description: existingProfile ? "Your diaspora profile has been updated." : "Welcome to Diaspora Connect! Your profile has been created.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest: string, type: 'donation' | 'civic') => {
    const key = type === 'donation' ? 'preferred_donation_interests' : 'civic_interests';
    const current = formData[key] as string[];
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    
    setFormData(prev => ({ ...prev, [key]: updated }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {existingProfile ? 'Update Your Profile' : 'Create Your Diaspora Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country_of_residence">Country of Residence *</Label>
                <Input
                  id="country_of_residence"
                  value={formData.country_of_residence}
                  onChange={(e) => setFormData(prev => ({ ...prev, country_of_residence: e.target.value }))}
                  placeholder="e.g., United States, France, Canada"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="home_village_town_city">Home Village/Town/City *</Label>
                <Input
                  id="home_village_town_city"
                  value={formData.home_village_town_city}
                  onChange={(e) => setFormData(prev => ({ ...prev, home_village_town_city: e.target.value }))}
                  placeholder="e.g., Yaoundé, Douala, Bamenda"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="home_region">Home Region *</Label>
                <Select 
                  value={formData.home_region} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, home_region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your home region" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMEROON_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession_sector">Profession/Sector</Label>
                <Input
                  id="profession_sector"
                  value={formData.profession_sector}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession_sector: e.target.value }))}
                  placeholder="e.g., Software Engineer, Doctor, Teacher"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_abroad">Years Abroad</Label>
                <Input
                  id="years_abroad"
                  type="number"
                  value={formData.years_abroad}
                  onChange={(e) => setFormData(prev => ({ ...prev, years_abroad: e.target.value }))}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diaspora_association">Diaspora Association (Optional)</Label>
              <Input
                id="diaspora_association"
                value={formData.diaspora_association}
                onChange={(e) => setFormData(prev => ({ ...prev, diaspora_association: e.target.value }))}
                placeholder="e.g., Cameroon Association of Atlanta"
              />
            </div>

            {/* Donation Interests */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Preferred Donation Interests
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DONATION_INTERESTS.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={`donation-${interest}`}
                      checked={formData.preferred_donation_interests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest, 'donation')}
                    />
                    <Label 
                      htmlFor={`donation-${interest}`} 
                      className="text-sm cursor-pointer"
                    >
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Civic Interests */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Civic Participation Interests
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CIVIC_INTERESTS.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={`civic-${interest}`}
                      checked={formData.civic_interests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest, 'civic')}
                    />
                    <Label 
                      htmlFor={`civic-${interest}`} 
                      className="text-sm cursor-pointer"
                    >
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Interests Preview */}
            {(formData.preferred_donation_interests.length > 0 || formData.civic_interests.length > 0) && (
              <div className="space-y-3">
                {formData.preferred_donation_interests.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Donation Interests:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.preferred_donation_interests.map(interest => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.civic_interests.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Civic Interests:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.civic_interests.map(interest => (
                        <Badge key={interest} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Create Profile')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};