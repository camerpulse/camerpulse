import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DonationCause {
  id: string;
  name: string;
  description?: string | null;
  target_amount?: number | null;
  current_amount?: number | null;
  status: 'active' | 'completed' | 'paused' | string;
  created_at: string;
  updated_at: string;
}

export interface DonationItem {
  id: string;
  user_id: string | null;
  cause_id: string | null;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | string;
  payment_method: string;
  created_at: string;
  completed_at?: string | null;
  cause?: { name?: string } | null;
}

export function useDonationCauses() {
  const query = useQuery({
    queryKey: ['donation_causes'],
    queryFn: async (): Promise<DonationCause[]> => {
      const { data, error } = await supabase
        .from('donation_causes')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Supabase may return numeric as string; coerce
      return (data || []).map((c: any) => ({
        ...c,
        target_amount: c.target_amount ? Number(c.target_amount) : null,
        current_amount: c.current_amount ? Number(c.current_amount) : null,
      }));
    },
    staleTime: 60_000,
  });
  return { causes: query.data ?? [], isLoading: query.isLoading, error: query.error, refetch: query.refetch };
}

export function useDonationsAdmin() {
  const queryClient = useQueryClient();
  const donationsQuery = useQuery({
    queryKey: ['donations', 'admin'],
    queryFn: async (): Promise<DonationItem[]> => {
      const { data, error } = await supabase
        .from('donations')
        .select('id,user_id,cause_id,donor_name,donor_email,amount,currency,status,payment_method,created_at,completed_at,cause:donation_causes(name)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        amount: Number(d.amount),
      }));
    },
    staleTime: 30_000,
  });

  const processDonationMutation = useMutation({
    mutationFn: async (donationId: string) => {
      const { error } = await supabase
        .from('donations')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', donationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations', 'admin'] });
    },
  });

  const donations = donationsQuery.data ?? [];
  const totalAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const completedCount = donations.filter(d => d.status === 'completed').length;
  const avgAmount = donations.length ? Math.round(totalAmount / donations.length) : 0;

  return {
    donations,
    isLoading: donationsQuery.isLoading,
    error: donationsQuery.error,
    stats: {
      totalAmount,
      count: donations.length,
      completedCount,
      avgAmount,
    },
    processDonation: (id: string) => processDonationMutation.mutateAsync(id),
    processing: processDonationMutation.isPending,
  };
}
