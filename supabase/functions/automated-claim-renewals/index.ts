import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RenewalResponse {
  renewals_processed: number;
  reminders_sent: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting automated claim renewals check...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Call the renewal check function
    const { data, error } = await supabase.rpc('check_claim_renewals');

    if (error) {
      console.error('❌ Error checking renewals:', error);
      throw error;
    }

    const result = data?.[0] as RenewalResponse;
    console.log(`✅ Renewal check completed:`, result);

    // Process any expired claims that need immediate attention
    const { data: expiredClaims, error: expiredError } = await supabase
      .from('institution_claim_renewals')
      .select(`
        *,
        institution_claims!inner(
          user_id,
          institution_name,
          status
        )
      `)
      .eq('renewal_status', 'pending')
      .lt('renewal_due_date', new Date().toISOString());

    if (expiredError) {
      console.error('❌ Error fetching expired claims:', expiredError);
    } else if (expiredClaims && expiredClaims.length > 0) {
      console.log(`⚠️ Found ${expiredClaims.length} expired claims`);
      
      // Mark institutions as needing renewal
      for (const claim of expiredClaims) {
        await supabase
          .from('institutions')
          .update({ claim_status: 'renewal_required' })
          .eq('claimed_by', claim.institution_claims.user_id)
          .eq('name', claim.institution_claims.institution_name);
      }
    }

    // Send email notifications for urgent renewals
    const { data: urgentRenewals } = await supabase
      .from('institution_claim_renewals')
      .select(`
        *,
        institution_claims!inner(
          user_id,
          institution_name
        )
      `)
      .eq('renewal_status', 'pending')
      .gte('renewal_due_date', new Date().toISOString())
      .lte('renewal_due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('reminder_sent_7_days', false);

    if (urgentRenewals && urgentRenewals.length > 0) {
      console.log(`📧 Sending ${urgentRenewals.length} urgent renewal emails`);
      
      // Here you would integrate with an email service
      // For now, we'll create in-app notifications
      for (const renewal of urgentRenewals) {
        await supabase
          .from('institution_claim_notifications')
          .insert({
            claim_id: renewal.original_claim_id,
            recipient_user_id: renewal.institution_claims.user_id,
            notification_type: 'renewal_urgent',
            title: '🚨 URGENT: Institution Claim Expires Soon',
            message: `Your claim for ${renewal.institution_claims.institution_name} expires in less than 7 days. Immediate renewal required to maintain access.`,
            action_url: `/institutions/renew/${renewal.original_claim_id}`
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        renewals_processed: result?.renewals_processed || 0,
        reminders_sent: result?.reminders_sent || 0,
        expired_claims_found: expiredClaims?.length || 0,
        urgent_emails_sent: urgentRenewals?.length || 0,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('💥 Renewal automation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});