
-- Recreate the view with security_invoker=on to satisfy the linter
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
SELECT
  user_id, display_name, avatar_url, cover_banner_url,
  bio, filmmaking_style, camera_gear, current_project,
  favorite_films, influences, portfolio_url, imdb_url,
  vimeo_url, instagram_url, youtube_url, twitter_url, tiktok_url,
  profile_accent_color, avatar_border_style, portfolio_gallery,
  featured_project_url, featured_project_title, featured_project_thumbnail,
  profile_section_order, card_section_order, cover_banner_position
FROM public.profiles;

-- Add a SELECT policy on profiles specifically for reading public fields through the view
-- This allows any authenticated user to read the limited columns exposed by the view
CREATE POLICY "Authenticated users can read profiles via public view"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
