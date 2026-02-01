-- Create enum for post categories
CREATE TYPE public.post_category AS ENUM (
  'general',
  'course_discussion',
  'project_submission',
  'feedback_critique',
  'announcement'
);

-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category post_category NOT NULL DEFAULT 'general',
  course_code TEXT,
  is_project_post BOOLEAN NOT NULL DEFAULT false,
  media_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_highlighted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create community_comments table (threaded)
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  what_works TEXT,
  what_could_improve TEXT,
  actionable_suggestion TEXT,
  is_instructor_comment BOOLEAN NOT NULL DEFAULT false,
  is_highlighted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create comment_likes table
CREATE TABLE public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.community_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create post_follows table for following threads
CREATE TABLE public.post_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_follows ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is enrolled
CREATE OR REPLACE FUNCTION public.is_enrolled_student(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = _user_id AND status = 'active'
  )
$$;

-- Community Posts Policies
CREATE POLICY "Enrolled students can view posts"
ON public.community_posts FOR SELECT
USING (
  public.is_enrolled_student(auth.uid()) OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Enrolled students can create posts"
ON public.community_posts FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  public.is_enrolled_student(auth.uid()) AND
  category != 'announcement'
);

CREATE POLICY "Users can update their own posts"
ON public.community_posts FOR UPDATE
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Users can delete their own posts"
ON public.community_posts FOR DELETE
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'moderator'::app_role)
);

-- Admins can create announcements
CREATE POLICY "Admins can create announcements"
ON public.community_posts FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
);

-- Community Comments Policies
CREATE POLICY "Enrolled students can view comments"
ON public.community_comments FOR SELECT
USING (
  public.is_enrolled_student(auth.uid()) OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Enrolled students can create comments"
ON public.community_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  public.is_enrolled_student(auth.uid())
);

CREATE POLICY "Users can update their own comments"
ON public.community_comments FOR UPDATE
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Users can delete their own comments"
ON public.community_comments FOR DELETE
USING (
  auth.uid() = user_id OR
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'moderator'::app_role)
);

-- Post Likes Policies
CREATE POLICY "Enrolled students can view likes"
ON public.post_likes FOR SELECT
USING (public.is_enrolled_student(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled students can like posts"
ON public.post_likes FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_enrolled_student(auth.uid()));

CREATE POLICY "Users can remove their own likes"
ON public.post_likes FOR DELETE
USING (auth.uid() = user_id);

-- Comment Likes Policies
CREATE POLICY "Enrolled students can view comment likes"
ON public.comment_likes FOR SELECT
USING (public.is_enrolled_student(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled students can like comments"
ON public.comment_likes FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_enrolled_student(auth.uid()));

CREATE POLICY "Users can remove their comment likes"
ON public.comment_likes FOR DELETE
USING (auth.uid() = user_id);

-- Post Follows Policies
CREATE POLICY "Users can view their own follows"
ON public.post_follows FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Enrolled students can follow posts"
ON public.post_follows FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_enrolled_student(auth.uid()));

CREATE POLICY "Users can unfollow posts"
ON public.post_follows FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
BEFORE UPDATE ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();