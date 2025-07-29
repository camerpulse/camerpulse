import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type DiasporaProfile = Database['public']['Tables']['diaspora_profiles']['Row'];
type DiasporaProfileInsert = Database['public']['Tables']['diaspora_profiles']['Insert'];

export const useCreateDiasporaProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: Omit<DiasporaProfileInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('diaspora_profiles')
        .insert({
          ...profileData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your diaspora profile has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['diaspora-profile'] });
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive"
      });
    }
  });
};

export const useDiasporaProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['diaspora-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('diaspora_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useDiasporaProjects = () => {
  return useQuery({
    queryKey: ['diaspora-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diaspora_investment_projects')
        .select('*')
        .eq('project_status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};

export const useDiasporaEvents = () => {
  return useQuery({
    queryKey: ['diaspora-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diaspora_events')
        .select('*')
        .eq('event_status', 'active')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data;
    }
  });
};

export const useDiasporaDonations = (profileId?: string) => {
  return useQuery({
    queryKey: ['diaspora-donations', profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from('diaspora_donations')
        .select('*')
        .eq('diaspora_profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });
};

export const useCreateDonation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationData: any) => {
      const { data, error } = await supabase
        .from('diaspora_donations')
        .insert(donationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Donation Successful",
        description: "Thank you for your contribution!",
      });
      queryClient.invalidateQueries({ queryKey: ['diaspora-donations'] });
    },
    onError: (error) => {
      console.error('Error creating donation:', error);
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive"
      });
    }
  });
};

export const useInvestmentProjects = () => {
  return useDiasporaProjects();
};