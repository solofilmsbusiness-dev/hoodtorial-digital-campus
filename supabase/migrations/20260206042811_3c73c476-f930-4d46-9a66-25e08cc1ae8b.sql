-- 1. Create helper function that checks paid access only (not enrollment)
CREATE OR REPLACE FUNCTION public.has_community_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE has_paid_access(_user_id)
  END
$$;

-- 2. Drop existing INSERT policies that require enrollment
DROP POLICY IF EXISTS "Enrolled students can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Enrolled students can create comments" ON public.community_comments;
DROP POLICY IF EXISTS "Enrolled students can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Enrolled students can like comments" ON public.comment_likes;
DROP POLICY IF EXISTS "Enrolled students can follow accessible posts" ON public.post_follows;

-- 3. Recreate INSERT policies using has_community_access() instead
CREATE POLICY "Paid users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    has_community_access(auth.uid()) AND 
    category <> 'announcement'::post_category
  );

CREATE POLICY "Paid users can create comments"
  ON public.community_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    has_community_access(auth.uid())
  );

CREATE POLICY "Paid users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    has_community_access(auth.uid())
  );

CREATE POLICY "Paid users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    has_community_access(auth.uid())
  );

CREATE POLICY "Paid users can follow posts"
  ON public.post_follows FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id AND 
    has_community_access(auth.uid()) AND
    EXISTS (SELECT 1 FROM community_posts WHERE id = post_follows.post_id)
  );