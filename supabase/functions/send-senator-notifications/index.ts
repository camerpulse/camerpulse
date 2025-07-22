import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailNotificationRequest {
  type: 'senator_claim' | 'senator_report' | 'senator_message' | 'general';
  recipientEmail: string;
  recipientName?: string;
  data: {
    senatorName?: string;
    senatorId?: string;
    claimType?: string;
    reportType?: string;
    messageSubject?: string;
    messageContent?: string;
    actionUrl?: string;
    [key: string]: any;
  };
}

const generateEmailTemplate = (type: string, data: any, recipientName?: string): { subject: string; html: string } => {
  const baseStyles = `
    <style>
      .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
      .content { padding: 30px; background: white; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; }
      .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
      .alert { padding: 15px; border-radius: 5px; margin: 15px 0; }
      .alert-info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
      .alert-warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
    </style>
  `;

  switch (type) {
    case 'senator_claim':
      return {
        subject: `Senator Profile Claim ${data.status ? `- ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}` : 'Submitted'}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>Senator Profile Claim Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${recipientName || 'User'},</h2>
              <p>We have an update regarding your claim for Senator <strong>${data.senatorName}</strong>.</p>
              
              <div class="alert alert-info">
                <strong>Claim Type:</strong> ${data.claimType || 'Profile Ownership'}<br>
                <strong>Status:</strong> ${data.status || 'Under Review'}<br>
                ${data.adminNotes ? `<strong>Notes:</strong> ${data.adminNotes}` : ''}
              </div>

              ${data.status === 'approved' ? `
                <p>🎉 <strong>Congratulations!</strong> Your claim has been approved. You now have administrative access to this senator profile.</p>
              ` : data.status === 'rejected' ? `
                <p>Unfortunately, your claim was not approved. If you believe this was an error, please contact our support team.</p>
              ` : `
                <p>Your claim is currently under review. We'll notify you once a decision has been made.</p>
              `}

              ${data.actionUrl ? `
                <p style="text-align: center;">
                  <a href="${data.actionUrl}" class="button">View Profile</a>
                </p>
              ` : ''}
            </div>
            <div class="footer">
              <p>Senator Registry System | <a href="#">Contact Support</a></p>
            </div>
          </div>
        `
      };

    case 'senator_report':
      return {
        subject: `New Report Filed for Senator ${data.senatorName}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>Senator Report Notification</h1>
            </div>
            <div class="content">
              <h2>Hello ${recipientName || 'User'},</h2>
              <p>A new report has been filed for Senator <strong>${data.senatorName}</strong>.</p>
              
              <div class="alert alert-warning">
                <strong>Report Type:</strong> ${data.reportType || 'General'}<br>
                <strong>Category:</strong> ${data.reportCategory || 'General'}<br>
                <strong>Severity:</strong> ${data.severity || 'Medium'}<br>
                <strong>Status:</strong> ${data.status || 'Pending Review'}
              </div>

              <p><strong>Description:</strong></p>
              <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
                ${data.description || 'No description provided'}
              </p>

              ${data.actionUrl ? `
                <p style="text-align: center;">
                  <a href="${data.actionUrl}" class="button">Review Report</a>
                </p>
              ` : ''}
            </div>
            <div class="footer">
              <p>Senator Registry System | <a href="#">Contact Support</a></p>
            </div>
          </div>
        `
      };

    case 'senator_message':
      return {
        subject: `New Message: ${data.messageSubject || 'Senator Inquiry'}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>New Senator Message</h1>
            </div>
            <div class="content">
              <h2>Hello ${recipientName || 'Senator'},</h2>
              <p>You have received a new message regarding your senatorial duties.</p>
              
              <div class="alert alert-info">
                <strong>Subject:</strong> ${data.messageSubject || 'General Inquiry'}<br>
                <strong>Type:</strong> ${data.messageType || 'Inquiry'}<br>
                <strong>Priority:</strong> ${data.priority || 'Normal'}
              </div>

              <p><strong>Message:</strong></p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745; margin: 15px 0;">
                ${data.messageContent || 'No message content'}
              </div>

              ${data.actionUrl ? `
                <p style="text-align: center;">
                  <a href="${data.actionUrl}" class="button">View & Respond</a>
                </p>
              ` : ''}
            </div>
            <div class="footer">
              <p>Senator Registry System | <a href="#">Contact Support</a></p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: `Notification from Senator Registry`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>Senator Registry Notification</h1>
            </div>
            <div class="content">
              <h2>Hello ${recipientName || 'User'},</h2>
              <p>You have a new notification from the Senator Registry system.</p>
              
              ${data.title ? `<h3>${data.title}</h3>` : ''}
              ${data.message ? `<p>${data.message}</p>` : ''}

              ${data.actionUrl ? `
                <p style="text-align: center;">
                  <a href="${data.actionUrl}" class="button">View Details</a>
                </p>
              ` : ''}
            </div>
            <div class="footer">
              <p>Senator Registry System | <a href="#">Contact Support</a></p>
            </div>
          </div>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailNotificationRequest = await req.json();
    console.log('Email notification request:', requestData);

    if (!requestData.recipientEmail || !requestData.type) {
      throw new Error('Missing required fields: recipientEmail and type');
    }

    // Generate email template
    const { subject, html } = generateEmailTemplate(
      requestData.type, 
      requestData.data, 
      requestData.recipientName
    );

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Senator Registry <onboarding@resend.dev>", // Use your verified domain
      to: [requestData.recipientEmail],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the notification in database (optional)
    if (requestData.data.senatorId) {
      try {
        await supabase
          .from('senator_notifications')
          .insert({
            senator_id: requestData.data.senatorId,
            recipient_email: requestData.recipientEmail,
            notification_type: requestData.type,
            subject: subject,
            sent_at: new Date().toISOString(),
            email_id: emailResponse.data?.id,
            metadata: requestData.data
          });
      } catch (dbError) {
        console.warn('Failed to log notification to database:', dbError);
        // Don't fail the request if logging fails
      }
    }

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id,
      message: 'Email sent successfully'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-senator-notifications function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);