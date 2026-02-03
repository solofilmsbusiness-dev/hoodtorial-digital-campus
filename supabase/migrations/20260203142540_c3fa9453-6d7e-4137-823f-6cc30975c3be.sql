-- Create quizzes table for module and course-level quizzes
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 80,
  time_limit_minutes INTEGER DEFAULT NULL,
  is_final_exam BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Either module_id or course_id must be set (but not both for final exams)
  CONSTRAINT quiz_parent_check CHECK (
    (module_id IS NOT NULL AND is_final_exam = false) OR 
    (course_id IS NOT NULL AND is_final_exam = true)
  )
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- RLS policies for quizzes
CREATE POLICY "Admins can manage quizzes"
ON public.quizzes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view quizzes for published courses"
ON public.quizzes
FOR SELECT
USING (
  (module_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = quizzes.module_id AND c.is_published = true AND c.is_locked = false
  ))
  OR
  (course_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = quizzes.course_id AND c.is_published = true AND c.is_locked = false
  ))
);

-- RLS policies for quiz_questions
CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view questions for published course quizzes"
ON public.quiz_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    WHERE q.id = quiz_questions.quiz_id
    AND (
      (q.module_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM modules m
        JOIN courses c ON c.id = m.course_id
        WHERE m.id = q.module_id AND c.is_published = true AND c.is_locked = false
      ))
      OR
      (q.course_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM courses c
        WHERE c.id = q.course_id AND c.is_published = true AND c.is_locked = false
      ))
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_quizzes_module_id ON public.quizzes(module_id);
CREATE INDEX idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);

-- Add updated_at trigger
CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
BEFORE UPDATE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();