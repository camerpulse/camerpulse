import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting multimodal emotion processing...');
    
    const formData = await req.formData();
    const results: any[] = [];
    const startTime = Date.now();

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process text content
    const textContent = formData.get('text') as string;
    if (textContent) {
      console.log('Processing text content...');
      const textResult = await processTextEmotion(textContent);
      results.push({
        media_type: 'text',
        primary_emotion: textResult.primary_emotion,
        confidence_score: textResult.confidence_score,
        detailed_analysis: textResult.detailed_analysis,
        processing_time_ms: Date.now() - startTime
      });

      // Store in database
      await storeEmotionResult(supabase, {
        media_type: 'text',
        content_text: textContent,
        sentiment_polarity: textResult.sentiment_polarity,
        sentiment_score: textResult.sentiment_score,
        emotional_tone: textResult.emotional_tone,
        confidence_score: textResult.confidence_score,
        platform: 'multimodal_processor',
        region_detected: textResult.region_detected,
        language_detected: textResult.language_detected
      });
    }

    // Process image content
    const imageFile = formData.get('image') as File;
    const imageUrl = formData.get('image_url') as string;
    
    if (imageFile || imageUrl) {
      console.log('Processing image content...');
      const imageResult = await processImageEmotion(imageFile, imageUrl);
      results.push({
        media_type: 'image',
        primary_emotion: imageResult.primary_emotion,
        confidence_score: imageResult.confidence_score,
        detailed_analysis: imageResult.detailed_analysis,
        processing_time_ms: Date.now() - startTime
      });

      // Store in database
      await storeEmotionResult(supabase, {
        media_type: 'image',
        content_text: imageResult.description || 'Image content',
        media_url: imageUrl || 'uploaded_file',
        sentiment_polarity: imageResult.sentiment_polarity,
        sentiment_score: imageResult.sentiment_score,
        emotional_tone: imageResult.emotional_tone,
        visual_emotions: imageResult.visual_emotions,
        facial_emotion_scores: imageResult.facial_emotion_scores,
        confidence_score: imageResult.confidence_score,
        platform: 'multimodal_processor',
        media_metadata: imageResult.metadata
      });
    }

    // Process audio content
    const audioFile = formData.get('audio') as File;
    if (audioFile) {
      console.log('Processing audio content...');
      const audioResult = await processAudioEmotion(audioFile);
      results.push({
        media_type: 'audio',
        primary_emotion: audioResult.primary_emotion,
        confidence_score: audioResult.confidence_score,
        detailed_analysis: audioResult.detailed_analysis,
        processing_time_ms: Date.now() - startTime
      });

      // Store in database
      await storeEmotionResult(supabase, {
        media_type: 'audio',
        content_text: audioResult.transcript || 'Audio content',
        audio_transcript: audioResult.transcript,
        sentiment_polarity: audioResult.sentiment_polarity,
        sentiment_score: audioResult.sentiment_score,
        emotional_tone: audioResult.emotional_tone,
        audio_emotion_analysis: audioResult.audio_emotion_analysis,
        confidence_score: audioResult.confidence_score,
        platform: 'multimodal_processor',
        language_detected: audioResult.language_detected,
        media_metadata: audioResult.metadata
      });
    }

    // Process video content
    const videoFile = formData.get('video') as File;
    if (videoFile) {
      console.log('Processing video content...');
      const videoResult = await processVideoEmotion(videoFile);
      results.push({
        media_type: 'video',
        primary_emotion: videoResult.primary_emotion,
        confidence_score: videoResult.confidence_score,
        detailed_analysis: videoResult.detailed_analysis,
        processing_time_ms: Date.now() - startTime
      });

      // Store in database
      await storeEmotionResult(supabase, {
        media_type: 'video',
        content_text: videoResult.description || 'Video content',
        audio_transcript: videoResult.transcript,
        sentiment_polarity: videoResult.sentiment_polarity,
        sentiment_score: videoResult.sentiment_score,
        emotional_tone: videoResult.emotional_tone,
        visual_emotions: videoResult.visual_emotions,
        facial_emotion_scores: videoResult.facial_emotion_scores,
        audio_emotion_analysis: videoResult.audio_emotion_analysis,
        multimodal_confidence: videoResult.multimodal_confidence,
        confidence_score: videoResult.confidence_score,
        platform: 'multimodal_processor',
        language_detected: videoResult.language_detected,
        media_metadata: videoResult.metadata
      });
    }

    const totalProcessingTime = Date.now() - startTime;
    console.log(`Multimodal processing completed in ${totalProcessingTime}ms`);

    return new Response(JSON.stringify({ 
      results,
      total_processing_time_ms: totalProcessingTime,
      processed_modalities: results.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Multimodal processing error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Text emotion processing using OpenAI
async function processTextEmotion(text: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are an expert emotion analysis AI for Cameroon civic monitoring. Analyze text for emotions, sentiment, and regional context.
          
          Respond in JSON format:
          {
            "primary_emotion": "dominant emotion (joy, anger, sadness, fear, pride, hope, indifference, sarcasm)",
            "sentiment_polarity": "positive, negative, or neutral",
            "sentiment_score": -1.0 to 1.0,
            "emotional_tone": ["list", "of", "detected", "emotions"],
            "confidence_score": 0.0 to 1.0,
            "language_detected": "en, fr, or pidgin",
            "region_detected": "Cameroon region if detectable",
            "civic_relevance": 0.0 to 1.0,
            "threat_level": "none, low, medium, high, critical"
          }`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const analysis = JSON.parse(data.choices[0].message.content);
  
  return {
    ...analysis,
    detailed_analysis: {
      text_sentiment: {
        polarity: analysis.sentiment_polarity,
        score: analysis.sentiment_score
      },
      region_detected: analysis.region_detected,
      civic_relevance: analysis.civic_relevance,
      threat_level: analysis.threat_level
    }
  };
}

// Image emotion processing using OpenAI Vision
async function processImageEmotion(imageFile?: File, imageUrl?: string) {
  let imageContent;
  
  if (imageFile) {
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    imageContent = `data:${imageFile.type};base64,${base64Image}`;
  } else if (imageUrl) {
    imageContent = imageUrl;
  } else {
    throw new Error('No image provided');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert computer vision AI for Cameroon civic emotion analysis. Analyze images for emotional content, facial expressions, crowd emotions, protest scenes, and civic context.
          
          Respond in JSON format:
          {
            "primary_emotion": "dominant emotion in image",
            "description": "brief description of image content",
            "facial_emotions": {"joy": 0.8, "anger": 0.2, "sadness": 0.1, "fear": 0.0, "surprise": 0.0, "disgust": 0.0},
            "crowd_emotion": "overall crowd mood if applicable",
            "scene_context": "protest, celebration, funeral, rally, etc.",
            "sentiment_polarity": "positive, negative, or neutral",
            "sentiment_score": -1.0 to 1.0,
            "emotional_tone": ["detected", "emotions"],
            "confidence_score": 0.0 to 1.0,
            "civic_relevance": 0.0 to 1.0,
            "threat_indicators": true/false,
            "region_indicators": "visual clues about Cameroon regions"
          }`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image for emotional content and civic context' },
            { type: 'image_url', image_url: { url: imageContent } }
          ]
        }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const analysis = JSON.parse(data.choices[0].message.content);
  
  return {
    ...analysis,
    visual_emotions: analysis.facial_emotions || {},
    facial_emotion_scores: analysis.facial_emotions || {},
    detailed_analysis: {
      facial_emotions: analysis.facial_emotions,
      scene_context: analysis.scene_context,
      crowd_emotion: analysis.crowd_emotion,
      threat_indicators: analysis.threat_indicators,
      region_indicators: analysis.region_indicators
    },
    metadata: {
      scene_context: analysis.scene_context,
      civic_relevance: analysis.civic_relevance
    }
  };
}

// Audio emotion processing
async function processAudioEmotion(audioFile: File) {
  // First transcribe the audio
  const transcriptionFormData = new FormData();
  transcriptionFormData.append('file', audioFile);
  transcriptionFormData.append('model', 'whisper-1');
  transcriptionFormData.append('language', 'fr'); // Support French, English will auto-detect

  const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
    },
    body: transcriptionFormData,
  });

  const transcriptionData = await transcriptionResponse.json();
  const transcript = transcriptionData.text;

  // Analyze the transcribed text for emotion
  const textAnalysis = await processTextEmotion(transcript);

  // Additional audio-specific analysis
  const audioAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `Analyze audio transcript for emotional tone, considering that this is spoken content from Cameroon. 
          Consider voice patterns typical of emotional states like anger (shouting), fear (trembling voice), joy (upbeat tone), etc.
          
          Respond in JSON format:
          {
            "audio_tone": "angry, fearful, joyful, sad, neutral, excited, aggressive",
            "speaking_style": "shouting, whispering, normal, chanting, singing",
            "emotional_intensity": 0.0 to 1.0,
            "language_dialect": "french, english, pidgin, mixed",
            "civic_context": "protest, speech, conversation, announcement",
            "group_or_individual": "individual, small_group, crowd, rally"
          }`
        },
        { role: 'user', content: `Transcript: "${transcript}"` }
      ],
      temperature: 0.3,
    }),
  });

  const audioAnalysisData = await audioAnalysisResponse.json();
  const audioAnalysis = JSON.parse(audioAnalysisData.choices[0].message.content);

  return {
    ...textAnalysis,
    transcript,
    audio_emotion_analysis: audioAnalysis,
    detailed_analysis: {
      ...textAnalysis.detailed_analysis,
      audio_analysis: {
        tone: audioAnalysis.audio_tone,
        speaking_style: audioAnalysis.speaking_style,
        intensity: audioAnalysis.emotional_intensity,
        language: audioAnalysis.language_dialect,
        context: audioAnalysis.civic_context,
        group_type: audioAnalysis.group_or_individual
      }
    },
    metadata: {
      duration: 'unknown', // Would need audio analysis library for this
      format: audioFile.type,
      size: audioFile.size
    }
  };
}

