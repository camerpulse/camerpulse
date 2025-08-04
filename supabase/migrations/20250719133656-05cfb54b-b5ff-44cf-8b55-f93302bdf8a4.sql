-- Create moderator onboarding system tables

-- Training slides content
CREATE TABLE public.moderator_training_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slide_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  slide_type TEXT NOT NULL DEFAULT 'content', -- content, image, video
  media_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz questions
CREATE TABLE public.moderator_quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- multiple_choice, true_false, text_input, essay
  options JSONB, -- For multiple choice questions
  correct_answer TEXT, -- For auto-graded questions
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderator onboarding progress
CREATE TABLE public.moderator_onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step TEXT NOT NULL DEFAULT 'training', -- training, quiz, oath, completed
  slides_completed INTEGER NOT NULL DEFAULT 0,
  quiz_attempts INTEGER NOT NULL DEFAULT 0,
  quiz_score NUMERIC,
  quiz_passed BOOLEAN NOT NULL DEFAULT false,
  oath_accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_region TEXT,
  mentor_id UUID, -- Senior moderator assigned as mentor
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz attempt details
CREATE TABLE public.moderator_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  onboarding_progress_id UUID NOT NULL,
  attempt_number INTEGER NOT NULL,
  answers JSONB NOT NULL, -- Store all answers
  score NUMERIC NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  time_taken_minutes INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderator assignments
CREATE TABLE public.moderator_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assignment_type TEXT NOT NULL, -- village, region, topic
  assignment_value TEXT NOT NULL, -- specific village name, region name, etc.
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderator performance metrics
CREATE TABLE public.moderator_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  villages_moderated INTEGER NOT NULL DEFAULT 0,
  submissions_approved INTEGER NOT NULL DEFAULT 0,
  submissions_rejected INTEGER NOT NULL DEFAULT 0,
  conflicts_resolved INTEGER NOT NULL DEFAULT 0,
  user_reports_handled INTEGER NOT NULL DEFAULT 0,
  quality_score NUMERIC NOT NULL DEFAULT 0.0,
  badges_earned JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

-- Enable RLS
ALTER TABLE public.moderator_training_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training slides
CREATE POLICY "Training slides are viewable by all authenticated users" 
ON public.moderator_training_slides 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage training slides" 
ON public.moderator_training_slides 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for quiz questions
CREATE POLICY "Quiz questions are viewable by authenticated users" 
ON public.moderator_quiz_questions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage quiz questions" 
ON public.moderator_quiz_questions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for onboarding progress
CREATE POLICY "Users can view their own onboarding progress" 
ON public.moderator_onboarding_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding progress" 
ON public.moderator_onboarding_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding progress" 
ON public.moderator_onboarding_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all onboarding progress" 
ON public.moderator_onboarding_progress 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for quiz attempts
CREATE POLICY "Users can view their own quiz attempts" 
ON public.moderator_quiz_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts" 
ON public.moderator_quiz_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz attempts" 
ON public.moderator_quiz_attempts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for moderator assignments
CREATE POLICY "Users can view their own assignments" 
ON public.moderator_assignments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all assignments" 
ON public.moderator_assignments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for moderator performance
CREATE POLICY "Users can view their own performance" 
ON public.moderator_performance 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can update performance metrics" 
ON public.moderator_performance 
FOR ALL 
USING (true);

CREATE POLICY "Admins can view all performance" 
ON public.moderator_performance 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Insert initial training slides
INSERT INTO public.moderator_training_slides (slide_number, title, subtitle, content) VALUES
(1, 'Welcome to the Civic Moderator Corps', 'You are now a guardian of the people''s story', 'Goals of the program: Preserve civic memory, maintain village identity, unite Cameroon through shared stories. What a Civic Moderator does: Verify village information daily, moderate community submissions, ensure cultural accuracy and respect.'),
(2, 'Why This Role Matters', 'Preserving Cameroon''s Civic Memory', 'Civic memory is fading — you are preserving it. Villages hold identity, not just boundaries. Every entry you verify helps Cameroon stay united, informed, and proud. Your work connects past, present, and future generations.'),
(3, 'Your Responsibilities', 'Core Duties of a Civic Moderator', 'Verify and update village pages with accurate information. Moderate petitions, conflicts, and community projects. Approve user-submitted data including photos, names, and biographies. Ensure all information is neutral, respectful, and factually accurate.'),
(4, 'Tools You''ll Use', 'Moderator Dashboard Overview', 'Features available to you: Edit village information and histories. Manage community submissions and requests. Update conflict logs and resolutions. Promote verified community members. Chat with other moderators for support.'),
(5, 'Ethics & Neutrality', 'Maintaining Objectivity', 'No political bias or manipulation of information. Do not promote your tribe or religion unfairly. Never alter facts for personal reasons. Everything must be verifiable, respectful, and culturally accurate. Serve all communities equally.'),
(6, 'What You Can Approve', 'Approval Authority Guidelines', 'New village biographies and historical information. Chiefs and traditional leader names and changes. Community project submissions with proper documentation. Petitions from verified community members. Billionaire and celebrity listings with verification.'),
(7, 'What Needs Admin Escalation', 'When to Seek Higher Authority', 'Village-level conflicts affecting multiple communities. Identity disputes over traditional leadership. Controversial petition content requiring review. Reports of sabotage, harassment, or platform abuse. Complex cultural or political matters.'),
(8, 'Moderation Quality Standards', 'Excellence in Community Service', 'Your entries must be: Clear and well-written. Properly verified with sources. Culturally respectful and sensitive. Thoroughly fact-checked. Remember: "If in doubt, wait or escalate to senior moderators."'),
(9, 'Recognition & Growth', 'Advancing Your Impact', 'Earn badges, rankings, and invitations to civic events. Outstanding moderators receive public recognition. Opportunities for national roles in research and documentation. Potential selection for special civic awards and honors.'),
(10, 'How to Get Help', 'Support Resources Available', 'Chat with higher-level moderators for guidance. Submit support tickets for technical issues. Join the internal CamerPulse community for moderators. Access training materials and best practice guides.'),
(11, 'Final Instructions', 'Complete Your Onboarding', 'Complete the quiz below (80% required to pass). Take the civic oath of service. Get approved and receive your moderator badge. Begin moderating your assigned village or region with pride and dedication.');

