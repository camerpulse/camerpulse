import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArtistApprovalEmailRequest {
  stage_name: string;
  email: string;
  artist_profile_link: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Artist approval email function called");
    
    const { stage_name, email, artist_profile_link }: ArtistApprovalEmailRequest = await req.json();
    
    console.log("Sending approval email to:", email, "for artist:", stage_name);

    // Validate required fields
    if (!stage_name || !email || !artist_profile_link) {
      throw new Error("Missing required fields: stage_name, email, and artist_profile_link are required");
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a; margin: 0; font-size: 28px;">✅ You're Verified on CamerPlay</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your Artist Profile Is Live!</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi <strong>${stage_name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Your artist profile has been approved and is now live on CamerPlay!
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${artist_profile_link}" 
               style="display: inline-block; background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              🔗 View Your Profile
            </a>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #16a34a; margin: 0 0 15px 0; font-size: 18px;">What you can do now:</h3>
            <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Upload new music</li>
              <li>Link your upcoming events</li>
              <li>Track streams, ticket sales, and awards</li>
              <li>Connect your village and fans to your journey</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #16a34a; font-size: 18px; font-weight: bold; margin: 0;">
              Let the nation hear your sound. Welcome to the official stage.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
              – CamerPlay Team
            </p>
            <p style="color: #888; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
              Profile: <a href="${artist_profile_link}" style="color: #16a34a;">${artist_profile_link}</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "CamerPlay <onboarding@resend.dev>", // You'll need to change this to your verified domain
      to: [email],
      subject: "✅ You're Verified on CamerPlay — Your Artist Profile Is Live!",
      html: emailHtml,
    });

    console.log("Approval email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Approval email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-artist-approval-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send approval email"
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