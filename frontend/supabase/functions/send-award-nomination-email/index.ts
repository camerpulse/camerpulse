import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AwardNominationRequest {
  artist_name: string;
  email: string;
  award_category: string;
  award_dashboard_link?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Award nomination email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      artist_name,
      email,
      award_category,
      award_dashboard_link
    }: AwardNominationRequest = await req.json();

    console.log(`Sending award nomination email to: ${email} for category: ${award_category}`);

    const emailResponse = await resend.emails.send({
      from: "CamerPlay Awards <awards@resend.dev>",
      to: [email],
      subject: `🏆 Congratulations, ${artist_name}! You've Been Nominated`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Hi ${artist_name},</h1>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We're excited to let you know that you've been nominated for:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #d4af37; margin: 0; font-size: 24px;">
              🏆 ${award_category}
            </h2>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
            Based on your streams, sales, and performance impact.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
            Voting opens soon, and your fans will be notified!
          </p>
          
          ${award_dashboard_link ? `
            <div style="text-align: center; margin: 30px 0;">
              <p style="margin-bottom: 15px;">Track your nomination status here:</p>
              <a href="${award_dashboard_link}" 
                 style="display: inline-block; background-color: #d4af37; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                🔗 View Award Dashboard
              </a>
            </div>
          ` : ''}
          
          <p style="font-size: 16px; line-height: 1.6; margin: 20px 0; font-weight: bold;">
            Keep rising. Cameroon is watching.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">– CamerPlay Awards Team</p>
          </div>
        </div>
      `,
    });

    console.log("Award nomination email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in award nomination email function:", error);
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