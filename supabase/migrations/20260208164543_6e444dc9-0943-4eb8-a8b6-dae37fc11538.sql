
-- Revoke anon access to profiles_public view to prevent unauthenticated queries
REVOKE SELECT ON public.profiles_public FROM anon;
