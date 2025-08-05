import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformGap {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'performance' | 'security' | 'compliance' | 'user_experience' | 'technical_debt';
  priority_level: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
  status: 'identified' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
  impact_score: number;
  effort_score: number;
  feasibility_score: number;
  risk_score: number;
  calculated_priority_score: number;
  affected_modules: string[];
  stakeholders: string[];
  estimated_effort_hours?: number;
  target_completion_date?: string;
  business_justification?: string;
  technical_notes?: string;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentSession {
  id: string;
  title: string;
  description?: string;
  assessment_date: string;
  facilitator_id?: string;
  participants: string[];
  methodology: string;
  scope_areas: string[];
  total_gaps_identified: number;
  must_have_count: number;
  should_have_count: number;
  could_have_count: number;
  wont_have_count: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  quarter?: string;
  theme?: string;
  planned_gaps: string[];
  allocated_budget?: number;
  team_capacity_hours?: number;
  completion_percentage: number;
  actual_effort_hours: number;
  created_by?: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
}

// Hooks for Platform Gaps
export const usePlatformGaps = () => {
  return useQuery({
    queryKey: ['platform-gaps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_gaps')
        .select('*')
        .order('calculated_priority_score', { ascending: false });

      if (error) throw error;
      return data as PlatformGap[];
    },
  });
};

export const useCreatePlatformGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gap: Omit<PlatformGap, 'id' | 'calculated_priority_score' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('platform_gaps')
        .insert(gap)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-gaps'] });
      toast.success('Platform gap created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create platform gap: ' + error.message);
    },
  });
};

export const useUpdatePlatformGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlatformGap> & { id: string }) => {
      const { data, error } = await supabase
        .from('platform_gaps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-gaps'] });
      toast.success('Platform gap updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update platform gap: ' + error.message);
    },
  });
};

// Hooks for Assessment Sessions
export const useAssessmentSessions = () => {
  return useQuery({
    queryKey: ['assessment-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gap_assessment_sessions')
        .select('*')
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      return data as AssessmentSession[];
    },
  });
};

export const useCreateAssessmentSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: Omit<AssessmentSession, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('gap_assessment_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-sessions'] });
      toast.success('Assessment session created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create assessment session: ' + error.message);
    },
  });
};

// Hooks for Development Roadmap
export const useRoadmapItems = () => {
  return useQuery({
    queryKey: ['roadmap-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('development_roadmap')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as RoadmapItem[];
    },
  });
};

export const useCreateRoadmapItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<RoadmapItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('development_roadmap')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap-items'] });
      toast.success('Roadmap item created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create roadmap item: ' + error.message);
    },
  });
};

// Statistics hook
export const usePriorityAssessmentStats = () => {
  return useQuery({
    queryKey: ['priority-assessment-stats'],
    queryFn: async () => {
      const { data: gaps, error: gapsError } = await supabase
        .from('platform_gaps')
        .select('priority_level, status, category');

      if (gapsError) throw gapsError;

      const stats = {
        totalGaps: gaps.length,
        byPriority: {
          must_have: gaps.filter(g => g.priority_level === 'must_have').length,
          should_have: gaps.filter(g => g.priority_level === 'should_have').length,
          could_have: gaps.filter(g => g.priority_level === 'could_have').length,
          wont_have: gaps.filter(g => g.priority_level === 'wont_have').length,
        },
        byStatus: {
          identified: gaps.filter(g => g.status === 'identified').length,
          in_progress: gaps.filter(g => g.status === 'in_progress').length,
          completed: gaps.filter(g => g.status === 'completed').length,
          deferred: gaps.filter(g => g.status === 'deferred').length,
          cancelled: gaps.filter(g => g.status === 'cancelled').length,
        },
        byCategory: {
          feature: gaps.filter(g => g.category === 'feature').length,
          performance: gaps.filter(g => g.category === 'performance').length,
          security: gaps.filter(g => g.category === 'security').length,
          compliance: gaps.filter(g => g.category === 'compliance').length,
          user_experience: gaps.filter(g => g.category === 'user_experience').length,
          technical_debt: gaps.filter(g => g.category === 'technical_debt').length,
        }
      };

      return stats;
    },
  });
};