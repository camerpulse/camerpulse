// Supabase Edge Function: cleanup-review
// Provides admin-only review queue operations for data cleanup
// - list review items
// - add whitelist pattern
// - add keep-id
// - resolve review item (delete from queue)

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

function getClient(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getClient(req);

    // Only POST is used; body must include an action
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action: string = body?.action;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("cleanup-review action:", action, "payload:", body);

    // Admin authorization: require authenticated user with 'admin' role
    const { data: authUser, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authUser?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: roleRow, error: roleErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleErr || !roleRow) {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list") {
      const { filters = {}, limit = 50, offset = 0 } = body ?? {};
      let query = supabase
        .from("cleanup_review_items")
        .select("id, run_id, table_name, record_id, reason, matched_column, matched_text, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + Math.max(0, Math.min(100, limit)) - 1);

      if (filters.run_id) query = query.eq("run_id", filters.run_id);
      if (filters.table_name) query = query.eq("table_name", filters.table_name);
      if (filters.reason) query = query.eq("reason", filters.reason);

      const { data, error, count } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ items: data, total: count ?? 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "add_whitelist") {
      const { pattern, description } = body ?? {};
      if (!pattern) {
        return new Response(
          JSON.stringify({ error: "pattern is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { data, error } = await supabase
        .from("cleanup_whitelist_patterns")
        .insert([{ pattern, description, active: true }])
        .select()
        .maybeSingle();
      if (error) throw error;
      return new Response(
        JSON.stringify({ pattern: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "add_keep") {
      const { table_name, record_id, reason } = body ?? {};
      if (!table_name || !record_id) {
        return new Response(
          JSON.stringify({ error: "table_name and record_id are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { data, error } = await supabase
        .from("cleanup_keep_ids")
        .insert([{ table_name, record_id, reason }])
        .select()
        .maybeSingle();
      if (error) throw error;
      return new Response(
        JSON.stringify({ keep: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "resolve") {
      const { review_item_id } = body ?? {};
      if (!review_item_id) {
        return new Response(
          JSON.stringify({ error: "review_item_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { error } = await supabase
        .from("cleanup_review_items")
        .delete()
        .eq("id", review_item_id);
      if (error) throw error;
      return new Response(
        JSON.stringify({ resolved: true, id: review_item_id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("cleanup-review error:", err);
    return new Response(
      JSON.stringify({ error: String(err?.message ?? err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
