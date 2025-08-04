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
  console.log(`[PAYMENT-ANALYTICS] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment analytics started");

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

    // Get request parameters
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '30'; // days
    const vendorId = url.searchParams.get('vendorId');
    const isAdmin = url.searchParams.get('admin') === 'true';

    logStep("Request parsed", { period, vendorId, isAdmin });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - parseInt(period));

    // Check if user is admin
    let hasAdminAccess = false;
    if (isAdmin) {
      const { data: roles } = await supabaseService
        .from('user_roles')
        .select('role')
        .eq('user_id', userData.user.id)
        .single();
      
      hasAdminAccess = roles?.role === 'admin';
    }

    let analyticsData: any = {};

    if (hasAdminAccess) {
      // Admin analytics - platform-wide data
      logStep("Generating admin analytics");

      // Get platform revenue
      const { data: platformOrders } = await supabaseService
        .from('orders')
        .select('amount, currency, status, created_at, payment_method')
        .gte('created_at', periodStart.toISOString())
        .eq('status', 'paid');

      const { data: platformSubscriptions } = await supabaseService
        .from('vendor_subscriptions')
        .select('amount, currency, status, created_at, plan_type')
        .gte('created_at', periodStart.toISOString())
        .in('status', ['active', 'trialing']);

      // Calculate platform metrics
      const totalOneOffRevenue = platformOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
      const totalSubscriptionRevenue = platformSubscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;
      const totalRevenue = totalOneOffRevenue + totalSubscriptionRevenue;

      // Payment method breakdown
      const paymentMethodBreakdown = platformOrders?.reduce((acc: any, order) => {
        const method = order.payment_method || 'unknown';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {}) || {};

      // Subscription plan breakdown
      const subscriptionBreakdown = platformSubscriptions?.reduce((acc: any, sub) => {
        const plan = sub.plan_type || 'unknown';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get Stripe analytics
      const stripeCharges = await stripe.charges.list({
        created: { gte: Math.floor(periodStart.getTime() / 1000) },
        limit: 100
      });

      const stripeSubscriptions = await stripe.subscriptions.list({
        created: { gte: Math.floor(periodStart.getTime() / 1000) },
        limit: 100
      });

      analyticsData = {
        platform: {
          total_revenue: totalRevenue,
          one_off_revenue: totalOneOffRevenue,
          subscription_revenue: totalSubscriptionRevenue,
          total_orders: platformOrders?.length || 0,
          total_subscriptions: platformSubscriptions?.length || 0,
          payment_method_breakdown: paymentMethodBreakdown,
          subscription_plan_breakdown: subscriptionBreakdown,
          stripe_data: {
            charges: stripeCharges.data.length,
            charge_volume: stripeCharges.data.reduce((sum, charge) => sum + charge.amount, 0),
            subscriptions: stripeSubscriptions.data.length,
            subscription_mrr: stripeSubscriptions.data.reduce((sum, sub) => {
              const amount = sub.items.data[0]?.price?.unit_amount || 0;
              return sum + amount;
            }, 0)
          }
        }
      };

    } else if (vendorId) {
      // Vendor-specific analytics
      logStep("Generating vendor analytics", { vendorId });

      // Check if user owns this vendor account
      const { data: vendorAccess } = await supabaseService
        .from('marketplace_vendors')
        .select('user_id')
        .eq('id', vendorId)
        .eq('user_id', userData.user.id)
        .single();

      if (!vendorAccess) {
        throw new Error("Access denied to vendor analytics");
      }

      // Get vendor orders
      const { data: vendorOrders } = await supabaseService
        .from('orders')
        .select('amount, currency, status, created_at, quantity, product_id')
        .gte('created_at', periodStart.toISOString())
        .eq('vendor_id', vendorId);

      // Get vendor subscription
      const { data: vendorSubscription } = await supabaseService
        .from('vendor_subscriptions')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('user_id', userData.user.id)
        .single();

      const totalSales = vendorOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
      const totalOrders = vendorOrders?.filter(order => order.status === 'paid').length || 0;
      const totalItems = vendorOrders?.reduce((sum, order) => sum + (order.quantity || 0), 0) || 0;

      // Calculate commission (assuming 5% platform fee)
      const platformFee = totalSales * 0.05;
      const netRevenue = totalSales - platformFee;

      analyticsData = {
        vendor: {
          total_sales: totalSales,
          net_revenue: netRevenue,
          platform_fee: platformFee,
          total_orders: totalOrders,
          total_items_sold: totalItems,
          subscription_status: vendorSubscription?.status || 'none',
          subscription_plan: vendorSubscription?.plan_type || 'none',
          orders: vendorOrders?.map(order => ({
            amount: order.amount,
            status: order.status,
            created_at: order.created_at,
            quantity: order.quantity
          })) || []
        }
      };

    } else {
      // User analytics - their purchases
      logStep("Generating user analytics");

      const { data: userOrders } = await supabaseService
        .from('orders')
        .select('amount, currency, status, created_at, product_id')
        .gte('created_at', periodStart.toISOString())
        .eq('buyer_id', userData.user.id);

      const totalSpent = userOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
      const totalPurchases = userOrders?.filter(order => order.status === 'paid').length || 0;

      analyticsData = {
        user: {
          total_spent: totalSpent,
          total_purchases: totalPurchases,
          orders: userOrders?.map(order => ({
            amount: order.amount,
            status: order.status,
            created_at: order.created_at
          })) || []
        }
      };
    }

    logStep("Analytics generated successfully");

    return new Response(JSON.stringify({
      success: true,
      period: period,
      period_start: periodStart.toISOString(),
      analytics: analyticsData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in payment-analytics", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});