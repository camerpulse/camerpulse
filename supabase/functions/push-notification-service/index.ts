import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  action_url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!fcmServerKey) {
      console.error('FCM_SERVER_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'Push notification service not configured' 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { user_id, title, body, data, action_url }: PushNotificationRequest = await req.json();

    // Get user's push notification tokens
    const { data: pushTokens, error: tokenError } = await supabase
      .from('user_push_tokens')
      .select('token, platform')
      .eq('user_id', user_id)
      .eq('is_active', true);

    if (tokenError) {
      console.error('Error fetching push tokens:', tokenError);
      throw tokenError;
    }

    if (!pushTokens || pushTokens.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No active push tokens found for user' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const results = [];

    // Send to each device
    for (const tokenData of pushTokens) {
      try {
        const notification = {
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'camerpulse-notification',
          requireInteraction: false,
          silent: false,
          data: {
            ...data,
            action_url,
            timestamp: Date.now()
          }
        };

        // Prepare FCM payload
        const fcmPayload = {
          to: tokenData.token,
          notification,
          data: {
            click_action: action_url || '/',
            ...data
          },
          priority: 'high',
          time_to_live: 86400 // 24 hours
        };

        // Send via FCM
        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${fcmServerKey}`
          },
          body: JSON.stringify(fcmPayload)
        });

        const fcmResult = await fcmResponse.json();
        
        if (fcmResult.success === 1) {
          results.push({ token: tokenData.token, success: true });
        } else {
          console.error('FCM send failed:', fcmResult);
          results.push({ 
            token: tokenData.token, 
            success: false, 
            error: fcmResult.results?.[0]?.error || 'Unknown FCM error' 
          });

          // Handle invalid tokens
          if (fcmResult.results?.[0]?.error === 'InvalidRegistration' || 
              fcmResult.results?.[0]?.error === 'NotRegistered') {
            await supabase
              .from('user_push_tokens')
              .update({ is_active: false })
              .eq('token', tokenData.token);
          }
        }
      } catch (error) {
        console.error('Error sending push notification:', error);
        results.push({ 
          token: tokenData.token, 
          success: false, 
          error: error.message 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalTokens = results.length;

    return new Response(JSON.stringify({ 
      success: successCount > 0,
      sent_to: successCount,
      total_tokens: totalTokens,
      results 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in push notification service:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);