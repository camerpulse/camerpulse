import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface JudiciaryMember {
  id: string;
  user_id: string | null;
  name: string;
  photo_url: string | null;
  position_title: string;
  court_level: string;
  region: string | null;
  district: string | null;
  term_start_date: string | null;
  term_end_date: string | null;
  education_background: string | null;
  career_background: string | null;
  cases_handled: number;
  integrity_score: number;
  verified_source_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  claimed_by_user: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalCase {
  id: string;
  case_reference: string;
  case_title: string;
  case_type: string;
  case_status: string;
  court_id: string | null;
  court_level: string;
  region: string | null;
  defendant: string | null;
  plaintiff: string | null;
  case_summary: string | null;
  verdict: string | null;
  case_documents: any[];
  timeline_events: any[];
  public_interest_score: number;
  media_coverage_count: number;
  citizen_comments_count: number;
  is_high_profile: boolean;
  started_date: string | null;
  closed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface JudicialRating {
  id: string;
  judiciary_member_id: string;
  user_id: string;
  timeliness_rating: number;
  public_trust_rating: number;
  ethical_conduct_rating: number;
  case_handling_rating: number;
  neutrality_rating: number;
  overall_rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MisconductReport {
  id: string;
  judiciary_member_id: string | null;
  case_id: string | null;
  reporter_user_id: string | null;
  report_type: string;
  incident_date: string | null;
  description: string;
  evidence_files: any[];
  is_anonymous: boolean;
  severity_level: string;
  investigation_status: string;
  investigated_by: string | null;
  investigation_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useJudiciaryData = () => {
  const queryClient = useQueryClient();

  // Fetch judiciary members
  const { 
    data: judiciaryMembers, 
    isLoading: loadingMembers,
    error: membersError 
  } = useQuery({
    queryKey: ['judiciary-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('judiciary_members')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as JudiciaryMember[];
    }
  });

  // Fetch legal cases
  const { 
    data: legalCases, 
    isLoading: loadingCases,
    error: casesError 
  } = useQuery({
    queryKey: ['legal-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_cases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LegalCase[];
    }
  });

  // Fetch judicial ratings
  const { 
    data: judicialRatings, 
    isLoading: loadingRatings 
  } = useQuery({
    queryKey: ['judicial-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('judicial_ratings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as JudicialRating[];
    }
  });

  // Fetch misconduct reports (only for admins or own reports)
  const { 
    data: misconductReports, 
    isLoading: loadingReports 
  } = useQuery({
    queryKey: ['misconduct-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('judicial_misconduct_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        // If user doesn't have permission, return empty array
        if (error.code === 'PGRST301') {
          return [];
        }
        throw error;
      }
      return data as MisconductReport[];
    }
  });

  // Create judicial rating mutation
  const createRatingMutation = useMutation({
    mutationFn: async (ratingData: {
      judiciary_member_id: string;
      timeliness_rating: number;
      public_trust_rating: number;
      ethical_conduct_rating: number;
      case_handling_rating: number;
      neutrality_rating: number;
      comment?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const overall_rating = (
        ratingData.timeliness_rating +
        ratingData.public_trust_rating +
        ratingData.ethical_conduct_rating +
        ratingData.case_handling_rating +
        ratingData.neutrality_rating
      ) / 5;

      const { data, error } = await supabase
        .from('judicial_ratings')
        .insert({
          ...ratingData,
          user_id: user.id,
          overall_rating
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judicial-ratings'] });
      queryClient.invalidateQueries({ queryKey: ['judiciary-members'] });
      toast.success('Rating submitted successfully');
    },
    onError: (error) => {
      console.error('Error creating rating:', error);
      toast.error('Failed to submit rating');
    }
  });

  // Create misconduct report mutation
  const createMisconductReportMutation = useMutation({
    mutationFn: async (reportData: {
      judiciary_member_id?: string;
      case_id?: string;
      report_type: string;
      incident_date?: string;
      description: string;
      evidence_files?: any[];
      is_anonymous?: boolean;
      severity_level?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('judicial_misconduct_reports')
        .insert({
          ...reportData,
          reporter_user_id: reportData.is_anonymous ? null : user?.id,
          investigation_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misconduct-reports'] });
      toast.success('Report submitted successfully');
    },
    onError: (error) => {
      console.error('Error creating report:', error);
      toast.error('Failed to submit report');
    }
  });

  // Case comment mutation
  const createCaseCommentMutation = useMutation({
    mutationFn: async (commentData: {
      case_id: string;
      comment_text: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('case_comments')
        .insert({
          ...commentData,
          user_id: user.id,
          is_approved: false // Requires moderation
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-comments'] });
      toast.success('Comment submitted for review');
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
      toast.error('Failed to submit comment');
    }
  });

  // Aggregate statistics
  const statistics = {
    totalJudges: judiciaryMembers?.length || 0,
    totalCases: legalCases?.length || 0,
    ongoingCases: legalCases?.filter(c => c.case_status === 'ongoing').length || 0,
    highProfileCases: legalCases?.filter(c => c.is_high_profile).length || 0,
    averageIntegrityScore: judiciaryMembers?.length 
      ? (judiciaryMembers.reduce((sum, member) => sum + member.integrity_score, 0) / judiciaryMembers.length).toFixed(2)
      : '0',
    totalRatings: judicialRatings?.length || 0,
    pendingReports: misconductReports?.filter(r => r.investigation_status === 'pending').length || 0
  };

  return {
    // Data
    judiciaryMembers,
    legalCases,
    judicialRatings,
    misconductReports,
    statistics,

    // Loading states
    isLoading: loadingMembers || loadingCases || loadingRatings || loadingReports,
    loadingMembers,
    loadingCases,
    loadingRatings,
    loadingReports,

    // Errors
    membersError,
    casesError,

    // Actions
    createRating: createRatingMutation.mutateAsync,
    createMisconductReport: createMisconductReportMutation.mutateAsync,
    createCaseComment: createCaseCommentMutation.mutateAsync,

    // Mutation states
    isCreatingRating: createRatingMutation.isPending,
    isCreatingReport: createMisconductReportMutation.isPending,
    isCreatingComment: createCaseCommentMutation.isPending
  };
};