
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can read quiz questions" ON public.quiz_questions;

-- Replace with authenticated-only access (view already strips correct_answer)
CREATE POLICY "Authenticated users can read quiz questions"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (true);
