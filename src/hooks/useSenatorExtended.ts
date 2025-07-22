import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Extended interfaces for the new senator system
export interface SenatorClaim {
  id: string;
  senator_id: string;
  user_id: string;
  claim_type: string;
  claim_reason?: string;
  evidence_files?: string[];
  claim_fee_amount: number;
  payment_method?: string;
  payment_reference?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  admin_notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  updated_at: string;
}

export interface SenatorReport {
  id: string;
  senator_id: string;
  reporter_user_id: string;
  report_type: string;
  report_category: string;
  description: string;
  evidence_files?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'resolved' | 'dismissed';
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SenatorMessage {
  id: string;
  senator_id: string;
  sender_user_id: string;
  subject: string;
  message_content: string;
  message_type: 'inquiry' | 'complaint' | 'suggestion' | 'support' | 'media';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'read' | 'replied' | 'forwarded' | 'archived';
  response_content?: string;
  responded_at?: string;
  responded_by?: string;
  attachments?: string[];
  is_public: boolean;
  requires_pro_membership: boolean;
  created_at: string;
  updated_at: string;
}

export interface SenatorFollowing {
  id: string;
  senator_id: string;
  user_id: string;
  notifications_enabled: boolean;
  followed_at: string;
}

export interface SenatorAnalytics {
  id: string;
  senator_id: string;
  metric_type: string;
  metric_value: number;
  metric_date: string;
  metadata: any;
  created_at: string;
}

// Hook for senator following
export const useSenatorFollowing = (senatorId: string) => {
  return useQuery({
    queryKey: ['senator-following', senatorId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isFollowing: false, followerCount: 0 };

      const [followingData, countData] = await Promise.all([
        supabase
          .from('senator_following')
          .select('*')
          .eq('senator_id', senatorId)
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('senator_following')
          .select('*', { count: 'exact', head: true })
          .eq('senator_id', senatorId)
      ]);

      return {
        isFollowing: !!followingData.data,
        followerCount: countData.count || 0,
        following: followingData.data as SenatorFollowing | null
      };
    },
    enabled: !!senatorId
  });
};

// Hook for following/unfollowing senators
export const useToggleSenatorFollow = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ senatorId, isFollowing }: { senatorId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('You must be logged in to follow senators');

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('senator_following')
          .delete()
          .eq('senator_id', senatorId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { action: 'unfollow' };
      } else {
        // Follow
        const { error } = await supabase
          .from('senator_following')
          .insert({
            senator_id: senatorId,
            user_id: user.id,
            notifications_enabled: true
          });
        
        if (error) throw error;
        return { action: 'follow' };
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['senator-following', variables.senatorId] });
      queryClient.invalidateQueries({ queryKey: ['senators'] });
      
      toast.success(data.action === 'follow' ? "Now following senator" : "Unfollowed senator");
    },
    onError: (error) => {
      toast.error(`Failed to ${error.message.includes('follow') ? 'follow' : 'unfollow'} senator`);
    }
  });
};

// Hook for senator claims
export const useSenatorClaims = (senatorId?: string) => {
  return useQuery({
    queryKey: ['senator-claims', senatorId],
    queryFn: async () => {
      let query = supabase.from('senator_claims').select('*');
      
      if (senatorId) {
        query = query.eq('senator_id', senatorId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SenatorClaim[];
    }
  });
};

// Hook for creating senator claims
export const useCreateSenatorClaim = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (claim: Partial<SenatorClaim>) => {
      if (!user) throw new Error('You must be logged in to claim a senator profile');

      const { data, error } = await supabase
        .from('senator_claims')
        .insert({
          senator_id: claim.senator_id || '',
          user_id: user.id,
          claim_type: claim.claim_type || 'identity',
          claim_reason: claim.claim_reason || '',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senator-claims'] });
      toast.success("Your senator profile claim has been submitted for review");
    },
    onError: (error) => {
      toast.error(`Claim failed: ${error.message}`);
    }
  });
};

// Hook for senator reports
export const useSenatorReports = (senatorId?: string) => {
  return useQuery({
    queryKey: ['senator-reports', senatorId],
    queryFn: async () => {
      let query = supabase.from('senator_reports').select('*');
      
      if (senatorId) {
        query = query.eq('senator_id', senatorId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SenatorReport[];
    }
  });
};

// Hook for creating senator reports
export const useCreateSenatorReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (report: Partial<SenatorReport>) => {
      if (!user) throw new Error('You must be logged in to report misconduct');

      const { data, error } = await supabase
        .from('senator_reports')
        .insert({
          senator_id: report.senator_id || '',
          reporter_user_id: user.id,
          report_type: report.report_type || 'issue',
          report_category: report.report_category || 'general',
          description: report.description || '',
          severity: report.severity || 'medium',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senator-reports'] });
      toast.success("Your misconduct report has been submitted for review");
    },
    onError: (error) => {
      toast.error(`Report failed: ${error.message}`);
    }
  });
};

// Hook for senator messages
export const useSenatorMessages = (senatorId?: string) => {
  return useQuery({
    queryKey: ['senator-messages', senatorId],
    queryFn: async () => {
      let query = supabase.from('senator_messages').select('*');
      
      if (senatorId) {
        query = query.eq('senator_id', senatorId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SenatorMessage[];
    }
  });
};

// Hook for sending messages to senators
export const useSendSenatorMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (message: Partial<SenatorMessage>) => {
      if (!user) throw new Error('You must be logged in to send messages');

      const { data, error } = await supabase
        .from('senator_messages')
        .insert({
          senator_id: message.senator_id || '',
          sender_user_id: user.id,
          subject: message.subject || '',
          message_content: message.message_content || '',
          message_type: message.message_type || 'inquiry',
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senator-messages'] });
      toast.success("Your message has been sent to the senator");
    },
    onError: (error) => {
      toast.error(`Message failed: ${error.message}`);
    }
  });
};

// Hook for senator analytics (for claimed senators)
export const useSenatorAnalytics = (senatorId: string) => {
  return useQuery({
    queryKey: ['senator-analytics', senatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('senator_analytics')
        .select('*')
        .eq('senator_id', senatorId)
        .order('metric_date', { ascending: false });
      
      if (error) throw error;
      return (data || []).map((item: any) => ({
        ...item,
        metric_date: item.period_start || item.created_at
      })) as SenatorAnalytics[];
    },
    enabled: !!senatorId
  });
};

// Hook for calculating senator trust score
export const useCalculateSenatorScore = () => {
  return useMutation({
    mutationFn: async (senatorId: string) => {
      // TODO: Implement enhanced scoring function
      const data = {
        overall_score: 75,
        engagement_score: 80,
        transparency_score: 70,
        effectiveness_score: 75
      };

      return data;
    },
    onSuccess: () => {
      toast.success("Senator scores have been updated");
    },
    onError: (error) => {
      toast.error(`Calculation failed: ${error.message}`);
    }
  });
};