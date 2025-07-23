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

  // Initialize Supabase client using the anon key for authentication
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    // Parse request body
    const { amount, method, description = "Wallet top-up" } = await req.json();
    
    if (!amount || amount < 500) {
      throw new Error("Minimum top-up amount is 500 FCFA");
    }

    // Use service role key for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create wallet transaction (credit)
    const { data: walletTx, error: walletError } = await supabaseService
      .from("wallet_transactions")
      .insert({
        user_id: user.id,
        transaction_type: "credit",
        amount: amount,
        description: `${description} via ${method}`,
        reference_id: null
      })
      .select()
      .single();

    if (walletError) {
      throw new Error(`Wallet transaction failed: ${walletError.message}`);
    }

    // Mock payment processing based on method
    let success = true;
    if (method === "mtnMomo" || method === "orangeMoney") {
      // Mock 95% success rate for mobile money
      success = Math.random() > 0.05;
    }

    if (!success) {
      // Update transaction to failed
      await supabaseService
        .from("wallet_transactions")
        .update({ description: `${description} via ${method} - FAILED` })
        .eq("id", walletTx.id);
        
      throw new Error(`${method} payment failed`);
    }

    return new Response(JSON.stringify({
      success: true,
      transactionId: walletTx.id,
      amount: amount,
      method: method
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in wallet-topup:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});