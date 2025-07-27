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
  console.log(`[MANAGE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Subscription management started");

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

    // Get request body
    const { action, subscriptionId } = await req.json();
    logStep("Request parsed", { action, subscriptionId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let result = {};

    switch (action) {
      case 'get_subscription':
        // Get current subscription
        const { data: subscription } = await supabaseService
          .from('vendor_subscriptions')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('status', 'active')
          .single();

        if (subscription && subscription.stripe_subscription_id) {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
          
          result = {
            subscription: {
              ...subscription,
              stripe_data: {
                current_period_start: new Date(stripeSubscription.current_period_start * 1000),
                current_period_end: new Date(stripeSubscription.current_period_end * 1000),
                status: stripeSubscription.status,
                cancel_at_period_end: stripeSubscription.cancel_at_period_end
              }
            }
          };
        } else {
          result = { subscription: null };
        }
        break;

      case 'cancel_subscription':
        if (!subscriptionId) {
          throw new Error("Subscription ID required for cancellation");
        }

        // Cancel at period end
        const cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });

        // Update database
        await supabaseService
          .from('vendor_subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionId);

        result = {
          success: true,
          message: 'Subscription will be cancelled at the end of the current billing period',
          subscription: cancelledSubscription
        };
        break;

      case 'reactivate_subscription':
        if (!subscriptionId) {
          throw new Error("Subscription ID required for reactivation");
        }

        // Reactivate subscription
        const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false
        });

        // Update database
        await supabaseService
          .from('vendor_subscriptions')
          .update({
            status: 'active',
            cancelled_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionId);

        result = {
          success: true,
          message: 'Subscription has been reactivated',
          subscription: reactivatedSubscription
        };
        break;

      case 'customer_portal':
        // Get customer ID
        const customers = await stripe.customers.list({ 
          email: userData.user.email,
          limit: 1 
        });

        if (customers.data.length === 0) {
          throw new Error("No customer found");
        }

        // Create customer portal session
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customers.data[0].id,
          return_url: `${req.headers.get("origin")}/marketplace/vendor-dashboard`,
        });

        result = {
          success: true,
          portal_url: portalSession.url
        };
        break;

      case 'update_subscription':
        const { newPlanType } = await req.json();
        if (!subscriptionId || !newPlanType) {
          throw new Error("Subscription ID and new plan type required");
        }

        // Get current subscription
        const currentSub = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Define new plan prices (you'd typically store these in your database)
        const planPrices = {
          vendor_basic: 'price_basic_id', // Replace with actual Stripe price IDs
          vendor_premium: 'price_premium_id',
          vendor_enterprise: 'price_enterprise_id'
        };

        const newPriceId = planPrices[newPlanType as keyof typeof planPrices];
        if (!newPriceId) {
          throw new Error("Invalid plan type");
        }

        // Update subscription
        const updatedSub = await stripe.subscriptions.update(subscriptionId, {
          items: [{
            id: currentSub.items.data[0].id,
            price: newPriceId,
          }],
          proration_behavior: 'create_prorations',
        });

        // Update database
        await supabaseService
          .from('vendor_subscriptions')
          .update({
            plan_type: newPlanType,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionId);

        result = {
          success: true,
          message: 'Subscription plan updated successfully',
          subscription: updatedSub
        };
        break;

      default:
        throw new Error("Invalid action");
    }

    logStep("Action completed", { action, result });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in manage-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});