import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Building2, Globe, Phone, Mail, MapPin, Calendar, Users } from 'lucide-react';

interface CompanyFormData {
  company_name: string;
  company_description: string;
  company_size: string;
  industry: string;
  website_url: string;
  company_logo_url: string;
  headquarters_location: string;
  founded_year: number;
  company_type: string;
  contact_email: string;
  contact_phone: string;
  social_media_links: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Government',
  'Non-Profit',
  'Agriculture',
  'Construction',
  'Transportation',
  'Energy',
  'Media',
  'Real Estate',
  'Consulting',
  'Other'
];

export const CompanyProfileForm = ({ 
  companyId, 
  onSuccess 
}: { 
  companyId?: string; 
  onSuccess?: () => void; 
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CompanyFormData>({
    defaultValues: {
      company_type: 'private',
      social_media_links: {}
    }
  });

  useEffect(() => {
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const fetchCompanyData = async () => {
    if (!companyId) return;
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    
    if (error) {
      toast.error('Failed to load company data');
      return;
    }
    
    if (data) {
      reset({
        ...data,
        social_media_links: data.social_media_links || {}
      });
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a company profile');
      return;
    }

    setIsLoading(true);

    try {
      const companyData = {
        ...data,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (companyId) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', companyId);

        if (error) throw error;
        toast.success('Company profile updated successfully!');
      } else {
        const { error } = await supabase
          .from('companies')
          .insert(companyData);

        if (error) throw error;
        toast.success('Company profile created successfully!');
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save company profile');
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          {companyId ? 'Edit Company Profile' : 'Create Company Profile'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  {...register('company_name', { required: 'Company name is required' })}
                  placeholder="e.g. TechCorp Ltd"
                />
                {errors.company_name && (
                  <p className="text-sm text-destructive">{errors.company_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select onValueChange={(value) => setValue('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-destructive">{errors.industry.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_size">Company Size</Label>
                <Select onValueChange={(value) => setValue('company_size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_type">Company Type</Label>
                <Select onValueChange={(value) => setValue('company_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private Company</SelectItem>
                    <SelectItem value="public">Public Company</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="ngo">NGO/Non-Profit</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headquarters_location">Headquarters</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="headquarters_location"
                    {...register('headquarters_location')}
                    placeholder="e.g. Douala, Cameroon"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="founded_year">Founded Year</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="founded_year"
                    type="number"
                    min="1800"
                    max={currentYear}
                    {...register('founded_year', { 
                      valueAsNumber: true,
                      min: { value: 1800, message: 'Invalid year' },
                      max: { value: currentYear, message: 'Year cannot be in the future' }
                    })}
                    placeholder="e.g. 2010"
                    className="pl-10"
                  />
                </div>
                {errors.founded_year && (
                  <p className="text-sm text-destructive">{errors.founded_year.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_description">Company Description</Label>
              <Textarea
                id="company_description"
                {...register('company_description')}
                placeholder="Tell us about your company, mission, and values..."
                rows={4}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact_email"
                    type="email"
                    {...register('contact_email', {
                      pattern: {
                        value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                        message: 'Invalid email format'
                      }
                    })}
                    placeholder="contact@company.com"
                    className="pl-10"
                  />
                </div>
                {errors.contact_email && (
                  <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact_phone"
                    {...register('contact_phone')}
                    placeholder="+237 6XX XXX XXX"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website_url">Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website_url"
                    type="url"
                    {...register('website_url', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL (starting with http:// or https://)'
                      }
                    })}
                    placeholder="https://www.company.com"
                    className="pl-10"
                  />
                </div>
                {errors.website_url && (
                  <p className="text-sm text-destructive">{errors.website_url.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  {...register('social_media_links.linkedin')}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  {...register('social_media_links.twitter')}
                  placeholder="https://twitter.com/yourcompany"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  {...register('social_media_links.facebook')}
                  placeholder="https://facebook.com/yourcompany"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  {...register('social_media_links.instagram')}
                  placeholder="https://instagram.com/yourcompany"
                />
              </div>
            </div>
          </div>

          {/* Company Logo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Branding</h3>
            
            <div className="space-y-2">
              <Label htmlFor="company_logo_url">Company Logo URL</Label>
              <Input
                id="company_logo_url"
                type="url"
                {...register('company_logo_url')}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-sm text-muted-foreground">
                Upload your logo to a hosting service and paste the URL here
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-32"
            >
              {isLoading ? 'Saving...' : (companyId ? 'Update Profile' : 'Create Profile')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};