-- Add is_demo column to all relevant tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.post_likes ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.comment_likes ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.challenge_submissions ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- Create indexes for efficient demo data filtering
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON public.profiles(is_demo) WHERE is_demo = true;
CREATE INDEX IF NOT EXISTS idx_community_posts_is_demo ON public.community_posts(is_demo) WHERE is_demo = true;
CREATE INDEX IF NOT EXISTS idx_community_comments_is_demo ON public.community_comments(is_demo) WHERE is_demo = true;

-- Create demo_settings table
CREATE TABLE IF NOT EXISTS public.demo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT false,
  show_demo_data boolean NOT NULL DEFAULT true,
  demo_user_count integer NOT NULL DEFAULT 25,
  demo_post_count integer NOT NULL DEFAULT 50,
  demo_comment_count integer NOT NULL DEFAULT 100,
  last_generated_at timestamp with time zone,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on demo_settings
ALTER TABLE public.demo_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for demo_settings (admin only)
CREATE POLICY "Admins can view demo settings"
  ON public.demo_settings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update demo settings"
  ON public.demo_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert demo settings"
  ON public.demo_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default demo settings row
INSERT INTO public.demo_settings (id, is_active, show_demo_data)
VALUES ('00000000-0000-0000-0000-000000000001', false, true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for admins to manage demo data across tables
-- Profiles: Allow admins to insert/update/delete demo profiles
CREATE POLICY "Admins can insert demo profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

CREATE POLICY "Admins can delete demo profiles"
  ON public.profiles FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

-- Community posts: Allow admins to manage demo posts
CREATE POLICY "Admins can insert demo posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

CREATE POLICY "Admins can delete demo posts"
  ON public.community_posts FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

-- Community comments: Allow admins to manage demo comments
CREATE POLICY "Admins can insert demo comments"
  ON public.community_comments FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

CREATE POLICY "Admins can delete demo comments"
  ON public.community_comments FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

-- Post likes: Allow admins to manage demo likes
CREATE POLICY "Admins can insert demo post likes"
  ON public.post_likes FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

CREATE POLICY "Admins can delete demo post likes"
  ON public.post_likes FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

-- Comment likes: Allow admins to manage demo comment likes
CREATE POLICY "Admins can insert demo comment likes"
  ON public.comment_likes FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

CREATE POLICY "Admins can delete demo comment likes"
  ON public.comment_likes FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

-- User progress: Allow admins to manage demo progress
CREATE POLICY "Admins can insert demo user progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

CREATE POLICY "Admins can delete demo user progress"
  ON public.user_progress FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

-- Quiz results: Allow admins to manage demo quiz results
CREATE POLICY "Admins can insert demo quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

CREATE POLICY "Admins can delete demo quiz results"
  ON public.quiz_results FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

-- Enrollments: Allow admins to manage demo enrollments
CREATE POLICY "Admins can insert demo enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

CREATE POLICY "Admins can delete demo enrollments"
  ON public.enrollments FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

-- Challenge submissions: Allow admins to manage demo submissions
CREATE POLICY "Admins can insert demo challenge submissions"
  ON public.challenge_submissions FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

CREATE POLICY "Admins can delete demo challenge submissions"
  ON public.challenge_submissions FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );