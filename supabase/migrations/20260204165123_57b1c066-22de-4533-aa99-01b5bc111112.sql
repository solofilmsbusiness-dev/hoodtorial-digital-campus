-- Add terms_accepted_at column to track when users accepted terms
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- Update handle_new_user to NOT auto-start trial (trial starts after terms acceptance)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    NULL,  -- No subscription status until terms accepted
    NULL,  -- Trial doesn't start until terms accepted
    NULL   -- Trial end date is NULL until terms accepted
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$function$;