import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecommendationRequest {
  user_id: string;
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

    const { user_id }: RecommendationRequest = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating recommendations for user: ${user_id}`);

    // 1. Get user preferences
    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // 2. Get user's recent activity
    const { data: recentActivity } = await supabaseClient
      .from('village_analytics')
      .select('village_id, event_type, event_data, created_at')
      .eq('user_id', user_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    // 3. Get villages user hasn't visited recently
    const visitedVillageIds = [...new Set(recentActivity?.map(a => a.village_id).filter(Boolean) || [])];
    
    const { data: allVillages } = await supabaseClient
      .from('villages')
      .select('*')
      .not('id', 'in', `(${visitedVillageIds.join(',') || 'NULL'})`)
      .limit(50);

    if (!allVillages || allVillages.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No new villages to recommend' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Generate recommendations
    const recommendations = [];

    // Algorithm 1: Similar interests based on preferences
    if (preferences?.interests && preferences.interests.length > 0) {
      const similarVillages = allVillages.filter(village => {
        return preferences.interests.some(interest => 
          village.description?.toLowerCase().includes(interest.toLowerCase()) ||
          village.name?.toLowerCase().includes(interest.toLowerCase())
        );
      }).slice(0, 3);

      for (const village of similarVillages) {
        recommendations.push({
          village_id: village.id,
          recommendation_type: 'similar_interests',
          confidence_score: 0.8 + Math.random() * 0.2,
          reason: `Based on your interest in ${preferences.interests.join(', ')}`,
          metadata: { algorithm: 'interest_matching', interests: preferences.interests }
        });
      }
    }

    // Algorithm 2: Popular in preferred regions
    if (preferences?.preferred_regions && preferences.preferred_regions.length > 0) {
      const regionalVillages = allVillages.filter(village => 
        preferences.preferred_regions.includes(village.region)
      ).slice(0, 3);

      for (const village of regionalVillages) {
        recommendations.push({
          village_id: village.id,
          recommendation_type: 'popular_in_region',
          confidence_score: 0.7 + Math.random() * 0.2,
          reason: `Popular village in ${village.region}, one of your preferred regions`,
          metadata: { algorithm: 'regional_preference', region: village.region }
        });
      }
    }

    // Algorithm 3: Trending villages (most visits in last 7 days)
    const { data: trendingData } = await supabaseClient
      .from('village_analytics')
      .select('village_id')
      .eq('event_type', 'village_view')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (trendingData) {
      const villageViewCounts = trendingData.reduce((acc: Record<string, number>, curr) => {
        acc[curr.village_id] = (acc[curr.village_id] || 0) + 1;
        return acc;
      }, {});

      const trendingVillageIds = Object.entries(villageViewCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([id]) => id);

      const trendingVillages = allVillages.filter(v => trendingVillageIds.includes(v.id));

      for (const village of trendingVillages) {
        recommendations.push({
          village_id: village.id,
          recommendation_type: 'trending',
          confidence_score: 0.6 + Math.random() * 0.3,
          reason: `Trending village with ${villageViewCounts[village.id]} recent visits`,
          metadata: { algorithm: 'trending', visit_count: villageViewCounts[village.id] }
        });
      }
    }

    // Algorithm 4: Random discovery for low-activity users
    if (recommendations.length < 3) {
      const randomVillages = allVillages
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - recommendations.length);

      for (const village of randomVillages) {
        recommendations.push({
          village_id: village.id,
          recommendation_type: 'discovery',
          confidence_score: 0.4 + Math.random() * 0.3,
          reason: 'Discover something new in Cameroon',
          metadata: { algorithm: 'random_discovery' }
        });
      }
    }

    // 5. Save recommendations to database
    const recommendationsToInsert = recommendations
      .slice(0, 8) // Limit to 8 recommendations
      .map(rec => ({
        user_id,
        ...rec,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Expire in 7 days
      }));

    // Delete old recommendations first
    await supabaseClient
      .from('village_recommendations')
      .delete()
      .eq('user_id', user_id)
      .or('expires_at.lt.now(),is_dismissed.eq.true');

    // Insert new recommendations
    const { error: insertError } = await supabaseClient
      .from('village_recommendations')
      .insert(recommendationsToInsert);

    if (insertError) {
      console.error('Error inserting recommendations:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save recommendations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generated ${recommendationsToInsert.length} recommendations for user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations_count: recommendationsToInsert.length,
        message: 'Recommendations generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-village-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});