import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RegionalHiringStats, HiringCampaign, Sponsor, CampaignHire } from '@/types/hiring';

// Regional hiring statistics
export const useRegionalHiringStats = (periodType: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
  return useQuery({
    queryKey: ['regional-hiring-stats', periodType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regional_hiring_stats')
        .select('*')
        .eq('period_type', periodType)
        .order('total_hires', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as RegionalHiringStats[];
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

// Live hiring leaderboard with real-time updates
export const useHiringLeaderboard = (timeframe: 'today' | 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: ['hiring-leaderboard', timeframe],
    queryFn: async () => {
      let startDate: string;
      const today = new Date();
      
      switch (timeframe) {
        case 'today':
          startDate = today.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          startDate = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          startDate = monthAgo.toISOString().split('T')[0];
          break;
        default:
          startDate = today.toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('regional_hiring_stats')
        .select('*')
        .gte('period_start', startDate)
        .order('total_hires', { ascending: false });

      if (error) throw error;

      // Aggregate data by region
      const regionMap = new Map<string, any>();
      
      data.forEach(stat => {
        const existing = regionMap.get(stat.region);
        if (existing) {
          existing.total_hires += stat.total_hires;
          existing.total_job_posts += stat.total_job_posts;
          existing.active_employers += stat.active_employers;
        } else {
          regionMap.set(stat.region, { 
            ...stat,
            top_sectors: Array.isArray(stat.top_sectors) ? stat.top_sectors : []
          });
        }
      });

      return Array.from(regionMap.values())
        .sort((a, b) => b.total_hires - a.total_hires)
        .slice(0, 10);
    },
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes for live updates
  });
};

// Active hiring campaigns
export const useActiveCampaigns = () => {
  return useQuery({
    queryKey: ['active-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hiring_campaigns')
        .select(`
          *,
          sponsor:sponsors(*)
        `)
        .eq('campaign_status', 'active')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (HiringCampaign & { sponsor: Sponsor })[];
    },
    refetchInterval: 5 * 60 * 1000,
  });
};

// Top sponsors by impact
export const useTopSponsors = (timeframe: 'week' | 'month' | 'quarter' = 'month') => {
  return useQuery({
    queryKey: ['top-sponsors', timeframe],
    queryFn: async () => {
      let startDate: string;
      const today = new Date();
      
      switch (timeframe) {
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          startDate = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          startDate = monthAgo.toISOString().split('T')[0];
          break;
        case 'quarter':
          const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          startDate = quarterAgo.toISOString().split('T')[0];
          break;
        default:
          startDate = today.toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('campaign_hires')
        .select(`
          campaign_id,
          hiring_campaigns!inner(
            sponsor_id,
            sponsors!inner(*)
          )
        `)
        .gte('hire_date', startDate)
        .eq('verified', true);

      if (error) throw error;

      // Aggregate hires by sponsor
      const sponsorMap = new Map();
      data.forEach(hire => {
        const sponsor = hire.hiring_campaigns?.sponsors;
        if (sponsor) {
          const existing = sponsorMap.get(sponsor.id);
          if (existing) {
            existing.hires += 1;
          } else {
            sponsorMap.set(sponsor.id, {
              ...sponsor,
              hires: 1
            });
          }
        }
      });

      return Array.from(sponsorMap.values())
        .sort((a, b) => b.hires - a.hires)
        .slice(0, 10);
    },
    refetchInterval: 10 * 60 * 1000,
  });
};

// Campaign progress tracking
export const useCampaignProgress = (campaignId: string) => {
  return useQuery({
    queryKey: ['campaign-progress', campaignId],
    queryFn: async () => {
      const { data: campaign, error: campaignError } = await supabase
        .from('hiring_campaigns')
        .select(`
          *,
          sponsor:sponsors(*)
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      const { data: hires, error: hiresError } = await supabase
        .from('campaign_hires')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('verified', true);

      if (hiresError) throw hiresError;

      return {
        campaign: campaign as HiringCampaign & { sponsor: Sponsor },
        hires: hires as CampaignHire[],
        progress: {
          percentage: Math.round((campaign.current_hires / campaign.target_hires) * 100),
          remaining: Math.max(0, campaign.target_hires - campaign.current_hires),
          daysLeft: Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        }
      };
    },
    enabled: !!campaignId,
  });
};