import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const processNotificationChannels = async (notification: any) => {
  console.log('Processing notification channels for:', notification.id);
  
  for (const channel of notification.channels || []) {
    if (channel === 'email' && !notification.sent_via_email) {
      try {
        console.log('Sending email notification...');
        await supabase.functions.invoke('send-email-notification', {
          body: { notification }
        });
        
        await supabase
          .from('notifications')
          .update({ 
            sent_via_email: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('id', notification.id);
          
        console.log('Email notification sent successfully');
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    }
    
    // SMS and Push would be handled similarly
    if (channel === 'sms' && !notification.sent_via_sms) {
      console.log('SMS channel not implemented yet');
    }
    
    if (channel === 'push' && !notification.sent_via_push) {
      console.log('Push channel not implemented yet');
    }
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    console.log('Processing notification action:', action);

    if (action === 'process_pending') {
      console.log('Processing pending notifications...');
      
      // Get pending notifications
      const { data: pendingNotifications } = await supabase
        .from('notifications')
        .select('*')
        .or('sent_via_email.eq.false,sent_via_sms.eq.false,sent_via_push.eq.false')
        .limit(10);

      console.log('Found pending notifications:', pendingNotifications?.length);

      // Process each notification
      for (const notification of pendingNotifications || []) {
        await processNotificationChannels(notification);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: pendingNotifications?.length || 0 
        }), 
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Handle test notification creation
    if (action === 'create_test') {
      const { user_id, notification_type, title, message, priority, channels } = body;
      
      console.log('Creating test notification for user:', user_id);

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id,
          notification_type,
          title,
          message,
          priority,
          channels
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating test notification:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      console.log('Created test notification:', notification.id);

      // Process the notification immediately
      await processNotificationChannels(notification);

      return new Response(
        JSON.stringify({ success: true, notification_id: notification.id }), 
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Handle specific notification ID processing
    if (body.notification_id) {
      const { data: notification } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', body.notification_id)
        .single();

      if (notification) {
        await processNotificationChannels(notification);
      }

      return new Response(
        JSON.stringify({ success: true }), 
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }), 
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in process-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});