
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_for text[] DEFAULT '{}';

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on)
AS
SELECT
  user_id,
  display_name,
  avatar_url,
  cover_banner_url,
  bio,
  filmmaking_style,
  camera_gear,
  current_project,
  favorite_films,
  influences,
  portfolio_url,
  imdb_url,
  vimeo_url,
  instagram_url,
  youtube_url,
  twitter_url,
  tiktok_url,
  profile_accent_color,
  avatar_border_style,
  portfolio_gallery,
  featured_project_url,
  featured_project_title,
  featured_project_thumbnail,
  profile_section_order,
  card_section_order,
  cover_banner_position,
  walkthrough_completed,
  creative_role,
  looking_for
FROM public.profiles
WHERE is_banned = false;