-- Insert quiz questions
INSERT INTO public.moderator_quiz_questions (question_number, question_text, question_type, options, correct_answer, explanation, points) VALUES
(1, 'What is the primary duty of a Civic Moderator?', 'multiple_choice', 
 '{"a": "Promote their own village above others", "b": "Verify and preserve accurate civic information", "c": "Collect fees from users", "d": "Share political opinions"}', 
 'b', 'The primary duty is to verify and preserve accurate civic information for all communities equally.', 2),

(2, 'You can promote your personal business on village pages.', 'true_false', 
 '{"true": "True", "false": "False"}', 
 'false', 'Moderators must maintain neutrality and cannot use their position for personal promotion.', 1),

(3, 'If someone claims a different chief than what is listed, what should you do?', 'multiple_choice',
 '{"a": "Immediately change it", "b": "Ignore the request", "c": "Verify with multiple sources and escalate if needed", "d": "Ask them to pay a fee"}',
 'c', 'Leadership disputes require careful verification and may need escalation to senior moderators.', 2),

(4, 'What kind of project submission should be rejected?', 'multiple_choice',
 '{"a": "Projects with clear photos and documentation", "b": "Projects with blurry photos and no verification", "c": "Projects helping the community", "d": "Projects from verified users"}',
 'b', 'Projects without proper documentation or verification should be rejected to maintain quality standards.', 2),

(5, 'What must every conflict update include?', 'text_input', 
 '{}', 
 'factual information, source verification, neutral language', 'Conflict updates must be factual, verified, and written in neutral language.', 2),

(6, 'Who do you contact for escalation of disputes?', 'multiple_choice',
 '{"a": "Local politicians", "b": "Senior moderators or admins", "c": "Village chiefs only", "d": "No one, handle it yourself"}',
 'b', 'Senior moderators and admins are the proper escalation path for complex disputes.', 1),

(7, 'It is acceptable to post unverified oral stories as historical fact.', 'true_false',
 '{"true": "True", "false": "False"}',
 'false', 'All information must be verified. Oral stories can be included but should be clearly marked as such.', 2),

(8, 'What earns you a "Village Builder" badge?', 'multiple_choice',
 '{"a": "Paying a fee", "b": "Consistently high-quality moderation work", "c": "Being from a large village", "d": "Having political connections"}',
 'b', 'Badges are earned through consistent, high-quality moderation work and community service.', 1),

(9, 'List 3 things you should never approve:', 'text_input',
 '{}',
 'false information, biased content, unverified claims', 'Never approve false information, politically biased content, or unverified claims.', 3),

(10, 'What is one reason CamerPulse exists?', 'essay',
 '{}',
 'manual_review', 'This question requires manual review by administrators to assess understanding of the platform''s civic mission.', 2);

-- Create function to update onboarding progress timestamps
CREATE OR REPLACE FUNCTION public.update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_moderator_training_slides_updated_at
  BEFORE UPDATE ON public.moderator_training_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_onboarding_updated_at();

CREATE TRIGGER update_moderator_quiz_questions_updated_at
  BEFORE UPDATE ON public.moderator_quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_onboarding_updated_at();

CREATE TRIGGER update_moderator_onboarding_progress_updated_at
  BEFORE UPDATE ON public.moderator_onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_onboarding_updated_at();

CREATE TRIGGER update_moderator_performance_updated_at
  BEFORE UPDATE ON public.moderator_performance
  FOR EACH ROW EXECUTE FUNCTION public.update_onboarding_updated_at();