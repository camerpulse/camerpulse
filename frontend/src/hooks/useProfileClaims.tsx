import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProfileClaim {
  id: string;
  user_id: string;
  entity_type: 'senator' | 'mp' | 'minister' | 'politician';
  entity_id: string;
  claim_type: string;
  claim_reason?: string;
  evidence_files?: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useProfileClaims = (entityType?: string, entityId?: string) => {
  return useQuery({
    queryKey: ['profile-claims', entityType, entityId],
    queryFn: async () => {
      let query = supabase.from('profile_claims').select('*');
      
      if (entityType && entityId) {
        query = query.eq('entity_type', entityType).eq('entity_id', entityId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProfileClaim[];
    },
    enabled: !!entityType && !!entityId
  });
};

export const useUserProfileClaims = () => {
  return useQuery({
    queryKey: ['user-profile-claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_claims')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProfileClaim[];
    }
  });
};

export const useClaimProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claim: {
      entity_type: 'senator' | 'mp' | 'minister' | 'politician';
      entity_id: string;
      claim_type: string;
      claim_reason?: string;
      evidence_files?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to claim a profile');

      const { data, error } = await supabase
        .from('profile_claims')
        .insert({
          ...claim,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile-claims'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile-claims'] });
      
      toast({
        title: "Claim Submitted",
        description: "Your profile claim has been submitted for review",
      });
    },
    onError: (error) => {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateClaimStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      claimId, 
      status, 
      adminNotes 
    }: { 
      claimId: string; 
      status: 'approved' | 'rejected'; 
      adminNotes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');

      const { data, error } = await supabase
        .from('profile_claims')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', claimId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-claims'] });
      toast({
        title: "Claim Updated",
        description: "Claim status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};