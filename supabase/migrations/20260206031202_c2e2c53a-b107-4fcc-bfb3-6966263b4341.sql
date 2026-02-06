-- Drop the policy that exposes completed enrollments to everyone
DROP POLICY IF EXISTS "Users can view completed enrollments publicly" ON public.enrollments;

-- The existing "Users can view their own enrollments" policy already handles proper access
-- (auth.uid() = user_id) - this is secure