-- Insert default 2024 awards
INSERT INTO public.awards (year, title, description, status) VALUES 
(2024, 'CamerPulse Awards 2024', 'The inaugural CamerPulse Awards celebrating the best in Cameroonian music', 'draft');

-- Get the award ID for categories
DO $$
DECLARE
  award_2024_id UUID;
BEGIN
  SELECT id INTO award_2024_id FROM public.awards WHERE year = 2024;
  
  -- Insert main categories with special prize amounts
  INSERT INTO public.award_categories (award_id, name, description, prize_amount, is_main_category, category_order) VALUES
  (award_2024_id, 'Artist of the Year', 'Overall best performing artist of the year', 50000000, true, 1), -- ₣50M
  (award_2024_id, 'Best Male Artist', 'Best male artist of the year', 10000000, false, 2),
  (award_2024_id, 'Best Female Artist', 'Best female artist of the year', 10000000, false, 3),
  (award_2024_id, 'Best Gospel Artist', 'Best gospel artist of the year', 10000000, false, 4),
  (award_2024_id, 'Song of the Year', 'Most popular song of the year', 10000000, false, 5),
  (award_2024_id, 'Album of the Year', 'Best album release of the year', 10000000, false, 6),
  (award_2024_id, 'Producer of the Year', 'Best music producer of the year', 10000000, false, 7),
  (award_2024_id, 'Best Diaspora Artist', 'Best Cameroonian artist in the diaspora', 10000000, false, 8),
  (award_2024_id, 'Best Collaboration', 'Best musical collaboration of the year', 10000000, false, 9),
  (award_2024_id, 'Best Music Video', 'Best music video of the year', 10000000, false, 10),
  (award_2024_id, 'Fan Favorite', 'Most loved artist by fans', 10000000, false, 11),
  (award_2024_id, 'Emerging Artist of the Year', 'Best new artist of the year', 10000000, false, 12);
END $$;