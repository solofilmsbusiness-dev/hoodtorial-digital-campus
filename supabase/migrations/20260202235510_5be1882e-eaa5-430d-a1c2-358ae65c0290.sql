-- Add admin policy for enrollments
CREATE POLICY "Admins can view all enrollments"
  ON public.enrollments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add DELETE policies for user data privacy rights
CREATE POLICY "Users can delete their own quiz results"
  ON public.quiz_results FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.user_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);