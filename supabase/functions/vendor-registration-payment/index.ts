import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VENDOR-REGISTRATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Vendor registration payment started");

    // Check for Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    // Initialize Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authentication required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid authentication token");
    }

    logStep("User authenticated", { userId: userData.user.id });

    // Get request body
    const { vendorData, feeType = 'registration_annual' } = await req.json();
    logStep("Request parsed", { feeType, vendorData });

    // Get vendor registration fee from pricing config
    const { data: pricingConfig, error: pricingError } = await supabaseService
      .from('pricing_config')
      .select('*')
      .eq('config_type', 'vendor_fee')
      .eq('config_key', feeType)
      .eq('is_active', true)
      .single();

    if (pricingError || !pricingConfig) {
      logStep("Pricing config not found", { error: pricingError });
      throw new Error("Vendor registration pricing not configured");
    }

    const registrationFee = pricingConfig.amount;
    const currency = pricingConfig.currency;

    logStep("Pricing loaded", { 
      amount: registrationFee, 
      currency, 
      feeType: pricingConfig.config_key 
    });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    let customerId;
    const customers = await stripe.customers.list({ 
      email: userData.user.email,
      limit: 1 
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: userData.user.email,
        name: vendorData?.businessName || vendorData?.ownerName,
        metadata: {
          user_id: userData.user.id,
          purpose: 'vendor_registration'
        }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create checkout session for vendor registration
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Vendor Registration Fee - ${feeType.replace('_', ' ').toUpperCase()}`,
              description: pricingConfig.description
            },
            unit_amount: registrationFee,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/marketplace/vendor-registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/marketplace/vendor-registration-cancelled`,
      metadata: {
        user_id: userData.user.id,
        fee_type: feeType,
        purpose: 'vendor_registration'
      }
    });

    logStep("Stripe session created", { sessionId: session.id, url: session.url });

    // Store vendor registration intent in database
    const { error: vendorError } = await supabaseService
      .from('vendor_registration_payments')
      .upsert({
        user_id: userData.user.id,
        stripe_customer_id: customerId,
        stripe_session_id: session.id,
        fee_type: feeType,
        amount: registrationFee,
        currency: currency,
        status: 'pending',
        vendor_data: vendorData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (vendorError) {
      logStep("Vendor registration record creation failed", { error: vendorError });
      // Don't fail the payment if record creation fails, just log it
    } else {
      logStep("Vendor registration record created");
    }

    return new Response(JSON.stringify({
      success: true,
      url: session.url,
      sessionId: session.id,
      amount: registrationFee,
      currency: currency,
      feeType: feeType
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in vendor-registration", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});