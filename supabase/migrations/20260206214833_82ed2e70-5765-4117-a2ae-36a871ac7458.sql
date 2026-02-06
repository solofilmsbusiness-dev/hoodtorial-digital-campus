
-- Fix RLS SELECT policies to use has_community_access instead of is_enrolled_student
-- This fixes the mismatch where users can write but not read back their own data

-- community_posts: drop old SELECT policy, create new one
DROP POLICY IF EXISTS "Enrolled students can view posts" ON public.community_posts;
CREATE POLICY "Users with community access can view posts"
  ON public.community_posts
  FOR SELECT
  TO authenticated
  USING (public.has_community_access(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- post_likes: drop old SELECT policy, create new one
DROP POLICY IF EXISTS "Enrolled students can view likes" ON public.post_likes;
CREATE POLICY "Users with community access can view likes"
  ON public.post_likes
  FOR SELECT
  TO authenticated
  USING (public.has_community_access(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- comment_likes: drop old SELECT policy, create new one
DROP POLICY IF EXISTS "Enrolled students can view comment likes" ON public.comment_likes;
CREATE POLICY "Users with community access can view comment likes"
  ON public.comment_likes
  FOR SELECT
  TO authenticated
  USING (public.has_community_access(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- community_comments: drop old SELECT policy, create new one
DROP POLICY IF EXISTS "Enrolled students can view comments" ON public.community_comments;
CREATE POLICY "Users with community access can view comments"
  ON public.community_comments
  FOR SELECT
  TO authenticated
  USING (public.has_community_access(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
