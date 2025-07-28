import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  limit?: number;
  offset?: number;
  session_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { limit = 20, offset = 0, session_id }: RequestBody = await req.json();

    console.log('Generating personalized feed', { limit, offset, session_id });

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user && !error) {
        userId = user.id;
      }
    }

    console.log('User ID:', userId);

    // Generate a diverse feed with different content types
    const feedItems = [];

    // Get latest pulse posts
    const { data: pulses } = await supabase
      .from('profile_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit * 0.4));

    if (pulses) {
      pulses.forEach(pulse => {
        feedItems.push({
          id: pulse.id,
          type: 'pulse',
          content: pulse.content,
          created_at: pulse.created_at,
          user_id: pulse.user_id,
          score: 0.8 + Math.random() * 0.2
        });
      });
    }

    // Get civic updates (government officials)
    const { data: officials } = await supabase
      .from('government_officials')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit * 0.3));

    if (officials) {
      officials.forEach(official => {
        feedItems.push({
          id: official.id,
          type: 'political_update',
          content: `Update from ${official.name} - ${official.position}`,
          created_at: official.created_at,
          official_data: official,
          score: 0.9 + Math.random() * 0.1
        });
      });
    }

    // Add some sample content if we don't have enough
    if (feedItems.length < limit) {
      const sampleContent = [
        {
          id: `sample-${Date.now()}-1`,
          type: 'civic_announcement',
          content: 'Welcome to CamerPulse - Your civic engagement platform',
          created_at: new Date().toISOString(),
          score: 0.7
        },
        {
          id: `sample-${Date.now()}-2`,
          type: 'community_update',
          content: 'Join the conversation about improving our communities',
          created_at: new Date().toISOString(),
          score: 0.6
        }
      ];

      feedItems.push(...sampleContent);
    }

    // Sort by score and creation time
    feedItems.sort((a, b) => {
      const scoreCompare = b.score - a.score;
      if (scoreCompare !== 0) return scoreCompare;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Apply pagination
    const paginatedItems = feedItems.slice(offset, offset + limit);

    console.log(`Generated ${paginatedItems.length} feed items`);

    return new Response(
      JSON.stringify({
        success: true,
        data: paginatedItems,
        pagination: {
          offset,
          limit,
          total: feedItems.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating personalized feed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate personalized feed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});