-- Create enrollments table for tracking active course enrollments
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_code)
);

-- Add video watch progress tracking to user_progress
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS watch_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS watched_seconds INTEGER DEFAULT 0;

-- Add quiz attempt tracking
ALTER TABLE public.quiz_results 
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;

-- Enable RLS on enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- RLS policies for enrollments
CREATE POLICY "Users can view their own enrollments"
ON public.enrollments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enrollments"
ON public.enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
ON public.enrollments FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_enrollments_updated_at
BEFORE UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to count active enrollments for a user
CREATE OR REPLACE FUNCTION public.get_active_enrollment_count(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.enrollments
  WHERE user_id = _user_id AND status = 'active'
$$;

-- Function to check if user can enroll (max 3 active courses)
CREATE OR REPLACE FUNCTION public.can_enroll(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_active_enrollment_count(_user_id) < 3
$$;

-- Function to get quiz attempt count
CREATE OR REPLACE FUNCTION public.get_quiz_attempt_count(_user_id UUID, _quiz_id TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(attempt_number), 0)::INTEGER
  FROM public.quiz_results
  WHERE user_id = _user_id AND quiz_id = _quiz_id
$$;