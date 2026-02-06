
-- Create faculty_members table
CREATE TABLE public.faculty_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  expertise text[] DEFAULT '{}',
  bio text,
  featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faculty_members ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view faculty members"
ON public.faculty_members FOR SELECT
USING (true);

-- Admin write
CREATE POLICY "Admins can insert faculty members"
ON public.faculty_members FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update faculty members"
ON public.faculty_members FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete faculty members"
ON public.faculty_members FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed existing faculty
INSERT INTO public.faculty_members (name, role, department, expertise, bio, featured, display_order) VALUES
('Marcus ''The Lens'' Williams', 'Head of Cinematography', 'Cinematography', ARRAY['iPhone ProRes', 'Lighting', 'Lens Selection', 'Camera Movement'], 'Former music video director with 200+ videos for major labels. Pioneer in mobile cinematography who''s shot campaigns for Nike, Beats, and Netflix.', true, 1),
('Aaliyah Chen', 'Lead Editing Instructor', 'Post-Production', ARRAY['DaVinci Resolve', 'Color Grading', 'Sound Design', 'Mobile Editing'], 'Emmy-nominated editor who transitioned from Hollywood to teaching mobile-first workflows. Edited documentaries that premiered at Sundance.', false, 2),
('DeShawn Carter', 'Directing Faculty', 'Directing', ARRAY['Narrative', 'Documentary', 'Music Video', 'Talent Direction'], 'Award-winning documentary filmmaker whose work explores urban culture. His films have screened at SXSW, Tribeca, and won multiple festival awards.', false, 3),
('Nina Rodriguez', 'Production Coordinator', 'Production', ARRAY['Line Producing', 'Budgeting', 'Scheduling', 'Client Relations'], '15 years in production management for commercials and indie films. Specializes in maximizing impact on minimal budgets.', false, 4),
('Terrence ''T-Light'' Jackson', 'Lighting Specialist', 'Cinematography', ARRAY['Natural Light', 'LED Setups', 'Night Shoots', 'Mood Lighting'], 'Gaffer-turned-educator who''s lit shoots for major artists and brands. Known for creating cinematic looks with just smartphone flashlights.', false, 5),
('Jasmine Foster', 'Sound Design Lead', 'Post-Production', ARRAY['Audio Mixing', 'Foley', 'Music Licensing', 'Voice Recording'], 'Audio engineer who''s worked on Grammy-winning albums. Now teaches creators how to capture and mix professional audio on mobile.', false, 6),
('Kevin ''K-Motion'' Park', 'Motion Graphics Instructor', 'Post-Production', ARRAY['After Effects', 'Motion Design', 'Title Design', 'VFX'], 'Motion designer for top YouTube channels and streaming platforms. Creates tutorials that have been viewed over 50 million times.', false, 7),
('Destiny Washington', 'Documentary Faculty', 'Directing', ARRAY['Street Documentary', 'Interview Techniques', 'Storytelling', 'Ethics'], 'Journalist and filmmaker whose documentary work focuses on overlooked communities. Her films have aired on HBO and Showtime.', false, 8);
