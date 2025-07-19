import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArtistWelcomeEmailRequest {
  full_name: string;
  stage_name: string;
  email: string;
  artist_profile_link?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Artist welcome email function called");
    
    const { full_name, stage_name, email, artist_profile_link }: ArtistWelcomeEmailRequest = await req.json();
    
    console.log("Sending welcome email to:", email, "for artist:", stage_name);

    // Validate required fields
    if (!full_name || !stage_name || !email) {
      throw new Error("Missing required fields: full_name, stage_name, and email are required");
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin: 0; font-size: 28px;">🎤 Welcome to CamerPlay</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Artist Submission Received!</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi <strong>${full_name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for submitting your artist profile to CamerPlay!
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We've received your submission for <strong>${stage_name}</strong>, and our team is now reviewing it. You'll be notified once your profile is approved or if we need more details.
          </p>
          
          <div style="background-color: #f8f4ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #6b46c1; margin: 0 0 15px 0; font-size: 18px;">🎶 What's next?</h3>
            <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Your music, events, and awards will all be unified under your verified profile</li>
              <li>Fans will be able to stream, follow, and support you directly</li>
            </ul>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            You can check your submission status anytime on your CamerPulse account dashboard.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b46c1; font-size: 18px; font-weight: bold; margin: 0;">
              Stay true to your sound. CamerPlay is proud to amplify your voice.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
              – CamerPlay Team
            </p>
            ${artist_profile_link ? `<p style="color: #888; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
              Profile Link: <a href="${artist_profile_link}" style="color: #6b46c1;">${artist_profile_link}</a>
            </p>` : ''}
          </div>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "CamerPlay <onboarding@resend.dev>", // You'll need to change this to your verified domain
      to: [email],
      subject: "🎤 Welcome to CamerPlay — Artist Submission Received!",
      html: emailHtml,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Welcome email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-artist-welcome-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send welcome email"
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