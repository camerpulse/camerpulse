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

const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');

// Cameroon-specific search terms
const cameroonHashtags = [
  '#Cameroon', '#Cameroun', '#237', '#CameroonElection', '#Vote237',
  '#PaulBiya', '#MRC', '#CPDM', '#AnglophoneCrisis', '#BiyaMustGo',
  '#EndAnglophoneCrisis', '#FreeNera', '#Ambazonia', '#FederalismNow',
  '#CameroonUnited', '#NoFuel', '#Jobless237', '#BackToSchool237',
  '#GCE2025', '#YouthEmpowerment', '#TransparencyNow', '#StopCorruption',
  '#CameroonRoads', '#LightCameroon', '#WaterForAll', '#DevCameroon'
];

const cameroonKeywords = [
  'Cameroon', 'Cameroun', 'Yaoundé', 'Douala', 'Bamenda', 'Buea',
  'Paul Biya', 'Maurice Kamto', 'Anglophone', 'Francophone',
  'SONARA', 'CONAC', 'ELECAM', 'INEC', 'CAN 2025', 'AFCON'
];

const politicalFigures = [
  'Paul Biya', 'Maurice Kamto', 'Cabral Libii', 'Joshua Osih',
  'Akere Muna', 'Ni John Fru Ndi', 'Jean Marc Soboth',
  'Joseph Dion Ngute', 'Laurent Esso', 'Atanga Nji'
];

interface TwitterPost {
  id: string;
  text: string;
  author_id: string;
  author_username?: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  context_annotations?: Array<{
    domain: { name: string };
    entity: { name: string };
  }>;
  geo?: {
    place_id: string;
  };
}

async function searchTwitter(query: string, maxResults: number = 100): Promise<TwitterPost[]> {
  if (!twitterBearerToken) {
    console.log('Twitter Bearer Token not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: query,
      'max_results': maxResults.toString(),
      'tweet.fields': 'author_id,created_at,public_metrics,context_annotations,geo',
      'user.fields': 'username,public_metrics,verified',
      'expansions': 'author_id,geo.place_id'
    });

    const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
      headers: {
        'Authorization': `Bearer ${twitterBearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter API error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    
    if (!data.data) {
      console.log('No tweets found for query:', query);
      return [];
    }

    // Map user information
    const users = new Map();
    if (data.includes?.users) {
      data.includes.users.forEach((user: any) => {
        users.set(user.id, user);
      });
    }

    // Map place information
    const places = new Map();
    if (data.includes?.places) {
      data.includes.places.forEach((place: any) => {
        places.set(place.id, place);
      });
    }

    return data.data.map((tweet: any) => {
      const user = users.get(tweet.author_id);
      return {
        ...tweet,
        author_username: user?.username,
        author_verified: user?.verified,
        author_followers: user?.public_metrics?.followers_count
      };
    });

  } catch (error) {
    console.error('Error searching Twitter:', error);
    return [];
  }
}

async function processTweetForSentiment(tweet: TwitterPost) {
  try {
    // Call the sentiment analysis function
    const response = await supabase.functions.invoke('camerpulse-processor', {
      body: {
        action: 'analyze_sentiment',
        data: {
          content: tweet.text,
          platform: 'twitter',
          contentId: tweet.id,
          authorHandle: tweet.author_username,
          engagementMetrics: {
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            replies: tweet.public_metrics?.reply_count || 0,
            quotes: tweet.public_metrics?.quote_count || 0
          }
        }
      }
    });

    if (response.error) {
      console.error('Error processing tweet sentiment:', response.error);
    }

    return response.data;
  } catch (error) {
    console.error('Error in processTweetForSentiment:', error);
    return null;
  }
}

async function updateTrendingTopics(tweets: TwitterPost[]) {
  try {
    // Extract hashtags and their frequency
    const hashtagCounts = new Map<string, number>();
    const hashtagDetails = new Map<string, {
      sentiment_scores: number[];
      platforms: string[];
      volume: number;
      tweets: TwitterPost[];
    }>();

    tweets.forEach(tweet => {
      const hashtags = tweet.text.match(/#\w+/g) || [];
      hashtags.forEach(hashtag => {
        const tag = hashtag.toLowerCase().substring(1);
        hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
        
        if (!hashtagDetails.has(tag)) {
          hashtagDetails.set(tag, {
            sentiment_scores: [],
            platforms: ['twitter'],
            volume: 0,
            tweets: []
          });
        }
        
        hashtagDetails.get(tag)!.volume++;
        hashtagDetails.get(tag)!.tweets.push(tweet);
      });
    });

    // Update trending topics in database
    for (const [hashtag, count] of hashtagCounts.entries()) {
      if (count >= 3) { // Only consider hashtags with at least 3 mentions
        const details = hashtagDetails.get(hashtag)!;
        
        // Calculate category based on keywords
        let category = 'general';
        const hashtagText = hashtag.toLowerCase();
        
        if (['election', 'vote', 'campaign', 'ballot'].some(k => hashtagText.includes(k))) {
          category = 'election';
        } else if (['government', 'minister', 'president', 'policy'].some(k => hashtagText.includes(k))) {
          category = 'governance';
        } else if (['security', 'military', 'crisis', 'conflict'].some(k => hashtagText.includes(k))) {
          category = 'security';
        } else if (['economy', 'job', 'unemployment', 'fuel', 'money'].some(k => hashtagText.includes(k))) {
          category = 'economy';
        } else if (['youth', 'student', 'education', 'school'].some(k => hashtagText.includes(k))) {
          category = 'youth';
        } else if (['road', 'transport', 'infrastructure', 'electricity'].some(k => hashtagText.includes(k))) {
          category = 'infrastructure';
        }

        // Upsert trending topic
        await supabase
          .from('camerpulse_intelligence_trending_topics')
          .upsert({
            topic_text: `#${hashtag}`,
            category: category,
            volume_score: count,
            platform_breakdown: { twitter: count },
            trend_status: count > 20 ? 'viral' : count > 10 ? 'rising' : 'stable',
            last_updated_at: new Date().toISOString()
          }, {
            onConflict: 'topic_text'
          });
      }
    }

  } catch (error) {
    console.error('Error updating trending topics:', error);
  }
}

