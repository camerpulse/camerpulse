import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  claimId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLAIM-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Payment processing started');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    const user = userData.user;
    if (!user) throw new Error('User not authenticated');
    
    logStep('User authenticated', { userId: user.id });

    const { claimId, amount, currency, paymentMethod }: PaymentRequest = await req.json();
    
    // Verify the claim exists and belongs to user
    const { data: claimData, error: claimError } = await supabaseClient
      .from('institution_claims')
      .select('*')
      .eq('id', claimId)
      .eq('user_id', user.id)
      .single();

    if (claimError || !claimData) {
      throw new Error('Claim not found or unauthorized');
    }
    
    logStep('Claim verified', { claimId, institutionName: claimData.institution_name });

    // TODO: Replace with actual Flutterwave API when credentials are provided
    // For now, return a mock payment URL structure
    const mockPaymentUrl = `https://checkout.flutterwave.com/v3/hosted/pay/${claimId}`;
    
    // Update claim with payment reference
    const paymentReference = `CLAIM_${claimId}_${Date.now()}`;
    
    await supabaseClient
      .from('institution_claims')
      .update({
        payment_reference: paymentReference,
        status: 'payment_pending'
      })
      .eq('id', claimId);

    // Create notification for user
    await supabaseClient.rpc('create_claim_notification', {
      p_claim_id: claimId,
      p_recipient_id: user.id,
      p_notification_type: 'payment_initiated',
      p_title: 'Payment Initiated',
      p_message: `Payment of ${amount} ${currency} has been initiated for your claim. Complete the payment to proceed with verification.`
    });

    // TODO: Implement actual Flutterwave payment initialization
    /*
    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: paymentReference,
        amount: amount,
        currency: currency,
        customer: {
          email: user.email,
          name: user.user_metadata?.full_name || 'User'
        },
        customizations: {
          title: 'CamerPulse Institution Claim',
          description: `Verification fee for claiming ${claimData.institution_name}`,
          logo: 'https://your-domain.com/logo.png'
        },
        redirect_url: `${req.headers.get('origin')}/claim-payment-callback`
      })
    });

    const paymentData = await flutterwaveResponse.json();
    
    if (!paymentData.status === 'success') {
      throw new Error('Failed to initialize payment');
    }
    */

    logStep('Payment URL generated', { paymentReference });

    return new Response(JSON.stringify({
      success: true,
      paymentUrl: mockPaymentUrl, // Replace with paymentData.data.link when using real Flutterwave
      paymentReference,
      message: 'Payment initiated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in payment processing', { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});