-- Add subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN subscription_status text DEFAULT 'trial'
  CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
ADD COLUMN trial_started_at timestamptz DEFAULT now(),
ADD COLUMN trial_ends_at timestamptz DEFAULT (now() + interval '3 days'),
ADD COLUMN subscription_started_at timestamptz,
ADD COLUMN subscription_ends_at timestamptz;

-- Create has_paid_access function to check if user has valid subscription or trial
CREATE OR REPLACE FUNCTION public.has_paid_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = _user_id
      AND (
        -- Active paid subscription
        (subscription_status = 'active' AND (subscription_ends_at IS NULL OR subscription_ends_at > now()))
        OR
        -- Within trial period
        (subscription_status = 'trial' AND trial_ends_at > now())
      )
    )
  END
$$;

-- Update is_enrolled_student to also check for paid access
CREATE OR REPLACE FUNCTION public.is_enrolled_student(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE (
      -- Must have paid access (trial or subscription)
      has_paid_access(_user_id)
      AND
      -- Must have at least one active enrollment
      EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE user_id = _user_id AND status = 'active'
      )
    )
  END
$$;

-- Drop existing insert policy on enrollments if it exists
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON public.enrollments;

-- New insert policy requiring paid access
CREATE POLICY "Users with paid access can enroll"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND has_paid_access(auth.uid())
  );

-- Update handle_new_user to set trial dates explicitly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    display_name,
    subscription_status,
    trial_started_at,
    trial_ends_at
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'display_name',
    'trial',
    now(),
    now() + interval '3 days'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;