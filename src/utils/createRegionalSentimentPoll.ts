import { supabase } from '@/integrations/supabase/client';

export const createRegionalSentimentPoll = async (userId: string) => {
  const pollData = {
    title: "Which Cameroonian region do you believe deserves more development focus right now?",
    description: "Help shape our understanding of regional development priorities across Cameroon",
    options: [
      "Far North",
      "North West", 
      "South West",
      "East",
      "Adamawa",
      "All regions deserve equal focus"
    ],
    creator_id: userId,
    privacy_mode: 'public',
    poll_type: 'civic',
    style: 'chart',
    tags: ['development', 'regions', 'governance', 'infrastructure'],
    is_active: true,
    ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
    show_results_after_expiry: true,
    allow_comments: true,
    moderation_enabled: true,
    requires_verification: false,
    custom_settings: {
      chartType: "horizontal_bar",
      colorTheme: "cameroon_gradient", // Red-Green-Yellow
      showRegionalMap: true,
      geoLockingEnabled: true,
      allowPDFExport: true,
      ministryTagging: true,
      regionAutoMatch: true,
      displayFormat: "horizontal_bar_by_region",
      colors: {
        gradient: ["#007A37", "#FCDD09", "#D21034"], // Cameroon flag colors
        barColors: {
          0: "#D21034", // Far North - Red
          1: "#FCDD09", // North West - Yellow  
          2: "#007A37", // South West - Green
          3: "#D21034", // East - Red
          4: "#FCDD09", // Adamawa - Yellow
          5: "#007A37"  // All regions - Green
        }
      }
    }
  };

  const { data, error } = await supabase
    .from('polls')
    .insert([pollData])
    .select()
    .single();

  if (error) {
    console.error('Error creating regional sentiment poll:', error);
    throw error;
  }

  return data;
};