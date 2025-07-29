import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface JobPostData {
  title: string;
  company_id: string;
  category_id: string;
  location: string;
  region: string;
  job_type: string;
  experience_level: string;
  education_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_period: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  how_to_apply?: string;
  application_email?: string;
  application_deadline?: string;
  is_remote: boolean;
  is_featured: boolean;
  is_urgent: boolean;
  tags: string[];
}

export const useJobPost = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: JobPostData) => {
      if (!user) {
        throw new Error('You must be logged in to post a job');
      }

      // Get company name for required field
      const { data: company } = await supabase
        .from('companies')
        .select('company_name')
        .eq('id', jobData.company_id)
        .single();

      // Generate slug from title and company name
      const slug = `${jobData.title}-at-${company?.company_name || 'company'}`
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: jobData.title,
          company_id: jobData.company_id,
          company_name: company?.company_name || 'Company',
          slug: slug,
          category_id: jobData.category_id,
          location: jobData.location,
          region: jobData.region,
          job_type: jobData.job_type,
          experience_level: jobData.experience_level,
          education_level: jobData.education_level,
          salary_min: jobData.salary_min,
          salary_max: jobData.salary_max,
          salary_currency: jobData.salary_currency,
          salary_period: jobData.salary_period,
          description: jobData.description,
          how_to_apply: jobData.how_to_apply,
          application_email: jobData.application_email,
          deadline: jobData.application_deadline,
          is_remote: jobData.is_remote,
          is_featured: jobData.is_featured,
          is_urgent: jobData.is_urgent,
          tags: jobData.tags,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  });
};