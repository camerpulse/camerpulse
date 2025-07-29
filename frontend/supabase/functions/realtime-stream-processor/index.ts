import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface StreamEvent {
  type: string;
  source: string;
  data: any;
  timestamp: string;
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stream_id, events, batch_size = 100 } = await req.json();

    if (!stream_id) {
      throw new Error('Stream ID is required');
    }

    if (!events || !Array.isArray(events)) {
      throw new Error('Events array is required');
    }

    console.log(`Processing ${events.length} events for stream ${stream_id}`);

    // Get stream configuration
    const { data: streamConfig, error: streamError } = await supabase
      .from('real_time_data_streams')
      .select('*')
      .eq('id', stream_id)
      .single();

    if (streamError || !streamConfig) {
      throw new Error(`Stream not found or error: ${streamError?.message}`);
    }

    if (streamConfig.status !== 'active') {
      throw new Error(`Stream ${stream_id} is not active`);
    }

    const processedEvents = [];
    const errors = [];
    let processedCount = 0;

    // Process events in batches
    for (let i = 0; i < events.length; i += batch_size) {
      const batch = events.slice(i, i + batch_size);
      
      for (const event of batch) {
        try {
          // Validate event structure
          if (!event.type || !event.data) {
            errors.push(`Invalid event structure at index ${processedCount}`);
            continue;
          }

          // Store in realtime_analytics_events
          const { data: storedEvent, error: eventError } = await supabase
            .from('realtime_analytics_events')
            .insert({
              event_type: event.type,
              event_source: streamConfig.stream_name,
              event_data: event.data,
              user_id: event.user_id || null,
              session_id: event.session_id || null,
              ip_address: event.ip_address || null,
              user_agent: event.user_agent || null,
              region: event.region || null,
              processed: false
            })
            .select()
            .single();

          if (eventError) {
            errors.push(`Error storing event ${processedCount}: ${eventError.message}`);
            continue;
          }

          // Process based on stream type and event type
          await processEventByType(event, streamConfig, storedEvent.id);
          
          processedEvents.push(storedEvent.id);
          processedCount++;

        } catch (error) {
          errors.push(`Error processing event ${processedCount}: ${error.message}`);
        }
      }

      // Update events per minute for the stream
      if (processedCount > 0) {
        const eventsPerMinute = processedCount / ((Date.now() - new Date(batch[0].timestamp || new Date()).getTime()) / 60000);
        
        await supabase
          .from('real_time_data_streams')
          .update({
            events_per_minute: eventsPerMinute,
            last_event_at: new Date().toISOString(),
            error_count: streamConfig.error_count + errors.length
          })
          .eq('id', stream_id);
      }
    }

    // Mark processed events as complete
    if (processedEvents.length > 0) {
      await supabase
        .from('realtime_analytics_events')
        .update({ processed: true })
        .in('id', processedEvents);
    }

    console.log(`Processed ${processedCount} events with ${errors.length} errors`);

    return new Response(JSON.stringify({
      success: true,
      stream_id: stream_id,
      total_events: events.length,
      processed_events: processedCount,
      errors: errors.length,
      error_details: errors.slice(0, 10) // Limit error details
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in realtime-stream-processor:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processEventByType(event: StreamEvent, streamConfig: any, eventId: string) {
  try {
    switch (streamConfig.stream_type) {
      case 'social_media':
        await processSocialMediaEvent(event, eventId);
        break;
      case 'news':
        await processNewsEvent(event, eventId);
        break;
      case 'government':
        await processGovernmentEvent(event, eventId);
        break;
      case 'economic':
        await processEconomicEvent(event, eventId);
        break;
      default:
        console.log(`No specific processing for stream type: ${streamConfig.stream_type}`);
    }
  } catch (error) {
    console.error(`Error processing event type ${streamConfig.stream_type}:`, error);
  }
}

async function processSocialMediaEvent(event: StreamEvent, eventId: string) {
  // Extract text content for sentiment analysis
  const text = event.data.text || event.data.content || event.data.message;
  
  if (text && text.length > 10) {
    // Trigger sentiment analysis
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-sentiment-analyzer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          text: text,
          source: 'social_media',
          region: event.data.location || event.region
        })
      });
    } catch (error) {
      console.error('Error calling sentiment analyzer:', error);
    }
  }

  // Check for trending hashtags or topics
  const hashtags = extractHashtags(text);
  if (hashtags.length > 0) {
    for (const hashtag of hashtags) {
      await updateTrendingTopic(hashtag, 'social_media', event.data);
    }
  }
}

