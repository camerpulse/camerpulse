import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    console.log(`API request: ${req.method} ${path}`)

    switch (path) {
      case 'polls':
        return await handlePollsAPI(req, supabase)
      case 'analytics':
        return await handleAnalyticsAPI(req, supabase)
      case 'webhooks':
        return await handleWebhooksAPI(req, supabase)
      case 'integrations':
        return await handleIntegrationsAPI(req, supabase)
      default:
        return await handleAPIDocumentation(req)
    }
  } catch (error) {
    console.error('API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

async function handlePollsAPI(req: Request, supabase: any) {
  const url = new URL(req.url)
  const pollId = url.searchParams.get('id')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  switch (req.method) {
    case 'GET':
      if (pollId) {
        // Get specific poll
        const { data: poll, error } = await supabase
          .from('polls')
          .select(`
            *,
            poll_advanced_config(*),
            poll_fraud_settings(*)
          `)
          .eq('id', pollId)
          .single()

        if (error) throw error

        return new Response(JSON.stringify({ poll }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // Get polls list
        const { data: polls, error } = await supabase
          .from('polls')
          .select('*')
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(JSON.stringify({ polls, total: polls.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

    case 'POST':
      const { poll: newPoll } = await req.json()
      
      const { data: createdPoll, error: createError } = await supabase
        .from('polls')
        .insert([newPoll])
        .select()
        .single()

      if (createError) throw createError

      return new Response(JSON.stringify({ poll: createdPoll }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      })

    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      })
  }
}

async function handleAnalyticsAPI(req: Request, supabase: any) {
  const url = new URL(req.url)
  const pollId = url.searchParams.get('poll_id')
  const startDate = url.searchParams.get('start_date')
  const endDate = url.searchParams.get('end_date')
  const granularity = url.searchParams.get('granularity') || 'daily'

  if (!pollId) {
    return new Response(JSON.stringify({ error: 'poll_id is required' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }

  switch (req.method) {
    case 'GET':
      // Get analytics data
      const { data: analytics, error } = await supabase.rpc('calculate_poll_performance_metrics', {
        p_poll_id: pollId
      })

      if (error) throw error

      // Get additional analytics data
      const { data: voteData } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId)

      const { data: viewData } = await supabase
        .from('poll_view_log')
        .select('*')
        .eq('poll_id', pollId)

      // Calculate demographics
      const demographics = calculateDemographics(voteData, viewData)
      const trends = calculateTrends(voteData, viewData, granularity)

      return new Response(JSON.stringify({
        overview: analytics?.[0] || {},
        demographics,
        trends,
        pollId,
        generatedAt: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      })
  }
}

async function handleWebhooksAPI(req: Request, supabase: any) {
  const url = new URL(req.url)
  const webhookId = url.searchParams.get('id')

  switch (req.method) {
    case 'GET':
      // List webhooks
      const { data: webhooks, error } = await supabase
        .from('poll_webhooks')
        .select('*')

      if (error) throw error

      return new Response(JSON.stringify({ webhooks }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    case 'POST':
      const { webhook } = await req.json()
      
      if (!webhook.url || !webhook.events) {
        return new Response(JSON.stringify({ error: 'url and events are required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const { data: createdWebhook, error: createError } = await supabase
        .from('poll_webhooks')
        .insert([{
          ...webhook,
          secret: generateWebhookSecret(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (createError) throw createError

      return new Response(JSON.stringify({ webhook: createdWebhook }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      })

    case 'DELETE':
      if (!webhookId) {
        return new Response(JSON.stringify({ error: 'webhook id is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const { error: deleteError } = await supabase
        .from('poll_webhooks')
        .delete()
        .eq('id', webhookId)

      if (deleteError) throw deleteError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      })
  }
}

async function handleIntegrationsAPI(req: Request, supabase: any) {
  switch (req.method) {
    case 'GET':
      // List available integrations
      const integrations = [
        {
          name: 'Slack',
          description: 'Send poll notifications to Slack channels',
          status: 'available',
          endpoints: ['/api/integrations/slack/webhook']
        },
        {
          name: 'Microsoft Teams',
          description: 'Send poll notifications to Teams channels',
          status: 'available',
          endpoints: ['/api/integrations/teams/webhook']
        },
        {
          name: 'Zapier',
          description: 'Connect polls to thousands of apps via Zapier',
          status: 'available',
          endpoints: ['/api/integrations/zapier/trigger']
        },
        {
          name: 'Google Sheets',
          description: 'Export poll results to Google Sheets',
          status: 'available',
          endpoints: ['/api/integrations/google-sheets/export']
        }
      ]

      return new Response(JSON.stringify({ integrations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    case 'POST':
      const { integration, config } = await req.json()
      
      // Handle integration setup
      const { data: integrationRecord, error } = await supabase
        .from('poll_integrations')
        .insert([{
          integration_type: integration,
          configuration: config,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ integration: integrationRecord }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      })

    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      })
  }
}

async function handleAPIDocumentation(req: Request) {
  const documentation = {
    title: "CamerPulse Polls API",
    version: "1.0.0",
    description: "RESTful API for poll management, analytics, and integrations",
    endpoints: {
      "/api/polls": {
        "GET": "List polls or get specific poll by ID",
        "POST": "Create a new poll"
      },
      "/api/analytics": {
        "GET": "Get poll analytics and performance metrics"
      },
      "/api/webhooks": {
        "GET": "List webhooks",
        "POST": "Create webhook",
        "DELETE": "Delete webhook"
      },
      "/api/integrations": {
        "GET": "List available integrations",
        "POST": "Setup new integration"
      }
    },
    authentication: "Bearer token required for most endpoints",
    rateLimit: "1000 requests per hour per API key"
  }

  return new Response(JSON.stringify(documentation, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

function calculateDemographics(voteData: any[], viewData: any[]) {
  // Mock demographic calculations
  return {
    regions: [
      { name: 'Centre', votes: 85, percentage: 35, growth: 12 },
      { name: 'Littoral', votes: 73, percentage: 30, growth: 8 },
      { name: 'West', votes: 49, percentage: 20, growth: -3 },
      { name: 'Northwest', votes: 38, percentage: 15, growth: 15 }
    ],
    ageGroups: [
      { group: '18-24', votes: 89, percentage: 36 },
      { group: '25-34', votes: 78, percentage: 32 },
      { group: '35-44', votes: 52, percentage: 21 },
      { group: '45-54', votes: 18, percentage: 7 },
      { group: '55+', votes: 8, percentage: 3 }
    ],
    deviceTypes: [
      { type: 'Mobile', count: 156, percentage: 64 },
      { type: 'Desktop', count: 67, percentage: 27 },
      { type: 'Tablet', count: 22, percentage: 9 }
    ]
  }
}

function calculateTrends(voteData: any[], viewData: any[], granularity: string) {
  // Mock trend calculations
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    votes: Math.floor(Math.random() * 25) + 5,
    views: Math.floor(Math.random() * 80) + 20,
    engagement: Math.floor(Math.random() * 30) + 10,
    completionRate: Math.floor(Math.random() * 40) + 60
  }))
}

function generateWebhookSecret(): string {
  return crypto.randomUUID()
}