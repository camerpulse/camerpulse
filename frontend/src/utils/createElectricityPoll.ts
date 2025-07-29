import { supabase } from '@/integrations/supabase/client';

export const createElectricityPoll = async (userId: string) => {
  const pollData = {
    title: "If Cameroonian electricity had a nickname, what should it be?",
    description: "A humorous take on our beloved power situation - vote for the most fitting nickname!",
    options: [
      "Hide and Seek",
      "Nepa Junior", 
      "Flash & Go",
      "Dumsor Unlimited",
      "Powerless Authority"
    ],
    creator_id: userId,
    privacy_mode: 'anonymous',
    poll_type: 'social',
    style: 'card',
    tags: ['humor', 'power cuts', 'daily life', 'satire'],
    is_active: true,
    ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    show_results_after_expiry: true,
    allow_comments: true,
    moderation_enabled: true,
    requires_verification: false,
    cover_image_url: '/src/assets/electricity-meme.jpg',
    custom_settings: {
      showEmojiResults: true,
      emojiMap: {
        0: "🔥", // Hide and Seek
        1: "😂", // Nepa Junior  
        2: "⚡", // Flash & Go
        3: "😭", // Dumsor Unlimited
        4: "💀"  // Powerless Authority
      },
      shareAsMeme: true,
      resultStyle: "emoji_bars"
    }
  };

  const { data, error } = await supabase
    .from('polls')
    .insert([pollData])
    .select()
    .single();

  if (error) {
    console.error('Error creating electricity poll:', error);
    throw error;
  }

  return data;
};