async function processNewsEvent(event: StreamEvent, eventId: string) {
  const title = event.data.title || event.data.headline;
  const content = event.data.content || event.data.body;
  
  if (title || content) {
    const textToAnalyze = `${title} ${content}`.trim();
    
    // Trigger sentiment analysis for news content
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-sentiment-analyzer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          text: textToAnalyze,
          source: 'news',
          region: event.data.region || 'Cameroon'
        })
      });
    } catch (error) {
      console.error('Error calling sentiment analyzer for news:', error);
    }
  }
}

async function processGovernmentEvent(event: StreamEvent, eventId: string) {
  // Process government announcements, policy changes, etc.
  const eventType = event.data.announcement_type || event.type;
  
  if (['policy_change', 'emergency_alert', 'public_announcement'].includes(eventType)) {
    // Create intelligence alert for significant government events
    await supabase
      .from('camerpulse_intelligence_alerts')
      .insert({
        alert_category: 'infrastructure_failure',
        alert_severity: eventType === 'emergency_alert' ? 'critical' : 'info',
        alert_title: event.data.title || 'Government Event',
        alert_description: event.data.description || 'Government data stream event',
        detection_method: 'realtime_stream_processing',
        source_systems: ['government_stream'],
        affected_regions: [event.data.region || 'National'],
        confidence_level: 0.9,
        raw_data: event.data
      });
  }
}

async function processEconomicEvent(event: StreamEvent, eventId: string) {
  // Process economic indicators, market data, etc.
  const indicator = event.data.indicator;
  const value = event.data.value;
  
  if (indicator && value !== undefined) {
    // Check for significant economic changes
    const threshold = event.data.threshold || 0.05; // 5% change threshold
    
    if (Math.abs(value) > threshold) {
      await supabase
        .from('camerpulse_intelligence_alerts')
        .insert({
          alert_category: 'economic_instability',
          alert_severity: Math.abs(value) > 0.1 ? 'warning' : 'info',
          alert_title: `Economic Alert: ${indicator}`,
          alert_description: `Significant change detected in ${indicator}: ${value}`,
          detection_method: 'economic_stream_monitoring',
          source_systems: ['economic_stream'],
          confidence_level: 0.8,
          raw_data: event.data
        });
    }
  }
}

function extractHashtags(text: string): string[] {
  if (!text) return [];
  const hashtagRegex = /#[\w]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
}

async function updateTrendingTopic(topic: string, source: string, data: any) {
  try {
    // Check if topic already exists
    const { data: existingTopic, error: selectError } = await supabase
      .from('trending_topics')
      .select('*')
      .eq('topic', topic)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existingTopic) {
      // Update existing topic
      await supabase
        .from('trending_topics')
        .update({
          mention_count: existingTopic.mention_count + 1,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', existingTopic.id);
    } else {
      // Create new trending topic
      await supabase
        .from('trending_topics')
        .insert({
          topic: topic,
          category: 'social',
          mention_count: 1,
          sentiment_score: 0,
          trend_direction: 'rising',
          velocity_score: 1,
          data_sources: [source],
          metadata: { first_mention: data }
        });
    }
  } catch (error) {
    console.error('Error updating trending topic:', error);
  }
}