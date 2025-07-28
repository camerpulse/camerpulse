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
    const { limit = 20, offset = 0, session_id } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get authentication header
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: ''
      })
    }

    // Generate personalized feed content
    const feedItems = []

    // Fetch recent political updates
    const { data: politicalUpdates } = await supabase
      .from('political_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit * 0.3))

    if (politicalUpdates) {
      feedItems.push(...politicalUpdates.map(item => ({
        ...item,
        content_type: 'political_update',
        priority: 0.9
      })))
    }

    // Fetch recent pulse posts
    const { data: pulsePosts } = await supabase
      .from('profile_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit * 0.4))

    if (pulsePosts) {
      feedItems.push(...pulsePosts.map(item => ({
        ...item,
        content_type: 'pulse',
        priority: 0.7
      })))
    }

    // Fetch recent jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit * 0.2))

    if (jobs) {
      feedItems.push(...jobs.map(item => ({
        ...item,
        content_type: 'job',
        priority: 0.6
      })))
    }

    // Fetch artist content if available
    const { data: artistPosts } = await supabase
      .from('artist_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit * 0.1))

    if (artistPosts) {
      feedItems.push(...artistPosts.map(item => ({
        ...item,
        content_type: 'artist_content',
        priority: 0.5
      })))
    }

    // Sort by priority and creation date
    const sortedFeed = feedItems
      .sort((a, b) => {
        // First sort by priority
        if (b.priority !== a.priority) {
          return b.priority - a.priority
        }
        // Then by creation date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .slice(offset, offset + limit)

    return new Response(
      JSON.stringify({
        success: true,
        data: sortedFeed,
        total: feedItems.length,
        limit,
        offset
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