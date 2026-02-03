-- Add document_url column to lessons table
ALTER TABLE public.lessons ADD COLUMN document_url text;

-- Create lesson-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-documents',
  'lesson-documents',
  true,
  20971520,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- RLS policies for lesson-documents bucket

-- Anyone can view (public bucket)
CREATE POLICY "Anyone can view lesson documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-documents');

-- Admins can upload lesson documents
CREATE POLICY "Admins can upload lesson documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-documents' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can update lesson documents
CREATE POLICY "Admins can update lesson documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson-documents' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can delete lesson documents
CREATE POLICY "Admins can delete lesson documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-documents' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);