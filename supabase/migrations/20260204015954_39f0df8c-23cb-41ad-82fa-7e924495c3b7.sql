-- Update site-assets bucket to allow 200MB file uploads (200 * 1024 * 1024 = 209715200 bytes)
UPDATE storage.buckets 
SET file_size_limit = 209715200
WHERE id = 'site-assets';