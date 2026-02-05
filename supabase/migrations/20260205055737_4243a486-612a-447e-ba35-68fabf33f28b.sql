-- Add target_profile_id column to community_posts for profile wall posts
ALTER TABLE public.community_posts 
ADD COLUMN target_profile_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL;

-- Create index for efficient profile wall queries
CREATE INDEX idx_community_posts_target_profile ON public.community_posts(target_profile_id) 
WHERE target_profile_id IS NOT NULL;

-- Profile owners can delete wall posts on their profile
CREATE POLICY "Profile owners can delete wall posts"
ON public.community_posts FOR DELETE
USING (
  target_profile_id IS NOT NULL AND
  target_profile_id = auth.uid()
);