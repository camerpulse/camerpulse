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

// WhatsApp Business API credentials
const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const whatsappVerifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  audio?: {
    id: string;
    mime_type: string;
  };
  image?: {
    id: string;
    mime_type: string;
    caption?: string;
  };
  type: 'text' | 'audio' | 'image' | 'video';
}

interface ProcessedMessage {
  content: string;
  media_type: string;
  media_url?: string;
  sender_region?: string;
  language_detected?: string;
}

// Detect region from phone number or content
function detectRegion(phoneNumber: string, content: string): string {
  // Cameroon regional phone patterns and keywords
  const regionPatterns = {
    'Centre': ['yaoundé', 'yaounde', 'centre', 'central'],
    'Littoral': ['douala', 'littoral', 'coastal'],
    'Nord-Ouest': ['bamenda', 'northwest', 'nw', 'nord-ouest'],
    'Sud-Ouest': ['buea', 'limbe', 'southwest', 'sw', 'sud-ouest'],
    'Extreme-Nord': ['maroua', 'extreme-nord', 'far north', 'garoua'],
    'Nord': ['garoua', 'nord', 'north'],
    'Adamaoua': ['ngaoundéré', 'adamaoua', 'adamawa'],
    'Est': ['bertoua', 'est', 'east'],
    'Sud': ['ebolowa', 'sud', 'south']
  };

  const contentLower = content.toLowerCase();
  
  // Check content for regional keywords
  for (const [region, keywords] of Object.entries(regionPatterns)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      return region;
    }
  }

  // Default region detection by phone area (simplified)
  if (phoneNumber.startsWith('237')) {
    const prefix = phoneNumber.substring(3, 6);
    // Simplified mapping - in reality you'd use proper telecom mapping
    if (['690', '691', '692', '693'].includes(prefix)) return 'Centre';
    if (['694', '695', '696', '697'].includes(prefix)) return 'Littoral';
    if (['670', '671', '672', '673'].includes(prefix)) return 'Nord-Ouest';
    if (['674', '675', '676', '677'].includes(prefix)) return 'Sud-Ouest';
  }

  return 'Unknown';
}

// Detect language using basic patterns
function detectLanguage(text: string): string {
  const englishWords = ['the', 'and', 'is', 'are', 'we', 'government', 'problem', 'help'];
  const frenchWords = ['le', 'la', 'et', 'est', 'nous', 'gouvernement', 'problème', 'aide'];
  const pidginWords = ['na', 'wey', 'dey', 'no', 'dem', 'sey', 'ting', 'palava'];

  const textLower = text.toLowerCase();
  
  const englishScore = englishWords.filter(word => textLower.includes(word)).length;
  const frenchScore = frenchWords.filter(word => textLower.includes(word)).length;
  const pidginScore = pidginWords.filter(word => textLower.includes(word)).length;

  if (pidginScore > 0 && pidginScore >= englishScore) return 'pidgin';
  if (frenchScore > englishScore) return 'fr';
  if (englishScore > 0) return 'en';
  
  return 'unknown';
}

// Download WhatsApp media
async function downloadWhatsAppMedia(mediaId: string): Promise<string | null> {
  if (!whatsappToken) return null;

  try {
    // Get media URL
    const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${whatsappToken}`
      }
    });

    if (!mediaResponse.ok) return null;

    const mediaData = await mediaResponse.json();
    const mediaUrl = mediaData.url;

    // Download media content
    const downloadResponse = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${whatsappToken}`
      }
    });

    if (!downloadResponse.ok) return null;

    const mediaBuffer = await downloadResponse.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(mediaBuffer)));
    
    return `data:${mediaData.mime_type};base64,${base64Data}`;
  } catch (error) {
    console.error('Error downloading WhatsApp media:', error);
    return null;
  }
}

// Convert audio to text using OpenAI Whisper
async function transcribeAudio(audioBase64: string): Promise<string> {
  if (!openAIApiKey) return '[Audio message - transcription unavailable]';

  try {
    // Convert base64 to blob
    const audioData = atob(audioBase64.split(',')[1]);
    const bytes = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      bytes[i] = audioData.charCodeAt(i);
    }

    const formData = new FormData();
    const blob = new Blob([bytes], { type: 'audio/ogg' });
    formData.append('file', blob, 'audio.ogg');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const result = await response.json();
    return result.text || '[Audio transcription failed]';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return '[Audio message - transcription failed]';
  }
}

// Process incoming WhatsApp message
async function processWhatsAppMessage(message: WhatsAppMessage): Promise<ProcessedMessage> {
  let content = '';
  let mediaType = 'text';
  let mediaUrl: string | undefined;

  // Detect region from phone number
  const region = detectRegion(message.from, message.text?.body || '');

  switch (message.type) {
    case 'text':
      content = message.text?.body || '';
      mediaType = 'text';
      break;

    case 'audio':
      if (message.audio) {
        mediaUrl = await downloadWhatsAppMedia(message.audio.id);
        if (mediaUrl) {
          content = await transcribeAudio(mediaUrl);
          mediaType = 'audio';
        } else {
          content = '[Audio message - download failed]';
        }
      }
      break;

    case 'image':
      if (message.image) {
        mediaUrl = await downloadWhatsAppMedia(message.image.id);
        content = message.image.caption || '[Image without caption]';
        mediaType = 'image';
      }
      break;

    default:
      content = '[Unsupported message type]';
      mediaType = 'unknown';
  }

  const language = detectLanguage(content);

  return {
    content,
    media_type: mediaType,
    media_url: mediaUrl,
    sender_region: region,
    language_detected: language
  };
}

