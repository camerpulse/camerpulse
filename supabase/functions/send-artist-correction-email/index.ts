import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArtistCorrectionEmailRequest {
  full_name: string;
  stage_name: string;
  email: string;
  edit_link: string;
  rejection_reasons: string | string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Artist correction email function called");
    
    const { full_name, stage_name, email, edit_link, rejection_reasons }: ArtistCorrectionEmailRequest = await req.json();
    
    console.log("Sending correction email to:", email, "for artist:", stage_name);

    // Validate required fields
    if (!full_name || !stage_name || !email || !edit_link || !rejection_reasons) {
      throw new Error("Missing required fields: full_name, stage_name, email, edit_link, and rejection_reasons are required");
    }

    // Format rejection reasons
    let reasonsHtml = '';
    if (Array.isArray(rejection_reasons)) {
      reasonsHtml = rejection_reasons.map(reason => `<li style="margin-bottom: 8px;">${reason}</li>`).join('');
      reasonsHtml = `<ul style="margin: 0; padding-left: 20px; color: #dc2626;">${reasonsHtml}</ul>`;
    } else {
      reasonsHtml = `<p style="color: #dc2626; margin: 15px 0; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">${rejection_reasons}</p>`;
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0; font-size: 28px;">⚠️ Action Needed</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Artist Profile Submission Incomplete</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi <strong>${full_name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We reviewed your submission for <strong>${stage_name}</strong>, but we need a few corrections before it can be approved:
          </p>
          
          <div style="margin: 25px 0;">
            <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">Reason(s):</h3>
            ${reasonsHtml}
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 25px 0;">
            Please log in to CamerPulse and edit your submission here:
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${edit_link}" 
               style="display: inline-block; background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              🔗 Edit Your Submission
            </a>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 25px 0;">
            Once updated, we'll continue the verification process.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #dc2626; font-size: 18px; font-weight: bold; margin: 0;">
              Keep pushing. Your voice matters.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
              – CamerPlay Verification Team
            </p>
            <p style="color: #888; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
              Edit Link: <a href="${edit_link}" style="color: #dc2626;">${edit_link}</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "CamerPlay Verification <onboarding@resend.dev>", // You'll need to change this to your verified domain
      to: [email],
      subject: "⚠️ Action Needed: Artist Profile Submission Incomplete",
      html: emailHtml,
    });

    console.log("Correction email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Correction email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-artist-correction-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send correction email"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);