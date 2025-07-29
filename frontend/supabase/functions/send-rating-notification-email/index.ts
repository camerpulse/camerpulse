import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  companyId: string;
  companyName: string;
  rating: number;
  reviewText?: string;
  raterName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, companyName, rating, reviewText, raterName }: NotificationRequest = await req.json();

    console.log('Processing rating notification for company:', companyName);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get company details and staff emails
    const { data: companyData, error: companyError } = await supabase
      .from('shipping_companies')
      .select(`
        company_name,
        contact_email,
        id,
        shipping_company_staff (
          user_id,
          role,
          profiles (
            display_name
          )
        )
      `)
      .eq('id', companyId)
      .single();

    if (companyError || !companyData) {
      console.error('Error fetching company data:', companyError);
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get staff user emails from auth.users (using service role)
    const staffUserIds = companyData.shipping_company_staff?.map(staff => staff.user_id) || [];
    let staffEmails: string[] = [];

    if (staffUserIds.length > 0) {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authUsers.users) {
        staffEmails = authUsers.users
          .filter(user => staffUserIds.includes(user.id))
          .map(user => user.email)
          .filter(email => email) as string[];
      }
    }

    // Prepare recipient emails
    const recipients = [companyData.contact_email, ...staffEmails].filter(Boolean);

    if (recipients.length === 0) {
      console.log('No email recipients found for company:', companyName);
      return new Response(
        JSON.stringify({ message: 'No email recipients found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate star rating display
    const starRating = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    
    // Create email content
    const emailSubject = `New Rating Received - ${companyName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Customer Rating</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">CamerPulse Logistics Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Rating Details</h2>
            
            <div style="display: flex; align-items: center; margin: 15px 0;">
              <strong style="color: #555; margin-right: 15px;">Company:</strong>
              <span style="color: #333; font-size: 16px;">${companyName}</span>
            </div>
            
            <div style="display: flex; align-items: center; margin: 15px 0;">
              <strong style="color: #555; margin-right: 15px;">Rating:</strong>
              <span style="font-size: 24px; color: #ffd700; margin-right: 10px;">${starRating}</span>
              <span style="color: #333; font-weight: bold;">${rating}/5</span>
            </div>
            
            ${raterName ? `
            <div style="display: flex; align-items: center; margin: 15px 0;">
              <strong style="color: #555; margin-right: 15px;">Customer:</strong>
              <span style="color: #333;">${raterName}</span>
            </div>
            ` : ''}
            
            ${reviewText ? `
            <div style="margin: 20px 0;">
              <strong style="color: #555; display: block; margin-bottom: 10px;">Review Comment:</strong>
              <div style="background: #f1f3f4; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea;">
                <em style="color: #555; line-height: 1.5;">"${reviewText}"</em>
              </div>
            </div>
            ` : ''}
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
            <h3 style="color: #1976d2; margin-top: 0;">What's Next?</h3>
            <ul style="color: #555; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Review this feedback to improve your services</li>
              <li>Consider reaching out to the customer if needed</li>
              <li>Use insights to enhance customer satisfaction</li>
              <li>Monitor your rating trends on the platform</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://camerpulse.com/logistics" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Your Company Profile
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>This is an automated notification from CamerPulse Logistics Platform</p>
          <p style="margin: 5px 0;">Building transparent and trusted logistics in Cameroon</p>
        </div>
      </div>
    `;

    // Send email to all recipients
    const emailPromises = recipients.map(async (email) => {
      try {
        const emailResponse = await resend.emails.send({
          from: "CamerPulse Logistics <onboarding@resend.dev>",
          to: [email],
          subject: emailSubject,
          html: emailHtml,
        });

        console.log(`Email sent successfully to ${email}:`, emailResponse);
        return { email, success: true, response: emailResponse };
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        return { email, success: false, error: error.message };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successCount = emailResults.filter(result => result.success).length;

    console.log(`Sent ${successCount}/${recipients.length} notification emails for rating`);

    return new Response(JSON.stringify({
      message: `Rating notification sent to ${successCount}/${recipients.length} recipients`,
      results: emailResults
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-rating-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);