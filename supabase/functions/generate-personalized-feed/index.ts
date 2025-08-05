import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedItem {
  id: string;
  content_type: string;
  content_id: string;
  score: number;
  content: any;
  region?: string;
  created_at: string;
}

interface UserPreferences {
  civic_content_weight: number;
  entertainment_weight: number;
  job_content_weight: number;
  artist_content_weight: number;
  local_content_preference: number;
  political_engagement_level: string;
  preferred_regions: string[];
  blocked_topics: string[];
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FEED-ALGORITHM] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Feed generation started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    const { limit = 20, offset = 0, session_id } = await req.json();

    // Get user preferences
    let { data: preferences, error: prefError } = await supabaseClient
      .from('user_feed_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (prefError || !preferences) {
      // Create default preferences
      logStep("Creating default preferences for user");
      const { data: newPrefs, error: createError } = await supabaseClient
        .from('user_feed_preferences')
        .insert({
          user_id: user.id,
          civic_content_weight: 0.4,
          entertainment_weight: 0.3,
          job_content_weight: 0.2,
          artist_content_weight: 0.1,
          local_content_preference: 0.7,
          political_engagement_level: 'moderate'
        })
        .select()
        .single();

      if (createError) {
        logStep("Error creating preferences", createError);
        // Use defaults if creation fails
        preferences = {
          civic_content_weight: 0.4,
          entertainment_weight: 0.3,
          job_content_weight: 0.2,
          artist_content_weight: 0.1,
          local_content_preference: 0.7,
          political_engagement_level: 'moderate',
          preferred_regions: [],
          blocked_topics: []
        };
      } else {
        preferences = newPrefs;
      }
    }

    logStep("User preferences loaded", preferences);

    // Get user profile for region info
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('location')
      .eq('user_id', user.id)
      .single();

    const userRegion = profile?.location || null;
    logStep("User region identified", { region: userRegion });

    // Get civic events for time-sensitive content boost
    const { data: civicEvents } = await supabaseClient
      .from('civic_events_calendar')
      .select('*')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .lte('event_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const hasActiveCivicEvents = civicEvents && civicEvents.length > 0;
    logStep("Civic events check", { hasActiveCivicEvents, eventCount: civicEvents?.length || 0 });

    // Generate personalized feed
    const feedItems: FeedItem[] = [];

    // 1. Get Pulse/Political content (civic relevance high)
    try {
      const { data: pulseItems } = await supabaseClient
        .from('feed_items')
        .select(`
          *,
          content:pulse_posts(*)
        `)
        .eq('content_type', 'pulse')
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit * preferences.civic_content_weight));

      if (pulseItems) {
        for (const item of pulseItems) {
          const score = await calculateContentScore(supabaseClient, {
            content_id: item.content_id,
            content_type: 'pulse',
            user_region: userRegion,
            user_id: user.id,
            preferences,
            civic_boost: hasActiveCivicEvents ? 1.2 : 1.0
          });

          feedItems.push({
            id: item.id,
            content_type: 'pulse',
            content_id: item.content_id,
            score,
            content: item.content,
            region: userRegion,
            created_at: item.created_at
          });
        }
      }
    } catch (error) {
      logStep("Error fetching pulse content", error);
    }

    // 2. Get Job content (if user interested)
    if (preferences.job_content_weight > 0) {
      try {
        const { data: jobItems } = await supabaseClient
          .from('jobs')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(Math.ceil(limit * preferences.job_content_weight));

        if (jobItems) {
          for (const job of jobItems) {
            const score = await calculateContentScore(supabaseClient, {
              content_id: job.id,
              content_type: 'job',
              user_region: userRegion,
              user_id: user.id,
              preferences,
              civic_boost: 1.0
            });

            feedItems.push({
              id: `job-${job.id}`,
              content_type: 'job',
              content_id: job.id,
              score,
              content: job,
              region: job.location,
              created_at: job.created_at
            });
          }
        }
      } catch (error) {
        logStep("Error fetching job content", error);
      }
    }

    // 3. Get Artist content (entertainment)
    if (preferences.artist_content_weight > 0) {
      try {
        const { data: artistItems } = await supabaseClient
          .from('artist_memberships')
          .select('*')
          .eq('membership_active', true)
          .order('created_at', { ascending: false })
          .limit(Math.ceil(limit * preferences.artist_content_weight));

        if (artistItems) {
          for (const artist of artistItems) {
            const score = await calculateContentScore(supabaseClient, {
              content_id: artist.id,
              content_type: 'artist_content',
              user_region: userRegion,
              user_id: user.id,
              preferences,
              civic_boost: 1.0
            });

            feedItems.push({
              id: `artist-${artist.id}`,
              content_type: 'artist_content',
              content_id: artist.id,
              score,
              content: artist,
              region: userRegion,
              created_at: artist.created_at
            });
          }
        }
      } catch (error) {
        logStep("Error fetching artist content", error);
      }
    }

    // Sort by score and apply diversity
    feedItems.sort((a, b) => b.score - a.score);

    // Apply content diversity rules
    const diversifiedFeed = applyContentDiversity(feedItems, preferences);
    logStep("Content diversity applied", { originalCount: feedItems.length, diversifiedCount: diversifiedFeed.length });

    // Apply pagination
    const paginatedFeed = diversifiedFeed.slice(offset, offset + limit);

    // Track diversity for this session
    if (session_id) {
      await trackContentDiversity(supabaseClient, user.id, session_id, paginatedFeed);
    }

    // Log successful feed generation
    logStep("Feed generated successfully", { 
      totalItems: paginatedFeed.length,
      avgScore: paginatedFeed.reduce((sum, item) => sum + item.score, 0) / paginatedFeed.length,
      contentTypes: [...new Set(paginatedFeed.map(item => item.content_type))]
    });

    return new Response(JSON.stringify({
      feed: paginatedFeed,
      total_count: diversifiedFeed.length,
      user_preferences: preferences,
      civic_events_active: hasActiveCivicEvents
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-personalized-feed", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function calculateContentScore(
  supabaseClient: any,
  params: {
    content_id: string;
    content_type: string;
    user_region: string | null;
    user_id: string;
    preferences: UserPreferences;
    civic_boost: number;
  }
): Promise<number> {
  const { content_id, content_type, user_region, user_id, preferences, civic_boost } = params;

  // Base civic relevance
  let civicScore = 0.0;
  switch (content_type) {
    case 'political_update': civicScore = 0.9; break;
    case 'pulse': civicScore = 0.6; break;
    case 'job': civicScore = 0.4; break;
    case 'artist_content': civicScore = 0.2; break;
    default: civicScore = 0.3;
  }

  // Geographic relevance
  const geoScore = user_region ? 0.8 : 0.4;

  // Time sensitivity with civic events boost
  const timeScore = 0.3 * civic_boost;

  // Authenticity score (placeholder - could be enhanced with verification data)
  const authScore = 0.5;

  // Personal engagement prediction based on past interactions
  let engagementScore = 0.5;
  try {
    const { data: interactions } = await supabaseClient
      .from('feed_interactions')
      .select('engagement_quality')
      .eq('user_id', user_id)
      .eq('content_type', content_type)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (interactions && interactions.length > 0) {
      engagementScore = interactions.reduce((sum: number, int: any) => sum + (int.engagement_quality || 0), 0) / interactions.length;
    }
  } catch (error) {
    console.log("Error calculating engagement score:", error);
  }

  // User preference weights
  let contentWeight = 1.0;
  switch (content_type) {
    case 'pulse':
    case 'political_update':
      contentWeight = preferences.civic_content_weight;
      break;
    case 'job':
      contentWeight = preferences.job_content_weight;
      break;
    case 'artist_content':
      contentWeight = preferences.artist_content_weight;
      break;
  }

  // Calculate weighted total score
  const baseScore = (civicScore * 0.3) + (geoScore * 0.25) + (timeScore * 0.2) + (authScore * 0.15) + (engagementScore * 0.1);
  const finalScore = Math.min(1.0, baseScore * contentWeight);

  return finalScore;
}

function applyContentDiversity(items: FeedItem[], preferences: UserPreferences): FeedItem[] {
  const diversified: FeedItem[] = [];
  const typeCounters: { [key: string]: number } = {};
  const maxPerType = Math.ceil(items.length * 0.4); // Max 40% of any single content type

  // Sort by score first
  const sorted = [...items].sort((a, b) => b.score - a.score);

  for (const item of sorted) {
    const currentCount = typeCounters[item.content_type] || 0;
    
    // Allow item if we haven't exceeded the diversity limit for this type
    if (currentCount < maxPerType) {
      diversified.push(item);
      typeCounters[item.content_type] = currentCount + 1;
    }
  }

  return diversified;
}

async function trackContentDiversity(
  supabaseClient: any,
  userId: string,
  sessionId: string,
  feedItems: FeedItem[]
): Promise<void> {
  try {
    const contentCounts = feedItems.reduce((acc: any, item) => {
      switch (item.content_type) {
        case 'pulse':
        case 'political_update':
          acc.civic_content_shown += 1;
          break;
        case 'job':
          acc.job_content_shown += 1;
          break;
        case 'artist_content':
          acc.entertainment_content_shown += 1;
          break;
        default:
          acc.entertainment_content_shown += 1;
      }
      return acc;
    }, {
      civic_content_shown: 0,
      entertainment_content_shown: 0,
      job_content_shown: 0,
      artist_content_shown: 0
    });

    const regions = [...new Set(feedItems.map(item => item.region).filter(Boolean))];

    await supabaseClient
      .from('feed_diversity_tracking')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        ...contentCounts,
        regions_shown: regions,
        political_viewpoints_shown: [], // Could be enhanced with sentiment analysis
      }, { onConflict: 'user_id,session_id' });

  } catch (error) {
    console.log("Error tracking diversity:", error);
  }
}