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
    const url = new URL(req.url);
    const webhookPath = url.pathname.split('/').pop();
    
    if (!webhookPath) {
      return new Response(JSON.stringify({ error: 'Invalid webhook path' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing webhook: ${webhookPath}`);

    // Get webhook endpoint configuration
    const { data: webhook, error: webhookError } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('endpoint_url', webhookPath)
      .eq('is_active', true)
      .single();

    if (webhookError || !webhook) {
      console.error('Webhook not found:', webhookError);
      return new Response(JSON.stringify({ error: 'Webhook endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate webhook secret if provided
    const providedSecret = req.headers.get('x-webhook-secret');
    if (webhook.webhook_secret && providedSecret !== webhook.webhook_secret) {
      console.error('Invalid webhook secret');
      return new Response(JSON.stringify({ error: 'Invalid webhook secret' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check rate limits
    const rateLimitConfig = webhook.rate_limit_config || { requests_per_minute: 100 };
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    const { count: recentRequests } = await supabase
      .from('integration_logs_v2')
      .select('*', { count: 'exact', head: true })
      .eq('webhook_endpoint_id', webhook.id)
      .gte('created_at', oneMinuteAgo);

    if (recentRequests && recentRequests >= rateLimitConfig.requests_per_minute) {
      console.error('Rate limit exceeded');
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(body);
    } catch {
      payload = { raw: body };
    }

    // Apply event filters
    const eventFilters = webhook.event_filters || {};
    if (eventFilters.event_type && payload.event_type !== eventFilters.event_type) {
      console.log('Event filtered out:', payload.event_type);
      return new Response(JSON.stringify({ message: 'Event filtered' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Apply transformation rules
    const transformationRules = webhook.transformation_rules || {};
    let transformedPayload = payload;
    
    if (transformationRules.field_mappings) {
      transformedPayload = {};
      for (const [targetField, sourceField] of Object.entries(transformationRules.field_mappings)) {
        transformedPayload[targetField] = payload[sourceField as string];
      }
    }

    // Log the webhook request
    const logEntry = {
      webhook_endpoint_id: webhook.id,
      event_type: payload.event_type || 'webhook_trigger',
      request_method: req.method,
      request_url: req.url,
      request_headers: Object.fromEntries(req.headers.entries()),
      request_payload: payload,
      response_status: 200,
      processing_time_ms: Date.now(),
      user_agent: req.headers.get('user-agent'),
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    };

    // Process the webhook (trigger notification engine)
    try {
      const { data: notificationResult, error: notificationError } = await supabase.functions.invoke(
        'centralized-notification-engine',
        {
          body: {
            event_type: 'webhook_triggered',
            recipient_id: webhook.user_id,
            recipient_type: 'user',
            data: {
              webhook_name: webhook.endpoint_name,
              payload: transformedPayload,
              source: 'external_webhook'
            }
          }
        }
      );

      if (notificationError) {
        console.error('Failed to trigger notification:', notificationError);
        logEntry.error_message = notificationError.message;
        logEntry.response_status = 500;
      } else {
        console.log('Notification triggered successfully:', notificationResult);
      }
    } catch (error) {
      console.error('Error triggering notification:', error);
      logEntry.error_message = error.message;
      logEntry.response_status = 500;
    }

    // Update processing time
    logEntry.processing_time_ms = Date.now() - logEntry.processing_time_ms;

    // Insert log entry
    await supabase.from('integration_logs_v2').insert(logEntry);

    // Update webhook stats
    await supabase
      .from('webhook_endpoints')
      .update({
        last_triggered_at: new Date().toISOString(),
        total_triggers: webhook.total_triggers + 1
      })
      .eq('id', webhook.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook processed successfully',
      processed_at: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);