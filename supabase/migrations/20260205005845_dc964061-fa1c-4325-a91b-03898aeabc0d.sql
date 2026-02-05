-- Add degree selection columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS degree_path TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS certificate_department TEXT DEFAULT NULL;

-- Add constraint to ensure valid degree paths
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_degree_path CHECK (
  degree_path IS NULL OR degree_path IN ('associate', 'bachelor', 'certificate')
);

-- Add constraint to ensure certificate_department is only set when path is certificate
ALTER TABLE public.profiles 
ADD CONSTRAINT certificate_department_requires_certificate_path CHECK (
  (degree_path = 'certificate' AND certificate_department IS NOT NULL) OR
  (degree_path != 'certificate' AND certificate_department IS NULL) OR
  degree_path IS NULL
);