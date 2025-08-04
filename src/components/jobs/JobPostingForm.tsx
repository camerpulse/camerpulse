import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MobileForm, MobileFormField, MobileInput, MobileTextarea, MobileButton } from '@/components/ui/mobile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { JobCategory } from '@/types/jobs';
import { Briefcase, MapPin, DollarSign, Clock, Users, Star } from 'lucide-react';
import { toast } from 'sonner';

const JOB_TYPES = [
  'full_time', 'part_time', 'contract', 'temporary', 'internship', 'freelance'
];

const EXPERIENCE_LEVELS = [
  'entry_level', 'mid_level', 'senior_level', 'executive'
];

const EDUCATION_LEVELS = [
  'high_school', 'diploma', 'bachelor', 'master', 'phd', 'professional_certification'
];

const SALARY_PERIODS = ['hourly', 'daily', 'weekly', 'monthly', 'yearly'];

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

interface JobPostingFormProps {
  companyId: string;
  onSuccess?: () => void;
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({ companyId, onSuccess }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    location: '',
    region: '',
    job_type: '',
    experience_level: '',
    education_level: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'FCFA',
    salary_period: 'monthly',
    description: '',
    requirements: [''],
    responsibilities: [''],
    benefits: [''],
    how_to_apply: '',
    application_email: '',
    application_deadline: '',
    is_remote: false,
    is_featured: false,
    is_urgent: false,
    tags: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (data) setCategories(data);
    };

