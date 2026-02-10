
-- Create lesson-videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-videos',
  'lesson-videos',
  true,
  419430400,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
);

-- Public read access
CREATE POLICY "Anyone can read lesson videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-videos');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload lesson videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-videos'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update their uploads
CREATE POLICY "Authenticated users can update lesson videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson-videos'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can delete lesson videos
CREATE POLICY "Authenticated users can delete lesson videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-videos'
  AND auth.role() = 'authenticated'
);
