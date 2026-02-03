-- Create quiz_answers table to store individual question responses
CREATE TABLE public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_result_id UUID REFERENCES public.quiz_results(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own quiz answers
CREATE POLICY "Users can view own quiz answers"
  ON public.quiz_answers FOR SELECT
  TO authenticated
  USING (
    quiz_result_id IN (
      SELECT id FROM public.quiz_results WHERE user_id = auth.uid()
    )
  );

-- RLS: Admins can view all quiz answers
CREATE POLICY "Admins can view all quiz answers"
  ON public.quiz_answers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Users can insert their own quiz answers
CREATE POLICY "Users can insert own quiz answers"
  ON public.quiz_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    quiz_result_id IN (
      SELECT id FROM public.quiz_results WHERE user_id = auth.uid()
    )
  );

-- RLS: Admins can delete quiz answers
CREATE POLICY "Admins can delete quiz answers"
  ON public.quiz_answers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin delete policy for quiz_results
CREATE POLICY "Admins can delete quiz results"
  ON public.quiz_results FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin delete policy for enrollments
CREATE POLICY "Admins can delete enrollments"
  ON public.enrollments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));