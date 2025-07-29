import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  event_type: string;
  recipient_id: string;
  recipient_type: string;
  data: Record<string, any>;
  delay_minutes?: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Centralized notification engine called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_type, recipient_id, recipient_type, data, delay_minutes = 0 }: NotificationRequest = await req.json();

    console.log(`Processing notification: ${event_type} for ${recipient_type} ${recipient_id}`);

    // Get matching notification flows for this event
    const { data: flows, error: flowsError } = await supabase
      .from('notification_flows')
      .select(`
        *,
        notification_templates (*)
      `)
      .eq('event_type', event_type)
      .eq('recipient_type', recipient_type)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (flowsError) {
      console.error('Error fetching flows:', flowsError);
      throw flowsError;
    }

    if (!flows || flows.length === 0) {
      console.log(`No active flows found for event: ${event_type}, recipient_type: ${recipient_type}`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No flows configured for this event',
        flows_processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check user preferences
    const { data: preferences } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', recipient_id)
      .eq('event_type', event_type);

    const userPrefs = preferences || [];
    let processedFlows = 0;

    // Process each flow
    for (const flow of flows) {
      try {
        // Check if user has disabled this channel for this event type
        const pref = userPrefs.find(p => 
          p.event_type === event_type && 
          p.channel === flow.channel
        );

        if (pref && !pref.is_enabled) {
          console.log(`User ${recipient_id} has disabled ${flow.channel} for ${event_type}`);
          continue;
        }

        // Create notification log entry
        const { data: logEntry, error: logError } = await supabase
          .from('notification_logs')
          .insert({
            flow_id: flow.id,
            recipient_id,
            event_type,
            channel: flow.channel,
            status: delay_minutes > 0 ? 'pending' : 'sent',
            template_data: data
          })
          .select()
          .single();

        if (logError) {
          console.error('Error creating log entry:', logError);
          continue;
        }

        // If there's a delay, schedule for later (in real implementation, use a queue)
        if (delay_minutes > 0) {
          console.log(`Notification scheduled for ${delay_minutes} minutes delay`);
          // In production, you'd use a job queue like pg_cron or external service
          continue;
        }

        // Route to appropriate delivery channel
        let deliveryResult;
        switch (flow.channel) {
          case 'email':
            deliveryResult = await sendEmail(flow, recipient_id, data);
            break;
          case 'in_app':
            deliveryResult = await createInAppNotification(flow, recipient_id, data);
            break;
          case 'push':
            deliveryResult = await sendPushNotification(flow, recipient_id, data);
            break;
          case 'sms':
            deliveryResult = await sendSMS(flow, recipient_id, data);
            break;
          case 'whatsapp':
            deliveryResult = await sendWhatsApp(flow, recipient_id, data);
            break;
          default:
            console.log(`Unknown channel: ${flow.channel}`);
            continue;
        }

        // Update log with delivery status
        await supabase
          .from('notification_logs')
          .update({
            status: deliveryResult.success ? 'delivered' : 'failed',
            sent_at: new Date().toISOString(),
            delivered_at: deliveryResult.success ? new Date().toISOString() : null,
            error_message: deliveryResult.error || null,
            external_id: deliveryResult.external_id || null
          })
          .eq('id', logEntry.id);

        // Track metrics
        if (deliveryResult.success) {
          await supabase
            .from('notification_metrics')
            .insert({
              log_id: logEntry.id,
              event_type: 'notification_sent',
              metadata: { channel: flow.channel, template_id: flow.template_id }
            });
        }

        processedFlows++;
      } catch (error) {
        console.error(`Error processing flow ${flow.id}:`, error);
      }
    }

    console.log(`Processed ${processedFlows} notification flows`);

    return new Response(JSON.stringify({ 
      success: true, 
      flows_processed: processedFlows,
      message: `${processedFlows} notifications sent` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in notification engine:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

// Email delivery function
async function sendEmail(flow: any, recipientId: string, data: Record<string, any>) {
  try {
    // Get recipient email
    const { data: user } = await supabase.auth.admin.getUserById(recipientId);
    if (!user.user?.email) {
      throw new Error('No email found for user');
    }

    const template = flow.notification_templates;
    if (!template) {
      throw new Error('No template found for flow');
    }

    // Replace template variables
    let subject = template.subject || '';
    let content = template.content || '';
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{ ${key} }}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Call appropriate email function based on event type
    const emailFunctions = {
      'artist_profile_submitted': 'send-artist-welcome-email',
      'artist_verified': 'send-artist-approval-email', 
      'artist_denied': 'send-artist-correction-email',
      'new_song_uploaded': 'send-song-published-email',
      'ticket_purchased': 'send-ticket-confirmation-email',
      'artist_award_nomination': 'send-award-nomination-email'
    };

    const functionName = emailFunctions[flow.event_type as keyof typeof emailFunctions];
    if (functionName) {
      const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          email: user.user.email,
          ...data
        })
      });

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error(`Email function failed: ${response.statusText}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Email delivery error:', error);
    return { success: false, error: error.message };
  }
}

// In-app notification function
async function createInAppNotification(flow: any, recipientId: string, data: Record<string, any>) {
  try {
    const template = flow.notification_templates;
    let content = template?.content || 'New notification';
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{ ${key} }}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Create in-app notification record
    const { error } = await supabase
      .from('user_notifications')
      .insert({
        user_id: recipientId,
        title: template?.subject || 'CamerPlay Notification',
        message: content,
        type: flow.event_type,
        is_read: false
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('In-app notification error:', error);
    return { success: false, error: error.message };
  }
}

// Push notification function
async function sendPushNotification(flow: any, recipientId: string, data: Record<string, any>) {
  try {
    // Placeholder for push notification service integration
    // Would integrate with FCM, APNS, or web push service
    console.log(`Push notification would be sent to ${recipientId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// SMS function
async function sendSMS(flow: any, recipientId: string, data: Record<string, any>) {
  try {
    // Placeholder for SMS service integration (Twilio, etc.)
    console.log(`SMS would be sent to ${recipientId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// WhatsApp function
async function sendWhatsApp(flow: any, recipientId: string, data: Record<string, any>) {
  try {
    // Placeholder for WhatsApp Business API integration
    console.log(`WhatsApp message would be sent to ${recipientId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

serve(handler);