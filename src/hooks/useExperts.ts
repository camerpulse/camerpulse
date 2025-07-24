import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types for the expert system
export interface ExpertProfile {
  id: string;
  user_id: string;
  professional_title: string;
  bio?: string;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  currency: string;
  availability: 'available' | 'busy' | 'not_available';
  work_preference: string[];
  expertise_areas: string[];
  skills: string[];
  languages: string[];
  years_experience: number;
  education: any[];
  certifications: any[];
  portfolio_items: any[];
  location?: string;
  region?: string;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  payment_status: string;
  featured_until?: string;
  average_rating: number;
  total_reviews: number;
  total_projects: number;
  profile_views: number;
  response_time_hours: number;
  profile_completion: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectRequest {
  id: string;
  client_id: string;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  currency: string;
  budget_type: 'hourly' | 'fixed' | 'daily' | 'weekly' | 'monthly';
  duration_estimate?: string;
  required_skills: string[];
  experience_level: 'entry_level' | 'mid_level' | 'senior_level' | 'expert_level';
  location_requirement?: string;
  is_remote: boolean;
  deadline?: string;
  attachments: string[];
  proposals_count: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ProjectProposal {
  id: string;
  expert_id: string;
  client_id: string;
  project_title: string;
  project_description: string;
  proposed_rate: number;
  currency: string;
  rate_type: 'hourly' | 'fixed' | 'daily' | 'weekly' | 'monthly';
  estimated_duration?: string;
  proposal_text: string;
  attachments: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpertFilters {
  skills?: string[];
  availability?: string;
  rate_range?: { min: number; max: number };
  experience_level?: string;
  location?: string;
  rating_min?: number;
}

export const useExperts = () => {
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Get user's expert profile
  const getUserExpertProfile = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching expert profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching expert profile:', error);
      return null;
    }
  };

  // Create expert profile
  const createExpertProfile = async (profileData: Partial<ExpertProfile>) => {
    if (!user) {
      toast.error('You must be logged in to create an expert profile');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('expert_profiles')
        .insert({
          ...profileData,
          user_id: user.id
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating expert profile:', error);
        toast.error('Failed to create expert profile');
        return { success: false, error: error.message };
      }

      toast.success('Expert profile created successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error creating expert profile:', error);
      toast.error('Failed to create expert profile');
      return { success: false, error: 'Creation failed' };
    } finally {
      setLoading(false);
    }
  };

  // Update expert profile
  const updateExpertProfile = async (profileId: string, updates: Partial<ExpertProfile>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('expert_profiles')
        .update(updates)
        .eq('id', profileId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating expert profile:', error);
        toast.error('Failed to update profile');
        return { success: false, error: error.message };
      }

      toast.success('Profile updated successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error updating expert profile:', error);
      toast.error('Failed to update profile');
      return { success: false, error: 'Update failed' };
    } finally {
      setLoading(false);
    }
  };

  // Search experts with filters
  const searchExperts = async (filters: ExpertFilters = {}) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('expert_profiles')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps('skills', filters.skills);
      }

      if (filters.availability) {
        query = query.eq('availability', filters.availability);
      }

      if (filters.rate_range) {
        if (filters.rate_range.min) {
          query = query.gte('hourly_rate_min', filters.rate_range.min);
        }
        if (filters.rate_range.max) {
          query = query.lte('hourly_rate_max', filters.rate_range.max);
        }
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.rating_min) {
        query = query.gte('average_rating', filters.rating_min);
      }

      const { data, error } = await query.order('average_rating', { ascending: false });

      if (error) {
        console.error('Error searching experts:', error);
        return [];
      }

      setExperts(data as unknown as ExpertProfile[] || []);
      return data || [];
    } catch (error) {
      console.error('Error searching experts:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get project requests
  const getProjectRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('project_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project requests:', error);
        return [];
      }

      setProjectRequests(data as unknown as ProjectRequest[] || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching project requests:', error);
      return [];
    }
  };

  // Create project request
  const createProjectRequest = async (requestData: Partial<ProjectRequest>) => {
    if (!user) {
      toast.error('You must be logged in to create a project request');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('project_requests')
        .insert({
          ...requestData,
          client_id: user.id
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating project request:', error);
        toast.error('Failed to create project request');
        return { success: false, error: error.message };
      }

      toast.success('Project request created successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error creating project request:', error);
      toast.error('Failed to create project request');
      return { success: false, error: 'Creation failed' };
    } finally {
      setLoading(false);
    }
  };

  // Submit proposal
  const submitProposal = async (proposalData: Partial<ProjectProposal>) => {
    if (!user) {
      toast.error('You must be logged in to submit a proposal');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('project_proposals')
        .insert(proposalData as any)
        .select()
        .single();

      if (error) {
        console.error('Error submitting proposal:', error);
        toast.error('Failed to submit proposal');
        return { success: false, error: error.message };
      }

      toast.success('Proposal submitted successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast.error('Failed to submit proposal');
      return { success: false, error: 'Submission failed' };
    } finally {
      setLoading(false);
    }
  };

  return {
    experts,
    projectRequests,
    loading,
    getUserExpertProfile,
    createExpertProfile,
    updateExpertProfile,
    searchExperts,
    getProjectRequests,
    createProjectRequest,
    submitProposal
  };
};