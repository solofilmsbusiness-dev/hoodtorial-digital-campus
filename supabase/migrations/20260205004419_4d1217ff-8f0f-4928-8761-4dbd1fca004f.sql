-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users with paid access can enroll" ON public.enrollments;

-- Create updated policy that allows admins OR users with paid access
CREATE POLICY "Users with paid access can enroll" 
ON public.enrollments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND (
    has_paid_access(auth.uid()) 
    OR has_role(auth.uid(), 'admin')
  )
);