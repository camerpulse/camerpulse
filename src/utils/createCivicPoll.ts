import { supabase } from '@/integrations/supabase/client';

export const createCivicPoll = async (userId: string) => {
  const pollData = {
    creator_id: userId,
    title: "Do you believe the current government has delivered on its 2020–2025 promises?",
    description: "This poll aims to gauge public opinion on the government's performance regarding their electoral promises made during the 2020-2025 mandate period.",
    options: [
      "Yes, they've done well",
      "Partially, but more needs to be done", 
      "No, they have failed",
      "I'm not sure"
    ],
    ends_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // 7 days from now
    privacy_mode: 'public' as const,
    show_results_after_expiry: true,
    auto_delete_at: null,
    is_active: true,
    theme_color: 'cm-green' as const,
    banner_image_url: null, // Will be set if image is uploaded
    anonymous_mode: false,
    duration_days: 7,
    poll_type: 'political' as const,
    tags: ['politics', 'governance', 'transparency', 'CPDM', 'opposition'],
    civic_impact_level: 'high' as const,
    enable_comments: true,
    enable_geo_analytics: true,
    featured_on_home: true
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
          p_description: `Created civic poll: ${pollData.title}`
        });
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error creating civic poll:', error);
    throw error;
  }
};