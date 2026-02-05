-- Add card_section_order column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS card_section_order TEXT[] DEFAULT ARRAY['bio', 'featured_project', 'info_cards', 'social_links'];

-- Recreate the profiles_public view to include the new column
CREATE OR REPLACE VIEW profiles_public AS
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
  card_section_order
FROM profiles;