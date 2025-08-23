-- Update existing profiles with better sample data
UPDATE profiles SET 
  bio = CASE 
    WHEN username = 'camerpulse' THEN 'Founder of CamerPulse - Connecting Cameroonians nationwide 🇨🇲'
    WHEN username = 'cemactrack' THEN 'Business analyst tracking Central African markets 📊'
    WHEN username = 'danka' THEN 'Tech entrepreneur building the future of digital payments 💳'
    WHEN username = '@morningstar' THEN 'Community leader and social activist 🌟'
  END,
  location = CASE 
    WHEN username = 'camerpulse' THEN 'Yaoundé, Cameroon'
    WHEN username = 'cemactrack' THEN 'Douala, Cameroon'
    WHEN username = 'danka' THEN 'Bamenda, Cameroon'
    WHEN username = '@morningstar' THEN 'Bafoussam, Cameroon'
  END,
  verified = CASE 
    WHEN username = 'camerpulse' THEN true
    WHEN username = 'cemactrack' THEN true
    ELSE false
  END
WHERE username IN ('camerpulse', 'cemactrack', 'danka', '@morningstar');

-- Add more engaging sample posts using existing user IDs
INSERT INTO pulse_posts (user_id, content, hashtags, location, sentiment_score, created_at)
VALUES
  -- CamerPulse posts
  ((SELECT user_id FROM profiles WHERE username = 'camerpulse'), 
   'Exciting news! CamerPulse just hit 10,000 active users! 🎉 Thank you for trusting us to be your digital town square. More features coming soon! #CamerPulse #Community #Milestone', 
   ARRAY['CamerPulse', 'Community', 'Milestone'], 
   'Yaoundé, Cameroon', 
   0.9, 
   now() - interval '2 hours'),
   
  -- Cemactrack posts
  ((SELECT user_id FROM profiles WHERE username = 'cemactrack'), 
   'CEMAC trade volumes increased by 15% this quarter! Strong growth in agricultural exports driving regional economy 📈 #CEMAC #Trade #Economy #Agriculture', 
   ARRAY['CEMAC', 'Trade', 'Economy', 'Agriculture'], 
   'Douala, Cameroon', 
   0.7, 
   now() - interval '4 hours'),
   
  -- Danka posts  
  ((SELECT user_id FROM profiles WHERE username = 'danka'), 
   'Just launched beta testing for our new mobile money integration! Making payments easier for everyone in Cameroon 💰 #FinTech #MobileMoney #Innovation', 
   ARRAY['FinTech', 'MobileMoney', 'Innovation'], 
   'Bamenda, Cameroon', 
   0.8, 
   now() - interval '6 hours'),
   
  -- Morningstar posts
  ((SELECT user_id FROM profiles WHERE username = '@morningstar'), 
   'Our womens empowerment workshop reached 200 participants today! When we empower women, we strengthen our entire community 💪 #WomensEmpowerment #CommunityDevelopment', 
   ARRAY['WomensEmpowerment', 'CommunityDevelopment'], 
   'Bafoussam, Cameroon', 
   0.8, 
   now() - interval '8 hours'),
   
  -- More varied content
  ((SELECT user_id FROM profiles WHERE username = 'camerpulse'), 
   'The future of civic engagement is digital. Every voice matters, every vote counts. Join the conversation! 🗳️ #CivicEngagement #Democracy #YourVoiceMatters', 
   ARRAY['CivicEngagement', 'Democracy', 'YourVoiceMatters'], 
   'Yaoundé, Cameroon', 
   0.6, 
   now() - interval '12 hours'),
   
  ((SELECT user_id FROM profiles WHERE username = 'cemactrack'), 
   'New infrastructure projects announced: Douala-Yaoundé highway expansion begins next month! This will cut travel time by 30% ⏱️ #Infrastructure #Transport #Development', 
   ARRAY['Infrastructure', 'Transport', 'Development'], 
   'Douala, Cameroon', 
   0.7, 
   now() - interval '1 day'),
   
  ((SELECT user_id FROM profiles WHERE username = 'danka'), 
   'Blockchain technology can revolutionize land ownership records in Cameroon. Transparency and security for all! ⛓️ #Blockchain #LandRights #Tech4Good', 
   ARRAY['Blockchain', 'LandRights', 'Tech4Good'], 
   'Bamenda, Cameroon', 
   0.5, 
   now() - interval '1 day 6 hours'),
   
  ((SELECT user_id FROM profiles WHERE username = '@morningstar'), 
   'Educational inequality remains our biggest challenge. Every child deserves quality education regardless of their location 📚 #Education #Equality #ChildRights', 
   ARRAY['Education', 'Equality', 'ChildRights'], 
   'Bafoussam, Cameroon', 
   0.3, 
   now() - interval '2 days'),
   
  ((SELECT user_id FROM profiles WHERE username = 'camerpulse'), 
   'Digital literacy is the new literacy! Our online courses have helped 5,000+ Cameroonians learn tech skills 💻 #DigitalLiteracy #TechEducation #SkillDevelopment', 
   ARRAY['DigitalLiteracy', 'TechEducation', 'SkillDevelopment'], 
   'Yaoundé, Cameroon', 
   0.8, 
   now() - interval '3 days'),
   
  ((SELECT user_id FROM profiles WHERE username = 'danka'), 
   'Climate change is real and affecting our farmers. We need sustainable agricultural practices NOW! 🌱 #ClimateChange #SustainableAgriculture #Environment', 
   ARRAY['ClimateChange', 'SustainableAgriculture', 'Environment'], 
   'Bamenda, Cameroon', 
   -0.2, 
   now() - interval '4 days');

-- Create realistic interactions between users
INSERT INTO pulse_post_likes (user_id, post_id, created_at)
SELECT 
  liker.user_id,
  post.id,
  post.created_at + interval '30 minutes' + (random() * interval '4 hours')
FROM pulse_posts post
CROSS JOIN profiles liker
WHERE liker.user_id != post.user_id  -- Don't like your own posts
AND random() < 0.4  -- 40% chance of like
ON CONFLICT DO NOTHING;

-- Add meaningful comments
INSERT INTO pulse_post_comments (post_id, user_id, content, created_at)
SELECT 
  post.id,
  commenter.user_id,
  CASE 
    WHEN commenter.username = 'camerpulse' THEN 'Thanks for being part of our growing community! 🙏'
    WHEN commenter.username = 'cemactrack' THEN 'Great insights! These numbers look very promising for the region.'
    WHEN commenter.username = 'danka' THEN 'Innovation like this is exactly what Cameroon needs right now!'
    WHEN commenter.username = '@morningstar' THEN 'This is the kind of positive change we need to see more of! 👏'
  END,
  post.created_at + interval '1 hour' + (random() * interval '8 hours')
FROM pulse_posts post
CROSS JOIN profiles commenter
WHERE commenter.user_id != post.user_id
AND random() < 0.3  -- 30% chance of comment
AND post.created_at > now() - interval '5 days'  -- Only recent posts
LIMIT 15;

-- Add some bookmarks for good content
INSERT INTO pulse_post_bookmarks (user_id, post_id, created_at)
SELECT 
  bookmarker.user_id,
  post.id,
  post.created_at + interval '2 hours' + (random() * interval '12 hours')
FROM pulse_posts post
CROSS JOIN profiles bookmarker
WHERE bookmarker.user_id != post.user_id
AND post.hashtags && ARRAY['Innovation', 'TechEducation', 'CommunityDevelopment']  -- Bookmark educational/tech content
AND random() < 0.2  -- 20% chance of bookmark
ON CONFLICT DO NOTHING;