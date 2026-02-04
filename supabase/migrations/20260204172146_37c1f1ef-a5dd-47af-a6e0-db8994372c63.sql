-- Add ban columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_banned boolean NOT NULL DEFAULT false,
ADD COLUMN banned_at timestamp with time zone,
ADD COLUMN banned_by uuid,
ADD COLUMN ban_reason text;

-- Create index for quick banned user filtering
CREATE INDEX idx_profiles_is_banned ON public.profiles(is_banned) WHERE is_banned = true;