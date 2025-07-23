import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Running deadline reminder job...');

    // Get current time and 24 hours from now
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    // Find tenders with deadlines approaching
    const { data: upcomingTenders, error: tendersError } = await supabase
      .from('tenders')
      .select(`
        id,
        title,
        deadline,
        published_by_user_id,
        bids!inner(*)
      `)
      .eq('status', 'open')
      .gte('deadline', now.toISOString())
      .lte('deadline', tomorrow.toISOString());

    if (tendersError) {
      console.error('Error fetching tenders:', tendersError);
      throw tendersError;
    }

    console.log(`Found ${upcomingTenders?.length || 0} tenders with approaching deadlines`);

    const notifications = [];

    for (const tender of upcomingTenders || []) {
      const deadline = new Date(tender.deadline);
      const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Send different notifications based on time remaining
      let notificationType = '';
      let title = '';
      let message = '';

      if (hoursUntilDeadline <= 3) {
        notificationType = 'deadline_critical';
        title = `🚨 URGENT: Tender deadline in ${Math.round(hoursUntilDeadline)} hours`;
        message = `The tender "${tender.title}" deadline is approaching in ${Math.round(hoursUntilDeadline)} hours. Submit your bid now to avoid missing out!`;
      } else if (hoursUntilDeadline <= 24) {
        notificationType = 'deadline_24h';
        title = `⏰ Tender deadline tomorrow`;
        message = `The tender "${tender.title}" deadline is tomorrow at ${deadline.toLocaleString()}. Make sure to complete your bid submission.`;
      }

      if (notificationType) {
        // Get all users who have active bids for this tender
        const { data: bidders, error: biddersError } = await supabase
          .from('bids')
          .select('company_id, users!inner(*)')
          .eq('tender_id', tender.id)
          .in('status', ['draft', 'submitted']);

        if (biddersError) {
          console.error('Error fetching bidders:', biddersError);
          continue;
        }

        // Check if we've already sent this type of notification
        for (const bidder of bidders || []) {
          const { data: existingNotification } = await supabase
            .from('bid_notifications')
            .select('id')
            .eq('tender_id', tender.id)
            .eq('user_id', bidder.users.id)
            .eq('notification_type', notificationType)
            .single();

          if (!existingNotification) {
            // Create notification tracking record
            const { error: trackingError } = await supabase
              .from('bid_notifications')
              .insert({
                bid_id: crypto.randomUUID(),
                user_id: bidder.users.id,
                tender_id: tender.id,
                notification_type: notificationType,
                scheduled_for: now.toISOString()
              });

            if (trackingError) {
              console.error('Error creating tracking record:', trackingError);
              continue;
            }

            // Send notification
            notifications.push({
              type: 'deadline_reminder',
              userId: bidder.users.id,
              tenderId: tender.id,
              title,
              message,
              data: {
                deadline: tender.deadline,
                hoursRemaining: Math.round(hoursUntilDeadline),
                actionUrl: `${supabaseUrl}/tenders/${tender.id}`
              }
            });
          }
        }
      }
    }

    // Send all notifications
    let successCount = 0;
    let errorCount = 0;

    for (const notification of notifications) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-bid-notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify(notification)
        });

        if (response.ok) {
          successCount++;
          console.log(`Sent notification to user ${notification.userId}`);
        } else {
          errorCount++;
          console.error(`Failed to send notification to user ${notification.userId}`);
        }
      } catch (error) {
        errorCount++;
        console.error('Error sending notification:', error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      processedTenders: upcomingTenders?.length || 0,
      notificationsSent: successCount,
      errors: errorCount,
      message: `Processed ${upcomingTenders?.length || 0} tenders, sent ${successCount} notifications with ${errorCount} errors`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in deadline reminder job:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);