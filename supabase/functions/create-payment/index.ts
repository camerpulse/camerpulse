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
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment creation started");

    // Check for Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    logStep("Stripe key verified");

    // Initialize Supabase clients
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get request body
    const { productId, quantity = 1, customerInfo } = await req.json();
    logStep("Request parsed", { productId, quantity, customerInfo });

    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Get authenticated user (optional for guest checkout)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseAnon.auth.getUser(token);
      user = data.user;
      logStep("User authenticated", { userId: user?.id, email: user?.email });
    } else {
      logStep("Guest checkout - no authentication");
    }

    // Fetch product details
    const { data: product, error: productError } = await supabaseAnon
      .from('marketplace_products')
      .select(`
        *,
        vendor:marketplace_vendors(*)
      `)
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${productError?.message}`);
    }
    logStep("Product fetched", { productName: product.name, price: product.price });

    // Check stock
    if (!product.in_stock) {
      throw new Error("Product is out of stock");
    }

    if (product.stock_quantity && product.stock_quantity < quantity) {
      throw new Error(`Only ${product.stock_quantity} items available`);
    }

    // Calculate total amount in cents
    const totalAmount = Math.round(product.price * quantity * 100); // Convert to cents
    logStep("Amount calculated", { totalAmount, currency: product.currency });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get or create customer
    let customerId = undefined;
    const customerEmail = user?.email || customerInfo?.email || "guest@camerpulse.com";
    
    if (user?.email || customerInfo?.email) {
      const customers = await stripe.customers.list({ 
        email: customerEmail, 
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customerInfo?.name || user?.user_metadata?.full_name,
          phone: customerInfo?.phone,
        });
        customerId = customer.id;
        logStep("New customer created", { customerId });
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'xaf',
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.images || undefined,
              metadata: {
                product_id: product.id,
                vendor_id: product.vendor_id,
              }
            },
            unit_amount: Math.round(product.price), // XAF doesn't typically use decimals
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/marketplace/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/marketplace`,
      metadata: {
        product_id: product.id,
        vendor_id: product.vendor_id,
        user_id: user?.id || "guest",
        quantity: quantity.toString(),
      },
      shipping_address_collection: {
        allowed_countries: ['CM', 'US', 'CA', 'FR', 'GB'], // Cameroon and other countries
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    logStep("Stripe session created", { sessionId: session.id, url: session.url });

    // Create order record in database
    const orderData = {
      user_id: user?.id || null,
      product_id: product.id,
      vendor_id: product.vendor_id,
      stripe_session_id: session.id,
      amount: totalAmount,
      currency: 'XAF',
      quantity: quantity,
      status: 'pending',
      customer_email: customerEmail,
      customer_name: customerInfo?.name || user?.user_metadata?.full_name || null,
      customer_phone: customerInfo?.phone || null,
      created_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      logStep("Order creation failed", { error: orderError });
      // Don't fail the payment if order creation fails, just log it
      console.error("Failed to create order:", orderError);
    } else {
      logStep("Order created successfully", { orderId: order.id });
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      orderId: order?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});