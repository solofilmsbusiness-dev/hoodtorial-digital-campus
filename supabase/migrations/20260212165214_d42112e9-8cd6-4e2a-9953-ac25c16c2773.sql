ALTER TABLE public.profiles
  ALTER COLUMN subscription_status DROP DEFAULT,
  ALTER COLUMN trial_started_at DROP DEFAULT,
  ALTER COLUMN trial_ends_at DROP DEFAULT;