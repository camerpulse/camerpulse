import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  user_id: string;
  event_type: 'notification_viewed' | 'notification_clicked' | 'notification_dismissed' | 'preference_updated';
  notification_id?: string;
  notification_type?: string;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  user_agent?: string;
  engagement_time_ms?: number;
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const event: AnalyticsEvent = await req.json();

    // Store analytics event
    const { error } = await supabase
      .from('notification_analytics')
      .insert([{
        user_id: event.user_id,
        event_type: event.event_type,
        notification_id: event.notification_id,
        notification_type: event.notification_type,
        device_type: event.device_type,
        user_agent: event.user_agent,
        engagement_time_ms: event.engagement_time_ms,
        metadata: event.metadata || {},
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Analytics storage error:', error);
      throw error;
    }

    // Update notification engagement metrics if applicable
    if (event.notification_id && event.event_type === 'notification_clicked') {
      await supabase
        .from('unified_notifications')
        .update({
          interaction_count: supabase.raw('interaction_count + 1'),
          last_interaction_at: new Date().toISOString()
        })
        .eq('id', event.notification_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in notification analytics:', error);
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