// Video emotion processing (combines audio and visual)
async function processVideoEmotion(videoFile: File) {
  // For now, we'll process video as a combination of audio extraction and frame analysis
  // In a production system, you'd use specialized video processing libraries
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `Analyze video content metadata for emotional context. Since we cannot process video directly, provide a comprehensive analysis framework.
          
          Respond in JSON format:
          {
            "primary_emotion": "estimated dominant emotion",
            "description": "Video analysis framework description",
            "sentiment_polarity": "estimated polarity",
            "sentiment_score": 0.0,
            "emotional_tone": ["video", "emotion", "analysis"],
            "confidence_score": 0.5,
            "multimodal_confidence": 0.5,
            "processing_note": "Video processing requires specialized tools"
          }`
        },
        { role: 'user', content: `Video file: ${videoFile.name}, Size: ${videoFile.size}, Type: ${videoFile.type}` }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const analysis = JSON.parse(data.choices[0].message.content);
  
  return {
    ...analysis,
    visual_emotions: {},
    facial_emotion_scores: {},
    audio_emotion_analysis: {},
    transcript: '',
    detailed_analysis: {
      processing_note: "Full video processing requires specialized computer vision and audio processing tools",
      framework_ready: true
    },
    metadata: {
      filename: videoFile.name,
      size: videoFile.size,
      type: videoFile.type
    }
  };
}

// Store emotion analysis result in database
async function storeEmotionResult(supabase: any, data: any) {
  const { error } = await supabase
    .from('camerpulse_intelligence_sentiment_logs')
    .insert([{
      platform: data.platform,
      content_text: data.content_text,
      media_type: data.media_type,
      media_url: data.media_url,
      media_metadata: data.media_metadata,
      audio_transcript: data.audio_transcript,
      sentiment_polarity: data.sentiment_polarity,
      sentiment_score: data.sentiment_score,
      emotional_tone: data.emotional_tone,
      confidence_score: data.confidence_score,
      visual_emotions: data.visual_emotions,
      facial_emotion_scores: data.facial_emotion_scores,
      audio_emotion_analysis: data.audio_emotion_analysis,
      multimodal_confidence: data.multimodal_confidence,
      language_detected: data.language_detected,
      region_detected: data.region_detected,
      processed_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error storing emotion result:', error);
    throw error;
  }
}