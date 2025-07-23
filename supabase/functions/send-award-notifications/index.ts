import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  tender_id: string;
  awarded_bid_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { tender_id, awarded_bid_id }: NotificationRequest = await req.json();

    // Fetch tender details
    const { data: tender, error: tenderError } = await supabase
      .from('tenders')
      .select('title, issuer_company_id')
      .eq('id', tender_id)
      .single();

    if (tenderError) throw tenderError;

    // Fetch all bids for this tender
    const { data: bids, error: bidsError } = await supabase
      .from('tender_bids')
      .select(`
        id, bidder_company_id, bid_amount_fcfa,
        companies(company_name, contact_person_email, contact_person_name)
      `)
      .eq('tender_id', tender_id);

    if (bidsError) throw bidsError;

    const notifications = [];

    // Process each bid
    for (const bid of bids) {
      const isWinner = bid.id === awarded_bid_id;
      const status = isWinner ? 'awarded' : 'rejected';
      
      // Create notification record
      const notificationData = {
        user_id: null, // Will be updated when we have user mapping
        title: isWinner ? 'Congratulations! Bid Awarded' : 'Bid Update',
        message: isWinner 
          ? `Your bid for "${tender.title}" has been awarded! Amount: ${bid.bid_amount_fcfa.toLocaleString()} FCFA`
          : `Your bid for "${tender.title}" was not selected. Thank you for your participation.`,
        notification_type: 'bid_result',
        data: {
          tender_id,
          bid_id: bid.id,
          status,
          amount: bid.bid_amount_fcfa
        },
        priority: isWinner ? 'high' : 'medium'
      };

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }

      notifications.push({
        company: bid.companies?.company_name,
        email: bid.companies?.contact_person_email,
        status,
        amount: bid.bid_amount_fcfa
      });
    }

    // Log the award action
    const { error: auditError } = await supabase
      .from('tender_audit_logs')
      .insert({
        tender_id,
        action_type: 'bid_awarded',
        action_description: `Bid ${awarded_bid_id} was awarded for tender "${tender.title}"`,
        performed_by: null, // Will be set when auth context is available
        metadata: {
          awarded_bid_id,
          total_bids: bids.length,
          notifications_sent: notifications.length
        }
      });

    if (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    console.log('Award notifications processed:', {
      tender_id,
      awarded_bid_id,
      total_notifications: notifications.length,
      notifications
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Award notifications sent successfully',
        notifications_sent: notifications.length,
        details: notifications
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-award-notifications:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);