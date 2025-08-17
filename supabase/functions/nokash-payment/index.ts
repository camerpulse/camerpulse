import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  order_id: string;
  amount: number;
  phone: string;
  payment_method: 'MTN' | 'ORANGE';
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const url = new URL(req.url);
    const path = url.pathname.split('/').slice(-1)[0];

    if (req.method === 'POST' && path === 'pay') {
      return await handlePaymentRequest(req, supabaseClient);
    } else if (req.method === 'POST' && path === 'callback') {
      return await handleCallback(req, supabaseClient);
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handlePaymentRequest(req: Request, supabaseClient: any) {
  try {
    const { order_id, amount, phone, payment_method, user_id }: PaymentRequest = await req.json();

    // Get Nokash configuration
    const { data: config, error: configError } = await supabaseClient
      .from('nokash_payment_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      console.error('Config error:', configError);
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get secrets
    const iSpaceKey = Deno.env.get('NOKASH_I_SPACE_KEY');
    const appSpaceKey = config.app_space_key;

    if (!iSpaceKey || !appSpaceKey) {
      console.error('Missing required keys');
      return new Response(
        JSON.stringify({ error: 'Payment service configuration incomplete' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate HMAC signature
    const signatureData = `${order_id}:${amount}:${phone}:${appSpaceKey}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(iSpaceKey);
    const messageData = encoder.encode(signatureData);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Create payment request payload
    const paymentPayload = {
      i_space_key: iSpaceKey,
      app_space_key: appSpaceKey,
      payment_type: "MOBILEMONEY",
      country: "CM",
      payment_method: payment_method,
      order_id: order_id,
      amount: amount,
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/nokash-payment/callback`,
      user_data: { user_phone: phone }
    };

    console.log('Payment request:', { ...paymentPayload, i_space_key: '[HIDDEN]' });

    // Store transaction in database
    const { error: dbError } = await supabaseClient
      .from('nokash_transactions')
      .insert({
        order_id,
        user_id,
        amount,
        phone_number: phone,
        payment_method,
        status: 'PENDING'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to store transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make request to Nokash API
    const nokashResponse = await fetch('https://api.nokash.app/lapas-on-trans/trans/api-payin-request/407', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'hmac-signature': signatureHex
      },
      body: JSON.stringify(paymentPayload)
    });

    const responseData = await nokashResponse.json();
    console.log('Nokash response:', responseData);

    // Update transaction with Nokash response
    await supabaseClient
      .from('nokash_transactions')
      .update({ nokash_response: responseData })
      .eq('order_id', order_id);

    if (!nokashResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Payment initiation failed', 
          details: responseData 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment initiated successfully',
        order_id,
        nokash_response: responseData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment request error:', error);
    return new Response(
      JSON.stringify({ error: 'Payment processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCallback(req: Request, supabaseClient: any) {
  try {
    const callbackData = await req.json();
    console.log('Nokash callback received:', callbackData);

    const { order_id, status } = callbackData;

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'Missing order_id in callback' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction status
    const updateData: any = {
      status: status || 'UNKNOWN',
      callback_data: callbackData
    };

    if (status === 'SUCCESS') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabaseClient
      .from('nokash_transactions')
      .update(updateData)
      .eq('order_id', order_id);

    if (error) {
      console.error('Database update error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Transaction ${order_id} updated to status: ${status}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Callback processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Callback error:', error);
    return new Response(
      JSON.stringify({ error: 'Callback processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}