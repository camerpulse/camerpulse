import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      title, 
      content, 
      priority, 
      regions, 
      target_users, 
      sender_id 
    } = await req.json();

    console.log('Sending civic alert:', { title, priority, target_users, regions });

    // Create the civic alert record
    const { data: alert, error: alertError } = await supabase
      .from('civic_alerts')
      .insert({
        title,
        content,
        priority,
        regions: regions || [],
        sender_id,
        created_at: new Date().toISOString(),
        metadata: {
          target_users,
          alert_type: 'broadcast',
          source: 'admin_panel'
        }
      })
      .select()
      .single();

    if (alertError) {
      console.error('Error creating civic alert:', alertError);
      throw alertError;
    }

    // Get target users based on criteria
    let targetUserIds: string[] = [];

    if (target_users === 'all') {
      const { data: users } = await supabase
        .from('profiles')
        .select('user_id');
      
      targetUserIds = users?.map(user => user.user_id) || [];
    } else if (target_users === 'region' && regions && regions.length > 0) {
      const { data: users } = await supabase
        .from('profiles')
        .select('user_id')
        .in('region', regions);
      
      targetUserIds = users?.map(user => user.user_id) || [];
    }

    console.log(`Broadcasting to ${targetUserIds.length} users`);

    // Create notification records for each target user
    const notifications = targetUserIds.map(userId => ({
      user_id: userId,
      type: 'civic_alert',
      title,
      content,
      priority,
      metadata: {
        alert_id: alert.id,
        regions: regions || [],
        sender_id
      },
      is_read: false,
      created_at: new Date().toISOString()
    }));

    // Batch insert notifications
    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('civic_notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
        // Don't throw here, alert was created successfully
      }
    }

    // Send real-time updates via Supabase channels
    const { error: channelError } = await supabase
      .channel('civic-alerts-broadcast')
      .send({
        type: 'broadcast',
        event: 'civic_alert',
        payload: {
          id: alert.id,
          title,
          content,
          priority,
          regions: regions || [],
          created_at: alert.created_at
        }
      });

    if (channelError) {
      console.error('Error broadcasting alert:', channelError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        alert_id: alert.id,
        notifications_sent: targetUserIds.length,
        message: 'Civic alert sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-civic-alert function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to send civic alert'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});