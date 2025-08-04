import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userId, 
      productId, 
      recommendationType = 'general',
      limit = 10,
      includeCollaborative = true,
      includeCrossSell = true,
      abTestGroup = 'control'
    } = await req.json();

    console.log('Generating recommendations for:', { userId, productId, recommendationType });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's purchase history and preferences
    const { data: userOrders } = await supabase
      .from('marketplace_orders')
      .select(`
        *,
        marketplace_products(*)
      `)
      .eq('buyer_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50);

    // Get user's browsing behavior
    const { data: userViews } = await supabase
      .from('product_views')
      .select('product_id, view_count, last_viewed_at')
      .eq('user_id', userId)
      .order('view_count', { ascending: false })
      .limit(20);

    // Get similar users for collaborative filtering
    let collaborativeProducts = [];
    if (includeCollaborative) {
      const { data: similarUsers } = await supabase.rpc('get_similar_users', {
        target_user_id: userId,
        limit_users: 10
      });

      if (similarUsers?.length > 0) {
        const { data: collaborativeData } = await supabase
          .from('marketplace_orders')
          .select(`
            marketplace_products(*)
          `)
          .in('buyer_id', similarUsers.map(u => u.user_id))
          .eq('status', 'completed')
          .limit(20);

        collaborativeProducts = collaborativeData?.map(order => order.marketplace_products).filter(Boolean) || [];
      }
    }

    // Get cross-sell recommendations based on current product
    let crossSellProducts = [];
    if (includeCrossSell && productId) {
      const { data: currentProduct } = await supabase
        .from('marketplace_products')
        .select('*')
        .eq('id', productId)
        .single();

      if (currentProduct) {
        const { data: crossSellData } = await supabase
          .from('marketplace_products')
          .select('*')
          .eq('category', currentProduct.category)
          .neq('id', productId)
          .eq('status', 'active')
          .order('rating', { ascending: false })
          .limit(10);

        crossSellProducts = crossSellData || [];
      }
    }

    // Get trending products
    const { data: trendingProducts } = await supabase
      .from('marketplace_products')
      .select(`
        *,
        marketplace_orders(count)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);

    // Use OpenAI to generate personalized recommendations
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    let aiRecommendations = [];

    if (openAIApiKey) {
      const userProfile = {
        purchaseHistory: userOrders?.slice(0, 10) || [],
        viewingHistory: userViews || [],
        preferences: {
          categories: [...new Set(userOrders?.map(o => o.marketplace_products?.category).filter(Boolean) || [])],
          priceRange: {
            min: Math.min(...(userOrders?.map(o => o.total_amount) || [0])),
            max: Math.max(...(userOrders?.map(o => o.total_amount) || [0]))
          }
        }
      };

      const prompt = `
        Based on this user profile: ${JSON.stringify(userProfile, null, 2)}
        
        Available products: ${JSON.stringify([...collaborativeProducts, ...crossSellProducts, ...trendingProducts], null, 2)}
        
        Generate personalized product recommendations that:
        1. Match user's past preferences
        2. Introduce complementary products
        3. Consider price sensitivity
        4. Factor in trending items
        
        Return a JSON array of product IDs ranked by relevance, with reasoning for each recommendation.
        Limit to ${limit} recommendations.
      `;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert e-commerce recommendation engine. Analyze user behavior and product data to generate highly relevant recommendations.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000
          }),
        });

        if (response.ok) {
          const aiResult = await response.json();
          const aiContent = aiResult.choices[0].message.content;
          
          try {
            aiRecommendations = JSON.parse(aiContent);
          } catch (parseError) {
            console.error('Failed to parse AI recommendations:', parseError);
          }
        }
      } catch (aiError) {
        console.error('AI recommendation error:', aiError);
      }
    }

    // Combine and rank all recommendations
    const allProducts = [
      ...collaborativeProducts,
      ...crossSellProducts,
      ...trendingProducts
    ];

    // Remove duplicates and products user already owns
    const ownedProductIds = new Set(userOrders?.map(o => o.marketplace_products?.id).filter(Boolean) || []);
    const uniqueProducts = allProducts.filter((product, index, self) => 
      product && 
      !ownedProductIds.has(product.id) &&
      self.findIndex(p => p?.id === product.id) === index
    );

    // Apply A/B testing logic
    let finalRecommendations = uniqueProducts;
    
    if (abTestGroup === 'personalized') {
      // Prioritize AI recommendations
      if (aiRecommendations.length > 0) {
        const aiProductIds = new Set(aiRecommendations.map(r => r.productId || r.id));
        finalRecommendations = [
          ...uniqueProducts.filter(p => aiProductIds.has(p.id)),
          ...uniqueProducts.filter(p => !aiProductIds.has(p.id))
        ];
      }
    } else if (abTestGroup === 'trending') {
      // Prioritize trending products
      finalRecommendations = uniqueProducts.sort((a, b) => 
        (b.marketplace_orders?.[0]?.count || 0) - (a.marketplace_orders?.[0]?.count || 0)
      );
    }

    // Limit results
    const recommendations = finalRecommendations.slice(0, limit);

    // Log recommendation event for analytics
    await supabase
      .from('recommendation_events')
      .insert({
        user_id: userId,
        recommendation_type: recommendationType,
        ab_test_group: abTestGroup,
        product_ids: recommendations.map(p => p.id),
        context: {
          collaborative_count: collaborativeProducts.length,
          cross_sell_count: crossSellProducts.length,
          trending_count: trendingProducts.length,
          ai_enabled: !!openAIApiKey
        }
      });

    return new Response(
      JSON.stringify({
        recommendations,
        metadata: {
          total_considered: allProducts.length,
          collaborative_filtering: includeCollaborative,
          cross_selling: includeCrossSell,
          ab_test_group: abTestGroup,
          ai_enhanced: aiRecommendations.length > 0,
          recommendation_type: recommendationType
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Recommendation generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        recommendations: [],
        metadata: { error: true }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});