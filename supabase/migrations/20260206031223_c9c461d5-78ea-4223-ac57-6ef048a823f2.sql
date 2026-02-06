-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can read site settings"
ON public.site_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);