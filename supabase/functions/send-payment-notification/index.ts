import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentNotificationRequest {
  transaction_id: string;
  user_email?: string;
  notification_type: 'success' | 'failed' | 'pending' | 'admin_alert';
  admin_emails?: string[];
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      transaction_id, 
      user_email, 
      notification_type, 
      admin_emails 
    }: PaymentNotificationRequest = await req.json();

    console.log(`Processing ${notification_type} notification for transaction: ${transaction_id}`);

    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('nokash_transactions')
      .select(`
        *,
        profiles:user_id(display_name, email)
      `)
      .eq('id', transaction_id)
      .single();

    if (txError || !transaction) {
      console.error('Transaction not found:', txError);
      throw new Error('Transaction not found');
    }

    const userEmail = user_email || transaction.profiles?.email;
    const userName = transaction.profiles?.display_name || 'Valued User';

    // Generate email content based on notification type
    let emailContent = '';
    let subject = '';
    let recipients: string[] = [];

    switch (notification_type) {
      case 'success':
        subject = '✅ Payment Confirmation - CamerPulse Donation';
        recipients = userEmail ? [userEmail] : [];
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px;">Payment Successful! 🎉</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your generous donation</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #1f2937; margin-top: 0;">Transaction Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Amount:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${transaction.amount} ${transaction.currency}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Transaction ID:</td>
                  <td style="padding: 10px 0; color: #1f2937; font-family: monospace;">${transaction.order_id}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Payment Method:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${transaction.payment_method}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Phone Number:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${transaction.phone_number}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Date:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${new Date(transaction.created_at).toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #1e40af; margin-top: 0;">Your Impact</h3>
              <p style="color: #1f2937; margin-bottom: 0;">Your donation directly supports civic engagement and democratic participation in Cameroon. Together, we're building a more transparent and accountable society.</p>
            </div>

            <div style="text-align: center; margin-bottom: 25px;">
              <a href="https://camerpulse.lovable.app/donate" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Make Another Donation</a>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p>Thank you for supporting CamerPulse!</p>
              <p>If you have any questions, please contact our support team.</p>
              <p style="margin-top: 15px;">
                <a href="https://camerpulse.lovable.app" style="color: #10b981;">Visit CamerPulse</a> | 
                <a href="mailto:support@camerpulse.cm" style="color: #10b981; margin-left: 10px;">Contact Support</a>
              </p>
            </div>
          </div>
        `;
        break;

      case 'failed':
        subject = '❌ Payment Failed - CamerPulse Donation';
        recipients = userEmail ? [userEmail] : [];
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px;">Payment Failed</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We couldn't process your donation</p>
            </div>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #dc2626; margin-top: 0;">What happened?</h3>
              <p style="color: #1f2937;">Your payment of ${transaction.amount} ${transaction.currency} could not be processed. This could be due to:</p>
              <ul style="color: #1f2937; margin-left: 20px;">
                <li>Insufficient funds in your mobile money account</li>
                <li>Network connectivity issues</li>
                <li>Incorrect phone number or PIN</li>
                <li>Mobile money service temporarily unavailable</li>
              </ul>
            </div>

            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin-top: 0;">Transaction Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Amount:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${transaction.amount} ${transaction.currency}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Transaction ID:</td>
                  <td style="padding: 10px 0; color: #1f2937; font-family: monospace;">${transaction.order_id}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">Payment Method:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${transaction.payment_method}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-bottom: 25px;">
              <a href="https://camerpulse.lovable.app/donate" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Try Again</a>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p>Need help? Contact our support team at support@camerpulse.cm</p>
            </div>
          </div>
        `;
        break;

      case 'admin_alert':
        subject = `🚨 Payment Alert - ${transaction.status.toUpperCase()} Transaction`;
        recipients = admin_emails || ['admin@camerpulse.cm'];
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f59e0b; padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
              <h2 style="margin: 0;">Payment System Alert</h2>
              <p style="margin: 5px 0 0 0;">Status: ${transaction.status}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
              <tr style="background: #e5e7eb;">
                <th style="padding: 12px; text-align: left; font-weight: bold;">Field</th>
                <th style="padding: 12px; text-align: left; font-weight: bold;">Value</th>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Transaction ID</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${transaction.id}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Order ID</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${transaction.order_id}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Amount</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${transaction.amount} ${transaction.currency}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Payment Method</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${transaction.payment_method}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Phone Number</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${transaction.phone_number}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">User</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${userName} (${userEmail})</td>
              </tr>
              <tr>
                <td style="padding: 10px;">Created</td>
                <td style="padding: 10px;">${new Date(transaction.created_at).toLocaleString()}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 20px;">
              <a href="https://camerpulse.lovable.app/admin/nokash-payments" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View in Admin Panel</a>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error('Invalid notification type');
    }

    if (recipients.length === 0) {
      console.warn('No recipients found for notification');
      return new Response(
        JSON.stringify({ success: false, message: 'No recipients' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email
    const emailResult = await resend.emails.send({
      from: 'CamerPulse <notifications@camerpulse.cm>',
      to: recipients,
      subject,
      html: emailContent,
    });

    console.log('Email sent successfully:', emailResult);

    // Log email notification
    await supabase.from('payment_notifications').insert({
      transaction_id,
      notification_type,
      recipient_email: recipients[0],
      email_status: 'sent',
      sent_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResult.data?.id,
        recipients: recipients.length 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error sending payment notification:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});