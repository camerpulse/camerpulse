import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  user_id: string;
  phone_number: string;
  template_name: string;
  variables: Record<string, any>;
  event_type?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, phone_number, template_name, variables, event_type }: WhatsAppRequest = await req.json();

    console.log('WhatsApp notification request:', { user_id, phone_number, template_name, event_type });

    // Get SendChamp API configuration
    const { data: apiConfig, error: configError } = await supabase
      .from('api_configurations')
      .select('api_key, additional_config, is_active')
      .eq('service_name', 'sendchamp_whatsapp')
      .single();

    if (configError || !apiConfig) {
      console.error('SendChamp API not configured:', configError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WhatsApp service not configured. Please contact admin.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiConfig.is_active || !apiConfig.api_key) {
      console.log('SendChamp API inactive or missing key');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WhatsApp service temporarily unavailable' 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get WhatsApp template
    const { data: template, error: templateError } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('template_name', template_name)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Template not found or inactive:', templateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Message template not available' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user WhatsApp preferences
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_whatsapp_preferences')
      .select('whatsapp_enabled, verified_at')
      .eq('user_id', user_id)
      .single();

    if (prefsError || !userPrefs?.whatsapp_enabled || !userPrefs?.verified_at) {
      console.log('User has not opted in to WhatsApp notifications');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User has not enabled WhatsApp notifications' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Replace template variables
    let messageContent = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      messageContent = messageContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    // Log message attempt
    const { data: logEntry, error: logError } = await supabase
      .from('whatsapp_message_logs')
      .insert({
        user_id,
        phone_number,
        template_name,
        message_content: messageContent,
        status: 'pending',
        metadata: { variables, event_type }
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to log message:', logError);
    }

    // Send via SendChamp API
    try {
      const sendChampResponse = await fetch('https://api.sendchamp.com/api/v1/whatsapp/message/text', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiConfig.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone_number,
          message: messageContent,
          sender: apiConfig.additional_config.sender_id || 'CamerPlay'
        }),
      });

      const sendChampData = await sendChampResponse.json();

      if (sendChampResponse.ok && sendChampData.status === 'success') {
        // Update log with success
        if (logEntry) {
          await supabase
            .from('whatsapp_message_logs')
            .update({
              status: 'sent',
              sendchamp_message_id: sendChampData.data?.message_id,
              delivery_status: 'pending'
            })
            .eq('id', logEntry.id);
        }

        console.log('WhatsApp message sent successfully:', sendChampData.data?.message_id);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message_id: sendChampData.data?.message_id,
            status: 'sent'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(sendChampData.message || 'Failed to send WhatsApp message');
      }
    } catch (sendError: any) {
      console.error('SendChamp API error:', sendError);
      
      // Update log with failure
      if (logEntry) {
        await supabase
          .from('whatsapp_message_logs')
          .update({
            status: 'failed',
            error_message: sendError.message
          })
          .eq('id', logEntry.id);
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send WhatsApp message',
          details: sendError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('WhatsApp notification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);