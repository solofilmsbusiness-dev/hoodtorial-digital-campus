-- Drop the foreign key constraint on profiles.user_id to allow demo users
-- Demo users have fake UUIDs that don't exist in auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add a comment explaining why this constraint was removed
COMMENT ON COLUMN public.profiles.user_id IS 'User ID - no FK to auth.users to support demo mode with fake user IDs';