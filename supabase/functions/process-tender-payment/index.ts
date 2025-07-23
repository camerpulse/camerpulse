import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { paymentId, action, walletData } = await req.json();

    if (action === "camerWallet") {
      // Process CamerWallet payment
      const { data: payment, error: paymentError } = await supabaseService
        .from("tender_payments")
        .select(`
          *,
          tender_payment_plans(*)
        `)
        .eq("id", paymentId)
        .single();

      if (paymentError) throw new Error("Payment not found");

      // Mock CamerWallet processing (replace with actual API)
      const walletSuccess = walletData.balance >= payment.amount_fcfa;
      
      if (walletSuccess) {
        // Update payment status
        await supabaseService
          .from("tender_payments")
          .update({
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            payment_method: "camerWallet",
            transaction_reference: `CW_${Date.now()}`
          })
          .eq("id", paymentId);

        // Create invoice record
        await supabaseService
          .from("tender_invoices")
          .insert({
            payment_id: paymentId,
            invoice_number: `INV-${Date.now()}`,
            amount_fcfa: payment.amount_fcfa,
            amount_usd: payment.amount_usd,
            currency: payment.currency,
            issued_at: new Date().toISOString(),
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            status: "paid"
          });

        return new Response(JSON.stringify({ 
          success: true, 
          message: "Payment processed successfully",
          transactionId: `CW_${Date.now()}`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        throw new Error("Insufficient wallet balance");
      }
    }

    if (action === "mtnMomo" || action === "orangeMoney") {
      // Process Mobile Money payment
      const { data: payment } = await supabaseService
        .from("tender_payments")
        .select("*")
        .eq("id", paymentId)
        .single();

      // Mock mobile money processing
      const momoSuccess = Math.random() > 0.1; // 90% success rate for demo
      
      if (momoSuccess) {
        await supabaseService
          .from("tender_payments")
          .update({
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            payment_method: action,
            transaction_reference: `${action.toUpperCase()}_${Date.now()}`
          })
          .eq("id", paymentId);

        return new Response(JSON.stringify({ 
          success: true, 
          message: "Mobile money payment processed",
          transactionId: `${action.toUpperCase()}_${Date.now()}`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        throw new Error("Mobile money payment failed");
      }
    }

    throw new Error("Invalid payment action");

  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});