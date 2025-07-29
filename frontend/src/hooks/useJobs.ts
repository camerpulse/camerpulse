import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Job, JobFilters, JobSearchResult } from '@/types/jobs';

export const useJobs = (filters?: JobFilters, page = 1, perPage = 10) => {
  return useQuery({
    queryKey: ['jobs', filters, page, perPage],
    queryFn: async (): Promise<JobSearchResult> => {
      let query = supabase
        .from('jobs')
        .select(`
          *
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.region) {
        query = query.eq('region', filters.region);
      }
      if (filters?.job_type) {
        query = query.eq('job_type', filters.job_type);
      }
      if (filters?.experience_level) {
        query = query.eq('experience_level', filters.experience_level);
      }
      if (filters?.is_remote !== undefined) {
        query = query.eq('is_remote', filters.is_remote);
      }
      if (filters?.search_query) {
        query = query.or(`title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`);
      }
      if (filters?.salary_min) {
        query = query.gte('salary_min', filters.salary_min);
      }

      // Count total for pagination
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      return {
        jobs: (data || []).map(job => ({
          ...job,
          requirements: typeof job.requirements === 'string' ? (job.requirements ? job.requirements.split('\n').filter(r => r.trim()) : []) : (job.requirements || []),
          responsibilities: typeof job.requirements === 'string' ? (job.requirements ? job.requirements.split('\n').filter(r => r.trim()) : []) : [],
          benefits: typeof job.benefits === 'string' ? (job.benefits ? job.benefits.split('\n').filter(b => b.trim()) : []) : (job.benefits || []),
          tags: Array.isArray(job.tags) ? job.tags : [],
          featured: Boolean(job.is_featured),
          application_deadline: job.deadline,
          external_apply_url: job.external_url
        })) as Job[],
        total: count || 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count || 0) / perPage)
      };
    }
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async (): Promise<Job> => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        requirements: typeof data.requirements === 'string' ? (data.requirements ? data.requirements.split('\n').filter(r => r.trim()) : []) : (data.requirements || []),
        responsibilities: typeof data.requirements === 'string' ? (data.requirements ? data.requirements.split('\n').filter(r => r.trim()) : []) : [],
        benefits: typeof data.benefits === 'string' ? (data.benefits ? data.benefits.split('\n').filter(b => b.trim()) : []) : (data.benefits || []),
        tags: Array.isArray(data.tags) ? data.tags : [],
        featured: Boolean(data.is_featured),
        application_deadline: data.deadline,
        external_apply_url: data.external_url
      } as Job;
    },
    enabled: !!id
  });
};

export const useJobCategories = () => {
  return useQuery({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    }
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, coverLetter, cvUrl, portfolioUrl }: {
      jobId: string;
      coverLetter?: string;
      cvUrl?: string;
      portfolioUrl?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to apply');

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          cover_letter: coverLetter,
          resume_url: cvUrl,
          applicant_email: user.email || '',
          applicant_name: user.user_metadata?.full_name || 'Unknown'
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

export const useBookmarkJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to bookmark');

      const { data, error } = await supabase
        .from('job_bookmarks')
        .insert({
          job_id: jobId,
          user_id: user.id
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

export const useTrackJobView = () => {
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('job_views')
        .insert({
          job_id: jobId,
          user_id: user?.id || null
        });

      if (error) throw error;
    }
  });
};