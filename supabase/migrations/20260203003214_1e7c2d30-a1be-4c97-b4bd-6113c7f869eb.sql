-- Drop the broad policy that exposes all profile data
DROP POLICY IF EXISTS "Enrolled students can view profiles for mentions" ON public.profiles;

-- Keep existing "Users can view their own profile" policy (already exists)
-- It uses: auth.uid() = user_id

-- Add admin/moderator policy for full profile access (moderation)
CREATE POLICY "Admins and moderators can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Create a minimal public view for community features
CREATE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT 
  user_id,
  display_name,
  avatar_url
FROM public.profiles;