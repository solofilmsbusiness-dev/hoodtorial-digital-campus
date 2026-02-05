-- Add columns for unified onboarding journey
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS recommended_degree_path TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.recommended_degree_path IS 'AI-suggested degree path based on assessment results';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Flag to track if user completed the full onboarding flow';