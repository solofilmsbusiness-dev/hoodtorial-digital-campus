-- Allow admins to delete user progress (for reset functionality)
CREATE POLICY "Admins can delete user progress"
  ON public.user_progress FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update profiles (for ban/unban functionality)
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));