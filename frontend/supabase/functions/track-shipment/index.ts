import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const trackingNumber = url.pathname.split('/').pop()

    if (!trackingNumber) {
      return new Response(
        JSON.stringify({ error: 'Tracking number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if tracking number exists in shipments table (fallback to existing table)
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from('shipments')
      .select(`
        id,
        tracking_number,
        status,
        sender_info,
        receiver_info,
        origin_address,
        destination_address,
        estimated_delivery_date,
        actual_delivery_date,
        created_at,
        updated_at
      `)
      .eq('tracking_number', trackingNumber)
      .single()

    if (shipmentError && shipmentError.code !== 'PGRST116') {
      throw shipmentError
    }

    // If no shipment found, create mock data for demo purposes
    if (!shipment) {
      // Generate mock shipment data
      const mockShipment = {
        tracking_number: trackingNumber,
        status: 'in_transit',
        sender_info: {
          name: 'Tech Solutions Ltd',
          address: 'Douala, Littoral Region, Cameroon',
          phone: '+237 6XX XXX XXX'
        },
        receiver_info: {
          name: 'Jane Doe',
          address: 'Yaoundé, Centre Region, Cameroon',
          phone: '+237 6XX XXX XXX'
        },
        delivery_type: 'Express Delivery',
        estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        last_scanned_location: {
          city: 'Douala',
          region: 'Littoral',
          timestamp: new Date().toISOString(),
          scanType: 'departure'
        },
        events: [
          {
            id: '1',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Douala Distribution Center',
            description: 'Package received at facility',
            status: 'in_transit'
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Douala Distribution Center',
            description: 'Package processed and sorted',
            status: 'in_transit'
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Douala Hub',
            description: 'Package loaded for transport',
            status: 'in_transit'
          },
          {
            id: '4',
            timestamp: new Date().toISOString(),
            location: 'Douala, Littoral',
            description: 'Package departed facility',
            status: 'in_transit'
          }
        ]
      }

      return new Response(
        JSON.stringify(mockShipment),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get tracking events from shipment_tracking_events table
    const { data: events, error: eventsError } = await supabaseClient
      .from('shipment_tracking_events')
      .select('*')
      .eq('shipment_id', shipment.id)
      .order('created_at', { ascending: true })

    // Combine shipment data with events
    const trackingData = {
      ...shipment,
      events: events || [],
      last_scanned_location: {
        city: 'Douala',
        region: 'Littoral',
        timestamp: new Date().toISOString(),
        scanType: 'processing'
      }
    }

    return new Response(
      JSON.stringify(trackingData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in tracking function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})