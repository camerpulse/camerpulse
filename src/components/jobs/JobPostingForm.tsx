import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, X, Building2, MapPin, Calendar, DollarSign } from 'lucide-react';

interface JobFormData {
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements: string;
  category_id: string;
  posting_status: string;
  featured: boolean;
  urgent: boolean;
  posting_expires_at?: string;
  auto_renewal: boolean;
  posting_package: string;
  interview_process: string[];
  benefits: string[];
  required_documents: string[];
}

interface Company {
  id: string;
  company_name: string;
}

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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [newDocument, setNewDocument] = useState('');
  const [newProcess, setNewProcess] = useState('');
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<JobFormData>({
    defaultValues: {
      posting_status: 'draft',
      posting_package: 'basic',
      featured: false,
      urgent: false,
      auto_renewal: false,
      interview_process: [],
      benefits: [],
      required_documents: []
    }
  });

  const watchedBenefits = watch('benefits') || [];
  const watchedDocuments = watch('required_documents') || [];
  const watchedProcess = watch('interview_process') || [];

  useEffect(() => {
    fetchCategories();
    fetchUserCompanies();
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

  const fetchUserCompanies = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('companies')
      .select('id, company_name')
      .eq('user_id', user.id)
      .eq('is_active', true);
    
    if (data) setCompanies(data);
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
        posting_expires_at: data.posting_expires_at ? 
          new Date(data.posting_expires_at).toISOString().split('T')[0] : '',
        interview_process: data.interview_process || [],
        benefits: data.benefits || [],
        required_documents: data.required_documents || []
      });
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setValue('benefits', [...watchedBenefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setValue('benefits', watchedBenefits.filter((_, i) => i !== index));
  };

  const addDocument = () => {
    if (newDocument.trim()) {
      setValue('required_documents', [...watchedDocuments, newDocument.trim()]);
      setNewDocument('');
    }
  };

  const removeDocument = (index: number) => {
    setValue('required_documents', watchedDocuments.filter((_, i) => i !== index));
  };

  const addProcess = () => {
    if (newProcess.trim()) {
      setValue('interview_process', [...watchedProcess, newProcess.trim()]);
      setNewProcess('');
    }
  };

  const removeProcess = (index: number) => {
    setValue('interview_process', watchedProcess.filter((_, i) => i !== index));
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
        posted_by: user.id,
        posting_expires_at: data.posting_expires_at ? 
          new Date(data.posting_expires_at).toISOString() : null,
        updated_at: new Date().toISOString()
      };

      if (jobId) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobId);

        if (error) throw error;
        toast.success('Job updated successfully!');
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert(jobData);

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
              <Label htmlFor="category_id">Category *</Label>
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
              <Label htmlFor="posting_package">Posting Package</Label>
              <Select onValueChange={(value) => setValue('posting_package', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (Free)</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Salary Range (FCFA)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="requirements">Requirements *</Label>
            <Textarea
              id="requirements"
              {...register('requirements', { required: 'Requirements are required' })}
              placeholder="List the required skills, experience, and qualifications..."
              rows={4}
            />
            {errors.requirements && (
              <p className="text-sm text-destructive">{errors.requirements.message}</p>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Benefits & Perks</Label>
            <div className="flex gap-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Add a benefit (e.g. Health insurance)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              />
              <Button type="button" onClick={addBenefit} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedBenefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {benefit}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeBenefit(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Required Documents */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Required Documents</Label>
            <div className="flex gap-2">
              <Input
                value={newDocument}
                onChange={(e) => setNewDocument(e.target.value)}
                placeholder="Add required document (e.g. CV, Cover Letter)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
              />
              <Button type="button" onClick={addDocument} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedDocuments.map((document, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {document}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeDocument(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Interview Process */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Interview Process</Label>
            <div className="flex gap-2">
              <Input
                value={newProcess}
                onChange={(e) => setNewProcess(e.target.value)}
                placeholder="Add interview step (e.g. Phone screening)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProcess())}
              />
              <Button type="button" onClick={addProcess} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {watchedProcess.map((step, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{index + 1}. {step}</span>
                  <X 
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive" 
                    onClick={() => removeProcess(index)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Posting Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Posting Settings
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="posting_status">Status</Label>
                <Select onValueChange={(value) => setValue('posting_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="posting_expires_at">Expires On</Label>
                <Input
                  id="posting_expires_at"
                  type="date"
                  {...register('posting_expires_at')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={watch('featured')}
                  onCheckedChange={(checked) => setValue('featured', !!checked)}
                />
                <Label htmlFor="featured">Featured Job (highlighted in search)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={watch('urgent')}
                  onCheckedChange={(checked) => setValue('urgent', !!checked)}
                />
                <Label htmlFor="urgent">Urgent Hiring</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto_renewal"
                  checked={watch('auto_renewal')}
                  onCheckedChange={(checked) => setValue('auto_renewal', !!checked)}
                />
                <Label htmlFor="auto_renewal">Auto-renew when expired</Label>
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