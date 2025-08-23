-- First, let's add some sample user profiles
INSERT INTO profiles (user_id, username, display_name, bio, avatar_url, verified, location, created_at)
VALUES 
  (gen_random_uuid(), 'sarah_yaounde', 'Sarah Mballa', 'Tech entrepreneur passionate about digital transformation in Cameroon 🚀', null, true, 'Yaoundé, Cameroon', now() - interval '30 days'),
  (gen_random_uuid(), 'jean_douala', 'Jean Fotso', 'Journalist covering politics and social issues. Voice for the voiceless 📰', null, true, 'Douala, Cameroon', now() - interval '25 days'),
  (gen_random_uuid(), 'marie_bamenda', 'Marie Tankou', 'Community organizer and womens rights advocate 💪', null, false, 'Bamenda, Cameroon', now() - interval '20 days'),
  (gen_random_uuid(), 'paul_bafoussam', 'Paul Kengne', 'Agricultural innovation researcher. Feeding the future 🌱', null, false, 'Bafoussam, Cameroon', now() - interval '15 days'),
  (gen_random_uuid(), 'grace_garoua', 'Grace Abdou', 'Healthcare worker and public health advocate 🩺', null, true, 'Garoua, Cameroon', now() - interval '10 days'),
  (gen_random_uuid(), 'antoine_kribi', 'Antoine Essomba', 'Environmental activist fighting for coastal conservation 🌊', null, false, 'Kribi, Cameroon', now() - interval '8 days'),
  (gen_random_uuid(), 'fatima_maroua', 'Fatima Aliou', 'Education policy researcher and teacher 📚', null, false, 'Maroua, Cameroon', now() - interval '5 days'),
  (gen_random_uuid(), 'eric_limbe', 'Eric Mokake', 'Software developer building solutions for Africa 💻', null, false, 'Limbe, Cameroon', now() - interval '3 days')
ON CONFLICT (user_id) DO NOTHING;

-- Add more diverse pulse posts with realistic content
INSERT INTO pulse_posts (user_id, content, hashtags, location, sentiment_score, created_at)
SELECT 
  p.user_id,
  CASE 
    WHEN p.username = 'sarah_yaounde' THEN 'Just launched our new fintech app to help small businesses in Cameroon access mobile payments! This is the future of commerce in Africa 🚀 #FinTech #MobilePayments #CameroonTech #Innovation'
    WHEN p.username = 'jean_douala' THEN 'Breaking: New infrastructure projects announced for the Southwest region. This could be a game-changer for rural connectivity and economic development. #Infrastructure #Development #CameroonNews'
    WHEN p.username = 'marie_bamenda' THEN 'Proud to announce that our womens cooperative secured funding for 200 new micro-enterprises! When women thrive, communities thrive 💪 #WomensEmpowerment #MicroFinance #CommunityDevelopment'
    WHEN p.username = 'paul_bafoussam' THEN 'Our drought-resistant cassava variety is showing 40% higher yields in field tests. Food security through innovation! 🌱 #Agriculture #FoodSecurity #Innovation #Cassava'
    WHEN p.username = 'grace_garoua' THEN 'Completed another successful vaccination drive in remote villages. Healthcare is a human right, not a privilege. 💉 #Healthcare #PublicHealth #VaccinationDrive #CommunityHealth'
    WHEN p.username = 'antoine_kribi' THEN 'Alarming: Plastic waste on our beaches has increased 25% this year. We need immediate action to protect our marine ecosystems! 🌊 #Environment #OceanConservation #ClimateAction'
    WHEN p.username = 'fatima_maroua' THEN 'Our new digital literacy program reached 500 students this month! Technology education is key to preparing our youth for the future. 📱 #DigitalLiteracy #Education #YouthEmpowerment'
    WHEN p.username = 'eric_limbe' THEN 'Building a ride-sharing app specifically for Cameroon urban transport challenges. Local solutions for local problems! 🚗 #TechForGood #UrbanMobility #LocalInnovation'
  END as content,
  CASE 
    WHEN p.username = 'sarah_yaounde' THEN ARRAY['FinTech', 'MobilePayments', 'CameroonTech', 'Innovation']
    WHEN p.username = 'jean_douala' THEN ARRAY['Infrastructure', 'Development', 'CameroonNews']
    WHEN p.username = 'marie_bamenda' THEN ARRAY['WomensEmpowerment', 'MicroFinance', 'CommunityDevelopment']
    WHEN p.username = 'paul_bafoussam' THEN ARRAY['Agriculture', 'FoodSecurity', 'Innovation', 'Cassava']
    WHEN p.username = 'grace_garoua' THEN ARRAY['Healthcare', 'PublicHealth', 'VaccinationDrive', 'CommunityHealth']
    WHEN p.username = 'antoine_kribi' THEN ARRAY['Environment', 'OceanConservation', 'ClimateAction']
    WHEN p.username = 'fatima_maroua' THEN ARRAY['DigitalLiteracy', 'Education', 'YouthEmpowerment']
    WHEN p.username = 'eric_limbe' THEN ARRAY['TechForGood', 'UrbanMobility', 'LocalInnovation']
  END as hashtags,
  p.location,
  CASE 
    WHEN p.username IN ('sarah_yaounde', 'marie_bamenda', 'paul_bafoussam', 'grace_garoua', 'fatima_maroua', 'eric_limbe') THEN 0.8
    WHEN p.username = 'jean_douala' THEN 0.3
    WHEN p.username = 'antoine_kribi' THEN -0.2
  END as sentiment_score,
  now() - (random() * interval '7 days') as created_at
