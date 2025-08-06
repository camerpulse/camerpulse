import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type CivicEntityType = 
  | 'politician' 
  | 'mp' 
  | 'senator' 
  | 'chief_fon' 
  | 'political_party' 
  | 'ministry' 
  | 'local_council' 
  | 'company' 
  | 'school' 
  | 'hospital' 
  | 'pharmacy' 
  | 'village' 
  | 'institution';

export type SuggestionType = 
  | 'new_entity' 
  | 'edit_existing' 
  | 'data_correction' 
  | 'additional_info';

export type SuggestionStatus = 
  | 'pending' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'needs_revision';

export interface CivicSuggestion {
  id: string;
  submitter_id: string;
  entity_type: CivicEntityType;
  entity_id?: string;
  suggestion_type: SuggestionType;
  status: SuggestionStatus;
  title: string;
  description?: string;
  suggested_data: Record<string, any>;
  evidence_urls?: string[];
  change_summary?: string;
  moderator_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSuggestionData {
  entity_type: CivicEntityType;
  entity_id?: string;
  suggestion_type: SuggestionType;
  title: string;
  description?: string;
  suggested_data: Record<string, any>;
  evidence_urls?: string[];
  change_summary?: string;
}

export const useCivicSuggestions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's suggestions
  const { data: userSuggestions, isLoading: loadingUserSuggestions } = useQuery({
    queryKey: ['user-civic-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CivicSuggestion[];
    },
  });

  // Get all approved suggestions (public)
  const { data: approvedSuggestions, isLoading: loadingApproved } = useQuery({
    queryKey: ['approved-civic-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_suggestions')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CivicSuggestion[];
    },
  });

  // Create suggestion mutation
  const createSuggestion = useMutation({
    mutationFn: async (suggestionData: CreateSuggestionData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('civic_suggestions')
        .insert({
          ...suggestionData,
          submitter_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-civic-suggestions'] });
      toast({
        title: 'Suggestion Submitted',
        description: 'Your suggestion has been submitted for review.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit suggestion. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    userSuggestions,
    approvedSuggestions,
    loadingUserSuggestions,
    loadingApproved,
    createSuggestion: createSuggestion.mutate,
    isCreating: createSuggestion.isPending,
  };
};

// Hook for moderators to manage suggestions
export const useModerationQueue = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingSuggestions, isLoading } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_suggestions')
        .select('*')
        .in('status', ['pending', 'under_review'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as CivicSuggestion[];
    },
  });

  const updateSuggestionStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      moderator_notes,
      rejection_reason,
    }: {
      id: string;
      status: SuggestionStatus;
      moderator_notes?: string;
      rejection_reason?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('civic_suggestions')
        .update({
          status,
          moderator_notes,
          rejection_reason,
          reviewed_by: user.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      toast({
        title: 'Suggestion Updated',
        description: 'Suggestion status has been updated.',
      });
    },
  });

  return {
    pendingSuggestions,
    isLoading,
    updateSuggestionStatus: updateSuggestionStatus.mutate,
    isUpdating: updateSuggestionStatus.isPending,
  };
};

// Hook for entity reviews and ratings
export const useEntityReviews = (entityType: CivicEntityType, entityId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['entity-reviews', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_entity_reviews')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('is_flagged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const submitReview = useMutation({
    mutationFn: async (reviewData: {
      overall_rating: number;
      transparency_rating?: number;
      responsiveness_rating?: number;
      service_quality_rating?: number;
      accessibility_rating?: number;
      review_title?: string;
      review_content?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('civic_entity_reviews')
        .insert({
          ...reviewData,
          user_id: user.user.id,
          entity_type: entityType,
          entity_id: entityId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-reviews', entityType, entityId] });
      toast({
        title: 'Review Submitted',
        description: 'Your review has been submitted successfully.',
      });
    },
  });

  return {
    reviews,
    isLoading,
    submitReview: submitReview.mutate,
    isSubmitting: submitReview.isPending,
  };
};

// Hook for user reputation
export const useUserReputation = () => {
  const { data: reputation, isLoading } = useQuery({
    queryKey: ['user-civic-reputation'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('user_civic_reputation')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  return {
    reputation,
    isLoading,
  };
};