import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Diaspora Profiles
export const useDiasporaProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['diaspora-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diaspora_profiles')
        .select('*')
        .eq('user_id', userId || '')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreateDiasporaProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (profile: {
      full_name: string;
      country_of_residence: string;
      home_village_town_city: string;
      profession_sector?: string;
      diaspora_association?: string;
      preferred_donation_interests?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('diaspora_profiles')
        .insert([{ ...profile, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaspora-profile'] });
      toast({
        title: "Profile Created",
        description: "Your diaspora profile has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDiasporaProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('diaspora_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaspora-profile'] });
      toast({
        title: "Profile Updated",
        description: "Your diaspora profile has been updated successfully.",
      });
    },
  });
};

// Investment Projects
export const useInvestmentProjects = (filters?: { category?: string; status?: string; location?: string }) => {
  return useQuery({
    queryKey: ['investment-projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('diaspora_investment_projects')
        .select('*')
        .eq('verification_status', 'verified')
        .order('created_at', { ascending: false });
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters?.status) {
        query = query.eq('project_status', filters.status);
      }
      
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateInvestmentProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (project: {
      title: string;
      description: string;
      category: string;
      target_amount_fcfa: number;
      location: string;
      project_manager?: string;
      contact_email?: string;
      start_date?: string;
      expected_completion_date?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('diaspora_investment_projects')
        .insert([{ ...project, created_by: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-projects'] });
      toast({
        title: "Project Created",
        description: "Your investment project has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });
};

// Donations
export const useDonations = (profileId?: string) => {
  return useQuery({
    queryKey: ['donations', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diaspora_donations')
        .select(`
          *,
          diaspora_investment_projects(title, category)
        `)
        .eq('diaspora_profile_id', profileId || '')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });
};

export const useCreateDonation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (donation: {
      diaspora_profile_id: string;
      project_id?: string;
      amount_fcfa: number;
      amount_usd?: number;
      donation_type: string;
      payment_method?: string;
      donation_message?: string;
      is_anonymous?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('diaspora_donations')
        .insert([{
          ...donation,
          transaction_reference: `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          qr_receipt_data: JSON.stringify({
            amount: donation.amount_fcfa,
            date: new Date().toISOString(),
            reference: `DON-${Date.now()}`,
          }),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['investment-projects'] });
      toast({
        title: "Donation Successful",
        description: "Your donation has been processed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process donation",
        variant: "destructive",
      });
    },
  });
};

// Recognition
export const useDiasporaRecognition = (profileId?: string) => {
  return useQuery({
    queryKey: ['diaspora-recognition', profileId],
    queryFn: async () => {
      let query = supabase
        .from('diaspora_recognition')
        .select(`
          *,
          diaspora_profiles(full_name, country_of_residence)
        `)
        .eq('public_display', true)
        .order('achievement_date', { ascending: false });
      
      if (profileId) {
        query = query.eq('diaspora_profile_id', profileId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Events
export const useDiasporaEvents = (filters?: { type?: string; upcoming?: boolean }) => {
  return useQuery({
    queryKey: ['diaspora-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('diaspora_events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (filters?.type) {
        query = query.eq('event_type', filters.type);
      }
      
      if (filters?.upcoming) {
        query = query.gte('event_date', new Date().toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ eventId, profileId, responses }: { 
      eventId: string; 
      profileId: string; 
      responses?: any;
    }) => {
      const { data, error } = await supabase
        .from('diaspora_event_registrations')
        .insert([{
          event_id: eventId,
          diaspora_profile_id: profileId,
          questions_responses: responses || {},
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaspora-events'] });
      toast({
        title: "Registration Successful",
        description: "You have been registered for the event.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    },
  });
};

// Stats
export const useDiasporaStats = () => {
  return useQuery({
    queryKey: ['diaspora-stats'],
    queryFn: async () => {
      const [profilesResult, projectsResult, donationsResult] = await Promise.all([
        supabase
          .from('diaspora_profiles')
          .select('id, total_contributions_fcfa')
          .eq('verification_status', 'verified'),
        supabase
          .from('diaspora_investment_projects')
          .select('id, target_amount_fcfa, raised_amount_fcfa')
          .eq('verification_status', 'verified'),
        supabase
          .from('diaspora_donations')
          .select('amount_fcfa')
          .eq('donation_status', 'completed'),
      ]);
      
      const totalMembers = profilesResult.data?.length || 0;
      const totalProjects = projectsResult.data?.length || 0;
      const totalRaised = donationsResult.data?.reduce((sum, donation) => sum + donation.amount_fcfa, 0) || 0;
      const projectsFunded = projectsResult.data?.filter(p => p.raised_amount_fcfa > 0).length || 0;
      
      return {
        totalMembers,
        totalProjects,
        totalRaised,
        projectsFunded,
      };
    },
  });
};