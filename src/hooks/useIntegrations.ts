import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface IntegrationService {
  id: string;
  service_name: string;
  service_type: string;
  display_name: string;
  description: string;
  icon_url?: string;
  configuration_schema: any;
  auth_type: string;
  supported_events: string[];
  is_active: boolean;
}

export interface UserIntegration {
  id: string;
  user_id: string;
  service_id: string;
  connection_name: string;
  configuration: any;
  webhook_url?: string;
  connection_status: 'pending' | 'connected' | 'error' | 'disconnected';
  last_test_at?: string;
  last_error?: string;
  is_active: boolean;
  created_at: string;
  integration_services?: IntegrationService;
}

export interface WebhookEndpoint {
  id: string;
  user_id: string;
  endpoint_name: string;
  endpoint_url: string;
  webhook_secret: string;
  is_active: boolean;
  total_triggers: number;
  last_triggered_at?: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_name: string;
  api_key: string;
  key_prefix: string;
  permissions: string[];
  is_active: boolean;
  last_used_at?: string;
  usage_count: number;
  expires_at?: string;
  created_at: string;
}

export function useIntegrations() {
  const { user } = useAuth();
  const [services, setServices] = useState<IntegrationService[]>([]);
  const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available integration services
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_services')
        .select('*')
        .eq('is_active', true)
        .order('display_name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching integration services:', error);
      toast.error('Failed to load integration services');
    }
  };

  // Fetch user integrations
  const fetchIntegrations = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_integrations')
        .select(`
          *,
          integration_services (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching user integrations:', error);
      toast.error('Failed to load integrations');
    }
  };

  // Fetch webhook endpoints
  const fetchWebhooks = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast.error('Failed to load webhooks');
    }
  };

  // Fetch API keys
  const fetchApiKeys = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    }
  };

  // Create new integration
  const createIntegration = async (serviceId: string, connectionName: string, configuration: any) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('user_integrations')
        .insert({
          user_id: user.id,
          service_id: serviceId,
          connection_name: connectionName,
          configuration,
          connection_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchIntegrations();
      toast.success('Integration created successfully');
      return data;
    } catch (error) {
      console.error('Error creating integration:', error);
      toast.error('Failed to create integration');
      throw error;
    }
  };

  // Update integration
  const updateIntegration = async (integrationId: string, updates: Partial<UserIntegration>) => {
    try {
      const { error } = await supabase
        .from('user_integrations')
        .update(updates)
        .eq('id', integrationId);

      if (error) throw error;
      
      await fetchIntegrations();
      toast.success('Integration updated successfully');
    } catch (error) {
      console.error('Error updating integration:', error);
      toast.error('Failed to update integration');
      throw error;
    }
  };

  // Test integration connection
  const testIntegration = async (integrationId: string) => {
    try {
      const { data, error } = await supabase.rpc('test_integration_connection', {
        integration_uuid: integrationId
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Connection test successful');
        await fetchIntegrations();
      } else {
        toast.error(`Connection test failed: ${data.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error testing integration:', error);
      toast.error('Failed to test integration');
      throw error;
    }
  };

  // Delete integration
  const deleteIntegration = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('user_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;
      
      await fetchIntegrations();
      toast.success('Integration deleted successfully');
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Failed to delete integration');
      throw error;
    }
  };

  // Create webhook endpoint
  const createWebhook = async (endpointName: string, eventFilters?: any, transformationRules?: any) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const webhookSecret = crypto.randomUUID();
      const endpointUrl = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('webhook_endpoints')
        .insert({
          user_id: user.id,
          endpoint_name: endpointName,
          endpoint_url: endpointUrl,
          webhook_secret: webhookSecret,
          event_filters: eventFilters || {},
          transformation_rules: transformationRules || {}
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchWebhooks();
      toast.success('Webhook endpoint created successfully');
      return data;
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error('Failed to create webhook endpoint');
      throw error;
    }
  };

  // Create API key
  const createApiKey = async (keyName: string, permissions: string[], expiresAt?: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('generate_api_key', {
        key_name: keyName,
        user_uuid: user.id
      });

      if (error) throw error;

      const apiKey = data;
      const keyPrefix = apiKey.split('_')[0] + '_' + apiKey.split('_')[1];

      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          key_name: keyName,
          api_key: apiKey,
          key_prefix: keyPrefix,
          permissions,
          expires_at: expiresAt
        });

      if (insertError) throw insertError;
      
      await fetchApiKeys();
      toast.success('API key created successfully');
      return { api_key: apiKey };
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
      throw error;
    }
  };

  // Delete API key
  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;
      
      await fetchApiKeys();
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
      throw error;
    }
  };

  // Send test notification to integration
  const sendTestNotification = async (integrationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('integration-dispatcher', {
        body: {
          integration_id: integrationId,
          event_type: 'test_notification',
          data: {
            message: 'This is a test notification from your integration',
            title: 'Test Notification',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Test notification sent successfully');
      } else {
        toast.error(`Failed to send test notification: ${data.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchServices(),
          fetchIntegrations(),
          fetchWebhooks(),
          fetchApiKeys()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  return {
    services,
    integrations,
    webhooks,
    apiKeys,
    loading,
    createIntegration,
    updateIntegration,
    testIntegration,
    deleteIntegration,
    createWebhook,
    createApiKey,
    deleteApiKey,
    sendTestNotification,
    refreshData: () => Promise.all([
      fetchServices(),
      fetchIntegrations(),
      fetchWebhooks(),
      fetchApiKeys()
    ])
  };
}