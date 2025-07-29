import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, reviewId, reviewType } = await req.json();

    if (!content || !reviewId || !reviewType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple toxicity detection based on keywords and patterns
    const toxicKeywords = [
      'hate', 'stupid', 'idiot', 'scam', 'fraud', 'terrible', 'awful', 
      'worst', 'horrible', 'disgusting', 'pathetic', 'useless'
    ];

    const suspiciousPatterns = [
      /(.)\1{4,}/g, // Repeated characters (e.g., "aaaaaaa")
      /[A-Z]{10,}/g, // All caps words longer than 10 characters
      /fuck|shit|damn|bitch|ass/gi, // Profanity
      /kill|die|death|murder/gi, // Violence
    ];

    let toxicityScore = 0;
    const contentLower = content.toLowerCase();
    
    // Check for toxic keywords
    toxicKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        toxicityScore += 0.2;
      }
    });

    // Check for suspicious patterns
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        toxicityScore += 0.3;
      }
    });

    // Check content length and structure
    if (content.length < 10) {
      toxicityScore += 0.1; // Very short content might be spam
    }

    if (content.split(' ').length < 5) {
      toxicityScore += 0.1; // Very few words
    }

    // Normalize score to 0-1 range
    toxicityScore = Math.min(toxicityScore, 1.0);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auto-flag content with high toxicity
    if (toxicityScore > 0.7) {
      // Add to moderation queue
      await supabase
        .from('review_moderation_queue')
        .insert({
          review_id: reviewId,
          review_type: reviewType,
          flagged_reason: 'High toxicity score detected',
          auto_flagged: true,
          toxicity_score: toxicityScore,
          moderation_priority: toxicityScore > 0.9 ? 5 : 4,
        });

      // Update the review status
      const tableName = reviewType === 'employer_review' ? 'employer_reviews' : 
                       reviewType === 'expert_review' ? 'expert_performance_reviews' : 
                       'review_responses';
      
      await supabase
        .from(tableName)
        .update({ 
          status: 'under_review',
          toxicity_score: toxicityScore 
        })
        .eq('id', reviewId);
    } else {
      // Just update the toxicity score
      const tableName = reviewType === 'employer_review' ? 'employer_reviews' : 
                       reviewType === 'expert_review' ? 'expert_performance_reviews' : 
                       'review_responses';
      
      await supabase
        .from(tableName)
        .update({ toxicity_score: toxicityScore })
        .eq('id', reviewId);
    }

    return new Response(
      JSON.stringify({ 
        toxicityScore,
        flagged: toxicityScore > 0.7,
        message: toxicityScore > 0.7 ? 'Content flagged for moderation' : 'Content approved'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-toxicity function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});