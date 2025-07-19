import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EventTicketEmailRequest {
  full_name: string;
  email: string;
  event_name: string;
  event_location: string;
  event_datetime: string;
  ticket_type: string;
  qr_code_link: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      full_name,
      email,
      event_name,
      event_location,
      event_datetime,
      ticket_type,
      qr_code_link
    }: EventTicketEmailRequest = await req.json();

    console.log("Sending event ticket email to:", email, "for event:", event_name);

    const emailResponse = await resend.emails.send({
      from: "CamerPlay Events <events@camerplay.com>",
      to: [email],
      subject: `🎟️ Your CamerPlay Ticket: ${event_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">🎟️ Your CamerPlay Ticket Confirmed!</h1>
          
          <p style="font-size: 16px; margin-bottom: 15px;">Hi <strong>${full_name}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Your ticket to <strong>${event_name}</strong> is confirmed!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0; font-size: 16px;"><strong>📍 Location:</strong> ${event_location}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>📅 Date & Time:</strong> ${event_datetime}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>🎟️ Ticket Type:</strong> ${ticket_type}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${qr_code_link}" 
               style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              📱 View Your Ticket QR Code
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Your ticket QR code is accessible via the link above. Please keep this email safe or access it via your CamerPulse dashboard.
          </p>
          
          <p style="font-size: 16px; margin-top: 30px;">
            Thank you for supporting Cameroonian talent.
          </p>
          
          <p style="font-size: 16px; margin-top: 20px;">
            – CamerPlay Events
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated email from CamerPlay Events. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log("Event ticket email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-event-ticket-email function:", error);
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