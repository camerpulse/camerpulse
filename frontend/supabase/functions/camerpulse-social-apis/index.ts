import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// API Keys
const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
const facebookAccessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
const serpApiKey = Deno.env.get('SERP_API_KEY');

interface SocialPost {
  id: string;
  text: string;
  platform: string;
  author_id?: string;
  author_handle?: string;
  created_at: string;
  engagement_metrics?: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
  };
  location?: string;
  hashtags?: string[];
  mentions?: string[];
}

// Facebook Graph API integration
async function searchFacebookPosts(query: string, limit: number = 100): Promise<SocialPost[]> {
  if (!facebookAccessToken) {
    console.log('Facebook Access Token not configured');
    return [];
  }

  try {
    // Search public posts using Facebook Graph API
    const params = new URLSearchParams({
      q: query,
      type: 'post',
      fields: 'id,message,created_time,from,likes.summary(true),shares,comments.summary(true)',
      access_token: facebookAccessToken,
      limit: limit.toString()
    });

    const response = await fetch(`https://graph.facebook.com/v18.0/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook API error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    
    if (!data.data) {
      console.log('No Facebook posts found for query:', query);
      return [];
    }

    return data.data.map((post: any) => ({
      id: post.id,
      text: post.message || '',
      platform: 'facebook',
      author_id: post.from?.id,
      author_handle: post.from?.name,
      created_at: post.created_time,
      engagement_metrics: {
        likes: post.likes?.summary?.total_count || 0,
        shares: post.shares?.count || 0,
        comments: post.comments?.summary?.total_count || 0
      },
      hashtags: (post.message?.match(/#\w+/g) || []).map((tag: string) => tag.substring(1)),
      mentions: (post.message?.match(/@\w+/g) || []).map((mention: string) => mention.substring(1))
    }));

  } catch (error) {
    console.error('Error searching Facebook:', error);
    return [];
  }
}

// Google Trends integration via SERP API
async function getGoogleTrends(keywords: string[], region: string = 'CM'): Promise<any[]> {
  if (!serpApiKey) {
    console.log('SERP API key not configured');
    return [];
  }

  const results = [];

  for (const keyword of keywords) {
    try {
      const params = new URLSearchParams({
        engine: 'google_trends',
        q: keyword,
        geo: region, // CM for Cameroon
        api_key: serpApiKey,
        data_type: 'TIMESERIES'
      });

      const response = await fetch(`https://serpapi.com/search.json?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`SERP API error for "${keyword}":`, response.status);
        continue;
      }

      const data = await response.json();
      
      if (data.interest_over_time) {
        results.push({
          keyword,
          region,
          trend_data: data.interest_over_time,
          related_queries: data.related_queries || [],
          rising_queries: data.rising_queries || [],
          avg_interest: data.interest_over_time?.timeline_data?.reduce((acc: number, item: any) => 
            acc + (item.values?.[0]?.extracted_value || 0), 0) / (data.interest_over_time?.timeline_data?.length || 1)
        });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching trends for "${keyword}":`, error);
    }
  }

  return results;
}

// TikTok scraping (unofficial API simulation)
async function scrapeTikTokContent(hashtag: string, limit: number = 50): Promise<SocialPost[]> {
  // Note: This is a simulated TikTok scraper since TikTok doesn't have official public API
  // In production, you would use a third-party service like RapidAPI TikTok scraper
  
  try {
    // Mock TikTok data for demonstration
    // In real implementation, you'd use a scraping service or unofficial API
    const mockPosts: SocialPost[] = Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
      id: `tiktok_${hashtag}_${i}`,
      text: `Mock TikTok post about ${hashtag} #${hashtag} #Cameroon #237`,
      platform: 'tiktok',
      author_handle: `user_${i}`,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      engagement_metrics: {
        likes: Math.floor(Math.random() * 10000),
        shares: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 500),
        views: Math.floor(Math.random() * 100000)
      },
      hashtags: [hashtag, 'cameroon', '237'],
      mentions: []
    }));

    console.log(`Generated ${mockPosts.length} mock TikTok posts for #${hashtag}`);
    return mockPosts;

  } catch (error) {
    console.error('Error scraping TikTok:', error);
    return [];
  }
}

