-- Create assessment_results table
CREATE TABLE public.assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  interests TEXT[] NOT NULL,
  experience_level TEXT NOT NULL,
  department_scores JSONB NOT NULL,
  recommended_courses TEXT[] NOT NULL,
  total_score INTEGER NOT NULL,
  time_taken_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own assessment results"
ON public.assessment_results
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment results"
ON public.assessment_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster user lookups
CREATE INDEX idx_assessment_results_user_id ON public.assessment_results(user_id);

-- Create index for fetching latest results
CREATE INDEX idx_assessment_results_created_at ON public.assessment_results(created_at DESC);