
-- 1. Fix site_settings: replace broad auth policy with specific public keys
DROP POLICY IF EXISTS "Authenticated users can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can read login settings" ON public.site_settings;

CREATE POLICY "Public can read public site settings"
ON public.site_settings
FOR SELECT
USING (
  id LIKE 'login_%'
  OR id LIKE 'page_bg_%'
  OR id = 'signup_disabled'
);

CREATE POLICY "Admins can read all site settings"
ON public.site_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
