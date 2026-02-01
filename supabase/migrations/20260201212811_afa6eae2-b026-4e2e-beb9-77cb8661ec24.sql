-- Create storage bucket for community uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-uploads',
  'community-uploads',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload community files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to community uploads
CREATE POLICY "Community uploads are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-uploads');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'community-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);