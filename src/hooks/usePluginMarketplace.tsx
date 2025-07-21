import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MarketplacePlugin {
  id: string;
  plugin_id: string;
  plugin_name: string;
  display_name: string;
  description: string;
  detailed_description?: string;
  version: string;
  author_id: string;
  author_name: string;
  category: string;
  tags: string[];
  source_type: 'local' | 'remote' | 'github';
  source_url?: string;
  bundle_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'deprecated';
  is_official: boolean;
  is_featured: boolean;
  download_count: number;
  install_count: number;
  rating_average: number;
  rating_count: number;
  security_scan_status: 'pending' | 'passed' | 'failed' | 'manual_review';
  created_at: string;
  published_at?: string;
}

export interface PluginSubmission {
  id: string;
  plugin_id: string;
  submitter_id: string;
  submitter_name: string;
  submission_type: 'new' | 'update' | 'resubmission';
  plugin_data: any;
  manifest_data: any;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_changes';
  reviewer_notes?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface SecurityScan {
  id: string;
  plugin_id: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'manual_review';
  overall_score?: number;
  malicious_patterns_found: any[];
  dependency_vulnerabilities: any[];
  requires_manual_review: boolean;
  created_at: string;
  completed_at?: string;
}

// Fetch marketplace plugins
const fetchMarketplacePlugins = async (filters?: {
  category?: string;
  search?: string;
  featured?: boolean;
  status?: string;
}): Promise<MarketplacePlugin[]> => {
  let query = supabase
    .from('plugin_marketplace')
    .select('*')
    .order('download_count', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'approved'); // Default to approved only
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.featured) {
    query = query.eq('is_featured', true);
  }

  if (filters?.search) {
    query = query.or(`plugin_name.ilike.%${filters.search}%,display_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Fetch plugin submissions
const fetchPluginSubmissions = async (): Promise<PluginSubmission[]> => {
  const { data, error } = await supabase
    .from('plugin_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch security scans
const fetchSecurityScans = async (pluginId?: string): Promise<SecurityScan[]> => {
  let query = supabase
    .from('plugin_security_scans')
    .select('*')
    .order('created_at', { ascending: false });

  if (pluginId) {
    query = query.eq('plugin_id', pluginId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const usePluginMarketplace = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    category?: string;
    search?: string;
    featured?: boolean;
    status?: string;
  }>({});

  // Fetch plugins with filters
  const { 
    data: plugins, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['marketplace-plugins', filters],
    queryFn: () => fetchMarketplacePlugins(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Install plugin mutation
  const installPlugin = useMutation({
    mutationFn: async ({ pluginId, installationType = 'marketplace' }: { 
      pluginId: string; 
      installationType?: string;
    }) => {
      // Track the download/install
      const { error: trackError } = await supabase
        .from('plugin_downloads')
        .insert({
          plugin_id: pluginId,
          download_type: 'install',
          installation_source: installationType,
          user_platform: 'web',
          success: true
        });

      if (trackError) throw trackError;

      // Update install count
      const { error: updateError } = await supabase.rpc('increment', {
        table_name: 'plugin_marketplace',
        row_id: pluginId,
        column_name: 'install_count'
      });

      if (updateError) throw updateError;

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Plugin installed successfully');
      queryClient.invalidateQueries({ queryKey: ['marketplace-plugins'] });
    },
    onError: (error) => {
      console.error('Install error:', error);
      toast.error('Failed to install plugin');
    }
  });

  // Rate plugin mutation
  const ratePlugin = useMutation({
    mutationFn: async ({ 
      pluginId, 
      rating, 
      reviewText 
    }: { 
      pluginId: string; 
      rating: number; 
      reviewText?: string;
    }) => {
      const { error } = await supabase
        .from('plugin_ratings')
        .upsert({
          plugin_id: pluginId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          rating,
          review_text: reviewText
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Rating submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['marketplace-plugins'] });
    },
    onError: () => {
      toast.error('Failed to submit rating');
    }
  });

  // Submit plugin mutation
  const submitPlugin = useMutation({
    mutationFn: async (submissionData: {
      plugin_id: string;
      plugin_data: any;
      manifest_data: any;
      submission_type?: 'new' | 'update' | 'resubmission';
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('plugin_submissions')
        .insert({
          ...submissionData,
          submitter_id: user.id,
          submitter_name: user.email || 'Unknown',
          submission_type: submissionData.submission_type || 'new'
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Plugin submitted for review');
      queryClient.invalidateQueries({ queryKey: ['plugin-submissions'] });
    },
    onError: () => {
      toast.error('Failed to submit plugin');
    }
  });

  // Update filters
  const updateFilters = useCallback((newFilters: typeof filters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Get plugin by ID
  const getPlugin = useCallback((pluginId: string) => {
    return plugins?.find(p => p.plugin_id === pluginId);
  }, [plugins]);

  // Get featured plugins
  const featuredPlugins = plugins?.filter(p => p.is_featured) || [];

  // Get categories
  const categories = Array.from(new Set(plugins?.map(p => p.category) || []));

  return {
    // Data
    plugins: plugins || [],
    featuredPlugins,
    categories,
    filters,
    isLoading,
    error,

    // Actions
    installPlugin: installPlugin.mutate,
    isInstalling: installPlugin.isPending,
    ratePlugin: ratePlugin.mutate,
    isRating: ratePlugin.isPending,
    submitPlugin: submitPlugin.mutate,
    isSubmitting: submitPlugin.isPending,
    updateFilters,
    clearFilters,
    refetch,
    getPlugin,
  };
};

export const usePluginSubmissions = () => {
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['plugin-submissions'],
    queryFn: fetchPluginSubmissions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Approve submission
  const approveSubmission = useMutation({
    mutationFn: async ({ submissionId, notes }: { submissionId: string; notes?: string }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('plugin_submissions')
        .update({
          status: 'approved',
          reviewer_id: user.id,
          reviewer_notes: notes,
          approved_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Submission approved');
      queryClient.invalidateQueries({ queryKey: ['plugin-submissions'] });
    },
    onError: () => {
      toast.error('Failed to approve submission');
    }
  });

  // Reject submission
  const rejectSubmission = useMutation({
    mutationFn: async ({ 
      submissionId, 
      reason, 
      notes 
    }: { 
      submissionId: string; 
      reason: string; 
      notes?: string;
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('plugin_submissions')
        .update({
          status: 'rejected',
          reviewer_id: user.id,
          reviewer_notes: notes,
          rejection_reason: reason,
          rejected_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Submission rejected');
      queryClient.invalidateQueries({ queryKey: ['plugin-submissions'] });
    },
    onError: () => {
      toast.error('Failed to reject submission');
    }
  });

  return {
    submissions: submissions || [],
    isLoading,
    approveSubmission: approveSubmission.mutate,
    rejectSubmission: rejectSubmission.mutate,
    isProcessing: approveSubmission.isPending || rejectSubmission.isPending,
  };
};

export const useSecurityScans = (pluginId?: string) => {
  const { data: scans, isLoading } = useQuery({
    queryKey: ['security-scans', pluginId],
    queryFn: () => fetchSecurityScans(pluginId),
    staleTime: 2 * 60 * 1000,
  });

  return {
    scans: scans || [],
    isLoading,
    latestScan: scans?.[0],
  };
};