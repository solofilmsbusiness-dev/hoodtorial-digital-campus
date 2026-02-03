import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses, Course, departments } from "@/data/courses";

export interface CourseWithStatus extends Course {
  isPublished: boolean;
  isComingSoon: boolean;
}

interface DbCourse {
  code: string;
  title: string;
  description: string | null;
  department_id: string;
  credits: number;
  level: string;
  duration: string | null;
  is_published: boolean;
  is_locked: boolean;
}

export function useCourseStatus() {
  const { data: dbCourses, isLoading, error } = useQuery({
    queryKey: ["course-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("code, title, description, department_id, credits, level, duration, is_published, is_locked");
      
      if (error) throw error;
      return data as DbCourse[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Build courses from both static data and database
  const coursesWithStatus: CourseWithStatus[] = [];
  const processedCodes = new Set<string>();

  // First, process all database courses (these are the source of truth for status)
  if (dbCourses) {
    for (const dbCourse of dbCourses) {
      processedCodes.add(dbCourse.code);
      
      // Check if there's matching static course data
      const staticCourse = staticCourses.find((s) => s.code === dbCourse.code);
      
      if (staticCourse) {
        // Merge static data with DB status
        coursesWithStatus.push({
          ...staticCourse,
          isPublished: dbCourse.is_published,
          isComingSoon: dbCourse.is_locked,
        });
      } else {
        // DB-only course (newly created in admin) - construct from DB fields
        // Try to find static course to get lesson count as fallback
        const matchingStaticCourse = staticCourses.find((s) => s.code === dbCourse.code);
        const dept = departments.find((d) => d.id === dbCourse.department_id);
        
        coursesWithStatus.push({
          code: dbCourse.code,
          title: dbCourse.title,
          description: dbCourse.description || "",
          department: dept?.name || dbCourse.department_id,
          departmentId: dbCourse.department_id,
          credits: dbCourse.credits,
          level: (dbCourse.level as "Beginner" | "Intermediate" | "Advanced") || "Beginner",
          duration: matchingStaticCourse?.duration || dbCourse.duration || "Self-paced",
          lessons: matchingStaticCourse?.lessons ?? 0, // Use static count as fallback
          modules: [], // Will be loaded separately when viewing course
          isPublished: dbCourse.is_published,
          isComingSoon: dbCourse.is_locked,
        });
      }
    }
  }

  // Then, add any static courses not yet in database (for backward compatibility)
  for (const staticCourse of staticCourses) {
    if (!processedCodes.has(staticCourse.code)) {
      coursesWithStatus.push({
        ...staticCourse,
        isPublished: true, // Default: show static courses
        isComingSoon: false,
      });
    }
  }

  // Filter to only show published courses
  const publishedCourses = coursesWithStatus.filter((course) => course.isPublished);

  return {
    courses: publishedCourses,
    allCourses: coursesWithStatus,
    isLoading,
    error,
  };
}
