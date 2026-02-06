-- Allow public (unauthenticated) access to login-related site settings
CREATE POLICY "Public can read login settings"
  ON public.site_settings
  FOR SELECT
  USING (
    id IN (
      'login_video_url',
      'login_logo_url', 
      'login_music_url',
      'signup_disabled'
    )
  );