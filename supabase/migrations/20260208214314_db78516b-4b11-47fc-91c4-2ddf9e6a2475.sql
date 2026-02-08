-- Drop the overly permissive policy that lets any enrolled student read ALL profile columns
DROP POLICY IF EXISTS "Enrolled students can view public profiles" ON public.profiles;