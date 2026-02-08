CREATE POLICY "Authenticated users can read quiz questions"
  ON public.quiz_questions
  FOR SELECT
  TO authenticated
  USING (true);