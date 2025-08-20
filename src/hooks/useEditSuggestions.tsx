import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EditSuggestion {
  id: string;
  user_id: string;
  entity_type: 'politician' | 'senator' | 'mp' | 'minister' | 'party';
  entity_id: string;
  entity_name: string;
  field_name: string;
  current_value: string | null;
  suggested_value: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name: string;
    avatar_url: string;
  };
}

export const useEditSuggestions = (entityType?: string, entityId?: string) => {
  return useQuery({
    queryKey: ['edit-suggestions', entityType, entityId],
    queryFn: async () => {
      let query = supabase
        .from('edit_suggestions')
        .select(`
          *,
          user_profile:profiles!user_id(display_name, avatar_url)
        `);
      
      if (entityType && entityId) {
        query = query.eq('entity_type', entityType).eq('entity_id', entityId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EditSuggestion[];
    },
    enabled: !!entityType && !!entityId
  });
};

export const useUserEditSuggestions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-edit-suggestions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('edit_suggestions')
        .select(`
          *,
          user_profile:profiles!user_id(display_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EditSuggestion[];
    },
    enabled: !!user
  });
};

export const useAllEditSuggestions = () => {
  return useQuery({
    queryKey: ['all-edit-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edit_suggestions')
        .select(`
          *,
          user_profile:profiles!user_id(display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EditSuggestion[];
    }
  });
};

export const useSubmitEditSuggestion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suggestion: {
      entity_type: 'politician' | 'senator' | 'mp' | 'minister' | 'party';
      entity_id: string;
      entity_name: string;
      field_name: string;
      current_value: string | null;
      suggested_value: string;
      justification: string;
    }) => {
      if (!user) throw new Error('You must be logged in to suggest edits');

      const { data, error } = await supabase
        .from('edit_suggestions')
        .insert({
          ...suggestion,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edit-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['user-edit-suggestions'] });
      
      toast({
        title: "Edit Suggestion Submitted",
        description: "Your suggested edit has been submitted for review by moderators.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateSuggestionStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      suggestionId, 
      status, 
      adminNotes 
    }: { 
      suggestionId: string; 
      status: 'approved' | 'rejected'; 
      adminNotes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');

      const { data, error } = await supabase
        .from('edit_suggestions')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', suggestionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edit-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['all-edit-suggestions'] });
      
      toast({
        title: "Suggestion Updated",
        description: "Edit suggestion status has been updated successfully",
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