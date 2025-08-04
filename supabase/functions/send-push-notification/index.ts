import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  icon?: string;
  badge?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, title, message, data = {}, icon, badge }: PushNotificationRequest = await req.json();

    console.log(`Sending push notification to user ${user_id}: ${title}`);

    // Get user's push notification tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_notification_tokens')
      .select('token, platform')
      .eq('user_id', user_id)
      .eq('is_active', true);

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No active push tokens found for user');
      return new Response(
        JSON.stringify({ success: false, message: 'No active push tokens' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, we'll store the push notification intent
    // In production, you would integrate with Firebase FCM or similar service
    const pushResults = [];

    for (const token of tokens) {
      try {
        // Store push notification record
        const { data: pushRecord, error: pushError } = await supabase
          .from('push_notification_log')
          .insert({
            user_id,
            token: token.token,
            platform: token.platform,
            title,
            message,
            data,
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .select()
          .single();

        if (pushError) {
          console.error('Error logging push notification:', pushError);
          pushResults.push({ token: token.token, success: false, error: pushError.message });
        } else {
          console.log(`Push notification logged for token: ${token.token.substring(0, 10)}...`);
          pushResults.push({ token: token.token.substring(0, 10) + '...', success: true, id: pushRecord.id });
        }

        // TODO: Integrate with actual push service (FCM, APNS, etc.)
        // This is where you would send to Firebase Cloud Messaging:
        /*
        const fcmPayload = {
          notification: {
            title,
            body: message,
            icon: icon || '/icons/icon-192x192.png',
            badge: badge || '/icons/badge-72x72.png'
          },
          data,
          token: token.token
        };
        
        // Send via FCM SDK
        const response = await admin.messaging().send(fcmPayload);
        */

      } catch (tokenError) {
        console.error(`Error processing token ${token.token}:`, tokenError);
        pushResults.push({ token: token.token, success: false, error: tokenError.message });
      }
    }

    const successCount = pushResults.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        total_tokens: tokens.length,
        successful_sends: successCount,
        results: pushResults
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send push notification' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});