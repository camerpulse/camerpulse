import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

// Create claim for politicians - consolidated from .ts file
interface ClaimProfileData {
  entity_type: 'politician' | 'senator' | 'mp' | 'minister';
  entity_id: string;
  claim_type: string;
  claim_reason: string;
  evidence_files: string[];
}

export const useClaimProfileEnhanced = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimData: ClaimProfileData) => {
      if (!user) {
        throw new Error('Authentication required to claim a profile');
      }

      // Determine the correct table and claim table based on entity type
      const tableMap = {
        politician: { table: 'politicians', claimTable: 'politician_claims' },
        senator: { table: 'senators', claimTable: 'senator_claims' },
        mp: { table: 'mps', claimTable: 'mp_claims' },
        minister: { table: 'ministers', claimTable: 'minister_claims' }
      };

      const { table, claimTable } = tableMap[claimData.entity_type];

      // First check if the profile exists and is claimable
      const { data: profileData, error: profileError } = await supabase
        .from(table)
        .select('id, name, is_claimable, is_claimed')
        .eq('id', claimData.entity_id)
        .maybeSingle();

      if (profileError) {
        throw new Error(`Failed to verify profile: ${profileError.message}`);
      }

      if (!profileData) {
        throw new Error('Profile not found');
      }

      if (!profileData.is_claimable) {
        throw new Error('This profile is not available for claiming');
      }

      if (profileData.is_claimed) {
        throw new Error('This profile has already been claimed');
      }

      // Check if user already has a pending claim for this profile
      const { data: existingClaim } = await supabase
        .from(claimTable)
        .select('id, status')
        .eq('user_id', user.id)
        .eq(`${claimData.entity_type}_id`, claimData.entity_id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingClaim) {
        throw new Error('You already have a pending claim for this profile');
      }

      // Create the claim request
      const claimPayload = {
        [`${claimData.entity_type}_id`]: claimData.entity_id,
        user_id: user.id,
        claim_type: claimData.claim_type,
        claim_reason: claimData.claim_reason,
        evidence_files: claimData.evidence_files,
        status: 'pending',
        submitted_at: new Date().toISOString()
      };

      const { data: claimResult, error: claimError } = await supabase
        .from(claimTable)
        .insert(claimPayload)
        .select()
        .single();

      if (claimError) {
        throw new Error(`Failed to submit claim: ${claimError.message}`);
      }

      return claimResult;
    },
    onSuccess: (data) => {
      toast({
        title: "Claim Submitted Successfully",
        description: "Your profile claim has been submitted for review. You'll receive an email notification once reviewed.",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['politicians'] });
      queryClient.invalidateQueries({ queryKey: ['senators'] });
      queryClient.invalidateQueries({ queryKey: ['mps'] });
      queryClient.invalidateQueries({ queryKey: ['ministers'] });
      queryClient.invalidateQueries({ queryKey: ['political-parties'] });
    },
    onError: (error) => {
      toast({
        title: "Claim Submission Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

// Hook to get user's claim status for a specific profile
export const useProfileClaimStatus = (entityType: string, entityId: string) => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user || !entityId) return null;

      const claimTableMap: { [key: string]: string } = {
        politician: 'politician_claims',
        senator: 'senator_claims',
        mp: 'mp_claims',
        minister: 'minister_claims'
      };

      const claimTable = claimTableMap[entityType];
      if (!claimTable) return null;

      const { data, error } = await supabase
        .from(claimTable)
        .select('id, status, submitted_at, reviewed_at, rejection_reason')
        .eq('user_id', user.id)
        .eq(`${entityType}_id`, entityId)
        .order('submitted_at', { ascending: false })
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    }
  });
};