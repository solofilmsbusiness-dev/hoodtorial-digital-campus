import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses, Course } from "@/data/courses";

export interface CourseWithStatus extends Course {
  isPublished: boolean;
  isComingSoon: boolean;
}

interface CourseStatus {
  code: string;
  is_published: boolean;
  is_locked: boolean;
}

export function useCourseStatus() {
  const { data: dbCourses, isLoading, error } = useQuery({
    queryKey: ["course-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("code, is_published, is_locked");
      
      if (error) throw error;
      return data as CourseStatus[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Merge static course data with database status
  const coursesWithStatus: CourseWithStatus[] = staticCourses.map((course) => {
    const dbStatus = dbCourses?.find((db) => db.code === course.code);
    
    // If no database entry, treat as published and not locked (fallback)
    return {
      ...course,
      isPublished: dbStatus?.is_published ?? true,
      isComingSoon: dbStatus?.is_locked ?? false,
    };
  });

  // Filter to only show published courses
  const publishedCourses = coursesWithStatus.filter((course) => course.isPublished);

  return {
    courses: publishedCourses,
    allCourses: coursesWithStatus,
    isLoading,
    error,
  };
}
