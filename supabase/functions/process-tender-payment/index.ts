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

  // Initialize Supabase client using the service role key for database operations
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { paymentId, action, walletData } = await req.json();
    
    if (!paymentId || !action) {
      throw new Error("Missing required parameters: paymentId or action");
    }

    console.log(`Processing payment ${paymentId} with action: ${action}`);

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from("tender_payments")
      .select(`
        *,
        tender_payment_plans(*)
      `)
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment not found");
    }

    let result = { success: false, transactionId: null, error: null };

    if (action === "camerWallet") {
      // Process CamerWallet payment
      const walletBalance = walletData?.balance || 0;
      
      if (walletBalance < payment.amount_fcfa) {
        throw new Error("Insufficient wallet balance");
      }

      // Create wallet transaction (debit)
      const { data: walletTx, error: walletError } = await supabaseClient
        .from("wallet_transactions")
        .insert({
          user_id: payment.user_id,
          transaction_type: "debit",
          amount: payment.amount_fcfa,
          description: `Tender payment: ${payment.tender_id}`,
          reference_id: payment.id
        })
        .select()
        .single();

      if (walletError) {
        throw new Error(`Wallet transaction failed: ${walletError.message}`);
      }

      // Update payment status
      await supabaseClient
        .from("tender_payments")
        .update({ 
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: "camerWallet"
        })
        .eq("id", paymentId);

      // Create invoice
      await supabaseClient
        .from("tender_invoices")
        .insert({
          payment_id: paymentId,
          invoice_number: `INV-${Date.now()}`,
          amount_fcfa: payment.amount_fcfa,
          amount_usd: payment.amount_usd,
          currency: payment.currency,
          status: "paid",
          issued_at: new Date().toISOString()
        });

      result = {
        success: true,
        transactionId: walletTx.id,
        error: null
      };

    } else if (action === "mtnMomo" || action === "orangeMoney") {
      // Mock mobile money payment processing
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        // Create wallet transaction (credit for successful payment)
        const { data: walletTx, error: walletError } = await supabaseClient
          .from("wallet_transactions")
          .insert({
            user_id: payment.user_id,
            transaction_type: "debit",
            amount: payment.amount_fcfa,
            description: `Tender payment via ${action}: ${payment.tender_id}`,
            reference_id: payment.id
          })
          .select()
          .single();

        if (walletError) {
          throw new Error(`Wallet transaction failed: ${walletError.message}`);
        }

        // Update payment status
        await supabaseClient
          .from("tender_payments")
          .update({ 
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            payment_method: action
          })
          .eq("id", paymentId);

        // Create invoice
        await supabaseClient
          .from("tender_invoices")
          .insert({
            payment_id: paymentId,
            invoice_number: `INV-${Date.now()}`,
            amount_fcfa: payment.amount_fcfa,
            amount_usd: payment.amount_usd,
            currency: payment.currency,
            status: "paid",
            issued_at: new Date().toISOString()
          });

        result = {
          success: true,
          transactionId: walletTx.id,
          error: null
        };
      } else {
        throw new Error(`${action} payment failed`);
      }
    } else {
      throw new Error(`Unsupported payment action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in process-tender-payment:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      transactionId: null 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});