-- Update profiles_public view to include more public-safe fields
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
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
  -- Social/portfolio links (user-provided, public by nature)
  portfolio_url,
  imdb_url,
  vimeo_url,
  instagram_url,
  youtube_url,
  twitter_url,
  tiktok_url,
  -- Visual customization
  profile_accent_color,
  avatar_border_style
FROM public.profiles;