// Comprehensive social media monitoring
async function monitorAllPlatforms(keywords: string[], region: string = 'Cameroon') {
  console.log('Starting comprehensive social media monitoring...');
  
  const results = {
    twitter: [],
    facebook: [],
    tiktok: [],
    trends: [],
    processed_count: 0,
    timestamp: new Date().toISOString()
  };

  // Monitor each keyword across platforms
  for (const keyword of keywords) {
    try {
      console.log(`Monitoring keyword: ${keyword}`);

      // Facebook posts
      if (facebookAccessToken) {
        const facebookPosts = await searchFacebookPosts(keyword, 25);
        results.facebook.push(...facebookPosts);
        
        // Process posts for sentiment analysis
        for (const post of facebookPosts) {
          await processSocialPostForSentiment(post);
        }
      }

      // TikTok content (simulated)
      const tiktokPosts = await scrapeTikTokContent(keyword, 25);
      results.tiktok.push(...tiktokPosts);
      
      // Process TikTok posts
      for (const post of tiktokPosts) {
        await processSocialPostForSentiment(post);
      }

      // Rate limiting between keywords
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error monitoring keyword "${keyword}":`, error);
    }
  }

  // Get Google Trends data
  if (serpApiKey) {
    const trendsData = await getGoogleTrends(keywords, 'CM');
    results.trends = trendsData;
    
    // Store trends data
    for (const trend of trendsData) {
      await storeTrendData(trend);
    }
  }

  results.processed_count = results.facebook.length + results.tiktok.length;
  
  console.log(`Monitoring completed. Processed ${results.processed_count} posts across platforms`);
  return results;
}

// Process social post for sentiment analysis
async function processSocialPostForSentiment(post: SocialPost) {
  try {
    const response = await supabase.functions.invoke('camerpulse-processor', {
      body: {
        action: 'analyze_sentiment',
        data: {
          content: post.text,
          platform: post.platform,
          contentId: post.id,
          authorHandle: post.author_handle,
          engagementMetrics: post.engagement_metrics
        }
      }
    });

    if (response.error) {
      console.error('Error processing post sentiment:', response.error);
    }

    return response.data;
  } catch (error) {
    console.error('Error in processSocialPostForSentiment:', error);
    return null;
  }
}

// Store Google Trends data
async function storeTrendData(trendData: any) {
  try {
    await supabase
      .from('camerpulse_intelligence_trending_topics')
      .upsert({
        topic_text: trendData.keyword,
        category: 'trending_search',
        volume_score: Math.round(trendData.avg_interest || 0),
        platform_breakdown: { google_trends: trendData.avg_interest },
        trend_status: trendData.avg_interest > 50 ? 'viral' : trendData.avg_interest > 20 ? 'rising' : 'stable',
        last_updated_at: new Date().toISOString(),
        regional_breakdown: { [trendData.region]: trendData.avg_interest }
      }, {
        onConflict: 'topic_text'
      });
  } catch (error) {
    console.error('Error storing trend data:', error);
  }
}

// Get platform health status
async function getPlatformStatus() {
  const status = {
    twitter: !!twitterBearerToken,
    facebook: !!facebookAccessToken,
    google_trends: !!serpApiKey,
    tiktok: true, // Always available (simulated)
    timestamp: new Date().toISOString()
  };

  return status;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case 'monitor_all_platforms': {
        const { keywords = ['Cameroon', 'Biya', 'Election'], region = 'CM' } = params;
        const results = await monitorAllPlatforms(keywords, region);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Multi-platform monitoring completed',
          data: results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'search_facebook': {
        const { query, limit = 100 } = params;
        const posts = await searchFacebookPosts(query, limit);
        
        return new Response(JSON.stringify({
          success: true,
          platform: 'facebook',
          posts: posts,
          count: posts.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_google_trends': {
        const { keywords, region = 'CM' } = params;
        const trends = await getGoogleTrends(keywords, region);
        
        return new Response(JSON.stringify({
          success: true,
          platform: 'google_trends',
          trends: trends,
          count: trends.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'scrape_tiktok': {
        const { hashtag, limit = 50 } = params;
        const posts = await scrapeTikTokContent(hashtag, limit);
        
        return new Response(JSON.stringify({
          success: true,
          platform: 'tiktok',
          posts: posts,
          count: posts.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'platform_status': {
        const status = await getPlatformStatus();
        
        return new Response(JSON.stringify({
          success: true,
          status: status
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ 
          error: 'Unknown action. Available: monitor_all_platforms, search_facebook, get_google_trends, scrape_tiktok, platform_status' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in camerpulse-social-apis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});