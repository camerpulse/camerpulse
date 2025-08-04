import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FanNotificationEmailRequest {
  fan_name: string;
  fan_email: string;
  artist_name: string;
  artist_profile_link: string;
  new_song_title?: string;
  event_name?: string;
  award_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fan notification email function called");
    
    const { 
      fan_name, 
      fan_email, 
      artist_name, 
      artist_profile_link,
      new_song_title,
      event_name,
      award_name 
    }: FanNotificationEmailRequest = await req.json();
    
    console.log("Sending fan notification to:", fan_email, "about artist:", artist_name);

    // Validate required fields
    if (!fan_name || !fan_email || !artist_name || !artist_profile_link) {
      throw new Error("Missing required fields: fan_name, fan_email, artist_name, and artist_profile_link are required");
    }

    // Build dynamic content sections
    let updateContent = '';
    let updateTitle = 'updated their profile';

    if (new_song_title) {
      updateContent += `
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #0ea5e9;">
          <p style="margin: 0; color: #0369a1; font-weight: bold;">
            🎵 New Song: <span style="color: #1e40af;">${new_song_title}</span>
          </p>
        </div>
      `;
      updateTitle = 'dropped a new song';
    }

    if (event_name) {
      updateContent += `
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">
            🎫 Upcoming Event: <span style="color: #d97706;">${event_name}</span>
          </p>
        </div>
      `;
      if (!new_song_title) updateTitle = 'announced a new event';
    }

    if (award_name) {
      updateContent += `
        <div style="background-color: #fef7cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #eab308;">
          <p style="margin: 0; color: #a16207; font-weight: bold;">
            🏆 Nominated for: <span style="color: #ca8a04;">${award_name}</span>
          </p>
        </div>
      `;
      if (!new_song_title && !event_name) updateTitle = 'received an award nomination';
    }

    // If no specific updates, default to generic profile update
    if (!updateContent) {
      updateContent = `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #6b7280;">
          <p style="margin: 0; color: #374151; font-weight: bold;">
            ✨ Profile Updated
          </p>
        </div>
      `;
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">🔔 ${artist_name} Just Dropped Something New</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">on CamerPlay</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hey <strong>${fan_name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Your favorite artist <strong>${artist_name}</strong> just ${updateTitle} on CamerPlay!
          </p>
          
          ${updateContent}
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 25px 0;">
            Follow their journey and stay in the loop:
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${artist_profile_link}" 
               style="display: inline-block; background-color: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              🔗 View Artist Profile
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
              – CamerPlay Notifications
            </p>
            <p style="color: #888; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
              You're receiving this because you follow ${artist_name} on CamerPlay
            </p>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "CamerPlay Notifications <onboarding@resend.dev>", // You'll need to change this to your verified domain
      to: [fan_email],
      subject: `🔔 ${artist_name} Just Dropped Something New on CamerPlay`,
      html: emailHtml,
    });

    console.log("Fan notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Fan notification email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-fan-notification-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send fan notification email"
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