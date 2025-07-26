import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FEED-INTERACTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Feed interaction tracking started");

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

    const {
      content_id,
      content_type,
      interaction_type,
      dwell_time_seconds = 0,
      metadata = {}
    } = await req.json();

    logStep("Interaction data received", {
      content_id,
      content_type,
      interaction_type,
      dwell_time_seconds,
      userId: user.id
    });

    // Validate required fields
    if (!content_id || !content_type || !interaction_type) {
      throw new Error("Missing required fields: content_id, content_type, or interaction_type");
    }

    // Calculate engagement quality based on interaction type and dwell time
    const engagementQuality = calculateEngagementQuality(interaction_type, dwell_time_seconds, metadata);

    logStep("Engagement quality calculated", { engagementQuality });

    // Store the interaction
    const { data: interaction, error: insertError } = await supabaseClient
      .from('feed_interactions')
      .insert({
        user_id: user.id,
        content_id,
        content_type,
        interaction_type,
        dwell_time_seconds,
        engagement_quality: engagementQuality,
        metadata
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to store interaction: ${insertError.message}`);
    }

    logStep("Interaction stored successfully", { interactionId: interaction.id });

    // Update or create content score
    await updateContentScore(supabaseClient, content_id, content_type, user.id, engagementQuality);

    // Check if this should trigger feed preference updates
    await updateUserPreferencesIfNeeded(supabaseClient, user.id, content_type, interaction_type, engagementQuality);

    logStep("Feed interaction tracking completed successfully");

    return new Response(JSON.stringify({
      success: true,
      interaction_id: interaction.id,
      engagement_quality: engagementQuality
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in track-feed-interaction", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function calculateEngagementQuality(
  interactionType: string,
  dwellTimeSeconds: number,
  metadata: any
): number {
  let baseScore = 0.0;

  // Base scores for different interaction types
  switch (interactionType) {
    case 'view':
      baseScore = 0.1;
      break;
    case 'like':
      baseScore = 0.6;
      break;
    case 'share':
      baseScore = 0.8;
      break;
    case 'comment':
      baseScore = 0.9;
      break;
    case 'skip':
      baseScore = -0.3;
      break;
    case 'hide':
      baseScore = -0.5;
      break;
    case 'report':
      baseScore = -1.0;
      break;
    default:
      baseScore = 0.0;
  }

  // Adjust based on dwell time for view interactions
  if (interactionType === 'view' && dwellTimeSeconds > 0) {
    if (dwellTimeSeconds < 3) {
      baseScore = 0.05; // Very quick view
    } else if (dwellTimeSeconds < 10) {
      baseScore = 0.2; // Brief view
    } else if (dwellTimeSeconds < 30) {
      baseScore = 0.4; // Good engagement
    } else if (dwellTimeSeconds < 60) {
      baseScore = 0.6; // Strong engagement
    } else {
      baseScore = 0.8; // Very strong engagement
    }
  }

  // Adjust for comment quality if available
  if (interactionType === 'comment' && metadata.comment_length) {
    if (metadata.comment_length > 50) {
      baseScore = Math.min(1.0, baseScore + 0.1); // Thoughtful comment
    }
  }

  // Ensure score is between -1 and 1
  return Math.max(-1.0, Math.min(1.0, baseScore));
}

async function updateContentScore(
  supabaseClient: any,
  contentId: string,
  contentType: string,
  userId: string,
  engagementQuality: number
): Promise<void> {
  try {
    logStep("Updating content score", { contentId, contentType, engagementQuality });

    // Check if content score exists
    const { data: existingScore } = await supabaseClient
      .from('feed_content_scores')
      .select('*')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .single();

    if (existingScore) {
      // Update existing score with weighted average
      const newEngagementScore = (existingScore.engagement_prediction * 0.8) + (engagementQuality * 0.2);
      const newTotalScore = calculateTotalScore(
        existingScore.civic_relevance_score,
        existingScore.geographic_relevance,
        existingScore.time_sensitivity_score,
        existingScore.authenticity_score,
        newEngagementScore
      );

      await supabaseClient
        .from('feed_content_scores')
        .update({
          engagement_prediction: newEngagementScore,
          total_score: newTotalScore,
          updated_at: new Date().toISOString()
        })
        .eq('content_id', contentId)
        .eq('content_type', contentType);

      logStep("Content score updated", { newEngagementScore, newTotalScore });
    } else {
      // Create new content score
      const score = await supabaseClient.rpc('calculate_content_score', {
        p_content_id: contentId,
        p_content_type: contentType,
        p_user_id: userId
      });

      if (score) {
        await supabaseClient
          .from('feed_content_scores')
          .insert({
            content_id: contentId,
            content_type: contentType,
            civic_relevance_score: getCivicRelevanceScore(contentType),
            geographic_relevance: 0.5,
            time_sensitivity_score: 0.3,
            authenticity_score: 0.5,
            engagement_prediction: engagementQuality,
            total_score: score.data || 0.5
          });

        logStep("New content score created", { score: score.data });
      }
    }
  } catch (error) {
    logStep("Error updating content score", error);
  }
}

async function updateUserPreferencesIfNeeded(
  supabaseClient: any,
  userId: string,
  contentType: string,
  interactionType: string,
  engagementQuality: number
): Promise<void> {
  try {
    // Only update preferences for significant positive or negative engagement
    if (Math.abs(engagementQuality) < 0.3) {
      return; // Not significant enough to update preferences
    }

    logStep("Checking if user preferences need updating", {
      userId,
      contentType,
      interactionType,
      engagementQuality
    });

    // Get recent interactions to determine if there's a pattern
    const { data: recentInteractions } = await supabaseClient
      .from('feed_interactions')
      .select('interaction_type, engagement_quality, content_type')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentInteractions && recentInteractions.length >= 5) {
      const avgEngagement = recentInteractions.reduce((sum, int) => sum + int.engagement_quality, 0) / recentInteractions.length;
      
      logStep("Pattern detected for preference update", { avgEngagement, interactionCount: recentInteractions.length });

      // Update preferences if there's a clear pattern (>= 0.5 average engagement or <= -0.3)
      if (avgEngagement >= 0.5 || avgEngagement <= -0.3) {
        const weightField = getWeightFieldForContentType(contentType);
        if (weightField) {
          const adjustment = avgEngagement > 0 ? 0.05 : -0.05; // Small incremental changes

          const { data: currentPrefs } = await supabaseClient
            .from('user_feed_preferences')
            .select(weightField)
            .eq('user_id', userId)
            .single();

          if (currentPrefs) {
            const currentWeight = currentPrefs[weightField] || 0.1;
            const newWeight = Math.max(0.05, Math.min(0.8, currentWeight + adjustment));

            await supabaseClient
              .from('user_feed_preferences')
              .update({
                [weightField]: newWeight,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);

            logStep("User preferences updated", { weightField, oldWeight: currentWeight, newWeight });
          }
        }
      }
    }
  } catch (error) {
    logStep("Error updating user preferences", error);
  }
}

function calculateTotalScore(
  civicScore: number,
  geoScore: number,
  timeScore: number,
  authScore: number,
  engagementScore: number
): number {
  return Math.min(1.0, (civicScore * 0.3) + (geoScore * 0.25) + (timeScore * 0.2) + (authScore * 0.15) + (engagementScore * 0.1));
}

function getCivicRelevanceScore(contentType: string): number {
  switch (contentType) {
    case 'political_update': return 0.9;
    case 'pulse': return 0.6;
    case 'job': return 0.4;
    case 'artist_content': return 0.2;
    default: return 0.3;
  }
}

function getWeightFieldForContentType(contentType: string): string | null {
  switch (contentType) {
    case 'pulse':
    case 'political_update':
      return 'civic_content_weight';
    case 'job':
      return 'job_content_weight';
    case 'artist_content':
      return 'artist_content_weight';
    default:
      return null;
  }
}