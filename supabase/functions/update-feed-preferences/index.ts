import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FEED-PREFERENCES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Feed preferences update started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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

    const {
      civic_content_weight,
      entertainment_weight,
      job_content_weight,
      artist_content_weight,
      local_content_preference,
      political_engagement_level,
      preferred_regions,
      blocked_topics
    } = await req.json();

    logStep("Preferences update requested", {
      userId: user.id,
      civic_content_weight,
      entertainment_weight,
      job_content_weight,
      artist_content_weight,
      local_content_preference,
      political_engagement_level
    });

    // Validate weight totals (should approximately sum to 1.0)
    const totalWeight = (civic_content_weight || 0) + (entertainment_weight || 0) + 
                       (job_content_weight || 0) + (artist_content_weight || 0);
    
    if (totalWeight > 1.2 || totalWeight < 0.8) {
      throw new Error("Content weights should sum to approximately 1.0");
    }

    // Validate engagement level
    const validEngagementLevels = ['low', 'moderate', 'high'];
    if (political_engagement_level && !validEngagementLevels.includes(political_engagement_level)) {
      throw new Error("Invalid political engagement level");
    }

    // Validate regions (Cameroon regions)
    const validRegions = [
      'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
      'North', 'Northwest', 'South', 'Southwest', 'West'
    ];
    
    if (preferred_regions && Array.isArray(preferred_regions)) {
      const invalidRegions = preferred_regions.filter(region => !validRegions.includes(region));
      if (invalidRegions.length > 0) {
        throw new Error(`Invalid regions: ${invalidRegions.join(', ')}`);
      }
    }

    // Prepare update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (civic_content_weight !== undefined) updateData.civic_content_weight = civic_content_weight;
    if (entertainment_weight !== undefined) updateData.entertainment_weight = entertainment_weight;
    if (job_content_weight !== undefined) updateData.job_content_weight = job_content_weight;
    if (artist_content_weight !== undefined) updateData.artist_content_weight = artist_content_weight;
    if (local_content_preference !== undefined) updateData.local_content_preference = local_content_preference;
    if (political_engagement_level !== undefined) updateData.political_engagement_level = political_engagement_level;
    if (preferred_regions !== undefined) updateData.preferred_regions = preferred_regions;
    if (blocked_topics !== undefined) updateData.blocked_topics = blocked_topics;

    logStep("Update data prepared", updateData);

    // Check if preferences exist
    const { data: existingPrefs } = await supabaseClient
      .from('user_feed_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingPrefs) {
      // Update existing preferences
      const { data, error } = await supabaseClient
        .from('user_feed_preferences')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update preferences: ${error.message}`);
      result = data;
      logStep("Preferences updated successfully");
    } else {
      // Create new preferences
      const { data, error } = await supabaseClient
        .from('user_feed_preferences')
        .insert({
          user_id: user.id,
          ...updateData
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create preferences: ${error.message}`);
      result = data;
      logStep("Preferences created successfully");
    }

    // Clear any existing diversity tracking to force fresh content in next feed
    await supabaseClient
      .from('feed_diversity_tracking')
      .delete()
      .eq('user_id', user.id);

    logStep("Diversity tracking cleared for fresh content");

    // Calculate new civic engagement score based on preferences
    const civicEngagementScore = calculateCivicEngagementScore(result);
    logStep("Civic engagement score calculated", { score: civicEngagementScore });

    return new Response(JSON.stringify({
      success: true,
      preferences: result,
      civic_engagement_score: civicEngagementScore,
      message: "Feed preferences updated successfully"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in update-feed-preferences", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function calculateCivicEngagementScore(preferences: any): number {
  let score = 0;

  // Base score from civic content weight (0-40 points)
  score += (preferences.civic_content_weight || 0) * 40;

  // Points for local content preference (0-20 points)
  score += (preferences.local_content_preference || 0) * 20;

  // Points for political engagement level (0-25 points)
  switch (preferences.political_engagement_level) {
    case 'high': score += 25; break;
    case 'moderate': score += 15; break;
    case 'low': score += 5; break;
    default: score += 10;
  }

  // Points for preferred regions (0-10 points)
  if (preferences.preferred_regions && preferences.preferred_regions.length > 0) {
    score += Math.min(10, preferences.preferred_regions.length * 2);
  }

  // Bonus for balanced preferences (avoiding echo chambers) (0-5 points)
  const weights = [
    preferences.civic_content_weight || 0,
    preferences.entertainment_weight || 0,
    preferences.job_content_weight || 0,
    preferences.artist_content_weight || 0
  ];
  
  // Check if no single weight dominates (>70%)
  const maxWeight = Math.max(...weights);
  if (maxWeight < 0.7) {
    score += 5; // Bonus for balanced content consumption
  }

  return Math.min(100, Math.max(0, score));
}