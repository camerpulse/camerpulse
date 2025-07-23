import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id: string;
  tender_id: string;
  notification_type: 'watchlist_alert' | 'deadline_reminder' | 'status_update' | 'new_tender';
  email?: string;
  phone?: string;
  tender_title: string;
  tender_deadline?: string;
  tender_status?: string;
  channels: ('email' | 'sms' | 'push')[];
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      user_id, 
      tender_id, 
      notification_type, 
      email, 
      phone, 
      tender_title, 
      tender_deadline, 
      tender_status,
      channels 
    }: NotificationRequest = await req.json();

    console.log('Processing notification:', { user_id, tender_id, notification_type, channels });

    const results = [];

    // Send Email Notification
    if (channels.includes('email') && email) {
      try {
        const emailContent = generateEmailContent(notification_type, {
          tender_title,
          tender_deadline,
          tender_status,
          tender_id
        });

        const emailResult = await resend.emails.send({
          from: 'CamerTenders <notifications@camertenders.org>',
          to: [email],
          subject: emailContent.subject,
          html: emailContent.html,
        });

        results.push({ channel: 'email', success: true, result: emailResult });
      } catch (error) {
        console.error('Email sending failed:', error);
        results.push({ channel: 'email', success: false, error: error.message });
      }
    }

    // Send SMS Notification (placeholder - integrate with SMS provider)
    if (channels.includes('sms') && phone) {
      try {
        const smsContent = generateSMSContent(notification_type, {
          tender_title,
          tender_deadline,
          tender_status
        });

        // TODO: Integrate with SMS provider (Twilio, etc.)
        console.log('SMS would be sent:', { phone, message: smsContent });
        results.push({ channel: 'sms', success: true, message: 'SMS queued (placeholder)' });
      } catch (error) {
        results.push({ channel: 'sms', success: false, error: error.message });
      }
    }

    // Send Push Notification
    if (channels.includes('push')) {
      try {
        const pushContent = generatePushContent(notification_type, {
          tender_title,
          tender_deadline,
          tender_status
        });

        // Store in-app notification
        const { error: pushError } = await supabase
          .from('user_notifications')
          .insert({
            user_id,
            title: pushContent.title,
            message: pushContent.body,
            notification_type,
            data: { tender_id, tender_title },
            read: false
          });

        if (pushError) throw pushError;

        results.push({ channel: 'push', success: true, message: 'Push notification stored' });
      } catch (error) {
        results.push({ channel: 'push', success: false, error: error.message });
      }
    }

    // Log notification attempt
    await supabase
      .from('notification_logs')
      .insert({
        user_id,
        tender_id,
        notification_type,
        channels,
        status: results.every(r => r.success) ? 'success' : 'partial',
        results: results,
        created_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: 'Notifications processed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function generateEmailContent(type: string, data: any) {
  const { tender_title, tender_deadline, tender_status, tender_id } = data;
  
  switch (type) {
    case 'watchlist_alert':
      return {
        subject: `📋 New Tender Alert: ${tender_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Tender Added to Your Watchlist</h2>
            <p>A new tender matching your watchlist criteria has been published:</p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0;">${tender_title}</h3>
              ${tender_deadline ? `<p><strong>Deadline:</strong> ${tender_deadline}</p>` : ''}
            </div>
            <a href="https://camertenders.org/tender/${tender_id}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Tender Details
            </a>
          </div>
        `
      };
    
    case 'deadline_reminder':
      return {
        subject: `⏰ Tender Deadline Reminder: ${tender_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Tender Deadline Approaching</h2>
            <p>This is a reminder that the deadline for the following tender is approaching:</p>
            <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin: 0 0 8px 0;">${tender_title}</h3>
              <p><strong>Deadline:</strong> ${tender_deadline}</p>
            </div>
            <a href="https://camertenders.org/tender/${tender_id}" 
               style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Tender
            </a>
          </div>
        `
      };
    
    case 'status_update':
      return {
        subject: `📊 Tender Status Update: ${tender_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Tender Status Updated</h2>
            <p>The status of a tender on your watchlist has been updated:</p>
            <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0;">${tender_title}</h3>
              <p><strong>New Status:</strong> ${tender_status}</p>
            </div>
            <a href="https://camertenders.org/tender/${tender_id}" 
               style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Updates
            </a>
          </div>
        `
      };
    
    default:
      return {
        subject: `📋 CamerTenders Notification`,
        html: `<p>You have a new notification about: ${tender_title}</p>`
      };
  }
}

function generateSMSContent(type: string, data: any) {
  const { tender_title, tender_deadline } = data;
  
  switch (type) {
    case 'watchlist_alert':
      return `CamerTenders: New tender "${tender_title}" matches your watchlist. View details at camertenders.org`;
    
    case 'deadline_reminder':
      return `CamerTenders: Deadline reminder for "${tender_title}" - Due: ${tender_deadline}`;
    
    case 'status_update':
      return `CamerTenders: Status updated for "${tender_title}". Check latest details.`;
    
    default:
      return `CamerTenders: You have a new notification about "${tender_title}"`;
  }
}

function generatePushContent(type: string, data: any) {
  const { tender_title, tender_status } = data;
  
  switch (type) {
    case 'watchlist_alert':
      return {
        title: '📋 New Tender Alert',
        body: `${tender_title} - Check it out now!`
      };
    
    case 'deadline_reminder':
      return {
        title: '⏰ Deadline Reminder',
        body: `${tender_title} deadline approaching`
      };
    
    case 'status_update':
      return {
        title: '📊 Status Update',
        body: `${tender_title} status: ${tender_status}`
      };
    
    default:
      return {
        title: '📋 CamerTenders',
        body: `Update for ${tender_title}`
      };
  }
}