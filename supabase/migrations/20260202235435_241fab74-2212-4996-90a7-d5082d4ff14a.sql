-- Fix community_posts UPDATE policy to prevent category manipulation to announcements
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
CREATE POLICY "Users can update their own posts"
  ON public.community_posts FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND (
      auth.uid() = user_id 
      OR has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'moderator'::app_role)
    )
  )
  WITH CHECK (
    -- Regular users cannot set category to announcement
    (NOT has_role(auth.uid(), 'admin'::app_role) AND NOT has_role(auth.uid(), 'moderator'::app_role) AND category <> 'announcement'::post_category)
    OR
    -- Admins/moderators can set any category
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
  );

-- Add admin policy for assessment_results so admins can view for educational oversight
CREATE POLICY "Admins can view all assessment results"
  ON public.assessment_results FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policy for quiz_results for educational oversight
CREATE POLICY "Admins can view all quiz results"
  ON public.quiz_results FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policy for user_progress for course improvement
CREATE POLICY "Admins can view all user progress"
  ON public.user_progress FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add validation for notifications - ensure enrolled students can only notify other enrolled students
DROP POLICY IF EXISTS "Users can create notifications as sender" ON public.notifications;
CREATE POLICY "Enrolled users can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = sender_id 
    AND is_enrolled_student(auth.uid())
  );

-- Fix post_follows INSERT to validate post exists and is accessible
DROP POLICY IF EXISTS "Enrolled students can follow posts" ON public.post_follows;
CREATE POLICY "Enrolled students can follow accessible posts"
  ON public.post_follows FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id 
    AND is_enrolled_student(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.community_posts 
      WHERE id = post_id
    )
  );