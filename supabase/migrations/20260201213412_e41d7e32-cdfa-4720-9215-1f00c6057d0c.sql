-- Add media_urls column to community_comments
ALTER TABLE public.community_comments
ADD COLUMN media_urls text[] DEFAULT '{}'::text[];