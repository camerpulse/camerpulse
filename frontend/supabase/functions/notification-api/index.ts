import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate API request
    const apiKey = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate API key
    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !apiKeyData) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check API key expiration
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'API key expired' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check rate limits
    const rateLimitConfig = apiKeyData.rate_limit_config || { requests_per_minute: 1000 };
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    const { count: recentRequests } = await supabase
      .from('integration_logs_v2')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', apiKeyData.id)
      .gte('created_at', oneMinuteAgo);

    if (recentRequests && recentRequests >= rateLimitConfig.requests_per_minute) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/notification-api', '');
    const method = req.method;

    let response: any = { error: 'Endpoint not found' };
    let statusCode = 404;

    // Route handling
    if (path === '/send' && method === 'POST') {
      // Send notification endpoint
      const body = await req.json();
      const { recipient_id, recipient_type, event_type, data, priority, delay_minutes } = body;

      // Validate required fields
      if (!recipient_id || !recipient_type || !event_type) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: recipient_id, recipient_type, event_type' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check permissions
      if (!apiKeyData.permissions.includes('send') && !apiKeyData.permissions.includes('write')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Trigger notification
      const { data: notificationResult, error: notificationError } = await supabase.functions.invoke(
        'centralized-notification-engine',
        {
          body: {
            event_type,
            recipient_id,
            recipient_type,
            data: data || {},
            delay_minutes: delay_minutes || 0
          }
        }
      );

      if (notificationError) {
        response = { error: 'Failed to send notification', details: notificationError.message };
        statusCode = 500;
      } else {
        response = { 
          success: true, 
          message: 'Notification sent successfully',
          notification_id: notificationResult?.notification_id,
          sent_at: new Date().toISOString()
        };
        statusCode = 200;
      }

    } else if (path === '/templates' && method === 'GET') {
      // Get notification templates
      if (!apiKeyData.permissions.includes('read')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: templates, error: templatesError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true);

      if (templatesError) {
        response = { error: 'Failed to fetch templates', details: templatesError.message };
        statusCode = 500;
      } else {
        response = { templates };
        statusCode = 200;
      }

    } else if (path === '/status' && method === 'GET') {
      // Get notification status
      if (!apiKeyData.permissions.includes('read')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const notificationId = url.searchParams.get('id');
      if (!notificationId) {
        return new Response(JSON.stringify({ error: 'Notification ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: notification, error: notificationError } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (notificationError) {
        response = { error: 'Notification not found', details: notificationError.message };
        statusCode = 404;
      } else {
        response = { notification };
        statusCode = 200;
      }

    } else if (path === '/analytics' && method === 'GET') {
      // Get analytics data
      if (!apiKeyData.permissions.includes('read')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const days = parseInt(url.searchParams.get('days') || '7');
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data: analytics, error: analyticsError } = await supabase
        .from('notification_metrics')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (analyticsError) {
        response = { error: 'Failed to fetch analytics', details: analyticsError.message };
        statusCode = 500;
      } else {
        response = { analytics, period_days: days };
        statusCode = 200;
      }
    }

    // Log API request
    const logEntry = {
      api_key_id: apiKeyData.id,
      event_type: 'api_request',
      request_method: method,
      request_url: req.url,
      request_headers: Object.fromEntries(req.headers.entries()),
      response_status: statusCode,
      processing_time_ms: Date.now(),
      user_agent: req.headers.get('user-agent'),
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    };

    try {
      const requestBody = method !== 'GET' ? await req.clone().json() : {};
      logEntry.request_payload = requestBody;
    } catch {
      // Ignore parsing errors for body
    }

    logEntry.processing_time_ms = Date.now() - logEntry.processing_time_ms;
    logEntry.response_body = response;

    // Insert log entry and update API key usage
    await Promise.all([
      supabase.from('integration_logs_v2').insert(logEntry),
      supabase
        .from('api_keys')
        .update({
          last_used_at: new Date().toISOString(),
          usage_count: apiKeyData.usage_count + 1
        })
        .eq('id', apiKeyData.id)
    ]);

    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);