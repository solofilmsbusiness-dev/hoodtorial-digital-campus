import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CourseCounts {
  totalLessons: number;
  totalQuizzes: number;
}

export function useDbCourseCounts() {
  const { data: counts = {}, isLoading } = useQuery({
    queryKey: ["db-course-counts"],
    queryFn: async () => {
      // Fetch lesson counts per course (via modules -> courses -> code)
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("module_id, modules!inner(course_id, courses!inner(code))")
      
      if (lessonError) throw lessonError;

      // Fetch quiz counts per course
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("id, course_id, courses!inner(code)")

      if (quizError) throw quizError;

      const map: Record<string, CourseCounts> = {};

      // Count lessons per course code
      for (const lesson of lessonData || []) {
        const code = (lesson as any).modules?.courses?.code as string;
        if (!code) continue;
        if (!map[code]) map[code] = { totalLessons: 0, totalQuizzes: 0 };
        map[code].totalLessons++;
      }

      // Count quizzes per course code
      for (const quiz of quizData || []) {
        const code = (quiz as any).courses?.code as string;
        if (!code) continue;
        if (!map[code]) map[code] = { totalLessons: 0, totalQuizzes: 0 };
        map[code].totalQuizzes++;
      }

      return map;
    },
    staleTime: 1000 * 60 * 5,
  });

  return { dbCourseCounts: counts, isLoading };
}
