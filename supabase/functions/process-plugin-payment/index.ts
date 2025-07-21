import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseRequest {
  licenseId: string;
  paymentGateway: 'stripe' | 'flutterwave' | 'mobile_money';
  paymentMethod?: string;
  metadata?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    const { licenseId, paymentGateway, paymentMethod, metadata }: PurchaseRequest = await req.json();

    // Get license details
    const { data: license, error: licenseError } = await supabaseClient
      .from('plugin_licenses')
      .select('*')
      .eq('id', licenseId)
      .single();

    if (licenseError) throw new Error('License not found');

    // Check if user already owns this plugin
    const { data: existingPurchase } = await supabaseClient
      .from('plugin_purchases')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('plugin_id', license.plugin_id)
      .eq('status', 'completed')
      .single();

    if (existingPurchase) {
      throw new Error('You already own this plugin');
    }

    // Get gateway configuration
    const { data: gatewayConfig, error: configError } = await supabaseClient
      .from('payment_gateway_config')
      .select('*')
      .eq('gateway_name', paymentGateway)
      .eq('is_active', true)
      .single();

    if (configError || !gatewayConfig) {
      throw new Error('Payment gateway not available');
    }

    // Calculate amounts
    const amount = license.price_amount;
    const commission = (amount * gatewayConfig.commission_percentage) / 100;
    const developerPayout = amount - commission;

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('plugin_purchases')
      .insert({
        user_id: userData.user.id,
        plugin_id: license.plugin_id,
        license_id: licenseId,
        payment_gateway: paymentGateway,
        payment_method: paymentMethod,
        amount,
        currency: license.currency,
        commission_amount: commission,
        developer_payout: developerPayout,
        status: 'pending',
        payment_data: metadata || {}
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Process payment based on gateway
    let paymentResult;
    
    if (paymentGateway === 'stripe') {
      paymentResult = await processStripePayment(purchase, license, userData.user);
    } else if (paymentGateway === 'flutterwave') {
      paymentResult = await processFlutterwavePayment(purchase, license, userData.user);
    } else if (paymentGateway === 'mobile_money') {
      paymentResult = await processMobileMoneyPayment(purchase, license, userData.user);
    }

    return new Response(JSON.stringify(paymentResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Payment error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function processStripePayment(purchase: any, license: any, user: any) {
  // TODO: Implement Stripe integration
  // This will be configured when you provide your Stripe credentials
  console.log('Processing Stripe payment for purchase:', purchase.id);
  
  // For now, return a mock response
  return {
    success: true,
    gateway: 'stripe',
    purchaseId: purchase.id,
    redirectUrl: `${Deno.env.get("SUPABASE_URL")}/payment/stripe/redirect?purchase=${purchase.id}`,
    message: 'Stripe payment integration pending configuration'
  };
}

async function processFlutterwavePayment(purchase: any, license: any, user: any) {
  // TODO: Implement Flutterwave integration
  // This will be configured when you provide your Flutterwave credentials
  console.log('Processing Flutterwave payment for purchase:', purchase.id);
  
  // For now, return a mock response
  return {
    success: true,
    gateway: 'flutterwave',
    purchaseId: purchase.id,
    redirectUrl: `${Deno.env.get("SUPABASE_URL")}/payment/flutterwave/redirect?purchase=${purchase.id}`,
    message: 'Flutterwave payment integration pending configuration'
  };
}

async function processMobileMoneyPayment(purchase: any, license: any, user: any) {
  // TODO: Implement Mobile Money integration
  // This will be configured based on your preferred mobile money providers
  console.log('Processing Mobile Money payment for purchase:', purchase.id);
  
  // For now, return a mock response
  return {
    success: true,
    gateway: 'mobile_money',
    purchaseId: purchase.id,
    message: 'Mobile Money payment integration pending configuration'
  };
}