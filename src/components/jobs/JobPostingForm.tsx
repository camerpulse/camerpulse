import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Building2, MapPin, Calendar, DollarSign } from 'lucide-react';

interface JobFormData {
  title: string;
  company_name: string;
  location: string;
  region: string;
  job_type: string;
  experience_level: string;
  education_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  description: string;
  requirements?: string;
  benefits?: string;
  how_to_apply?: string;
  application_email?: string;
  external_url?: string;
  deadline?: string;
  is_featured: boolean;
  is_urgent: boolean;
  is_remote: boolean;
  status: string;
  category_id?: string;
  tags?: string[];
}

const REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export const JobPostingForm = ({ 
  jobId, 
  onSuccess 
}: { 
  jobId?: string; 
  onSuccess?: () => void; 
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<JobFormData>({
    defaultValues: {
      status: 'draft',
      salary_currency: 'FCFA',
      salary_period: 'monthly',
      is_featured: false,
      is_urgent: false,
      is_remote: false,
      experience_level: 'mid-level',
      tags: []
    }
  });

  useEffect(() => {
    fetchCategories();
    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('job_categories')
      .select('id, name')
      .order('name');
    
    if (data) setCategories(data);
  };

  const fetchJobData = async () => {
    if (!jobId) return;
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (error) {
      toast.error('Failed to load job data');
      return;
    }
    
    if (data) {
      reset({
        ...data,
        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
        tags: data.tags || []
      });
    }
  };

  const onSubmit = async (data: JobFormData) => {
    if (!user) {
      toast.error('You must be logged in to post jobs');
      return;
    }

    setIsLoading(true);

    try {
      const jobData = {
        ...data,
        created_by: user.id,
        updated_at: new Date().toISOString(),
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
        published_at: data.status === 'published' ? new Date().toISOString() : null
      };

      if (jobId) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData as any)
          .eq('id', jobId);

        if (error) throw error;
        toast.success('Job updated successfully!');
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert(jobData as any);

        if (error) throw error;
        toast.success('Job posted successfully!');
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          {jobId ? 'Edit Job Posting' : 'Post New Job'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Job title is required' })}
                placeholder="e.g. Senior Software Engineer"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

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
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...register('location', { required: 'Location is required' })}
                placeholder="e.g. Douala, Cameroon"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select onValueChange={(value) => setValue('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select onValueChange={(value) => setValue('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_type">Job Type *</Label>
              <Select onValueChange={(value) => setValue('job_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level *</Label>
              <Select onValueChange={(value) => setValue('experience_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry-level">Entry Level</SelectItem>
                  <SelectItem value="mid-level">Mid Level</SelectItem>
                  <SelectItem value="senior-level">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education_level">Education Level</Label>
              <Select onValueChange={(value) => setValue('education_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="certification">Professional Certification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Salary Range
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Salary</Label>
                <Input
                  id="salary_min"
                  type="number"
                  {...register('salary_min', { valueAsNumber: true })}
                  placeholder="e.g. 500000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_max">Maximum Salary</Label>
                <Input
                  id="salary_max"
                  type="number"
                  {...register('salary_max', { valueAsNumber: true })}
                  placeholder="e.g. 800000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_currency">Currency</Label>
                <Select onValueChange={(value) => setValue('salary_currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCFA">FCFA</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_period">Period</Label>
                <Select onValueChange={(value) => setValue('salary_period', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Per Hour</SelectItem>
                    <SelectItem value="daily">Per Day</SelectItem>
                    <SelectItem value="weekly">Per Week</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                    <SelectItem value="yearly">Per Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Job description is required' })}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={6}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              {...register('requirements')}
              placeholder="List the required skills, experience, and qualifications..."
              rows={4}
            />
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits & Perks</Label>
            <Textarea
              id="benefits"
              {...register('benefits')}
              placeholder="Describe the benefits, perks, and compensation package..."
              rows={3}
            />
          </div>

          {/* Application Details */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Application Details</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="application_email">Application Email</Label>
                <Input
                  id="application_email"
                  type="email"
                  {...register('application_email')}
                  placeholder="applications@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="external_url">External Application URL</Label>
                <Input
                  id="external_url"
                  type="url"
                  {...register('external_url')}
                  placeholder="https://company.com/careers/job123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register('deadline')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="how_to_apply">How to Apply</Label>
              <Textarea
                id="how_to_apply"
                {...register('how_to_apply')}
                placeholder="Provide specific instructions on how candidates should apply..."
                rows={3}
              />
            </div>
          </div>

          {/* Job Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Job Settings
            </Label>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={watch('is_featured')}
                  onCheckedChange={(checked) => setValue('is_featured', !!checked)}
                />
                <Label htmlFor="is_featured">Featured Job (highlighted in search)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_urgent"
                  checked={watch('is_urgent')}
                  onCheckedChange={(checked) => setValue('is_urgent', !!checked)}
                />
                <Label htmlFor="is_urgent">Urgent Hiring</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_remote"
                  checked={watch('is_remote')}
                  onCheckedChange={(checked) => setValue('is_remote', !!checked)}
                />
                <Label htmlFor="is_remote">Remote Work Available</Label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-32"
            >
              {isLoading ? 'Saving...' : (jobId ? 'Update Job' : 'Post Job')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};