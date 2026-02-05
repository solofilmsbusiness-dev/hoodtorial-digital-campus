-- Create a public view for quiz questions that hides correct answers
-- Students will query this view, not the base table
CREATE VIEW public.quiz_questions_public
WITH (security_invoker = on) AS
SELECT 
  id,
  quiz_id,
  question,
  options,
  sort_order,
  created_at,
  updated_at
  -- Excludes: correct_answer, explanation
FROM public.quiz_questions;

-- Drop the existing public SELECT policy that exposes correct answers
DROP POLICY IF EXISTS "Anyone can view questions for published course quizzes" ON public.quiz_questions;

-- Create a new restrictive policy - only admins can SELECT from base table
CREATE POLICY "Only admins can view quiz questions directly"
ON public.quiz_questions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a function to verify answers server-side (returns correct answer only after submission)
CREATE OR REPLACE FUNCTION public.check_quiz_answer(
  _question_id uuid,
  _selected_answer integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _correct_answer integer;
  _explanation text;
  _is_correct boolean;
BEGIN
  -- Get the correct answer (bypasses RLS due to SECURITY DEFINER)
  SELECT correct_answer, explanation 
  INTO _correct_answer, _explanation
  FROM public.quiz_questions 
  WHERE id = _question_id;
  
  IF _correct_answer IS NULL THEN
    RETURN jsonb_build_object('error', 'Question not found');
  END IF;
  
  _is_correct := (_selected_answer = _correct_answer);
  
  RETURN jsonb_build_object(
    'is_correct', _is_correct,
    'correct_answer', _correct_answer,
    'explanation', _explanation
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_quiz_answer(uuid, integer) TO authenticated;