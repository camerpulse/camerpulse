import React, { useState } from 'react';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Plus, 
  X,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserProfileFormProps {
  onSuccess?: () => void;
  existingProfile?: UserProfile | null;
}

const REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Design', 'Marketing',
  'Writing', 'Photography', 'Video Editing', 'Project Management',
  'Data Analysis', 'Public Speaking', 'Teaching', 'Translation'
];

const COMMON_INTERESTS = [
  'Technology', 'Music', 'Sports', 'Travel', 'Reading', 'Art',
  'Politics', 'Environment', 'Business', 'Health', 'Food', 'Gaming'
];

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ 
  onSuccess, 
  existingProfile 
}) => {
  const { upsertUserProfile, updateProfileCompletionScore, loading } = useUserProfile();
  
  const [formData, setFormData] = useState({
    username: existingProfile?.username || '',
    display_name: existingProfile?.display_name || '',
    first_name: existingProfile?.first_name || '',
    last_name: existingProfile?.last_name || '',
    bio: existingProfile?.bio || '',
    profile_picture_url: existingProfile?.profile_picture_url || '',
    cover_image_url: existingProfile?.cover_image_url || '',
    location: existingProfile?.location || '',
    region: existingProfile?.region || '',
    phone_number: existingProfile?.phone_number || '',
    date_of_birth: existingProfile?.date_of_birth || '',
    gender: existingProfile?.gender || '',
    website_url: existingProfile?.website_url || '',
    social_media_links: existingProfile?.social_media_links || {},
    skills: existingProfile?.skills || [],
    interests: existingProfile?.interests || [],
    languages: existingProfile?.languages || [],
    profile_visibility: existingProfile?.profile_visibility || 'public',
    show_email: existingProfile?.show_email || false,
    show_phone: existingProfile?.show_phone || false,
    show_location: existingProfile?.show_location || true,
    allow_messages: existingProfile?.allow_messages || true,
    allow_friend_requests: existingProfile?.allow_friend_requests || true
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      social_media_links: {
        ...prev.social_media_links,
        [platform]: url
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await upsertUserProfile(formData);
    
    if (result.success) {
      await updateProfileCompletionScore();
      onSuccess?.();
    }
  };

  const completionScore = existingProfile?.profile_completion_score || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Edit Profile
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2">
                Profile Completion
              </div>
              <div className="flex items-center gap-2">
                <Progress value={completionScore} className="w-20" />
                <span className="text-sm font-medium">{completionScore}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Pictures */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.profile_picture_url} />
                <AvatarFallback>
                  {formData.display_name?.charAt(0) || <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="profile_picture_url"
                    value={formData.profile_picture_url}
                    onChange={(e) => handleInputChange('profile_picture_url', e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="your_username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact & Location */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="+237 XXX XXX XXX"
                />
              </div>
              <div>
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <Label htmlFor="location">City/Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Yaoundé, Douala, etc."
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Interests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skills */}
            <div>
              <Label>Skills</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_SKILLS.map(skill => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => !formData.skills.includes(skill) && setFormData(prev => ({
                      ...prev,
                      skills: [...prev.skills, skill]
                    }))}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <Badge key={skill} variant="default" className="gap-1">
                    {skill}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <Label>Interests</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <Button type="button" onClick={addInterest} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_INTERESTS.map(interest => (
                  <Badge 
                    key={interest} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => !formData.interests.includes(interest) && setFormData(prev => ({
                      ...prev,
                      interests: [...prev.interests, interest]
                    }))}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map(interest => (
                  <Badge key={interest} variant="secondary" className="gap-1">
                    {interest}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeInterest(interest)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <Label>Languages</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Add a language"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                />
                <Button type="button" onClick={addLanguage} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map(language => (
                  <Badge key={language} variant="outline" className="gap-1">
                    {language}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeLanguage(language)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Who can see your profile
                  </p>
                </div>
                <Select 
                  value={formData.profile_visibility} 
                  onValueChange={(value) => handleInputChange('profile_visibility', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Display email on your profile
                  </p>
                </div>
                <Switch
                  checked={formData.show_email}
                  onCheckedChange={(checked) => handleInputChange('show_email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    Display phone number on your profile
                  </p>
                </div>
                <Switch
                  checked={formData.show_phone}
                  onCheckedChange={(checked) => handleInputChange('show_phone', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Location</Label>
                  <p className="text-sm text-muted-foreground">
                    Display location on your profile
                  </p>
                </div>
                <Switch
                  checked={formData.show_location}
                  onCheckedChange={(checked) => handleInputChange('show_location', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others send you messages
                  </p>
                </div>
                <Switch
                  checked={formData.allow_messages}
                  onCheckedChange={(checked) => handleInputChange('allow_messages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Friend Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others send you friend requests
                  </p>
                </div>
                <Switch
                  checked={formData.allow_friend_requests}
                  onCheckedChange={(checked) => handleInputChange('allow_friend_requests', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};