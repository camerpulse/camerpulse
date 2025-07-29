-- Add RLS policies for Civic Education Hub

-- Constitution articles (public read)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'constitution_articles' AND policyname = 'Anyone can view constitution articles') THEN
    EXECUTE 'CREATE POLICY "Anyone can view constitution articles" ON public.constitution_articles FOR SELECT USING (is_active = true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'constitution_articles' AND policyname = 'Admins can manage constitution articles') THEN
    EXECUTE 'CREATE POLICY "Admins can manage constitution articles" ON public.constitution_articles FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ''admin''))';
  END IF;
END
$$;

-- Educational content (public read)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_educational_content' AND policyname = 'Anyone can view published educational content') THEN
    EXECUTE 'CREATE POLICY "Anyone can view published educational content" ON public.civic_educational_content FOR SELECT USING (is_published = true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_educational_content' AND policyname = 'Authors and admins can manage educational content') THEN
    EXECUTE 'CREATE POLICY "Authors and admins can manage educational content" ON public.civic_educational_content FOR ALL USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ''admin''))';
  END IF;
END
$$;

-- User bookmarks (user-specific)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_user_bookmarks' AND policyname = 'Users can manage their own bookmarks') THEN
    EXECUTE 'CREATE POLICY "Users can manage their own bookmarks" ON public.civic_user_bookmarks FOR ALL USING (auth.uid() = user_id)';
  END IF;
END
$$;

-- Civic questions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_questions' AND policyname = 'Users can view public questions') THEN
    EXECUTE 'CREATE POLICY "Users can view public questions" ON public.civic_questions FOR SELECT USING (is_public = true OR auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_questions' AND policyname = 'Users can create questions') THEN
    EXECUTE 'CREATE POLICY "Users can create questions" ON public.civic_questions FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_questions' AND policyname = 'Users can update their own questions') THEN
    EXECUTE 'CREATE POLICY "Users can update their own questions" ON public.civic_questions FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_questions' AND policyname = 'Admins can manage all questions') THEN
    EXECUTE 'CREATE POLICY "Admins can manage all questions" ON public.civic_questions FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ''admin''))';
  END IF;
END
$$;

-- Civic quizzes (public read, admin manage)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_quizzes' AND policyname = 'Anyone can view active quizzes') THEN
    EXECUTE 'CREATE POLICY "Anyone can view active quizzes" ON public.civic_quizzes FOR SELECT USING (is_active = true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_quizzes' AND policyname = 'Admins can manage quizzes') THEN
    EXECUTE 'CREATE POLICY "Admins can manage quizzes" ON public.civic_quizzes FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ''admin''))';
  END IF;
END
$$;

-- Achievement badges (user-specific read, system create)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_achievement_badges' AND policyname = 'Users can view their own badges') THEN
    EXECUTE 'CREATE POLICY "Users can view their own badges" ON public.civic_achievement_badges FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_achievement_badges' AND policyname = 'System can create badges') THEN
    EXECUTE 'CREATE POLICY "System can create badges" ON public.civic_achievement_badges FOR INSERT WITH CHECK (true)';
  END IF;
END
$$;

-- Content comments
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_content_comments' AND policyname = 'Anyone can view approved comments') THEN
    EXECUTE 'CREATE POLICY "Anyone can view approved comments" ON public.civic_content_comments FOR SELECT USING (is_approved = true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_content_comments' AND policyname = 'Users can create comments') THEN
    EXECUTE 'CREATE POLICY "Users can create comments" ON public.civic_content_comments FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_content_comments' AND policyname = 'Users can update their own comments') THEN
    EXECUTE 'CREATE POLICY "Users can update their own comments" ON public.civic_content_comments FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'civic_content_comments' AND policyname = 'Admins can manage all comments') THEN
    EXECUTE 'CREATE POLICY "Admins can manage all comments" ON public.civic_content_comments FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ''admin''))';
  END IF;
END
$$;