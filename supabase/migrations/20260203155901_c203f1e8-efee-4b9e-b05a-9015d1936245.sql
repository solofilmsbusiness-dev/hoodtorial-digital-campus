-- Daily challenges table
CREATE TABLE public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  credits_reward DECIMAL(3,1) NOT NULL DEFAULT 0.5,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('lighting', 'composition', 'movement', 'storytelling', 'general')),
  active_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Challenge submissions tracking
CREATE TABLE public.challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  credits_awarded DECIMAL(3,1),
  awarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Add challenge_id to community_posts for linking posts to challenges
ALTER TABLE public.community_posts ADD COLUMN challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_challenges
CREATE POLICY "Anyone can view active challenges" ON public.daily_challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all challenges" ON public.daily_challenges
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert challenges" ON public.daily_challenges
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update challenges" ON public.daily_challenges
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete challenges" ON public.daily_challenges
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for challenge_submissions
CREATE POLICY "Users can view their own submissions" ON public.challenge_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions" ON public.challenge_submissions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled students can submit challenges" ON public.challenge_submissions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    is_enrolled_student(auth.uid())
  );

CREATE POLICY "Users can delete their own submissions" ON public.challenge_submissions
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_daily_challenges_active_date ON public.daily_challenges(active_date);
CREATE INDEX idx_challenge_submissions_user_id ON public.challenge_submissions(user_id);
CREATE INDEX idx_challenge_submissions_challenge_id ON public.challenge_submissions(challenge_id);
CREATE INDEX idx_community_posts_challenge_id ON public.community_posts(challenge_id);

-- Trigger to update updated_at
CREATE TRIGGER update_daily_challenges_updated_at
  BEFORE UPDATE ON public.daily_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some initial challenges
INSERT INTO public.daily_challenges (title, description, prompt, difficulty, credits_reward, category, active_date) VALUES
('Light Study', 'Explore how natural light shapes your scene and creates mood.', 'Film a 15-second clip using only available light. Focus on shadows and how they define your subject.', 'beginner', 0.5, 'lighting', CURRENT_DATE),
('Three-Shot Story', 'Master the art of visual storytelling with minimal shots.', 'Tell a complete story in exactly 3 shots. No dialogue allowed - let your visuals do the talking.', 'intermediate', 0.5, 'storytelling', CURRENT_DATE + 1),
('Motion Blur Magic', 'Use motion blur as a creative tool, not an accident.', 'Create intentional motion blur that enhances your subject and adds energy to your shot.', 'intermediate', 0.5, 'movement', CURRENT_DATE + 2),
('Reflections', 'Find and use reflective surfaces to add depth to your compositions.', 'Use reflections (mirrors, water, glass) creatively in your shot to create visual interest.', 'beginner', 0.5, 'composition', CURRENT_DATE + 3),
('One Take Wonder', 'Challenge yourself with continuous camera movement.', 'Film a 30-second continuous take with intentional camera movement that guides the viewer.', 'advanced', 0.5, 'movement', CURRENT_DATE + 4),
('Golden Hour Hunt', 'Capture the magic of golden hour lighting.', 'Film during golden hour and show us how this light transforms an ordinary scene.', 'beginner', 0.5, 'lighting', CURRENT_DATE + 5),
('Frame Within Frame', 'Use environmental elements to create natural frames.', 'Find a doorway, window, or archway and use it to frame your subject cinematically.', 'intermediate', 0.5, 'composition', CURRENT_DATE + 6);