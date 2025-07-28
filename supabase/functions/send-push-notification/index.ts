import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webPushPrivateKey = Deno.env.get('WEB_PUSH_PRIVATE_KEY') || '';
const webPushPublicKey = Deno.env.get('WEB_PUSH_PUBLIC_KEY') || 'BNXxJjlhKwPO-i6BzY9QqGsKznFZSZoUvmF6YlHG4uU7VjCJqF_JqgN-o1Ej_Uj-8fCo_1-zX5Ek6yV-7gN-JhQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PushNotificationPayload {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  priority?: 'low' | 'medium' | 'high';
  tag?: string;
  silent?: boolean;
}

// Helper function to send web push notification
async function sendWebPushNotification(subscription: any, payload: any) {
  try {
    const webpush = await import('https://esm.sh/web-push@3.6.6');
    
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      webPushPublicKey,
      webPushPrivateKey
    );

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key
      }
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log('Push notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

// Helper function to create notification record
async function createNotificationRecord(userId: string, payload: PushNotificationPayload) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: payload.data?.type || 'push_notification',
        title: payload.title,
        message: payload.body,
        data: payload.data || {},
        read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating notification record:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: PushNotificationPayload = await req.json();
    console.log('Push notification payload:', payload);

    // Validate required fields
    if (!payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Determine target user IDs
    let targetUserIds: string[] = [];
    if (payload.user_id) {
      targetUserIds = [payload.user_id];
    } else if (payload.user_ids) {
      targetUserIds = payload.user_ids;
    } else {
      return new Response(
        JSON.stringify({ error: 'Either user_id or user_ids must be provided' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Target user IDs:', targetUserIds);

    // Prepare push notification payload
    const pushPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-72x72.png',
      data: {
        url: '/notifications',
        timestamp: Date.now(),
        ...payload.data
      },
      actions: payload.actions || [
        {
          action: 'view',
          title: 'View',
          icon: '/icon-72x72.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      tag: payload.tag || 'notification',
      requireInteraction: payload.priority === 'high',
      silent: payload.silent || payload.priority === 'low',
      vibrate: payload.priority === 'high' ? [200, 100, 200] : [100, 50, 100]
    };

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    // Process each user
    for (const userId of targetUserIds) {
      try {
        // Create notification record in database first
        const notificationRecord = await createNotificationRecord(userId, payload);
        
        // Get user's push subscriptions
        const { data: subscriptions, error: subError } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (subError) {
          console.error('Error fetching subscriptions for user:', userId, subError);
          failureCount++;
          results.push({
            user_id: userId,
            success: false,
            error: 'Failed to fetch subscriptions'
          });
          continue;
        }

        if (!subscriptions || subscriptions.length === 0) {
          console.log('No active subscriptions found for user:', userId);
          results.push({
            user_id: userId,
            success: false,
            error: 'No active push subscriptions'
          });
          continue;
        }

        // Send push notification to all user's subscriptions
        let userSuccessCount = 0;
        for (const subscription of subscriptions) {
          const sent = await sendWebPushNotification(subscription, pushPayload);
          if (sent) {
            userSuccessCount++;
          } else {
            // Mark subscription as inactive if it failed
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', subscription.id);
          }
        }

        if (userSuccessCount > 0) {
          successCount++;
          results.push({
            user_id: userId,
            success: true,
            subscriptions_sent: userSuccessCount,
            notification_id: notificationRecord?.id
          });
        } else {
          failureCount++;
          results.push({
            user_id: userId,
            success: false,
            error: 'All subscriptions failed'
          });
        }

      } catch (error) {
        console.error('Error processing user:', userId, error);
        failureCount++;
        results.push({
          user_id: userId,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`Push notification summary: ${successCount} succeeded, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: targetUserIds.length,
          succeeded: successCount,
          failed: failureCount
        },
        results
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});