
-- Allow authenticated users to view non-banned profiles (view filters sensitive columns)
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_banned = false);
