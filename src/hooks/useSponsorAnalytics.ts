import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SponsorImpactMetrics, Sponsor, CampaignHire } from '@/types/hiring';

// Sponsor analytics and metrics
export const useSponsorAnalytics = (sponsorId: string, timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  return useQuery({
    queryKey: ['sponsor-analytics', sponsorId, timeframe],
    queryFn: async () => {
      if (!sponsorId) return null;

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
        case 'year':
          const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          startDate = yearAgo.toISOString().split('T')[0];
          break;
        default:
          startDate = today.toISOString().split('T')[0];
      }

      // Get sponsor details
      const { data: sponsor, error: sponsorError } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', sponsorId)
        .single();

      if (sponsorError) throw sponsorError;

      // Get all campaigns for this sponsor
      const { data: campaigns, error: campaignError } = await supabase
        .from('hiring_campaigns')
        .select('*')
        .eq('sponsor_id', sponsorId);

      if (campaignError) throw campaignError;

      // Get all hires for this sponsor's campaigns
      const campaignIds = campaigns.map(c => c.id);
      const { data: hires, error: hiresError } = await supabase
        .from('campaign_hires')
        .select('*')
        .in('campaign_id', campaignIds)
        .gte('hire_date', startDate)
        .eq('verified', true);

      if (hiresError) throw hiresError;

      // Calculate analytics
      const totalHires = hires.length;
      const activeCampaigns = campaigns.filter(c => c.campaign_status === 'active').length;
      const completedCampaigns = campaigns.filter(c => c.campaign_status === 'completed').length;
      const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget_allocated || 0), 0);

      // Demographics breakdown
      const genderBreakdown = hires.reduce((acc, hire) => {
        const gender = hire.gender || 'unspecified';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ageBreakdown = hires.reduce((acc, hire) => {
        const age = hire.age_group || 'unspecified';
        acc[age] = (acc[age] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Regional breakdown
      const regionalBreakdown = hires.reduce((acc, hire) => {
        const region = hire.region || 'unspecified';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Sector breakdown
      const sectorBreakdown = hires.reduce((acc, hire) => {
        const sector = hire.sector || 'unspecified';
        acc[sector] = (acc[sector] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Monthly hiring trend
      const monthlyTrend = hires.reduce((acc, hire) => {
        const month = hire.hire_date.substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        sponsor,
        campaigns,
        analytics: {
          totalHires,
          activeCampaigns,
          completedCampaigns,
          totalBudget,
          averageHiresPerCampaign: campaigns.length > 0 ? Math.round(totalHires / campaigns.length) : 0,
          genderBreakdown,
          ageBreakdown,
          regionalBreakdown,
          sectorBreakdown,
          monthlyTrend,
        },
        rawHires: hires
      };
    },
    enabled: !!sponsorId,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

// Get all sponsors for admin view
export const useAllSponsors = () => {
  return useQuery({
    queryKey: ['all-sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Sponsor[];
    },
  });
};

// Sponsor leaderboard with detailed metrics
export const useSponsorLeaderboard = (timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  return useQuery({
    queryKey: ['sponsor-leaderboard-detailed', timeframe],
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
        case 'year':
          const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          startDate = yearAgo.toISOString().split('T')[0];
          break;
        default:
          startDate = today.toISOString().split('T')[0];
      }

      const { data: sponsors, error: sponsorError } = await supabase
        .from('sponsors')
        .select(`
          *,
          hiring_campaigns!inner(
            id,
            name,
            target_hires,
            current_hires,
            budget_allocated
          )
        `)
        .eq('is_active', true);

      if (sponsorError) throw sponsorError;

      // Get all hires for the timeframe
      const { data: hires, error: hiresError } = await supabase
        .from('campaign_hires')
        .select(`
          *,
          hiring_campaigns!inner(
            sponsor_id
          )
        `)
        .gte('hire_date', startDate)
        .eq('verified', true);

      if (hiresError) throw hiresError;

      // Aggregate data by sponsor
      const sponsorMap = new Map();
      
      sponsors.forEach(sponsor => {
        const sponsorHires = hires.filter(hire => 
          hire.hiring_campaigns?.sponsor_id === sponsor.id
        );

        const campaigns = Array.isArray(sponsor.hiring_campaigns) 
          ? sponsor.hiring_campaigns 
          : [sponsor.hiring_campaigns].filter(Boolean);

        sponsorMap.set(sponsor.id, {
          ...sponsor,
          hires: sponsorHires.length,
          activeCampaigns: campaigns.length,
          totalBudget: campaigns.reduce((sum, c) => sum + (c.budget_allocated || 0), 0),
          totalTargets: campaigns.reduce((sum, c) => sum + c.target_hires, 0),
          womenHired: sponsorHires.filter(h => h.gender === 'female').length,
          youthHired: sponsorHires.filter(h => h.age_group === '18-35').length,
          regions: [...new Set(sponsorHires.map(h => h.region).filter(Boolean))].length,
        });
      });

      return Array.from(sponsorMap.values())
        .sort((a, b) => b.hires - a.hires)
        .slice(0, 20);
    },
    refetchInterval: 10 * 60 * 1000,
  });
};

// Export sponsor data
export const useExportSponsorData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sponsorId, format }: { sponsorId: string, format: 'pdf' | 'xlsx' }) => {
      // This would typically call an edge function to generate the export
      // For now, we'll just return a success message
      const response = await supabase.functions.invoke('export-sponsor-data', {
        body: { sponsorId, format }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      // Could trigger a download or show success message
    }
  });
};