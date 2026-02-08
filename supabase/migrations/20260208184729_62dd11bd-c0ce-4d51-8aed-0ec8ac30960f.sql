
-- Drop the overly permissive public policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view modules of published courses" ON public.modules;
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON public.lessons;
DROP POLICY IF EXISTS "Anyone can view quizzes for published courses" ON public.quizzes;

-- Courses: authenticated users can browse the catalog (titles, descriptions)
CREATE POLICY "Authenticated users can view published courses"
ON public.courses
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND is_published = true
  AND is_locked = false
);

-- Modules: require enrollment or paid access
CREATE POLICY "Enrolled or paid users can view modules"
ON public.modules
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = modules.course_id
      AND c.is_published = true
      AND c.is_locked = false
  )
  AND (
    has_paid_access(auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Lessons: require enrollment or paid access
CREATE POLICY "Enrolled or paid users can view lessons"
ON public.lessons
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id
      AND c.is_published = true
      AND c.is_locked = false
  )
  AND (
    has_paid_access(auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Quizzes: require enrollment or paid access
CREATE POLICY "Enrolled or paid users can view quizzes"
ON public.quizzes
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    (module_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      WHERE m.id = quizzes.module_id
        AND c.is_published = true
        AND c.is_locked = false
    ))
    OR
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = quizzes.course_id
        AND c.is_published = true
        AND c.is_locked = false
    ))
  )
  AND (
    has_paid_access(auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);
