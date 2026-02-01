-- Allow enrolled students to view other students' basic profile info for mentions
CREATE POLICY "Enrolled students can view profiles for mentions"
  ON public.profiles
  FOR SELECT
  USING (
    is_enrolled_student(auth.uid()) 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'moderator'::app_role)
  );