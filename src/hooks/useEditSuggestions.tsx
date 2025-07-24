import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EditSuggestion {
  id: string;
  user_id: string;
  entity_type: 'senator' | 'mp' | 'minister' | 'politician';
  entity_id: string;
  suggested_changes: Record<string, any>;
  change_reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useEditSuggestions = (entityType?: string, entityId?: string) => {
  return useQuery({
    queryKey: ['edit-suggestions', entityType, entityId],
    queryFn: async () => {
      let query = supabase.from('edit_suggestions').select('*');
      
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
  return useQuery({
    queryKey: ['user-edit-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edit_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EditSuggestion[];
    }
  });
};

export const useSuggestEdit = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suggestion: {
      entity_type: 'senator' | 'mp' | 'minister' | 'politician';
      entity_id: string;
      suggested_changes: Record<string, any>;
      change_reason?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to suggest edits');

      const { data, error } = await supabase
        .from('edit_suggestions')
        .insert({
          ...suggestion,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['edit-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['user-edit-suggestions'] });
      
      toast({
        title: "Edit Suggestion Submitted",
        description: "Your edit suggestion has been submitted for review",
      });
    },
    onError: (error) => {
      toast({
        title: "Suggestion Failed",
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