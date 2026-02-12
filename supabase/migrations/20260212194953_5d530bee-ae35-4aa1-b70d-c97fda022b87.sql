-- Remove the overly permissive policy that exposes correct_answer to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can read quiz questions" ON public.quiz_questions;