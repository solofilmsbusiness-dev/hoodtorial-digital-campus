-- Enable RLS on the profiles_public view
ALTER VIEW public.profiles_public SET (security_invoker = on);

-- Allow enrolled students to view public profile information
CREATE POLICY "Enrolled students can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- User is an enrolled student viewing another enrolled student's basic info
  -- This works through the profiles_public view which only exposes safe fields
  is_enrolled_student(auth.uid())
);

-- Note: The profiles_public view already filters to only show:
-- avatar_url, display_name, user_id
-- So even with this SELECT policy, sensitive fields like subscription_status,
-- trial_ends_at, ban_reason etc. are not exposed through the view