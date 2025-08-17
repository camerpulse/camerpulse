import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, User, Briefcase, Users, Heart } from 'lucide-react';
import { useCreateDiasporaProfile } from '@/hooks/useDiaspora';

const { useState } = React;

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Netherlands', 'Belgium', 'Switzerland', 'Australia', 'New Zealand', 'South Africa',
  'Nigeria', 'Ghana', 'Ivory Coast', 'Senegal', 'Morocco', 'Egypt', 'Kenya',
  'China', 'Japan', 'South Korea', 'India', 'Brazil', 'Argentina', 'Chile'
];

const PROFESSIONS = [
  'Healthcare', 'Engineering', 'Education', 'Information Technology', 'Finance',
  'Legal', 'Business/Management', 'Research/Academia', 'Arts/Entertainment',
  'Public Service', 'Non-Profit', 'Agriculture', 'Construction', 'Manufacturing',
  'Transportation', 'Hospitality', 'Retail', 'Consulting', 'Other'
];

const DONATION_INTERESTS = [
  'Education & Schools', 'Healthcare & Medical', 'Infrastructure Development',
  'Agriculture & Food Security', 'Water & Sanitation', 'Energy & Electricity',
  'Youth Development', 'Women Empowerment', 'Small Business Support',
  'Technology & Innovation', 'Sports & Recreation', 'Arts & Culture',
  'Environmental Protection', 'Emergency Relief', 'Community Centers'
];

export const DiasporaProfileSetup = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    country_of_residence: '',
    home_village_town_city: '',
    profession_sector: '',
    diaspora_association: '',
    preferred_donation_interests: [] as string[],
  });

  const createProfile = useCreateDiasporaProfile();

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_donation_interests: prev.preferred_donation_interests.includes(interest)
        ? prev.preferred_donation_interests.filter(i => i !== interest)
        : [...prev.preferred_donation_interests, interest]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProfile.mutate(formData, {
      onSuccess: () => {
        navigateTo('/diaspora/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to DiasporaConnect
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create your diaspora profile to start engaging with your home community and contributing to national development
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Globe className="h-6 w-6" />
              Setup Your Diaspora Profile
            </CardTitle>
            <CardDescription>
              Help us connect you with relevant projects and opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country_of_residence" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Country of Residence
                  </Label>
                  <Select 
                    value={formData.country_of_residence} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, country_of_residence: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country of residence" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="home_village_town_city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Home Village/Town/City in Cameroon
                  </Label>
                  <Input
                    id="home_village_town_city"
                    value={formData.home_village_town_city}
                    onChange={(e) => setFormData(prev => ({ ...prev, home_village_town_city: e.target.value }))}
                    placeholder="e.g., Douala, Yaoundé, Bamenda, Bafoussam"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession_sector" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Profession/Sector
                  </Label>
                  <Select 
                    value={formData.profession_sector} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, profession_sector: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONS.map((profession) => (
                        <SelectItem key={profession} value={profession}>{profession}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diaspora_association" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Diaspora Association (Optional)
                </Label>
                <Input
                  id="diaspora_association"
                  value={formData.diaspora_association}
                  onChange={(e) => setFormData(prev => ({ ...prev, diaspora_association: e.target.value }))}
                  placeholder="e.g., Cameroon USA Association, CAMCAN, etc."
                />
              </div>

              {/* Donation Interests */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Heart className="h-4 w-4" />
                  Preferred Donation/Investment Interests
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select the areas you're most interested in supporting (select multiple)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DONATION_INTERESTS.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.preferred_donation_interests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                      />
                      <Label 
                        htmlFor={interest} 
                        className="text-sm cursor-pointer"
                      >
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {formData.preferred_donation_interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.preferred_donation_interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={createProfile.isPending}
                  className="px-8"
                >
                  {createProfile.isPending ? 'Creating Profile...' : 'Create My Diaspora Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};