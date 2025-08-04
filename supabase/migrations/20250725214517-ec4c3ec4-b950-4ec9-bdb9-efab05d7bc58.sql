-- Insert sample data for demonstration
INSERT INTO public.feed_items (author_id, item_type, title, content, tags, priority, category, metadata) VALUES 
(
  '91569092-36c0-4867-8a0e-370ee026e202'::uuid,
  'pulse',
  NULL,
  'Welcome to the new CamerPulse advanced feed! This AI-powered system intelligently ranks content based on engagement, relevance, and real-time data. #CamerPulse #AI #Innovation',
  ARRAY['CamerPulse', 'AI', 'Innovation'],
  'high',
  'Platform Update',
  '{"source": "system", "algorithm_version": "2.0"}'::jsonb
),
(
  '91569092-36c0-4867-8a0e-370ee026e202'::uuid,
  'debt_alert',
  'Economic Alert: National Debt Update',
  'Cameroon''s national debt has increased by 2.3% this month. Current debt-to-GDP ratio stands at 42.7%. Full transparency report now available for public review.',
  ARRAY['NationalDebt', 'Economics', 'Transparency'],
  'urgent',
  'Economic Alert',
  '{"source": "debt_monitor", "alert_level": "urgent", "gdp_ratio": 42.7}'::jsonb
),
(
  '91569092-36c0-4867-8a0e-370ee026e202'::uuid,
  'civic_event',
  'Town Hall Meeting: Infrastructure Development',
  'Join us for a public discussion on the upcoming infrastructure projects in the Northwest region. Your voice matters in shaping our community''s future.',
  ARRAY['TownHall', 'Infrastructure', 'Community'],
  'medium',
  'Civic Event',
  '{"source": "civic", "event_date": "2025-08-15", "location": "Bamenda"}'::jsonb
),
(
  '91569092-36c0-4867-8a0e-370ee026e202'::uuid,
  'job',
  'New Employment Opportunities',
  'CDC announces 500 new job openings across agriculture, engineering, and administration sectors. Applications now open for positions in the Southwest region.',
  ARRAY['Jobs', 'CDC', 'Agriculture', 'Engineering'],
  'high',
  'Employment',
  '{"source": "job_board", "positions": 500, "sectors": ["agriculture", "engineering", "administration"]}'::jsonb
),
(
  '91569092-36c0-4867-8a0e-370ee026e202'::uuid,
  'music',
  'New CamerPlay Release',
  'Discover the latest hit "Unity in Diversity" by Charlotte Dipanda, now streaming on CamerPlay. A celebration of Cameroon''s rich cultural heritage. 🇨🇲',
  ARRAY['NewMusic', 'CamerPlay', 'Culture', 'CharlotteDipanda'],
  'medium',
  'Entertainment',
  '{"source": "camerplay", "artist": "Charlotte Dipanda", "track": "Unity in Diversity"}'::jsonb
);

-- Insert sample trending topics
INSERT INTO public.trending_topics (topic_name, mention_count, engagement_count, trending_score, category, time_window) VALUES
('Infrastructure', 1247, 2340, 95.7, 'Development', '24h'),
('CamerPlay', 892, 1567, 87.3, 'Entertainment', '24h'),
('Jobs', 756, 1234, 82.1, 'Employment', '24h'),
('NationalDebt', 634, 890, 78.9, 'Economics', '24h'),
('Unity', 521, 756, 71.2, 'Culture', '24h'),
('Innovation', 387, 623, 65.4, 'Technology', '24h'),
('Community', 298, 445, 58.7, 'Civic', '24h'),
('Transparency', 234, 378, 52.3, 'Governance', '24h');

-- Insert sample engagement data
INSERT INTO public.feed_engagement (item_id, user_id, engagement_type) 
SELECT 
  fi.id,
  '91569092-36c0-4867-8a0e-370ee026e202'::uuid,
  'view'
FROM public.feed_items fi
LIMIT 5;

-- Calculate initial scores for the feed items
SELECT public.calculate_feed_score(id, '91569092-36c0-4867-8a0e-370ee026e202'::uuid) 
FROM public.feed_items;