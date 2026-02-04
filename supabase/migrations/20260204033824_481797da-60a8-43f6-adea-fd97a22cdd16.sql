-- Add audio MIME types to site-assets bucket for music uploads
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'video/mp4', 
  'video/webm', 
  'image/jpeg', 
  'image/png', 
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg'
]
WHERE id = 'site-assets';