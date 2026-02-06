
-- Replace the overly permissive waitlist INSERT policy with a slightly stricter one
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
WITH CHECK (
  email IS NOT NULL AND email <> ''
);
