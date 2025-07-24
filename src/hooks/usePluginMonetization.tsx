import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PluginLicense {
  id: string;
  plugin_id: string;
  license_type: 'one_time' | 'subscription' | 'pay_per_call';
  price_amount: number;
  currency: string;
  billing_interval?: 'month' | 'year' | 'one_time' | 'per_call';
  trial_period_days: number;
  usage_limits: any;
  features_included: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PluginLicenseKey {
  id: string;
  license_id: string;
  user_id: string;
  license_key: string;
  status: 'active' | 'expired' | 'suspended' | 'trial';
  expires_at?: string;
  usage_count: number;
  usage_limit?: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface PluginPurchase {
  id: string;
  user_id: string;
  plugin_id: string;
  license_id: string;
  payment_gateway: 'stripe' | 'flutterwave' | 'mobile_money';
  payment_method?: string;
  transaction_id?: string;
  amount: number;
  currency: string;
  commission_amount: number;
  developer_payout: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_data: any;
  created_at: string;
  updated_at: string;
}

export interface DeveloperPayout {
  id: string;
  developer_id: string;
  period_start: string;
  period_end: string;
  total_earnings: number;
  commission_deducted: number;
  payout_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payout_method?: string;
  payout_data: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentGatewayConfig {
  id: string;
  gateway_name: string;
  is_active: boolean;
  config_data: any;
  commission_percentage: number;
  created_at: string;
  updated_at: string;
}

// Hook to get plugin licenses
export const usePluginLicenses = (pluginId?: string) => {
  return useQuery({
    queryKey: ['plugin-licenses', pluginId],
    queryFn: async () => {
      let query = supabase
        .from('plugin_licenses')
        .select('*')
        .eq('is_active', true);

      if (pluginId) {
        query = query.eq('plugin_id', pluginId);
      }

      const { data, error } = await query.order('price_amount');
      if (error) throw error;
      return data as PluginLicense[];
    }
  });
};

// Hook to get user's plugin purchases
export const useUserPurchases = () => {
  return useQuery({
    queryKey: ['user-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugin_purchases')
        .select(`
          *,
          plugin_licenses (
            license_type,
            billing_interval
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};

// Hook to get user's license keys
export const useUserLicenseKeys = () => {
  return useQuery({
    queryKey: ['user-license-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugin_license_keys')
        .select(`
          *,
          plugin_licenses (
            plugin_id,
            license_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};

// Hook to validate license key
export const useValidateLicense = () => {
  return useMutation({
    mutationFn: async ({ licenseKey, pluginId }: { licenseKey: string; pluginId: string }) => {
      // Check if license key exists and is valid
      const { data: licenseData, error } = await supabase
        .from('plugin_license_keys')
        .select(`
          *,
          plugin_licenses (
            plugin_id,
            license_type,
            usage_limits
          )
        `)
        .eq('license_key', licenseKey)
        .single();

      if (error) throw new Error('Invalid license key');

      const license = licenseData as any;
      
      // Check if license is for the correct plugin
      if (license.plugin_licenses.plugin_id !== pluginId) {
        throw new Error('License key not valid for this plugin');
      }

      // Check if license is active
      if (license.status !== 'active' && license.status !== 'trial') {
        throw new Error('License key is not active');
      }

      // Check if license has expired
      if (license.expires_at && new Date(license.expires_at) < new Date()) {
        throw new Error('License key has expired');
      }

      // Check usage limits
      if (license.usage_limit && license.usage_count >= license.usage_limit) {
        throw new Error('License usage limit exceeded');
      }

      return license;
    }
  });
};

// Hook to track plugin usage
export const useTrackUsage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      licenseKeyId, 
      pluginId, 
      usageType = 'api_call',
      metadata = {} 
    }: {
      licenseKeyId: string;
      pluginId: string;
      usageType?: string;
      metadata?: any;
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Log usage
      const { error: logError } = await supabase
        .from('plugin_usage_logs')
        .insert({
          license_key_id: licenseKeyId,
          user_id: user.id,
          plugin_id: pluginId,
          usage_type: usageType,
          metadata
        });

      if (logError) throw logError;

      // TODO: Implement usage count tracking when needed
      // For now, skip usage count increment as the function doesn't exist yet
    },
    onError: (error) => {
      toast({
        title: "Usage Tracking Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Hook to get developer earnings
export const useDeveloperEarnings = () => {
  return useQuery({
    queryKey: ['developer-earnings'],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Get plugin sales for this developer
      const { data: sales, error } = await supabase
        .from('plugin_purchases')
        .select(`
          *,
          plugin_licenses (
            plugin_id
          )
        `)
        .eq('status', 'completed')
        .in('plugin_id', []);

      if (error) throw error;

      // Calculate totals
      const totalSales = sales?.length || 0;
      const totalRevenue = sales?.reduce((sum, sale) => sum + sale.developer_payout, 0) || 0;
      const totalCommission = sales?.reduce((sum, sale) => sum + sale.commission_amount, 0) || 0;

      return {
        totalSales,
        totalRevenue,
        totalCommission,
        sales: sales || []
      };
    }
  });
};

// Hook to get developer payouts
export const useDeveloperPayouts = () => {
  return useQuery({
    queryKey: ['developer-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developer_payouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DeveloperPayout[];
    }
  });
};

// Hook to initiate plugin purchase
export const usePurchasePlugin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      licenseId, 
      paymentGateway = 'stripe'
    }: {
      licenseId: string;
      paymentGateway?: 'stripe' | 'flutterwave' | 'mobile_money';
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Get license details
      const { data: license, error: licenseError } = await supabase
        .from('plugin_licenses')
        .select('*')
        .eq('id', licenseId)
        .single();

      if (licenseError) throw licenseError;

      // Check if user already owns this plugin
      const { data: existingPurchase } = await supabase
        .from('plugin_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('plugin_id', license.plugin_id)
        .eq('status', 'completed')
        .single();

      if (existingPurchase) {
        throw new Error('You already own this plugin');
      }

      // Get gateway configuration
      const { data: gatewayConfig, error: configError } = await supabase
        .from('payment_gateway_config')
        .select('*')
        .eq('gateway_name', paymentGateway)
        .eq('is_active', true)
        .single();

      if (configError || !gatewayConfig) {
        throw new Error('Payment gateway not available');
      }

      // Calculate amounts
      const amount = license.price_amount;
      const commission = (amount * gatewayConfig.commission_percentage) / 100;
      const developerPayout = amount - commission;

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('plugin_purchases')
        .insert({
          user_id: user.id,
          plugin_id: license.plugin_id,
          license_id: licenseId,
          payment_gateway: paymentGateway,
          amount,
          currency: license.currency,
          commission_amount: commission,
          developer_payout: developerPayout,
          status: 'pending'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // TODO: Integrate with actual payment gateway
      // For now, simulate successful payment
      if (paymentGateway === 'stripe') {
        // Stripe integration would go here
        console.log('Processing Stripe payment...');
      } else if (paymentGateway === 'flutterwave') {
        // Flutterwave integration would go here
        console.log('Processing Flutterwave payment...');
      }

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['user-license-keys'] });
      toast({
        title: "Purchase Initiated",
        description: "Your plugin purchase is being processed",
      });
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Hook to manage plugin licenses (for developers)
export const useManagePluginLicense = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (licenseData: Partial<PluginLicense>) => {
      if (licenseData.id) {
        // Update existing license
        const { data, error } = await supabase
          .from('plugin_licenses')
          .update(licenseData)
          .eq('id', licenseData.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new license
        const { data, error } = await supabase
          .from('plugin_licenses')
          .insert(licenseData as any)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugin-licenses'] });
      toast({
        title: "License Updated",
        description: "Plugin license has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "License Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Hook to get payment gateway configs (for admins)
export const usePaymentGatewayConfigs = () => {
  return useQuery({
    queryKey: ['payment-gateway-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_gateway_config')
        .select('*')
        .order('gateway_name');

      if (error) throw error;
      return data as PaymentGatewayConfig[];
    }
  });
};