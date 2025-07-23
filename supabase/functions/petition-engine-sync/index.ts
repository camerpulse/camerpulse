import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PetitionData {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: string;
  deadline?: string;
  url?: string;
}

interface PetitionRequest {
  action: 'sync' | 'create' | 'link';
  tender_id?: string;
  petition_id?: string;
  petition_data?: {
    title: string;
    description: string;
    connection_type: 'related' | 'complaint' | 'support';
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, tender_id, petition_id, petition_data }: PetitionRequest = await req.json()

    console.log(`Petition Engine: Processing ${action} request`, { tender_id, petition_id })

    switch (action) {
      case 'sync':
        if (!petition_id) {
          throw new Error('Petition ID required for sync action')
        }
        
        // Simulate fetching petition data from external API
        // In real implementation, this would call the actual petition platform API
        const mockPetitionData: PetitionData = {
          id: petition_id,
          title: `Petition #${petition_id}`,
          description: "Sample petition description from external platform",
          votes: Math.floor(Math.random() * 1000) + 100,
          status: ['active', 'completed', 'expired'][Math.floor(Math.random() * 3)],
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          url: `https://petition-platform.com/petitions/${petition_id}`
        }

        // Update petition connection with latest data
        const { error: syncError } = await supabaseClient
          .from('petition_connections')
          .update({
            petition_title: mockPetitionData.title,
            petition_description: mockPetitionData.description,
            petition_votes: mockPetitionData.votes,
            petition_status: mockPetitionData.status,
            petition_deadline: mockPetitionData.deadline,
            petition_url: mockPetitionData.url,
            last_synced_at: new Date().toISOString()
          })
          .eq('petition_id', petition_id)

        if (syncError) {
          console.error('Error syncing petition data:', syncError)
          throw syncError
        }

        // Check for vote milestones and create alerts
        const milestones = [100, 500, 1000, 5000, 10000]
        const nextMilestone = milestones.find(m => m > mockPetitionData.votes - 50 && m <= mockPetitionData.votes)
        
        if (nextMilestone) {
          const { data: connections } = await supabaseClient
            .from('petition_connections')
            .select('id')
            .eq('petition_id', petition_id)

          for (const connection of connections || []) {
            await supabaseClient
              .from('petition_alerts')
              .insert({
                petition_connection_id: connection.id,
                alert_type: 'vote_milestone',
                alert_title: `Petition reached ${nextMilestone} votes!`,
                alert_message: `The petition "${mockPetitionData.title}" has reached ${mockPetitionData.votes} votes.`,
                votes_threshold: nextMilestone
              })
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            action: 'sync',
            petition_data: mockPetitionData,
            alerts_created: nextMilestone ? 1 : 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create':
        if (!tender_id || !petition_data) {
          throw new Error('Tender ID and petition data required for create action')
        }

        // Simulate creating a petition on external platform
        const newPetitionId = `PTN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // In real implementation, this would call the petition platform API to create the petition
        console.log('Creating petition on external platform:', petition_data)

        const { data: newConnection, error: createError } = await supabaseClient
          .from('petition_connections')
          .insert({
            tender_id: tender_id,
            petition_id: newPetitionId,
            petition_title: petition_data.title,
            petition_description: petition_data.description,
            petition_status: 'active',
            petition_votes: 0,
            connection_type: petition_data.connection_type,
            auto_created: true,
            petition_url: `https://petition-platform.com/petitions/${newPetitionId}`
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating petition connection:', createError)
          throw createError
        }

        return new Response(
          JSON.stringify({
            success: true,
            action: 'create',
            petition_id: newPetitionId,
            connection: newConnection
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'link':
        if (!tender_id || !petition_id) {
          throw new Error('Tender ID and petition ID required for link action')
        }

        // Fetch petition data first
        const petitionData: PetitionData = {
          id: petition_id,
          title: `Existing Petition #${petition_id}`,
          description: "Linked from existing petition platform",
          votes: Math.floor(Math.random() * 500) + 50,
          status: 'active',
          url: `https://petition-platform.com/petitions/${petition_id}`
        }

        const { data: linkConnection, error: linkError } = await supabaseClient
          .from('petition_connections')
          .insert({
            tender_id: tender_id,
            petition_id: petition_id,
            petition_title: petitionData.title,
            petition_description: petitionData.description,
            petition_status: petitionData.status,
            petition_votes: petitionData.votes,
            petition_url: petitionData.url,
            connection_type: 'related',
            auto_created: false
          })
          .select()
          .single()

        if (linkError) {
          console.error('Error linking petition:', linkError)
          throw linkError
        }

        return new Response(
          JSON.stringify({
            success: true,
            action: 'link',
            connection: linkConnection
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Petition Engine Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})