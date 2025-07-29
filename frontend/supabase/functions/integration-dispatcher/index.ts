import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface IntegrationRequest {
  integration_id: string;
  event_type: string;
  data: Record<string, any>;
  priority?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: IntegrationRequest = await req.json();
    const { integration_id, event_type, data, priority = 'medium' } = body;

    console.log('Processing integration dispatch:', { integration_id, event_type, priority });

    // Get integration configuration
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select(`
        *,
        integration_services (*)
      `)
      .eq('id', integration_id)
      .eq('is_active', true)
      .eq('connection_status', 'connected')
      .single();

    if (integrationError || !integration) {
      console.error('Integration not found or inactive:', integrationError);
      return new Response(JSON.stringify({ error: 'Integration not found or inactive' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const service = integration.integration_services;
    const config = integration.configuration;
    
    let result: any = { success: false, message: 'Service not implemented' };
    let statusCode = 500;

    // Dispatch to appropriate service
    switch (service.service_type) {
      case 'slack':
        result = await sendToSlack(config, data, integration.credentials);
        break;
      case 'discord':
        result = await sendToDiscord(config, data);
        break;
      case 'teams':
        result = await sendToTeams(config, data, integration.credentials);
        break;
      case 'webhook':
        result = await sendToWebhook(config, data);
        break;
      case 'email':
        result = await sendEmail(config, data, integration.credentials);
        break;
      case 'sms':
        result = await sendSMS(config, data, integration.credentials);
        break;
      default:
        result = { success: false, message: `Service type ${service.service_type} not implemented` };
    }

    statusCode = result.success ? 200 : 400;

    // Log the integration attempt
    const logEntry = {
      integration_id: integration.id,
      event_type,
      request_method: req.method,
      request_url: req.url,
      request_payload: data,
      response_status: statusCode,
      response_body: result,
      processing_time_ms: Date.now(),
      error_message: result.success ? null : result.message
    };

    logEntry.processing_time_ms = Date.now() - logEntry.processing_time_ms;

    // Update integration statistics
    await Promise.all([
      supabase.from('integration_logs_v2').insert(logEntry),
      supabase.from('integration_analytics').insert({
        integration_id: integration.id,
        metric_type: result.success ? 'successful_dispatch' : 'failed_dispatch',
        metric_value: 1,
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString(),
        metadata: { event_type, service_type: service.service_type }
      })
    ]);

    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Integration dispatcher error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

// Integration service handlers
async function sendToSlack(config: any, data: any, credentials: any) {
  try {
    const webhookUrl = config.webhook_url || credentials.webhook_url;
    if (!webhookUrl) {
      return { success: false, message: 'Slack webhook URL not configured' };
    }

    const payload = {
      text: data.message || data.content || 'Notification from your app',
      channel: config.channel,
      username: config.username || 'Notification Bot',
      attachments: data.attachments || []
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { success: true, message: 'Message sent to Slack successfully' };
    } else {
      const errorText = await response.text();
      return { success: false, message: `Slack API error: ${errorText}` };
    }
  } catch (error) {
    return { success: false, message: `Slack integration error: ${error.message}` };
  }
}

async function sendToDiscord(config: any, data: any) {
  try {
    const webhookUrl = config.webhook_url;
    if (!webhookUrl) {
      return { success: false, message: 'Discord webhook URL not configured' };
    }

    const payload = {
      content: data.message || data.content || 'Notification from your app',
      username: config.username || 'Notification Bot',
      avatar_url: config.avatar_url,
      embeds: data.embeds || []
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { success: true, message: 'Message sent to Discord successfully' };
    } else {
      const errorText = await response.text();
      return { success: false, message: `Discord API error: ${errorText}` };
    }
  } catch (error) {
    return { success: false, message: `Discord integration error: ${error.message}` };
  }
}

async function sendToTeams(config: any, data: any, credentials: any) {
  try {
    const webhookUrl = config.webhook_url || credentials.webhook_url;
    if (!webhookUrl) {
      return { success: false, message: 'Teams webhook URL not configured' };
    }

    const payload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": data.title || "Notification",
      "sections": [{
        "activityTitle": data.title || "Notification",
        "activitySubtitle": data.message || data.content || 'Notification from your app',
        "facts": data.facts || [],
        "markdown": true
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { success: true, message: 'Message sent to Teams successfully' };
    } else {
      const errorText = await response.text();
      return { success: false, message: `Teams API error: ${errorText}` };
    }
  } catch (error) {
    return { success: false, message: `Teams integration error: ${error.message}` };
  }
}

async function sendToWebhook(config: any, data: any) {
  try {
    const url = config.url;
    if (!url) {
      return { success: false, message: 'Webhook URL not configured' };
    }

    const method = config.method || 'POST';
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(data)
    });

    if (response.ok) {
      return { success: true, message: 'Webhook called successfully' };
    } else {
      const errorText = await response.text();
      return { success: false, message: `Webhook error: ${errorText}` };
    }
  } catch (error) {
    return { success: false, message: `Webhook integration error: ${error.message}` };
  }
}

async function sendEmail(config: any, data: any, credentials: any) {
  // Placeholder - would integrate with email service like Resend
  return { success: false, message: 'Email integration not implemented yet' };
}

async function sendSMS(config: any, data: any, credentials: any) {
  // Placeholder - would integrate with SMS service like Twilio
  return { success: false, message: 'SMS integration not implemented yet' };
}

serve(handler);