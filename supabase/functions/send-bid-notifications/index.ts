import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'bid_update' | 'deadline_reminder' | 'award_notification' | 'tender_update';
  userId: string;
  tenderId?: string;
  bidId?: string;
  title: string;
  message: string;
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userId, tenderId, bidId, title, message, data }: NotificationRequest = await req.json();

    console.log('Processing notification:', { type, userId, title });

    // Get user's notification preferences
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (prefError && prefError.code !== 'PGRST116') {
      console.error('Error fetching preferences:', prefError);
      throw prefError;
    }

    // Default preferences if none exist
    const userPrefs = preferences || {
      email_notifications: true,
      push_notifications: true,
      bid_updates: true,
      deadline_reminders: true,
      award_notifications: true,
      tender_updates: true
    };

    // Check if this notification type is enabled
    const typeEnabled = (() => {
      switch (type) {
        case 'bid_update':
          return userPrefs.bid_updates;
        case 'deadline_reminder':
          return userPrefs.deadline_reminders;
        case 'award_notification':
          return userPrefs.award_notifications;
        case 'tender_update':
          return userPrefs.tender_updates;
        default:
          return true;
      }
    })();

    if (!typeEnabled) {
      console.log('Notification type disabled for user:', type);
      return new Response(JSON.stringify({ message: 'Notification type disabled' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get user email
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user.user?.email) {
      console.error('Error fetching user:', userError);
      throw new Error('User not found or no email');
    }

    const userEmail = user.user.email;
    let emailSent = false;
    let pushSent = false;

    // Send email notification if enabled
    if (userPrefs.email_notifications) {
      try {
        const emailContent = generateEmailContent(type, title, message, data);
        
        const emailResponse = await resend.emails.send({
          from: "TenderHub <notifications@resend.dev>",
          to: [userEmail],
          subject: title,
          html: emailContent,
        });

        console.log("Email sent successfully:", emailResponse);
        emailSent = true;
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw - continue with other notifications
      }
    }

    // Create notification record in database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        notification_type: type,
        title,
        message,
        data: data || {},
        sent_via_email: emailSent,
        sent_via_push: pushSent,
        tender_id: tenderId,
        bid_id: bidId
      });

    if (notificationError) {
      console.error('Error creating notification record:', notificationError);
      throw notificationError;
    }

    // Send real-time notification via Supabase realtime
    if (userPrefs.push_notifications) {
      try {
        await supabase.realtime.send({
          type: 'broadcast',
          event: 'notification',
          payload: {
            type,
            title,
            message,
            data,
            userId,
            timestamp: new Date().toISOString()
          }
        });
        pushSent = true;
        console.log('Real-time notification sent');
      } catch (realtimeError) {
        console.error('Error sending real-time notification:', realtimeError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailSent, 
      pushSent,
      message: 'Notification processed successfully' 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateEmailContent(type: string, title: string, message: string, data?: any): string {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; background: #f9fafb; }
      .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
      .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      .alert { padding: 15px; margin: 10px 0; border-left: 4px solid #f59e0b; background: #fef3c7; }
    </style>
  `;

  const getIcon = (type: string) => {
    switch (type) {
      case 'bid_update':
        return '📝';
      case 'deadline_reminder':
        return '⏰';
      case 'award_notification':
        return '🏆';
      case 'tender_update':
        return '📢';
      default:
        return '📧';
    }
  };

  const actionButton = data?.actionUrl ? `
    <a href="${data.actionUrl}" class="button">View Details</a>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      ${baseStyle}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${getIcon(type)} ${title}</h1>
        </div>
        <div class="content">
          <p>${message}</p>
          ${type === 'deadline_reminder' ? `
            <div class="alert">
              <strong>⚠️ Deadline Alert:</strong> This deadline is approaching soon. Make sure to complete your submission on time.
            </div>
          ` : ''}
          ${actionButton}
          ${data?.additionalInfo ? `<p><small>${data.additionalInfo}</small></p>` : ''}
        </div>
        <div class="footer">
          <p>You received this email because you have notifications enabled in your TenderHub account.</p>
          <p>To manage your notification preferences, please visit your account settings.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);