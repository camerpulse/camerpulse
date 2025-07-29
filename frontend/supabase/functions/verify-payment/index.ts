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
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment verification started");

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

    // Get request body
    const { sessionId } = await req.json();
    logStep("Request parsed", { sessionId });

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });
    logStep("Stripe session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      paymentIntentId: session.payment_intent?.id
    });

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ 
        success: false, 
        status: session.payment_status,
        message: 'Payment not completed'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Find the order in our database
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (orderError || !order) {
      logStep("Order not found", { error: orderError });
      throw new Error("Order not found");
    }

    // Update order with payment details
    const updateData = {
      status: 'paid',
      stripe_payment_intent_id: typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id,
      customer_name: session.customer_details?.name || order.customer_name,
      customer_email: session.customer_details?.email || order.customer_email,
      customer_phone: session.customer_details?.phone || order.customer_phone,
      shipping_address: session.shipping_details ? {
        name: session.shipping_details.name,
        address: session.shipping_details.address,
      } : null,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseService
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    if (updateError) {
      logStep("Order update failed", { error: updateError });
      throw new Error("Failed to update order");
    }

    logStep("Order updated successfully", { orderId: order.id, status: 'paid' });

    // Optionally update product stock
    if (order.quantity > 0) {
      const { error: stockError } = await supabaseService
        .from('marketplace_products')
        .update({
          stock_quantity: Math.max(0, (order.stock_quantity || 0) - order.quantity)
        })
        .eq('id', order.product_id);

      if (stockError) {
        logStep("Stock update failed", { error: stockError });
        // Don't fail verification if stock update fails
      } else {
        logStep("Stock updated", { productId: order.product_id, quantity: order.quantity });
      }
    }

    // Return success response with order details
    return new Response(JSON.stringify({
      success: true,
      status: 'paid',
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        quantity: order.quantity,
        status: 'paid',
        customer_name: updateData.customer_name,
        customer_email: updateData.customer_email,
        shipping_address: updateData.shipping_address,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});