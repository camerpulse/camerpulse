-- Add multimodal support to CamerPulse Intelligence sentiment logs
ALTER TABLE public.camerpulse_intelligence_sentiment_logs 
ADD COLUMN media_type TEXT DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'audio', 'video', 'multimodal')),
ADD COLUMN media_url TEXT,
ADD COLUMN media_metadata JSONB DEFAULT '{}',
ADD COLUMN visual_emotions JSONB DEFAULT '{}', -- For image/video emotion detection
ADD COLUMN audio_transcript TEXT, -- For audio content transcription
ADD COLUMN facial_emotion_scores JSONB DEFAULT '{}', -- Facial emotion analysis for images/videos
ADD COLUMN audio_emotion_analysis JSONB DEFAULT '{}', -- Audio tone and emotion analysis
ADD COLUMN multimodal_confidence NUMERIC(3,2) DEFAULT 1.0; -- Overall confidence across modalities

-- Create index for efficient media type queries
CREATE INDEX idx_camerpulse_sentiment_media_type ON public.camerpulse_intelligence_sentiment_logs(media_type);
CREATE INDEX idx_camerpulse_sentiment_media_url ON public.camerpulse_intelligence_sentiment_logs(media_url);

-- Add comment explaining the new fields
COMMENT ON COLUMN public.camerpulse_intelligence_sentiment_logs.media_type IS 'Type of media content: text, image, audio, video, or multimodal';
COMMENT ON COLUMN public.camerpulse_intelligence_sentiment_logs.media_url IS 'URL or path to the media file (image, audio, or video)';
COMMENT ON COLUMN public.camerpulse_intelligence_sentiment_logs.media_metadata IS 'Additional metadata about the media file (duration, format, dimensions, etc.)';
COMMENT ON COLUMN public.camerpulse_intelligence_sentiment_logs.visual_emotions IS 'JSON object containing visual emotion analysis results from images/videos';
COMMENT ON COLUMN public.camerpulse_intelligence_sentiment_logs.audio_transcript IS 'Transcribed text from audio content for analysis';
COMMENT ON COLUMN public.camerpulse_intelligence_sentiment_logs.facial_emotion_scores IS 'Detailed facial emotion recognition scores (joy, anger, sadness, fear, surprise, disgust)';
COMMENT ON COLUMN public.camerpulse_intelligence_sentiment_logs.audio_emotion_analysis IS 'Audio-specific emotion analysis including tone, pitch, volume patterns, dialect detection';
COMMENT ON COLUMN public.camerpulse_intelligence_sentiment_logs.multimodal_confidence IS 'Confidence score for multimodal analysis combining text, visual, and audio inputs';