    fetchCategories();
  }, []);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post a job');
      return;
    }

    try {
      setLoading(true);

      const jobData = {
        title: formData.title,
        company_id: companyId,
        category_id: formData.category_id,
        location: formData.location,
        region: formData.region,
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        education_level: formData.education_level,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        salary_period: formData.salary_period,
        description: formData.description,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        responsibilities: formData.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
        how_to_apply: formData.how_to_apply,
        application_email: formData.application_email,
        application_deadline: formData.application_deadline || null,
        is_remote: formData.is_remote,
        is_featured: formData.is_featured,
        is_urgent: formData.is_urgent,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        created_by: user.id,
        status: 'pending'
      } as any;

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) {
        console.error('Error posting job:', error);
        toast.error('Failed to post job');
        return;
      }

      toast.success('Job posted successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Briefcase className="h-6 w-6" />
          Post a New Job
        </CardTitle>
        <CardDescription>
          Fill out the details below to post your job opportunity
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <MobileForm onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Job Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Job Details</h3>
              
              <MobileFormField label="Job Title" required>
                <MobileInput
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g. Software Developer, Marketing Manager"
                  required
                />
              </MobileFormField>

              <MobileFormField label="Category" required>
                <Select value={formData.category_id} onValueChange={(value) => updateFormData('category_id', value)}>
                  <SelectTrigger className="h-12">
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
              </MobileFormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MobileFormField label="Job Type" required>
                  <Select value={formData.job_type} onValueChange={(value) => updateFormData('job_type', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MobileFormField>

                <MobileFormField label="Experience Level" required>
                  <Select value={formData.experience_level} onValueChange={(value) => updateFormData('experience_level', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MobileFormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MobileFormField label="Location" required>
                  <MobileInput
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    placeholder="e.g. Douala, Yaoundé"
                    required
                  />
                </MobileFormField>

                <MobileFormField label="Region" required>
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
                  id="remote"
                  checked={formData.is_remote}
                  onCheckedChange={(checked) => updateFormData('is_remote', checked)}
                />
                <label htmlFor="remote" className="text-sm font-medium">
                  Remote work available
                </label>
              </div>
            </div>

            {/* Salary Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salary Information
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MobileFormField label="Min Salary">
                  <MobileInput
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => updateFormData('salary_min', e.target.value)}
                    placeholder="50000"
                  />
                </MobileFormField>

                <MobileFormField label="Max Salary">
                  <MobileInput
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => updateFormData('salary_max', e.target.value)}
                    placeholder="100000"
                  />
                </MobileFormField>

                <MobileFormField label="Currency">
                  <Select value={formData.salary_currency} onValueChange={(value) => updateFormData('salary_currency', value)}>
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

                <MobileFormField label="Period">
                  <Select value={formData.salary_period} onValueChange={(value) => updateFormData('salary_period', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SALARY_PERIODS.map((period) => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </MobileFormField>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-4">
              <MobileFormField label="Job Description" required>
                <MobileTextarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Provide a detailed description of the job role, what the candidate will be doing, and what makes this opportunity unique..."
                  required
                  className="min-h-[120px]"
                />
              </MobileFormField>

              <MobileFormField label="Education Level">
                <Select value={formData.education_level} onValueChange={(value) => updateFormData('education_level', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select minimum education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MobileFormField>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Requirements</h3>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <MobileInput
                    value={req}
                    onChange={(e) => updateArrayField('requirements', index, e.target.value)}
                    placeholder="e.g. Bachelor's degree in Computer Science"
                    className="flex-1"
                  />
                  {formData.requirements.length > 1 && (
                    <MobileButton
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayItem('requirements', index)}
                    >
                      Remove
                    </MobileButton>
                  )}
                </div>
              ))}
              <MobileButton
                type="button"
                variant="outline"
                onClick={() => addArrayItem('requirements')}
              >
                Add Requirement
              </MobileButton>
            </div>

            {/* Responsibilities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Responsibilities</h3>
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="flex gap-2">
                  <MobileInput
                    value={resp}
                    onChange={(e) => updateArrayField('responsibilities', index, e.target.value)}
                    placeholder="e.g. Develop and maintain web applications"
                    className="flex-1"
                  />
                  {formData.responsibilities.length > 1 && (
                    <MobileButton
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayItem('responsibilities', index)}
                    >
                      Remove
                    </MobileButton>
                  )}
                </div>
              ))}
              <MobileButton
                type="button"
                variant="outline"
                onClick={() => addArrayItem('responsibilities')}
              >
                Add Responsibility
              </MobileButton>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Benefits</h3>
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <MobileInput
                    value={benefit}
                    onChange={(e) => updateArrayField('benefits', index, e.target.value)}
                    placeholder="e.g. Health insurance, flexible working hours"
                    className="flex-1"
                  />
                  {formData.benefits.length > 1 && (
                    <MobileButton
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayItem('benefits', index)}
                    >
                      Remove
                    </MobileButton>
                  )}
                </div>
              ))}
              <MobileButton
                type="button"
                variant="outline"
                onClick={() => addArrayItem('benefits')}
              >
                Add Benefit
              </MobileButton>
            </div>

            {/* Application Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Application Information</h3>
              
              <MobileFormField label="How to Apply">
                <MobileTextarea
                  value={formData.how_to_apply}
                  onChange={(e) => updateFormData('how_to_apply', e.target.value)}
                  placeholder="Provide instructions on how candidates should apply..."
                />
              </MobileFormField>

              <MobileFormField label="Application Email">
                <MobileInput
                  type="email"
                  value={formData.application_email}
                  onChange={(e) => updateFormData('application_email', e.target.value)}
                  placeholder="jobs@company.com"
                />
              </MobileFormField>

              <MobileFormField label="Application Deadline">
                <MobileInput
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => updateFormData('application_deadline', e.target.value)}
                />
              </MobileFormField>

              <MobileFormField label="Tags (comma-separated)">
                <MobileInput
                  value={formData.tags}
                  onChange={(e) => updateFormData('tags', e.target.value)}
                  placeholder="javascript, react, frontend, web development"
                />
              </MobileFormField>
            </div>

            {/* Job Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Job Features</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <label className="text-sm font-medium">Featured Job</label>
                      <p className="text-xs text-muted-foreground">Get more visibility (additional cost applies)</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => updateFormData('is_featured', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-red-500" />
                    <div>
                      <label className="text-sm font-medium">Urgent Hiring</label>
                      <p className="text-xs text-muted-foreground">Mark as urgent to attract immediate attention</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_urgent}
                    onCheckedChange={(checked) => updateFormData('is_urgent', checked)}
                  />
                </div>
              </div>
            </div>

            <MobileButton 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Posting Job...' : 'Post Job'}
            </MobileButton>
          </div>
        </MobileForm>
      </CardContent>
    </Card>
  );
};