-- Fix is_enrolled_student function to explicitly return false for unauthenticated users
CREATE OR REPLACE FUNCTION public.is_enrolled_student(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.enrollments
      WHERE user_id = _user_id
        AND status = 'active'
    )
  END
$$;

-- Drop and recreate policies for profiles to require authentication
DROP POLICY IF EXISTS "Enrolled students can view profiles for mentions" ON public.profiles;
CREATE POLICY "Enrolled students can view profiles for mentions"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (
      is_enrolled_student(auth.uid()) 
      OR has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'moderator'::app_role)
      OR auth.uid() = user_id
    )
  );

-- Fix community_posts SELECT policy
DROP POLICY IF EXISTS "Enrolled students can view posts" ON public.community_posts;
CREATE POLICY "Enrolled students can view posts"
  ON public.community_posts FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (
      is_enrolled_student(auth.uid()) 
      OR has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'moderator'::app_role)
    )
  );

-- Fix community_comments SELECT policy  
DROP POLICY IF EXISTS "Enrolled students can view comments" ON public.community_comments;
CREATE POLICY "Enrolled students can view comments"
  ON public.community_comments FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (
      is_enrolled_student(auth.uid()) 
      OR has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'moderator'::app_role)
    )
  );

-- Fix post_likes SELECT policy
DROP POLICY IF EXISTS "Enrolled students can view likes" ON public.post_likes;
CREATE POLICY "Enrolled students can view likes"
  ON public.post_likes FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (
      is_enrolled_student(auth.uid()) 
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- Fix comment_likes SELECT policy
DROP POLICY IF EXISTS "Enrolled students can view comment likes" ON public.comment_likes;
CREATE POLICY "Enrolled students can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (
      is_enrolled_student(auth.uid()) 
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- Fix post_follows SELECT policy - users should only see their own follows
DROP POLICY IF EXISTS "Users can view their own follows" ON public.post_follows;
CREATE POLICY "Users can view their own follows"
  ON public.post_follows FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);