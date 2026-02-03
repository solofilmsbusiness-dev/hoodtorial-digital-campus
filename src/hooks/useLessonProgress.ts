import { useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useTestMode } from "@/hooks/useTestMode";
import type { Course, Lesson, Module } from "@/data/courses";

const WATCH_THRESHOLD = 90; // 90% watched to mark complete

export interface LessonProgressData {
  lessonId: string;
  watchPercentage: number;
  completed: boolean;
  isUnlocked: boolean;
}

export function useLessonProgress(course: Course | undefined) {
  const { user } = useAuth();
  const { progress, markLessonComplete } = useUserProgress();
  const { results: quizResults } = useQuizResults();
  const { isTestModeEnabled } = useTestMode();

  // Get completion data for this course
  const courseProgress = useMemo(() => {
    if (!course) return { lessonMap: new Map(), quizMap: new Map() };

    const lessonMap = new Map<string, { completed: boolean; watchPercentage: number }>();
    const quizMap = new Map<string, { passed: boolean; attempts: number }>();

    // Build lesson completion map
    progress
      .filter((p) => p.course_code === course.code && p.lesson_id)
      .forEach((p) => {
        lessonMap.set(p.lesson_id!, {
          completed: p.completed,
          watchPercentage: (p as any).watch_percentage || 0,
        });
      });

    // Build quiz completion map
    quizResults
      .filter((r) => r.course_code === course.code)
      .forEach((r) => {
        const existing = quizMap.get(r.quiz_id);
        if (!existing || r.passed) {
          quizMap.set(r.quiz_id, {
            passed: r.passed,
            attempts: existing ? existing.attempts + 1 : 1,
          });
        } else if (existing) {
          quizMap.set(r.quiz_id, {
            ...existing,
            attempts: existing.attempts + 1,
          });
        }
      });

    return { lessonMap, quizMap };
  }, [course, progress, quizResults]);

  // Check if a specific lesson/quiz is unlocked based on sequential progression
  const isContentUnlocked = useCallback(
    (moduleIndex: number, lessonIndex: number, type: "lesson" | "quiz" = "lesson") => {
      if (!course) return false;
      if (!user) return false; // Must be logged in to progress

      // Admin test mode: bypass all unlock requirements
      if (isTestModeEnabled) {
        return true;
      }

      // First module, first lesson is always unlocked
      if (moduleIndex === 0 && lessonIndex === 0 && type === "lesson") {
        return true;
      }

      const { lessonMap, quizMap } = courseProgress;

      // Check all previous content is completed
      for (let mi = 0; mi <= moduleIndex; mi++) {
        const module = course.modules[mi];
        const isCurrentModule = mi === moduleIndex;
        const lessonLimit = isCurrentModule
          ? type === "quiz"
            ? module.lessons.length
            : lessonIndex
          : module.lessons.length;

        // Check all lessons before this one
        for (let li = 0; li < lessonLimit; li++) {
          const lesson = module.lessons[li];
          const lessonData = lessonMap.get(lesson.id);

          // Video lessons need 90%+ watched OR marked complete
          if (lesson.type === "video") {
            const isWatched =
              lessonData?.completed || (lessonData?.watchPercentage || 0) >= WATCH_THRESHOLD;
            if (!isWatched) return false;
          } else {
            // Non-video lessons just need to be marked complete
            if (!lessonData?.completed) return false;
          }
        }

        // Check module quiz if exists (except for current module if we're checking a lesson)
        if (mi < moduleIndex && module.quiz) {
          const quizData = quizMap.get(module.quiz.id);
          if (!quizData?.passed) return false;
        }

        // If checking quiz in current module, all lessons must be complete
        if (isCurrentModule && type === "quiz") {
          // We already checked all lessons above
          return true;
        }
      }

      return true;
    },
    [course, user, courseProgress, isTestModeEnabled]
  );

  // Update video watch progress
  const updateWatchProgress = useCallback(
    async (lessonId: string, watchedSeconds: number, durationSeconds: number) => {
      if (!user || !course) return;

      const watchPercentage = Math.round((watchedSeconds / durationSeconds) * 100);
      const completed = watchPercentage >= WATCH_THRESHOLD;

      try {
        await supabase.from("user_progress").upsert(
          {
            user_id: user.id,
            course_code: course.code,
            lesson_id: lessonId,
            watch_percentage: watchPercentage,
            watched_seconds: watchedSeconds,
            video_duration_seconds: durationSeconds,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,course_code,lesson_id" }
        );
      } catch (err) {
        console.error("Failed to update watch progress:", err);
      }
    },
    [user, course]
  );

  // Get quiz attempt count
  const getQuizAttempts = useCallback(
    (quizId: string) => {
      return quizResults.filter((r) => r.quiz_id === quizId).length;
    },
    [quizResults]
  );

  const isQuizPassed = useCallback(
    (quizId: string) => {
      // Test mode: treat all quizzes as passed
      if (isTestModeEnabled) return true;
      return courseProgress.quizMap.get(quizId)?.passed || false;
    },
    [courseProgress, isTestModeEnabled]
  );

  const canAttemptQuiz = useCallback(
    (quizId: string) => {
      // Test mode: always allow quiz attempts
      if (isTestModeEnabled) return true;
      const attempts = getQuizAttempts(quizId);
      const passed = isQuizPassed(quizId);
      return !passed && attempts < 3;
    },
    [getQuizAttempts, isQuizPassed, isTestModeEnabled]
  );

  // Calculate module completion percentage
  const getModuleProgress = useCallback(
    (module: Module) => {
      const { lessonMap, quizMap } = courseProgress;
      let completed = 0;
      let total = module.lessons.length;

      module.lessons.forEach((lesson) => {
        const data = lessonMap.get(lesson.id);
        if (lesson.type === "video") {
          if (data?.completed || (data?.watchPercentage || 0) >= WATCH_THRESHOLD) {
            completed++;
          }
        } else if (data?.completed) {
          completed++;
        }
      });

      if (module.quiz) {
        total++;
        if (quizMap.get(module.quiz.id)?.passed) {
          completed++;
        }
      }

      return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    },
    [courseProgress]
  );

  // Check if lesson is completed
  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      // Test mode: treat all lessons as completed
      if (isTestModeEnabled) return true;
      const data = courseProgress.lessonMap.get(lessonId);
      if (!data) return false;
      return data.completed || data.watchPercentage >= WATCH_THRESHOLD;
    },
    [courseProgress, isTestModeEnabled]
  );

  // Get watch percentage for a specific lesson
  const getWatchPercentage = useCallback(
    (lessonId: string) => {
      const data = courseProgress.lessonMap.get(lessonId);
      return data?.watchPercentage || 0;
    },
    [courseProgress]
  );

  return {
    isContentUnlocked,
    updateWatchProgress,
    getQuizAttempts,
    isQuizPassed,
    canAttemptQuiz,
    getModuleProgress,
    isLessonCompleted,
    getWatchPercentage,
    markLessonComplete,
    watchThreshold: WATCH_THRESHOLD,
  };
}
