import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Calculate notification statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get delivery statistics
    const { data: deliveryStats } = await supabase
      .from('notification_delivery_log')
      .select('status, delivered_at, sent_at')
      .gte('sent_at', thirtyDaysAgo.toISOString());

    const totalSent = deliveryStats?.length || 0;
    const totalDelivered = deliveryStats?.filter(d => d.status === 'delivered').length || 0;
    const totalFailed = deliveryStats?.filter(d => d.status === 'failed').length || 0;
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

    // Calculate average delivery time
    const deliveredNotifications = deliveryStats?.filter(d => 
      d.status === 'delivered' && d.sent_at && d.delivered_at
    ) || [];
    
    const avgDeliveryTime = deliveredNotifications.length > 0 
      ? deliveredNotifications.reduce((sum, notification) => {
          const sentTime = new Date(notification.sent_at).getTime();
          const deliveredTime = new Date(notification.delivered_at).getTime();
          return sum + (deliveredTime - sentTime);
        }, 0) / deliveredNotifications.length
      : 0;

    // Get top notification types
    const { data: typeStats } = await supabase
      .from('unified_notifications')
      .select('type')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const typeCounts = typeStats?.reduce((acc: Record<string, number>, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {}) || {};

    const topNotificationTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stats = {
      total_sent: totalSent,
      total_delivered: totalDelivered,
      total_failed: totalFailed,
      delivery_rate: deliveryRate,
      avg_delivery_time_ms: avgDeliveryTime,
      top_notification_types: topNotificationTypes
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in notification admin stats:', error);
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