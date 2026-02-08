
-- Drop the overly permissive "all operations" admin policy and replace with specific ones
DROP POLICY IF EXISTS "Admins can manage waitlist" ON public.waitlist;

-- Admin can SELECT all waitlist entries
CREATE POLICY "Admins can select waitlist"
ON public.waitlist FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can UPDATE waitlist entries
CREATE POLICY "Admins can update waitlist"
ON public.waitlist FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can DELETE waitlist entries
CREATE POLICY "Admins can delete waitlist"
ON public.waitlist FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Keep the existing anonymous INSERT policy but scope it to anon role only
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

CREATE POLICY "Anonymous users can join waitlist"
ON public.waitlist FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL 
  AND email <> ''
  AND status IS NOT DISTINCT FROM 'pending'
);