async function monitorCameroonTwitter() {
  console.log('Starting Cameroon Twitter monitoring...');
  
  const searchQueries = [
    // Hashtag-based searches
    cameroonHashtags.slice(0, 5).join(' OR '),
    // Keyword-based searches
    cameroonKeywords.slice(0, 5).join(' OR '),
    // Political figure searches
    politicalFigures.slice(0, 3).map(name => `"${name}"`).join(' OR ')
  ];

  const allTweets: TwitterPost[] = [];

  for (const query of searchQueries) {
    try {
      console.log(`Searching Twitter for: ${query}`);
      const tweets = await searchTwitter(query, 50);
      allTweets.push(...tweets);
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error in search query:', query, error);
    }
  }

  console.log(`Found ${allTweets.length} tweets total`);

  // Remove duplicates
  const uniqueTweets = allTweets.filter((tweet, index, self) => 
    index === self.findIndex(t => t.id === tweet.id)
  );

  console.log(`Processing ${uniqueTweets.length} unique tweets`);

  // Process tweets for sentiment analysis
  const sentimentPromises = uniqueTweets.map(tweet => processTweetForSentiment(tweet));
  await Promise.allSettled(sentimentPromises);

  // Update trending topics
  await updateTrendingTopics(uniqueTweets);

  return {
    processed: uniqueTweets.length,
    queries: searchQueries
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

    switch (action) {
      case 'monitor_twitter': {
        const result = await monitorCameroonTwitter();
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Twitter monitoring completed',
          data: result
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'search_tweets': {
        const { query, maxResults = 100 } = await req.json();
        const tweets = await searchTwitter(query, maxResults);
        
        return new Response(JSON.stringify({
          success: true,
          tweets: tweets,
          count: tweets.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ 
          error: 'Unknown action. Use "monitor_twitter" or "search_tweets"' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in camerpulse-twitter:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});