FROM profiles p 
WHERE p.username IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add some additional varied posts for more content
INSERT INTO pulse_posts (user_id, content, hashtags, location, sentiment_score, created_at)
SELECT 
  p.user_id,
  content_array[floor(random() * array_length(content_array, 1) + 1)],
  hashtags_array[floor(random() * array_length(hashtags_array, 1) + 1)],
  p.location,
  (random() * 2 - 1)::numeric(3,2),
  now() - (random() * interval '14 days') as created_at
FROM profiles p 
CROSS JOIN (
  VALUES 
    (ARRAY[
      'The new metro project in Douala is moving forward! This will transform public transport in our economic capital 🚇 #PublicTransport #Infrastructure #Douala',
      'Celebrating International Day of Democracy with a call for greater youth participation in governance 🗳️ #Democracy #YouthParticipation #Governance',
      'Traditional medicine meets modern healthcare: Our new research collaboration is promising! 🌿 #TraditionalMedicine #Healthcare #Research',
      'Coffee farmers in the West Region are adopting new sustainable practices. Great news for our economy and environment! ☕ #Coffee #Sustainability #Agriculture'
    ], ARRAY[
      ARRAY['PublicTransport', 'Infrastructure', 'Douala'],
      ARRAY['Democracy', 'YouthParticipation', 'Governance'],
      ARRAY['TraditionalMedicine', 'Healthcare', 'Research'],
      ARRAY['Coffee', 'Sustainability', 'Agriculture']
    ])
) as t(content_array, hashtags_array)
WHERE p.username IS NOT NULL
LIMIT 25;

-- Create some likes and interactions for the posts
INSERT INTO pulse_post_likes (user_id, post_id, created_at)
SELECT 
  liker.user_id,
  post.id,
  post.created_at + (random() * interval '24 hours')
FROM pulse_posts post
CROSS JOIN profiles liker
WHERE random() < 0.3  -- 30% chance of like
AND liker.user_id != post.user_id  -- Don't like your own posts
ON CONFLICT DO NOTHING;

-- Add some comments
INSERT INTO pulse_post_comments (post_id, user_id, content, created_at)
SELECT 
  post.id,
  commenter.user_id,
  comments_array[floor(random() * array_length(comments_array, 1) + 1)],
  post.created_at + (random() * interval '48 hours')
FROM pulse_posts post
CROSS JOIN profiles commenter
CROSS JOIN (
  VALUES (ARRAY[
    'Great work! Keep it up 👏',
    'This is exactly what we need in Cameroon!',
    'How can I get involved in this initiative?',
    'Brilliant innovation! Proud to be Cameroonian 🇨🇲',
    'This gives me hope for our future',
    'More people need to see this',
    'Excellent points raised here',
    'Keep pushing for positive change!'
  ])
) as t(comments_array)
WHERE random() < 0.2  -- 20% chance of comment
AND commenter.user_id != post.user_id
LIMIT 40;

-- Add some bookmarks
INSERT INTO pulse_post_bookmarks (user_id, post_id, created_at)
SELECT 
  bookmarker.user_id,
  post.id,
  post.created_at + (random() * interval '72 hours')
FROM pulse_posts post
CROSS JOIN profiles bookmarker
WHERE random() < 0.15  -- 15% chance of bookmark
AND bookmarker.user_id != post.user_id
ON CONFLICT DO NOTHING;