// Analyze sentiment and store in database
async function analyzeAndStoreMessage(processedMessage: ProcessedMessage, originalMessage: WhatsAppMessage) {
  try {
    // Send to multimodal emotion processor
    const response = await supabase.functions.invoke('multimodal-emotion-processor', {
      body: {
        action: 'analyze_multimodal',
        data: {
          content: processedMessage.content,
          media_type: processedMessage.media_type,
          media_url: processedMessage.media_url,
          platform: 'whatsapp'
        }
      }
    });

    if (response.error) {
      console.error('Error in sentiment analysis:', response.error);
      return;
    }

    // Store in sentiment logs
    const { error } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .insert({
        platform: 'whatsapp',
        content_text: processedMessage.content,
        media_type: processedMessage.media_type,
        media_url: processedMessage.media_url,
        region_detected: processedMessage.sender_region,
        language_detected: processedMessage.language_detected,
        author_handle: 'anonymous', // Privacy protection
        content_id: originalMessage.id,
        sentiment_polarity: response.data?.sentiment_polarity || 'neutral',
        sentiment_score: response.data?.sentiment_score || 0,
        emotional_tone: response.data?.emotional_tone || [],
        confidence_score: response.data?.confidence_score || 0.5,
        threat_level: response.data?.threat_level || 'none',
        flagged_for_review: response.data?.flagged_for_review || false
      });

    if (error) {
      console.error('Error storing message:', error);
    } else {
      console.log('WhatsApp message processed and stored successfully');
    }

    // Check for alert conditions (10+ negative messages in 30 minutes from same region)
    await checkForRegionalAlerts(processedMessage.sender_region || 'Unknown');

  } catch (error) {
    console.error('Error in analyzeAndStoreMessage:', error);
  }
}

// Check for regional alerts
async function checkForRegionalAlerts(region: string) {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: recentMessages } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('sentiment_polarity, sentiment_score')
      .eq('platform', 'whatsapp')
      .eq('region_detected', region)
      .gte('created_at', thirtyMinutesAgo);

    if (!recentMessages) return;

    const negativeMessages = recentMessages.filter(msg => 
      msg.sentiment_polarity === 'negative' || (msg.sentiment_score && msg.sentiment_score < -0.3)
    );

    if (negativeMessages.length >= 10) {
      // Create alert
      await supabase
        .from('camerpulse_intelligence_alerts')
        .insert({
          alert_type: 'whatsapp_regional_sentiment',
          severity: 'high',
          title: `High Negative Sentiment in ${region}`,
          description: `${negativeMessages.length} negative WhatsApp reports received from ${region} in the last 30 minutes`,
          affected_regions: [region],
          sentiment_data: {
            negative_count: negativeMessages.length,
            total_count: recentMessages.length,
            time_window: '30_minutes'
          },
          recommended_actions: [
            'Monitor regional situation closely',
            'Dispatch field agents if necessary',
            'Prepare public communication'
          ]
        });

      console.log(`Alert created for ${region} - ${negativeMessages.length} negative messages`);
    }
  } catch (error) {
    console.error('Error checking regional alerts:', error);
  }
}

// Send auto-reply to WhatsApp
async function sendWhatsAppReply(phoneNumber: string, messageText: string) {
  if (!whatsappToken || !whatsappPhoneNumberId) return;

  try {
    await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: messageText }
      })
    });
  } catch (error) {
    console.error('Error sending WhatsApp reply:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Handle webhook verification
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === whatsappVerifyToken) {
        console.log('WhatsApp webhook verified successfully');
        return new Response(challenge, { status: 200 });
      } else {
        console.error('WhatsApp webhook verification failed');
        return new Response('Verification failed', { status: 403 });
      }
    }

    // Handle incoming webhooks
    if (req.method === 'POST') {
      const body = await req.json();

      // Check if this is a WhatsApp webhook
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === 'messages') {
              const messages = change.value.messages || [];
              
              for (const message of messages) {
                console.log('Processing WhatsApp message:', message.id);
                
                // Process the message
                const processedMessage = await processWhatsAppMessage(message);
                
                // Analyze sentiment and store
                await analyzeAndStoreMessage(processedMessage, message);
                
                // Send auto-reply
                const replyText = "Thank you for your civic report. Your message has been received by CamerPulse Intelligence and will be analyzed for national sentiment monitoring. Your privacy is protected - no personal information is stored.";
                await sendWhatsAppReply(message.from, replyText);
              }
            }
          }
        }

        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      // Handle API requests
      const { action, ...params } = body;

      switch (action) {
        case 'status': {
          const status = {
            connected: !!whatsappToken && !!whatsappPhoneNumberId,
            phone_number_id: whatsappPhoneNumberId ? 'configured' : 'missing',
            webhook_token: whatsappVerifyToken ? 'configured' : 'missing',
            openai_available: !!openAIApiKey,
            timestamp: new Date().toISOString()
          };

          return new Response(JSON.stringify(status), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        case 'test_webhook': {
          // Test the webhook configuration
          return new Response(JSON.stringify({
            success: !!whatsappToken,
            message: whatsappToken ? 'WhatsApp API configured' : 'WhatsApp API not configured'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        default:
          return new Response(JSON.stringify({ 
            error: 'Unknown action. Available: status, test_webhook' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
      }
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  } catch (error) {
    console.error('Error in whatsapp-civic-bridge:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});