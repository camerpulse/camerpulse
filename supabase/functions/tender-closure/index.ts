import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TenderClosureRequest {
  manual?: boolean;
  tenderId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { manual = false, tenderId }: TenderClosureRequest = 
      req.method === "POST" ? await req.json() : {};

    console.log(`Starting tender closure automation - Manual: ${manual}, TenderID: ${tenderId}`);

    let query = supabase
      .from('tenders')
      .select('id, title, deadline, published_by_user_id, bids_count')
      .eq('status', 'open')
      .lt('deadline', new Date().toISOString());

    // If manual closure for specific tender
    if (manual && tenderId) {
      query = supabase
        .from('tenders')
        .select('id, title, deadline, published_by_user_id, bids_count')
        .eq('id', tenderId)
        .eq('status', 'open');
    }

    const { data: expiredTenders, error: selectError } = await query;

    if (selectError) {
      throw selectError;
    }

    console.log(`Found ${expiredTenders?.length || 0} tenders to close`);

    const closureResults = [];

    for (const tender of expiredTenders || []) {
      try {
        // Close the tender
        const { error: updateError } = await supabase
          .from('tenders')
          .update({ 
            status: 'closed',
            updated_at: new Date().toISOString()
          })
          .eq('id', tender.id);

        if (updateError) {
          console.error(`Failed to close tender ${tender.id}:`, updateError);
          continue;
        }

        // Update all pending bids to 'expired'
        const { error: bidsError } = await supabase
          .from('tender_bids')
          .update({ 
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('tender_id', tender.id)
          .eq('status', 'submitted');

        if (bidsError) {
          console.error(`Failed to update bids for tender ${tender.id}:`, bidsError);
        }

        // Log the closure
        const { error: logError } = await supabase
          .from('tender_audit_logs')
          .insert({
            tender_id: tender.id,
            action: 'tender_closed',
            action_by: 'system',
            details: {
              reason: manual ? 'manual_closure' : 'deadline_expired',
              previous_status: 'open',
              new_status: 'closed',
              bids_count: tender.bids_count,
              closure_time: new Date().toISOString()
            }
          });

        if (logError) {
          console.error(`Failed to log closure for tender ${tender.id}:`, logError);
        }

        closureResults.push({
          tender_id: tender.id,
          title: tender.title,
          status: 'closed_successfully',
          bids_affected: tender.bids_count
        });

        console.log(`Successfully closed tender: ${tender.title} (ID: ${tender.id})`);

        // Create notification for tender publisher
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: tender.published_by_user_id,
            type: 'tender_closed',
            title: 'Tender Closed',
            message: `Your tender "${tender.title}" has been automatically closed due to deadline expiry.`,
            data: {
              tender_id: tender.id,
              closure_type: manual ? 'manual' : 'automatic',
              bids_count: tender.bids_count
            }
          });

        if (notificationError) {
          console.error(`Failed to create notification for tender ${tender.id}:`, notificationError);
        }

      } catch (error) {
        console.error(`Error processing tender ${tender.id}:`, error);
        closureResults.push({
          tender_id: tender.id,
          title: tender.title,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update tender statistics
    const { error: statsError } = await supabase
      .from('tender_statistics')
      .upsert({
        date: new Date().toISOString().split('T')[0],
        total_closed: closureResults.filter(r => r.status === 'closed_successfully').length,
        automatic_closures: closureResults.filter(r => r.status === 'closed_successfully').length,
        last_run: new Date().toISOString()
      }, {
        onConflict: 'date'
      });

    if (statsError) {
      console.error('Failed to update statistics:', statsError);
    }

    const response = {
      success: true,
      message: `Processed ${expiredTenders?.length || 0} tenders`,
      results: closureResults,
      processed_at: new Date().toISOString()
    };

    console.log('Tender closure automation completed:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in tender-closure function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        processed_at: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);