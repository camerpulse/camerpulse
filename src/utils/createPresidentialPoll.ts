import { supabase } from '@/integrations/supabase/client';

export const createPresidentialPoll = async (userId: string) => {
  // Party logos configuration
  const partyLogos = {
    "Incumbent President (CPDM)": "/api/placeholder/60/60", // CPDM logo
    "Maurice Kamto (CRM)": "/api/placeholder/60/60", // CRM logo  
    "Cabral Libii (PCRN)": "/api/placeholder/60/60", // PCRN logo
    "None of the above": null
  };

  const pollData = {
    creator_id: userId,
    title: "If presidential elections were held today, who would you vote for?",
    description: "This is an election simulation poll to gauge public sentiment regarding potential presidential candidates for the upcoming electoral cycle.",
    options: [
      "Incumbent President (CPDM)",
      "Maurice Kamto (CRM)", 
      "Cabral Libii (PCRN)",
      "None of the above"
    ],
    ends_at: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString(), // 14 days from now
    privacy_mode: 'public' as const,
    show_results_after_expiry: false, // Hide results until poll expires
    auto_delete_at: null,
    is_active: true,
    theme_color: 'primary' as const,
    banner_image_url: null,
    anonymous_mode: false, // Requires verified account
    duration_days: 14,
    poll_type: 'political' as const,
    tags: ['elections', '2025', 'presidential', 'simulation'],
    civic_impact_level: 'very_high' as const,
    enable_comments: true,
    enable_geo_analytics: true,
    featured_on_home: true,
    poll_style: 'ballot' as const,
    party_logos: partyLogos,
    moderation_enabled: true,
    requires_verification: true // Only verified accounts can vote
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
          p_description: `Created presidential election simulation poll: ${pollData.title}`
        });
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error creating presidential poll:', error);
    throw error;
  }
};

// Regional breakdown utilities
export const getRegionalBreakdown = async (pollId: string) => {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select(`
        option_index,
        region,
        created_at
      `)
      .eq('poll_id', pollId);

    if (error) throw error;

    // Group votes by region and option
    const regionalData = data.reduce((acc: any, vote) => {
      if (!acc[vote.region]) {
        acc[vote.region] = {};
      }
      if (!acc[vote.region][vote.option_index]) {
        acc[vote.region][vote.option_index] = 0;
      }
      acc[vote.region][vote.option_index]++;
      return acc;
    }, {});

    return regionalData;
  } catch (error) {
    console.error('Error getting regional breakdown:', error);
    return {};
  }
};