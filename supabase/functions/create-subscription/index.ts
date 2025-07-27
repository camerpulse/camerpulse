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
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Subscription creation started");

    // Check for Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    logStep("Stripe key verified");

    // Initialize Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authentication required for subscriptions");
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
    const { planType, vendorId, customPlan } = await req.json();
    logStep("Request parsed", { planType, vendorId, customPlan });

    if (!planType) {
      throw new Error("Plan type is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Define subscription plans
    const plans = {
      vendor_basic: {
        name: "Vendor Basic",
        amount: 2000, // 20 USD in cents
        interval: "month",
        features: ["Up to 50 products", "Basic analytics", "Standard support"]
      },
      vendor_premium: {
        name: "Vendor Premium", 
        amount: 5000, // 50 USD in cents
        interval: "month",
        features: ["Unlimited products", "Advanced analytics", "Priority support", "Marketing tools"]
      },
      vendor_enterprise: {
        name: "Vendor Enterprise",
        amount: 10000, // 100 USD in cents
        interval: "month",
        features: ["Everything in Premium", "Custom integrations", "Dedicated account manager", "White-label options"]
      },
      custom: customPlan
    };

    const selectedPlan = plans[planType as keyof typeof plans];
    if (!selectedPlan) {
      throw new Error("Invalid plan type");
    }

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
        metadata: {
          user_id: userData.user.id,
          vendor_id: vendorId || ''
        }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create or retrieve price for the plan
    let priceId;
    const prices = await stripe.prices.list({
      product: selectedPlan.name.toLowerCase().replace(' ', '_'),
      limit: 1
    });

    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
    } else {
      // Create product and price
      const product = await stripe.products.create({
        name: selectedPlan.name,
        description: `${selectedPlan.name} subscription plan`,
        metadata: {
          plan_type: planType,
          features: JSON.stringify(selectedPlan.features)
        }
      });

      const price = await stripe.prices.create({
        unit_amount: selectedPlan.amount,
        currency: 'usd',
        recurring: { interval: selectedPlan.interval as 'month' | 'year' },
        product: product.id,
      });
      priceId = price.id;
    }

    logStep("Price configured", { priceId });

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/marketplace/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/marketplace/subscription-cancelled`,
      metadata: {
        user_id: userData.user.id,
        vendor_id: vendorId || '',
        plan_type: planType
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    logStep("Stripe session created", { sessionId: session.id, url: session.url });

    // Store subscription intent in database
    const { error: subError } = await supabaseService
      .from('vendor_subscriptions')
      .upsert({
        user_id: userData.user.id,
        vendor_id: vendorId,
        plan_type: planType,
        stripe_customer_id: customerId,
        stripe_session_id: session.id,
        status: 'pending',
        amount: selectedPlan.amount,
        currency: 'usd',
        interval: selectedPlan.interval,
        features: selectedPlan.features,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (subError) {
      logStep("Subscription record creation failed", { error: subError });
      // Don't fail the payment if record creation fails, just log it
    } else {
      logStep("Subscription record created");
    }

    return new Response(JSON.stringify({
      success: true,
      url: session.url,
      sessionId: session.id,
      plan: selectedPlan
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});