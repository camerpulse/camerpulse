import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@4.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailNotificationRequest {
  user_id: string;
  template_id?: string;
  subject: string;
  content: string;
  variables?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'Email service not configured' 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { 
      user_id, 
      template_id, 
      subject, 
      content, 
      variables = {},
      priority = 'medium' 
    }: EmailNotificationRequest = await req.json();

    // Get user email from auth.users
    const { data: userAuth, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !userAuth.user?.email) {
      throw new Error('User email not found');
    }

    const userEmail = userAuth.user.email;

    // Check user email preferences
    const { data: preferences } = await supabase
      .from('user_notification_preferences')
      .select('email_enabled, email_frequency')
      .eq('user_id', user_id)
      .single();

    if (preferences && !preferences.email_enabled) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'User has disabled email notifications' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Process template variables
    let processedSubject = subject;
    let processedContent = content;

    // If template is provided, load it
    if (template_id) {
      const { data: template, error: templateError } = await supabase
        .from('notification_templates')
        .select('subject, content')
        .eq('id', template_id)
        .eq('is_active', true)
        .single();

      if (template && !templateError) {
        processedSubject = template.subject;
        processedContent = template.content;
      }
    }

    // Replace variables in subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedSubject = processedSubject.replace(placeholder, String(value));
      processedContent = processedContent.replace(placeholder, String(value));
    });

    // Send email via Resend
    const resend = new Resend(resendApiKey);
    
    const emailResponse = await resend.emails.send({
      from: 'CamerPulse <notifications@camerpulse.com>',
      to: [userEmail],
      subject: processedSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">CamerPulse</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
            ${processedContent.replace(/\n/g, '<br>')}
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>You received this email because you're subscribed to CamerPulse notifications.</p>
            <p>To unsubscribe or manage your preferences, <a href="${supabaseUrl}/notifications/preferences">click here</a>.</p>
          </div>
        </div>
      `,
      headers: {
        'X-Priority': priority === 'urgent' ? '1' : priority === 'high' ? '2' : '3'
      }
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error(emailResponse.error.message);
    }

    console.log('Email sent successfully:', emailResponse.data?.id);

    return new Response(JSON.stringify({ 
      success: true,
      email_id: emailResponse.data?.id,
      sent_to: userEmail
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in email notification service:', error);
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