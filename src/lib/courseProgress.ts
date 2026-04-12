import type { Course } from "@/data/courses";

/**
 * Returns true when every lesson in every module of the course has been completed.
 * Quiz completion is NOT considered here — this checks lesson content only.
 * Pass the Set of completed lesson IDs from useLessonCompletions.
 *
 * @example
 * const { completedLessonIds } = useLessonCompletions(course?.code);
 * const done = isCourseComplete(course, completedLessonIds);
 */
export function isCourseComplete(
  course: Course | undefined,
  completedLessonIds: Set<string>
): boolean {
  if (!course) return false;
  return course.modules.every((module) =>
    module.lessons.every((lesson) => completedLessonIds.has(lesson.id))
  );
}
