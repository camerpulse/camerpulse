import React, { useState } from 'react';
import { useExperts } from '@/hooks/useExperts';
import { MobileForm, MobileFormField, MobileInput, MobileTextarea, MobileButton } from '@/components/ui/mobile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { User, Star, MapPin, DollarSign, Award, Briefcase } from 'lucide-react';

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'busy', label: 'Busy', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'not_available', label: 'Not Available', color: 'bg-red-100 text-red-800' }
];

const COMMON_SKILLS = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Digital Marketing',
  'Data Analysis', 'Project Management', 'Content Writing', 'Graphic Design',
  'Video Editing', 'Photography', 'Accounting', 'Legal Services',
  'Business Consulting', 'IT Support', 'Network Administration', 'Database Management'
];

interface ExpertProfileFormProps {
  onSuccess?: () => void;
  existingProfile?: any;
}

export const ExpertProfileForm: React.FC<ExpertProfileFormProps> = ({ onSuccess, existingProfile }) => {
  const { createExpertProfile, updateExpertProfile, loading } = useExperts();
  const [formData, setFormData] = useState({
    professional_title: existingProfile?.professional_title || '',
    bio: existingProfile?.bio || '',
    hourly_rate_min: existingProfile?.hourly_rate_min || '',
    hourly_rate_max: existingProfile?.hourly_rate_max || '',
    currency: existingProfile?.currency || 'FCFA',
    availability: existingProfile?.availability || 'available',
    work_preference: existingProfile?.work_preference || ['remote'],
    expertise_areas: existingProfile?.expertise_areas || [],
    skills: existingProfile?.skills || [],
    languages: existingProfile?.languages || ['English'],
    years_experience: existingProfile?.years_experience || '',
    location: existingProfile?.location || '',
    region: existingProfile?.region || '',
    response_time_hours: existingProfile?.response_time_hours || 24,
    // Portfolio and education
    portfolio_items: existingProfile?.portfolio_items || [{ title: '', description: '', url: '' }],
    education: existingProfile?.education || [{ degree: '', institution: '', year: '' }],
    certifications: existingProfile?.certifications || [{ name: '', issuer: '', year: '' }]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileData = {
      ...formData,
      hourly_rate_min: formData.hourly_rate_min ? parseInt(formData.hourly_rate_min as string) : null,
      hourly_rate_max: formData.hourly_rate_max ? parseInt(formData.hourly_rate_max as string) : null,
      years_experience: parseInt(formData.years_experience as string) || 0,
      portfolio_items: formData.portfolio_items.filter(item => item.title.trim() !== ''),
      education: formData.education.filter(edu => edu.degree.trim() !== ''),
      certifications: formData.certifications.filter(cert => cert.name.trim() !== '')
    };

    let result;
    if (existingProfile) {
      result = await updateExpertProfile(existingProfile.id, profileData);
    } else {
      result = await createExpertProfile(profileData);
    }

    if (result.success) {
      onSuccess?.();
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const updateArrayField = (field: 'portfolio_items' | 'education' | 'certifications', index: number, key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => 
        i === index ? { ...item, [key]: value } : item
      )
    }));
  };

  const addArrayItem = (field: 'portfolio_items' | 'education' | 'certifications') => {
    const newItem = field === 'portfolio_items' 
      ? { title: '', description: '', url: '' }
      : field === 'education'
      ? { degree: '', institution: '', year: '' }
      : { name: '', issuer: '', year: '' };
    
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], newItem]
    }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <User className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">
          {existingProfile ? 'Update Expert Profile' : 'Create Expert Profile'}
        </CardTitle>
        <CardDescription>
          Join CamerPulse as a verified expert and showcase your skills
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <MobileForm onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </h3>
              
              <MobileFormField label="Professional Title" required>
                <MobileInput
                  value={formData.professional_title}
                  onChange={(e) => updateFormData('professional_title', e.target.value)}
                  placeholder="e.g. Full Stack Developer, Digital Marketing Expert"
                  required
                />
              </MobileFormField>

              <MobileFormField label="Professional Bio" required>
                <MobileTextarea
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  placeholder="Tell potential clients about your experience, skills, and what makes you unique..."
                  className="min-h-[120px]"
                  required
                />
              </MobileFormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MobileFormField label="Years of Experience" required>
                  <MobileInput
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => updateFormData('years_experience', e.target.value)}
                    placeholder="5"
                    required
                  />
                </MobileFormField>

                <MobileFormField label="Response Time (hours)">
                  <MobileInput
                    type="number"
                    value={formData.response_time_hours}
                    onChange={(e) => updateFormData('response_time_hours', parseInt(e.target.value))}
                    placeholder="24"
                  />
                </MobileFormField>
              </div>
            </div>

            {/* Rates & Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Rates & Availability
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MobileFormField label="Min Hourly Rate">
                  <MobileInput
                    type="number"
                    value={formData.hourly_rate_min}
                    onChange={(e) => updateFormData('hourly_rate_min', e.target.value)}
                    placeholder="5000"
                  />
                </MobileFormField>

                <MobileFormField label="Max Hourly Rate">
                  <MobileInput
                    type="number"
                    value={formData.hourly_rate_max}
                    onChange={(e) => updateFormData('hourly_rate_max', e.target.value)}
                    placeholder="15000"
                  />
                </MobileFormField>

                <MobileFormField label="Currency">
                  <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCFA">FCFA</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </MobileFormField>
              </div>

              <MobileFormField label="Availability Status" required>
                <Select value={formData.availability} onValueChange={(value) => updateFormData('availability', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MobileFormField>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Work Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MobileFormField label="Location">
                  <MobileInput
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    placeholder="e.g. Douala, Yaoundé"
                  />
                </MobileFormField>

                <MobileFormField label="Region">
                  <Select value={formData.region} onValueChange={(value) => updateFormData('region', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMEROON_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MobileFormField>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.work_preference.includes('remote')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData('work_preference', [...formData.work_preference.filter(p => p !== 'remote'), 'remote']);
                    } else {
                      updateFormData('work_preference', formData.work_preference.filter(p => p !== 'remote'));
                    }
                  }}
                />
                <label className="text-sm font-medium">Available for remote work</label>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5" />
                Skills & Expertise
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select your main skills:</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SKILLS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <MobileFormField label="Additional Skills (comma-separated)">
                <MobileInput
                  value={formData.expertise_areas.join(', ')}
                  onChange={(e) => updateFormData('expertise_areas', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  placeholder="React, Node.js, Python, SEO"
                />
              </MobileFormField>

              <MobileFormField label="Languages (comma-separated)">
                <MobileInput
                  value={formData.languages.join(', ')}
                  onChange={(e) => updateFormData('languages', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  placeholder="English, Pidgin, Local languages"
                />
              </MobileFormField>
            </div>

            {/* Portfolio */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                Portfolio & Experience
              </h3>
              
              <div className="space-y-4">
                <label className="text-sm font-medium">Portfolio Items:</label>
                {formData.portfolio_items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <MobileInput
                      value={item.title}
                      onChange={(e) => updateArrayField('portfolio_items', index, 'title', e.target.value)}
                      placeholder="Project title"
                    />
                    <MobileInput
                      value={item.description}
                      onChange={(e) => updateArrayField('portfolio_items', index, 'description', e.target.value)}
                      placeholder="Description"
                    />
                    <MobileInput
                      value={item.url}
                      onChange={(e) => updateArrayField('portfolio_items', index, 'url', e.target.value)}
                      placeholder="https://project-url.com"
                    />
                  </div>
                ))}
                <MobileButton
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('portfolio_items')}
                >
                  Add Portfolio Item
                </MobileButton>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Education:</label>
                {formData.education.map((edu, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <MobileInput
                      value={edu.degree}
                      onChange={(e) => updateArrayField('education', index, 'degree', e.target.value)}
                      placeholder="Degree/Certificate"
                    />
                    <MobileInput
                      value={edu.institution}
                      onChange={(e) => updateArrayField('education', index, 'institution', e.target.value)}
                      placeholder="Institution"
                    />
                    <MobileInput
                      value={edu.year}
                      onChange={(e) => updateArrayField('education', index, 'year', e.target.value)}
                      placeholder="Year"
                    />
                  </div>
                ))}
                <MobileButton
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('education')}
                >
                  Add Education
                </MobileButton>
              </div>
            </div>

            <MobileButton 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Expert Profile'}
            </MobileButton>
          </div>
        </MobileForm>
      </CardContent>
    </Card>
  );
};