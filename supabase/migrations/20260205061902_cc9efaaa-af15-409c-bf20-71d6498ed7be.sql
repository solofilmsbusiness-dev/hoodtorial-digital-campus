-- Add portfolio_gallery column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS portfolio_gallery TEXT[] DEFAULT '{}';

-- Drop and recreate the profiles_public view with the new column
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
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
  portfolio_url,
  imdb_url,
  vimeo_url,
  instagram_url,
  youtube_url,
  twitter_url,
  tiktok_url,
  profile_accent_color,
  avatar_border_style,
  portfolio_gallery
FROM public.profiles;

-- Add RLS policy to allow viewing completed enrollments publicly
-- First drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Users can view completed enrollments publicly" ON public.enrollments;

CREATE POLICY "Users can view completed enrollments publicly"
ON public.enrollments FOR SELECT
USING (
  status = 'completed' OR user_id = auth.uid()
);