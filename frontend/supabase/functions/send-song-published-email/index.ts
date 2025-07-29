import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SongPublishedRequest {
  artist_name: string;
  email: string;
  song_title: string;
  song_page_link?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Song published email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      artist_name,
      email,
      song_title,
      song_page_link
    }: SongPublishedRequest = await req.json();

    console.log(`Sending song published email to: ${email} for song: ${song_title}`);

    const emailResponse = await resend.emails.send({
      from: "CamerPlay Music <music@resend.dev>",
      to: [email],
      subject: "🎧 Your Song Is Now Live on CamerPlay!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Hi ${artist_name},</h1>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your new track <strong>${song_title}</strong> is now published and streaming on CamerPlay!
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🎶 Start tracking:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Streams</li>
              <li style="margin: 8px 0;">Fan feedback</li>
              <li style="margin: 8px 0;">Playlist placements</li>
              <li style="margin: 8px 0;">Awards eligibility</li>
            </ul>
          </div>
          
          ${song_page_link ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${song_page_link}" 
                 style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                🔗 View your song now
              </a>
            </div>
          ` : ''}
          
          <p style="font-size: 16px; line-height: 1.6; margin: 20px 0; font-weight: bold;">
            You're building a legacy. Keep the fire burning.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">– CamerPlay Music Team</p>
          </div>
        </div>
      `,
    });

    console.log("Song published email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in song published email function:", error);
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