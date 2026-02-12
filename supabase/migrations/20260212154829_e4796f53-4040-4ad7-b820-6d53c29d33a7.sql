
ALTER TABLE public.daily_challenges ADD COLUMN end_date date;
UPDATE public.daily_challenges SET end_date = active_date + interval '2 days';
ALTER TABLE public.daily_challenges ALTER COLUMN end_date SET NOT NULL;
ALTER TABLE public.daily_challenges ALTER COLUMN end_date SET DEFAULT (CURRENT_DATE + interval '2 days');
