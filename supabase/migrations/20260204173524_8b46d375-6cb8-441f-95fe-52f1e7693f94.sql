-- Add swap tracking columns to enrollments
ALTER TABLE public.enrollments
ADD COLUMN swaps_used integer NOT NULL DEFAULT 0,
ADD COLUMN dropped_at timestamp with time zone;

-- Index for efficient queries on dropped enrollments
CREATE INDEX idx_enrollments_dropped ON public.enrollments(dropped_at) 
WHERE dropped_at IS NOT NULL;