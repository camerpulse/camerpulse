import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TenderStatusUpdate {
  id: string;
  title: string;
  status: string;
  deadline: string;
  bids_count: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting automatic tender status updates...')

    const now = new Date().toISOString()
    
    // Find tenders that should be closed (deadline passed)
    const { data: expiredTenders, error: fetchError } = await supabase
      .from('tenders')
      .select('id, title, status, deadline, bids_count')
      .eq('status', 'open')
      .lt('deadline', now)

    if (fetchError) {
      console.error('Error fetching expired tenders:', fetchError)
      throw fetchError
    }

    console.log(`Found ${expiredTenders?.length || 0} expired tenders`)

    const updatedTenders: TenderStatusUpdate[] = []

    if (expiredTenders && expiredTenders.length > 0) {
      for (const tender of expiredTenders) {
        // Update tender status based on bid count
        const newStatus = tender.bids_count > 0 ? 'under_review' : 'closed_no_bids'
        
        const { error: updateError } = await supabase
          .from('tenders')
          .update({ 
            status: newStatus,
            closed_at: now,
            auto_closed: true
          })
          .eq('id', tender.id)

        if (updateError) {
          console.error(`Error updating tender ${tender.id}:`, updateError)
          continue
        }

        updatedTenders.push({
          id: tender.id,
          title: tender.title,
          status: newStatus,
          deadline: tender.deadline,
          bids_count: tender.bids_count
        })

        console.log(`Updated tender ${tender.id} (${tender.title}) to status: ${newStatus}`)

        // Log the automatic status change
        await supabase.from('tender_activity_log').insert({
          tender_id: tender.id,
          activity_type: 'status_change',
          description: `Automatically closed due to deadline. New status: ${newStatus}`,
          metadata: {
            old_status: 'open',
            new_status: newStatus,
            bids_received: tender.bids_count,
            auto_closure: true
          }
        })
      }
    }

    // Check for tenders approaching deadline (24 hours)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    const { data: soonToExpire, error: soonError } = await supabase
      .from('tenders')
      .select('id, title, deadline')
      .eq('status', 'open')
      .gte('deadline', now)
      .lte('deadline', tomorrow)

    if (soonError) {
      console.error('Error fetching soon-to-expire tenders:', soonError)
    } else if (soonToExpire && soonToExpire.length > 0) {
      console.log(`Found ${soonToExpire.length} tenders expiring within 24 hours`)
      
      // Send deadline reminders (would typically integrate with notification system)
      for (const tender of soonToExpire) {
        await supabase.from('tender_activity_log').insert({
          tender_id: tender.id,
          activity_type: 'deadline_reminder',
          description: 'Tender deadline approaching within 24 hours',
          metadata: {
            deadline: tender.deadline,
            hours_remaining: Math.round((new Date(tender.deadline).getTime() - Date.now()) / (1000 * 60 * 60))
          }
        })
      }
    }

    const result = {
      success: true,
      message: 'Tender status updates completed',
      updated_count: updatedTenders.length,
      approaching_deadline_count: soonToExpire?.length || 0,
      updated_tenders: updatedTenders,
      timestamp: now
    }

    console.log('Tender status update completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in tender status updater:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})