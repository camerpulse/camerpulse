import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LicenseValidationRequest {
  licenseKey: string;
  pluginId: string;
  action?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { licenseKey, pluginId, action }: LicenseValidationRequest = await req.json();

    // Validate license key
    const { data: licenseData, error } = await supabaseClient
      .from('plugin_license_keys')
      .select(`
        *,
        plugin_licenses (
          plugin_id,
          license_type,
          usage_limits,
          features_included
        )
      `)
      .eq('license_key', licenseKey)
      .single();

    if (error) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Invalid license key' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const license = licenseData as any;

    // Validate plugin ID
    if (license.plugin_licenses.plugin_id !== pluginId) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'License key not valid for this plugin' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check license status
    if (license.status !== 'active' && license.status !== 'trial') {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: `License is ${license.status}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check expiration
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      // Update status to expired
      await supabaseClient
        .from('plugin_license_keys')
        .update({ status: 'expired' })
        .eq('id', license.id);

      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'License has expired' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check usage limits
    if (license.usage_limit && license.usage_count >= license.usage_limit) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Usage limit exceeded' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // If this is a usage action, increment the count
    if (action === 'use') {
      await supabaseClient.rpc('increment_usage_count', { 
        license_key_id: license.id 
      });

      // Log usage
      await supabaseClient
        .from('plugin_usage_logs')
        .insert({
          license_key_id: license.id,
          user_id: license.user_id,
          plugin_id: pluginId,
          usage_type: 'api_call',
          metadata: {}
        });
    }

    return new Response(JSON.stringify({ 
      valid: true,
      license: {
        id: license.id,
        type: license.plugin_licenses.license_type,
        status: license.status,
        expires_at: license.expires_at,
        usage_count: license.usage_count + (action === 'use' ? 1 : 0),
        usage_limit: license.usage_limit,
        features: license.plugin_licenses.features_included
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('License validation error:', error);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: 'License validation failed' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});