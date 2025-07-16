import { supabase } from '@/integrations/supabase/client';

export const createYouthPoll = async (userId: string) => {
  const pollData = {
    creator_id: userId,
    title: "Which of these challenges do young Cameroonians face most today?",
    description: "A survey to understand the most pressing issues affecting Cameroonian youth in our current socio-economic climate.",
    options: [
      "Unemployment",
      "Police harassment", 
      "Poor education system",
      "Mental health struggles",
      "Corruption and lack of role models"
    ],
    ends_at: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)).toISOString(), // 5 days from now
    privacy_mode: 'anonymous' as const,
    show_results_after_expiry: true,
    auto_delete_at: null,
    is_active: true,
    theme_color: 'primary' as const, // Blue-green civic gradient
    banner_image_url: null, // Will be set if image is uploaded
    anonymous_mode: true,
    duration_days: 5,
    poll_type: 'social_issues' as const,
    tags: ['youth', 'challenges', 'unemployment', 'education', 'mental-health', 'corruption'],
    civic_impact_level: 'high' as const,
    enable_comments: true,
    enable_geo_analytics: true,
    featured_on_home: true,
    poll_style: 'chart' as const
  };

  try {
    const { data, error } = await supabase
      .from('polls')
      .insert(pollData)
      .select()
      .single();

    if (error) throw error;

    // Award points for creating the poll
    if (userId) {
      try {
        await supabase.rpc('award_points', {
          p_user_id: userId,
          p_activity_type: 'poll_created',
          p_activity_reference_id: data.id,
          p_description: `Created youth challenges poll: ${pollData.title}`
        });
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error creating youth poll:', error);
    throw error;
  }
};

// Social sharing utilities
export const shareOnWhatsApp = (pollTitle: string, pollId: string) => {
  const url = `${window.location.origin}/polls/${pollId}`;
  const text = `Check out this important poll about youth challenges in Cameroon: "${pollTitle}" ${url}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
};

export const shareOnFacebook = (pollTitle: string, pollId: string) => {
  const url = `${window.location.origin}/polls/${pollId}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`Important poll: ${pollTitle}`)}`;
  window.open(facebookUrl, '_blank');
};