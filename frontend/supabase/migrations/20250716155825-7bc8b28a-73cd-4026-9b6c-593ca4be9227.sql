-- Create poll templates table
CREATE TABLE public.poll_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL UNIQUE,
  style_name TEXT NOT NULL,
  description TEXT NOT NULL,
  layout_type TEXT NOT NULL,
  style_class TEXT NOT NULL,
  color_theme JSONB NOT NULL DEFAULT '{}',
  icon_set TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  supported_poll_types TEXT[] NOT NULL DEFAULT ARRAY['standard', 'yes_no', 'multiple_choice'],
  preview_image_url TEXT,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.poll_templates ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active templates
CREATE POLICY "Anyone can view active poll templates"
ON public.poll_templates
FOR SELECT
USING (is_active = true);

-- Only admins can manage templates
CREATE POLICY "Admins can manage poll templates"
ON public.poll_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_poll_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_poll_templates_updated_at
BEFORE UPDATE ON public.poll_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_poll_templates_updated_at();

-- Insert the 10 poll templates
INSERT INTO public.poll_templates (
  template_name, style_name, description, layout_type, style_class, 
  color_theme, icon_set, supported_poll_types, features
) VALUES 
(
  'civic_card',
  'Civic Card',
  'Clean card design with Cameroon flag badge and real-time progress bars for government polls',
  'card',
  'civic-card-template',
  '{"primary": "#007A33", "secondary": "#FFD700", "accent": "#CE1126", "background": "#FFFFFF", "text": "#2D3748"}',
  'government',
  ARRAY['standard', 'yes_no', 'multiple_choice'],
  '{"hasProgressBars": true, "hasFlag": true, "maxOptions": 5, "showRealTime": true}'
),
(
  'interactive_ballot',
  'Interactive Ballot',
  'Mimics national voting slip with formal design for elections and serious governance polls',
  'ballot',
  'ballot-template',
  '{"primary": "#2B6CB0", "secondary": "#F7FAFC", "accent": "#1A365D", "background": "#FFFFFF", "text": "#1A202C"}',
  'voting',
  ARRAY['yes_no', 'multiple_choice'],
  '{"formalStyle": true, "tickBoxes": true, "officialLook": true, "maxOptions": 6}'
),
(
  'bar_chart_vote',
  'Bar Chart Vote',
  'Animated horizontal bars perfect for numerical voting and satisfaction scales',
  'chart',
  'bar-chart-template',
  '{"primary": "#38A169", "secondary": "#68D391", "accent": "#2F855A", "background": "#F7FAFC", "text": "#2D3748"}',
  'analytics',
  ARRAY['standard', 'rating', 'scale'],
  '{"animatedBars": true, "showPercentages": true, "liveUpdate": true, "chartType": "horizontal"}'
),
(
  'emoji_burst',
  'Emoji Burst',
  'Fun emoji-based options with floating animations - perfect for viral engagement',
  'emoji',
  'emoji-burst-template',
  '{"primary": "#ED8936", "secondary": "#FED7AA", "accent": "#C05621", "background": "#FFFAF0", "text": "#744210"}',
  'emoji',
  ARRAY['emoji', 'reaction', 'sentiment'],
  '{"emojiAnimations": true, "floatingEffects": true, "viralOptimized": true, "touchFriendly": true}'
),
(
  'radar_sentiment',
  'Radar Chart Civic Sentiment',
  'Interactive radar chart for multi-issue civic priorities like health, education, economy',
  'radar',
  'radar-sentiment-template',
  '{"primary": "#805AD5", "secondary": "#D6BCFA", "accent": "#553C9A", "background": "#FAF5FF", "text": "#44337A"}',
  'civic',
  ARRAY['priority', 'multi_select', 'civic'],
  '{"radarChart": true, "multipleIssues": true, "interactivePoints": true, "maxIssues": 6}'
),
(
  'flash_poll',
  'Flash Poll (Time-Limited)',
  'Urgent polls with countdown timer - expires in 1-5 minutes with high-energy styling',
  'timer',
  'flash-poll-template',
  '{"primary": "#E53E3E", "secondary": "#FED7D7", "accent": "#C53030", "background": "#FFFAFA", "text": "#742A2A"}',
  'timer',
  ARRAY['flash', 'urgent', 'time_limited'],
  '{"countdown": true, "urgentStyling": true, "autoExpire": true, "flashEffects": true}'
),
(
  'side_by_side',
  'Side-by-Side Comparison',
  'Visual comparison of 2-3 options with hover-to-zoom for policy or personality comparison',
  'comparison',
  'comparison-template',
  '{"primary": "#3182CE", "secondary": "#BEE3F8", "accent": "#2C5282", "background": "#F7FAFC", "text": "#2A4365"}',
  'comparison',
  ARRAY['comparison', 'visual', 'policy'],
  '{"hoverZoom": true, "visualComparison": true, "maxOptions": 3, "imageSupport": true}'
),
(
  'pulse_heatmap',
  'Pulse Heatmap',
  'Regional voting data with color intensity heatmap showing participation by area',
  'heatmap',
  'heatmap-template',
  '{"primary": "#319795", "secondary": "#81E6D9", "accent": "#2C7A7B", "background": "#F0FDFA", "text": "#234E52"}',
  'regional',
  ARRAY['regional', 'geographic', 'heatmap'],
  '{"regionalData": true, "heatmapColors": true, "geoVisualization": true, "liveUpdates": true}'
),
(
  'carousel_poll',
  'Carousel Poll',
  'Swipeable cards with images, titles, and descriptions - mobile-optimized engagement',
  'carousel',
  'carousel-template',
  '{"primary": "#D69E2E", "secondary": "#F6E05E", "accent": "#B7791F", "background": "#FFFFF0", "text": "#744210"}',
  'media',
  ARRAY['visual', 'media', 'carousel'],
  '{"swipeSupport": true, "imageCards": true, "mobileOptimized": true, "fullScreen": true}'
),
(
  'voice_poll',
  'Voice Poll (Future-Ready)',
  'Accessibility-focused template ready for audio questions and voice responses',
  'voice',
  'voice-template',
  '{"primary": "#9F7AEA", "secondary": "#E9D8FD", "accent": "#7C3AED", "background": "#FEFBFF", "text": "#553C9A"}',
  'accessibility',
  ARRAY['voice', 'accessibility', 'audio'],
  '{"voiceReady": true, "accessibility": true, "audioSupport": true, "futureUpgrade": true}'
);

-- Create poll_template_usage table to track template usage
CREATE TABLE public.poll_template_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.poll_templates(id) ON DELETE CASCADE,
  poll_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on usage table
ALTER TABLE public.poll_template_usage ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own usage
CREATE POLICY "Users can view their own template usage"
ON public.poll_template_usage
FOR SELECT
USING (user_id = auth.uid());

-- Allow users to insert their own usage
CREATE POLICY "Users can track their own template usage"
ON public.poll_template_usage
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can view all usage
CREATE POLICY "Admins can view all template usage"
ON public.poll_template_usage
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);