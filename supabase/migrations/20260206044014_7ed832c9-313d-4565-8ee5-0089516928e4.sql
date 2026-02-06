-- Add columns to waitlist table for username and approval tracking
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS desired_username text;

ALTER TABLE public.waitlist
ADD COLUMN IF NOT EXISTS password_token text;

ALTER TABLE public.waitlist
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Add a unique constraint on desired_username to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_desired_username_unique 
ON public.waitlist (desired_username) 
WHERE desired_username IS NOT NULL;