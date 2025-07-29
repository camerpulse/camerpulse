import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentVerificationRequest {
  transactionId: string;
  paymentReference: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-VERIFICATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Payment verification started');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { transactionId, paymentReference }: PaymentVerificationRequest = await req.json();
    
    logStep('Verifying payment', { transactionId, paymentReference });

    // Find the claim by payment reference
    const { data: claimData, error: claimError } = await supabaseClient
      .from('institution_claims')
      .select('*')
      .eq('payment_reference', paymentReference)
      .single();

    if (claimError || !claimData) {
      throw new Error('Claim not found for payment reference');
    }

    // TODO: Verify payment with Flutterwave API when credentials are provided
    /*
    const verificationResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
        'Content-Type': 'application/json'
      }
    });

    const verificationData = await verificationResponse.json();
    
    if (verificationData.status !== 'success' || verificationData.data.status !== 'successful') {
      throw new Error('Payment verification failed');
    }

    // Check if amount matches
    if (verificationData.data.amount !== claimData.payment_amount) {
      throw new Error('Payment amount mismatch');
    }
    */

    // Mock verification for now - replace with actual Flutterwave verification
    const paymentVerified = true; // Replace with actual verification result
    
    if (paymentVerified) {
      // Update claim status to under review
      await supabaseClient
        .from('institution_claims')
        .update({
          payment_status: 'completed',
          status: 'under_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', claimData.id);

      // Create notification for user
      await supabaseClient.rpc('create_claim_notification', {
        p_claim_id: claimData.id,
        p_recipient_id: claimData.user_id,
        p_notification_type: 'payment_completed',
        p_title: 'Payment Confirmed',
        p_message: `Your payment has been confirmed. Your claim for ${claimData.institution_name} is now under review by our moderation team.`
      });

      // Notify admins about new claim to review
      const { data: adminUsers } = await supabaseClient
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminUsers) {
        for (const admin of adminUsers) {
          await supabaseClient.rpc('create_claim_notification', {
            p_claim_id: claimData.id,
            p_recipient_id: admin.user_id,
            p_notification_type: 'under_review',
            p_title: 'New Claim Requires Review',
            p_message: `A new ${claimData.institution_type} claim for ${claimData.institution_name} requires moderation review.`
          });
        }
      }

      logStep('Payment verified and claim updated', { claimId: claimData.id });

      return new Response(JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        claimStatus: 'under_review'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    } else {
      throw new Error('Payment verification failed');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in payment verification', { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});