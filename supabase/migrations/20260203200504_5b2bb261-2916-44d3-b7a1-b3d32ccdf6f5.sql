-- Create site_settings table for storing site-wide configuration
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings for login page customization
INSERT INTO public.site_settings (id, value) VALUES
  ('login_video_url', NULL),
  ('login_logo_url', NULL);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings (needed for auth page before login)
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Only admins can update site settings (using has_role function)
CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert new settings
CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create site-assets storage bucket for videos and images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  52428800,
  ARRAY['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
);

-- Anyone can view site assets (public bucket)
CREATE POLICY "Anyone can view site assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

-- Only admins can upload site assets
CREATE POLICY "Admins can upload site assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'site-assets'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Only admins can update site assets
CREATE POLICY "Admins can update site assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'site-assets'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Only admins can delete site assets
CREATE POLICY "Admins can delete site assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'site-assets'
    AND has_role(auth.uid(), 'admin'::app_role)
  );