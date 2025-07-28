import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { tracking_number, event_type, location, description, metadata } = await req.json()

      if (!tracking_number || !event_type || !location || !description) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update last scanned location in shipment
      const locationParts = location.split(',')
      const lastScannedLocation = {
        city: locationParts[0]?.trim() || location,
        region: locationParts[1]?.trim() || '',
        timestamp: new Date().toISOString(),
        scanType: event_type === 'pickup' ? 'departure' : 
                  event_type === 'delivery' ? 'delivery_attempt' : 'processing'
      }

      // Try to update existing shipment or create new mock entry
      const { data: shipment, error: shipmentError } = await supabaseClient
        .from('shipments')
        .select('*')
        .eq('tracking_number', tracking_number)
        .single()

      if (shipment) {
        // Update existing shipment
        const newStatus = event_type === 'delivery' ? 'delivered' :
                         event_type === 'pickup' ? 'picked_up' :
                         event_type === 'exception' ? 'exception' : 'in_transit'

        await supabaseClient
          .from('shipments')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('tracking_number', tracking_number)
      }

      // Add tracking event to existing table (shipment_status_history)
      const { data: eventData, error: eventError } = await supabaseClient
        .from('shipment_status_history')
        .insert({
          shipment_id: shipment?.id,
          status: event_type,
          description: description,
          location: location,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (eventError) {
        console.error('Error creating tracking event:', eventError)
      }

      return new Response(
        JSON.stringify({
          success: true,
          tracking_number,
          event_type,
          location,
          description,
          timestamp: new Date().toISOString(),
          last_scanned_location: lastScannedLocation
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in update-tracking function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})