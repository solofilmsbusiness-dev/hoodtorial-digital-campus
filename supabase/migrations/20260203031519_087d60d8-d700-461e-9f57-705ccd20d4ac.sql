-- Add new columns to profiles table for creative customization
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS cover_banner_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_accent_color TEXT DEFAULT '#D4AF37',
  ADD COLUMN IF NOT EXISTS avatar_border_style TEXT DEFAULT 'solid',
  ADD COLUMN IF NOT EXISTS filmmaking_style TEXT,
  ADD COLUMN IF NOT EXISTS favorite_films TEXT[],
  ADD COLUMN IF NOT EXISTS influences TEXT,
  ADD COLUMN IF NOT EXISTS current_project TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS imdb_url TEXT,
  ADD COLUMN IF NOT EXISTS vimeo_url TEXT;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- RLS: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Public avatar access for viewing
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');