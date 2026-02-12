
-- Add intro_video_url to faculty_members
ALTER TABLE public.faculty_members ADD COLUMN intro_video_url text;

-- Create gallery_comments table
CREATE TABLE public.gallery_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_owner_id uuid NOT NULL,
  image_url text NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read comments
CREATE POLICY "Anyone can view gallery comments"
  ON public.gallery_comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.gallery_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.gallery_comments FOR DELETE
  USING (auth.uid() = user_id);
