import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Generate a basic feed - return sample content for now
    const feedItems = [
      {
        id: '1',
        type: 'civic_update',
        title: 'Welcome to CamerPulse',
        content: 'Your civic engagement platform is ready',
        created_at: new Date().toISOString(),
        score: 1.0
      },
      {
        id: '2', 
        type: 'marketplace',
        title: 'Marketplace Active',
        content: 'Browse local businesses and services',
        created_at: new Date().toISOString(),
        score: 0.8
      },
      {
        id: '3',
        type: 'logistics',
        title: 'Logistics Directory',
        content: 'Find trusted shipping companies like Cemac Track',
        created_at: new Date().toISOString(),
        score: 0.7
      }
    ];

    return new Response(
      JSON.stringify({
        success: true,
        data: feedItems,
        total: feedItems.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error generating personalized feed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: []
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})