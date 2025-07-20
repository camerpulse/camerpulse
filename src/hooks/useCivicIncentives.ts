import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

// Simplified types to avoid deep instantiation issues
type GrantProgram = any;
type GrantApplication = any;
type CivicReward = any;
type UserCivicReward = any;
type UserCivicMetrics = any;
type CivicLeaderboard = any;

// Grant Programs Hooks
export const useGrantPrograms = (status?: 'draft' | 'open' | 'closed' | 'suspended') => {
  return useQuery({
    queryKey: ['grant-programs', status],
    queryFn: async () => {
      let query = supabase
        .from('grant_programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('program_status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};

export const useCreateGrantProgram = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (programData: Omit<Database['public']['Tables']['grant_programs']['Insert'], 'created_by'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('grant_programs')
        .insert({
          ...programData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Grant Program Created",
        description: "New grant program has been successfully created!",
      });
      queryClient.invalidateQueries({ queryKey: ['grant-programs'] });
    },
    onError: (error) => {
      console.error('Error creating grant program:', error);
      toast({
        title: "Error",
        description: "Failed to create grant program. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Grant Applications Hooks
export const useGrantApplications = (userId?: string) => {
  return useQuery({
    queryKey: ['grant-applications', userId],
    queryFn: async () => {
      let query = supabase
        .from('grant_applications')
        .select(`
          *,
          grant_programs (
            program_name,
            program_type,
            program_category
          )
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('applicant_user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
};

export const useCreateGrantApplication = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (applicationData: Omit<Database['public']['Tables']['grant_applications']['Insert'], 'applicant_user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('grant_applications')
        .insert({
          ...applicationData,
          applicant_user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your grant application has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['grant-applications'] });
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Civic Rewards Hooks
export const useCivicRewards = (category?: string) => {
  return useQuery({
    queryKey: ['civic-rewards', category],
    queryFn: async () => {
      let query = supabase
        .from('civic_rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_value', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};

export const useUserCivicRewards = (userId?: string) => {
  return useQuery({
    queryKey: ['user-civic-rewards', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_civic_rewards')
        .select(`
          *,
          civic_rewards (
            reward_name,
            reward_type,
            description,
            icon_url,
            badge_color,
            points_value,
            category
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
};

// User Civic Metrics Hooks
export const useUserCivicMetrics = (userId?: string) => {
  return useQuery({
    queryKey: ['user-civic-metrics', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_civic_metrics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
};

export const useUpdateCivicMetrics = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string, updates: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('user_civic_metrics')
        .upsert({
          user_id: userId,
          ...updates
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-civic-metrics', data.user_id] });
    },
    onError: (error) => {
      console.error('Error updating civic metrics:', error);
      toast({
        title: "Error",
        description: "Failed to update civic metrics.",
        variant: "destructive"
      });
    }
  });
};

// Civic Leaderboards Hooks
export const useCivicLeaderboards = (type?: string, category?: string) => {
  return useQuery({
    queryKey: ['civic-leaderboards', type, category],
    queryFn: async () => {
      let query = supabase
        .from('civic_leaderboards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('leaderboard_type', type);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};

// Top Performers Query
export const useTopCivicPerformers = (category: string = 'overall', limit: number = 10) => {
  return useQuery({
    queryKey: ['top-civic-performers', category, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_civic_metrics')
        .select('*')
        .order('total_civic_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    }
  });
};

// Award Civic Reward Function
export const useAwardCivicReward = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, rewardId, context = {} }: { userId: string, rewardId: string, context?: any }) => {
      const { data, error } = await supabase.rpc('award_civic_reward', {
        p_user_id: userId,
        p_reward_id: rewardId,
        p_context: context
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      if (data) {
        toast({
          title: "Reward Earned!",
          description: "Congratulations! You've earned a new civic reward.",
        });
        queryClient.invalidateQueries({ queryKey: ['user-civic-rewards', variables.userId] });
        queryClient.invalidateQueries({ queryKey: ['user-civic-metrics', variables.userId] });
      }
    },
    onError: (error) => {
      console.error('Error awarding civic reward:', error);
    }
  });
};

// Calculate Civic Score Function
export const useCalculateCivicScore = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('calculate_civic_score', {
        p_user_id: userId
      });

      if (error) throw error;
      return data;
    }
  });
};