import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to execute HTTP request with auth
async function executeHttpRequest(integration: any, authSecrets: any[] = []) {
  const startTime = Date.now();
  let authHeader: Record<string, string> = {};
  
  try {
    // Handle authentication
    if (integration.auth_type === 'bearer') {
      const bearerSecret = authSecrets.find(s => s.secret_key === 'bearer_token');
      if (bearerSecret) {
        authHeader['Authorization'] = `Bearer ${bearerSecret.secret_value}`;
      }
    } else if (integration.auth_type === 'api_key') {
      const apiKeySecret = authSecrets.find(s => s.secret_key === 'api_key');
      const headerName = integration.auth_config?.header_name || 'X-API-Key';
      if (apiKeySecret) {
        authHeader[headerName] = apiKeySecret.secret_value;
      }
    } else if (integration.auth_type === 'basic') {
      const usernameSecret = authSecrets.find(s => s.secret_key === 'username');
      const passwordSecret = authSecrets.find(s => s.secret_key === 'password');
      if (usernameSecret && passwordSecret) {
        const credentials = btoa(`${usernameSecret.secret_value}:${passwordSecret.secret_value}`);
        authHeader['Authorization'] = `Basic ${credentials}`;
      }
    }

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...integration.request_headers,
      ...authHeader
    };

    // Execute request
    const response = await fetch(integration.endpoint_url, {
      method: integration.request_method,
      headers,
      body: integration.request_method !== 'GET' ? JSON.stringify(integration.request_body) : undefined,
    });

    const responseData = await response.text();
    let parsedData;
    
    try {
      parsedData = JSON.parse(responseData);
    } catch {
      parsedData = { raw_response: responseData };
    }

    const executionTime = Date.now() - startTime;

    // Log execution
    await supabase.from('integration_execution_logs').insert({
      integration_id: integration.id,
      execution_status: response.ok ? 'success' : 'error',
      request_data: {
        method: integration.request_method,
        headers: headers,
        body: integration.request_body,
        endpoint: integration.endpoint_url
      },
      response_data: parsedData,
      response_status_code: response.status,
      execution_time_ms: executionTime,
      error_message: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`
    });

    // Update integration stats
    await supabase.from('custom_integrations')
      .update({
        last_executed_at: new Date().toISOString(),
        execution_count: integration.execution_count + 1,
        success_count: response.ok ? integration.success_count + 1 : integration.success_count,
        error_count: response.ok ? integration.error_count : integration.error_count + 1
      })
      .eq('id', integration.id);

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('integration_usage_stats')
      .upsert({
        integration_id: integration.id,
        stat_date: today,
        total_requests: 1,
        successful_requests: response.ok ? 1 : 0,
        failed_requests: response.ok ? 0 : 1,
        average_response_time_ms: executionTime,
        total_data_transferred_bytes: responseData.length
      }, {
        onConflict: 'integration_id,stat_date',
        ignoreDuplicates: false
      });

    return {
      success: response.ok,
      status: response.status,
      data: parsedData,
      execution_time: executionTime,
      message: response.ok ? 'Integration executed successfully' : `HTTP ${response.status}: ${response.statusText}`
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('Integration execution error:', error);

    // Log error
    await supabase.from('integration_execution_logs').insert({
      integration_id: integration.id,
      execution_status: 'error',
      request_data: {
        method: integration.request_method,
        endpoint: integration.endpoint_url
      },
      response_data: {},
      execution_time_ms: executionTime,
      error_message: error.message
    });

    // Update error count
    await supabase.from('custom_integrations')
      .update({
        error_count: integration.error_count + 1
      })
      .eq('id', integration.id);

    return {
      success: false,
      status: 500,
      data: null,
      execution_time: executionTime,
      message: `Execution failed: ${error.message}`
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'list': {
        const { data: integrations, error } = await supabase
          .from('custom_integrations')
          .select(`
            *,
            integration_usage_stats (
              stat_date,
              total_requests,
              successful_requests,
              failed_requests,
              average_response_time_ms
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(integrations), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'create': {
        const body = await req.json();
        const { auth_secrets, ...integrationData } = body;

        // Create integration
        const { data: integration, error: integrationError } = await supabase
          .from('custom_integrations')
          .insert({
            ...integrationData,
            created_by: body.created_by || 'system'
          })
          .select()
          .single();

        if (integrationError) throw integrationError;

        // Create auth secrets if provided
        if (auth_secrets && auth_secrets.length > 0) {
          const secretsToInsert = auth_secrets.map((secret: any) => ({
            integration_id: integration.id,
            secret_key: secret.key,
            secret_value: secret.value // In production, this should be encrypted
          }));

          const { error: secretsError } = await supabase
            .from('integration_auth_secrets')
            .insert(secretsToInsert);

          if (secretsError) throw secretsError;
        }

        return new Response(JSON.stringify(integration), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'execute': {
        const body = await req.json();
        const { integration_id } = body;

        // Get integration details
        const { data: integration, error: integrationError } = await supabase
          .from('custom_integrations')
          .select('*')
          .eq('id', integration_id)
          .eq('is_active', true)
          .single();

        if (integrationError) throw integrationError;
        if (!integration) {
          return new Response(JSON.stringify({ error: 'Integration not found or inactive' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get auth secrets
        const { data: authSecrets } = await supabase
          .from('integration_auth_secrets')
          .select('secret_key, secret_value')
          .eq('integration_id', integration_id);

        // Execute the integration
        const result = await executeHttpRequest(integration, authSecrets || []);

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'test': {
        const body = await req.json();
        const { endpoint_url, request_method = 'GET', request_headers = {}, auth_config = {} } = body;

        try {
          const response = await fetch(endpoint_url, {
            method: request_method,
            headers: {
              'Content-Type': 'application/json',
              ...request_headers
            }
          });

          const responseData = await response.text();
          let parsedData;
          
          try {
            parsedData = JSON.parse(responseData);
          } catch {
            parsedData = { raw_response: responseData };
          }

          return new Response(JSON.stringify({
            success: response.ok,
            status: response.status,
            data: parsedData,
            message: response.ok ? 'Test successful' : `HTTP ${response.status}: ${response.statusText}`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });

        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            status: 500,
            data: null,
            message: `Test failed: ${error.message}`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      case 'logs': {
        const integration_id = url.searchParams.get('integration_id');
        const limit = parseInt(url.searchParams.get('limit') || '50');

        let query = supabase
          .from('integration_execution_logs')
          .select('*')
          .order('executed_at', { ascending: false })
          .limit(limit);

        if (integration_id) {
          query = query.eq('integration_id', integration_id);
        }

        const { data: logs, error } = await query;
        if (error) throw error;

        return new Response(JSON.stringify(logs), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'stats': {
        const integration_id = url.searchParams.get('integration_id');
        
        if (!integration_id) {
          return new Response(JSON.stringify({ error: 'integration_id required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data: stats, error } = await supabase
          .from('integration_usage_stats')
          .select('*')
          .eq('integration_id', integration_id)
          .order('stat_date', { ascending: false })
          .limit(30);

        if (error) throw error;

        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'update': {
        const body = await req.json();
        const { integration_id, ...updateData } = body;

        const { data: integration, error } = await supabase
          .from('custom_integrations')
          .update(updateData)
          .eq('id', integration_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(integration), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'delete': {
        const body = await req.json();
        const { integration_id } = body;

        const { error } = await supabase
          .from('custom_integrations')
          .delete()
          .eq('id', integration_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Custom Integrator Builder error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});