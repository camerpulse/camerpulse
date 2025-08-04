import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  send_push?: boolean;
  send_email?: boolean;
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

    const { 
      user_id, 
      type, 
      title, 
      message, 
      data = {}, 
      priority = 'medium',
      action_url,
      send_push = false,
      send_email = false 
    }: NotificationRequest = await req.json();

    console.log(`Creating notification for user ${user_id}: ${title}`);

    // 1. Create in-app notification
    const { data: notification, error: notificationError } = await supabase
      .from('realtime_notifications')
      .insert({
        user_id,
        notification_type: type,
        title,
        message,
        data,
        priority,
        action_url,
        is_read: false
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    // 2. Check user notification preferences
    const { data: preferences } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .eq('event_type', type);

    const shouldSendPush = send_push && (preferences?.some(p => p.channel === 'push' && p.is_enabled) ?? true);
    const shouldSendEmail = send_email && (preferences?.some(p => p.channel === 'email' && p.is_enabled) ?? true);

    // 3. Send push notification if enabled
    if (shouldSendPush) {
      try {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id,
            title,
            message,
            data: { ...data, notification_id: notification.id }
          }
        });
        console.log('Push notification sent successfully');
      } catch (pushError) {
        console.error('Error sending push notification:', pushError);
      }
    }

    // 4. Send email notification if enabled
    if (shouldSendEmail) {
      try {
        await supabase.functions.invoke('send-email-notification', {
          body: {
            user_id,
            title,
            message,
            action_url
          }
        });
        console.log('Email notification sent successfully');
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }

    // 5. Update user's unread count
    await supabase.rpc('increment_unread_notifications', { p_user_id: user_id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification_id: notification.id,
        sent_push: shouldSendPush,
        sent_email: shouldSendEmail
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Notification engine error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process notification' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});