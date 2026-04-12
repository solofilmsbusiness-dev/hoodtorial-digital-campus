import { useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useTestMode } from "@/hooks/useTestMode";
import { useLessonCompletions } from "@/hooks/useLessonCompletions";
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
  const { progress, markLessonComplete: markProgressComplete } = useUserProgress();
  const { results: quizResults } = useQuizResults();
  const { isTestModeEnabled } = useTestMode();

  // lesson_progress table: source of truth for explicit "mark complete" actions
  const lessonCompletions = useLessonCompletions(course?.code);

  // Get quiz completion data from quiz results
  const quizMap = useMemo(() => {
    if (!course) return new Map<string, { passed: boolean; attempts: number }>();

    const map = new Map<string, { passed: boolean; attempts: number }>();
    quizResults
      .filter((r) => r.course_code === course.code)
      .forEach((r) => {
        const existing = map.get(r.quiz_id);
        if (!existing || r.passed) {
          map.set(r.quiz_id, {
            passed: r.passed,
            attempts: existing ? existing.attempts + 1 : 1,
          });
        } else if (existing) {
          map.set(r.quiz_id, { ...existing, attempts: existing.attempts + 1 });
        }
      });
    return map;
  }, [course, quizResults]);

  // Watch percentage data from user_progress (video tracking)
  const watchMap = useMemo(() => {
    if (!course) return new Map<string, number>();
    const map = new Map<string, number>();
    progress
      .filter((p) => p.course_code === course.code && p.lesson_id)
      .forEach((p) => {
        map.set(p.lesson_id!, (p as any).watch_percentage || 0);
      });
    return map;
  }, [course, progress]);

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
          if (!_isLessonCompletedRaw(lesson.id)) return false;
        }

        // Check module quiz if exists (except for current module if we're checking a lesson)
        if (mi < moduleIndex && module.quiz) {
          const quizData = quizMap.get(module.quiz.id);
          if (!quizData?.passed) return false;
        }

        // If checking quiz in current module, all lessons must be complete
        if (isCurrentModule && type === "quiz") {
          return true;
        }
      }

      return true;
    },
    [course, user, isTestModeEnabled, lessonCompletions.completedLessonIds, quizMap]
  );

  // Raw completion check (no test mode bypass) — used internally for progression
  const _isLessonCompletedRaw = useCallback(
    (lessonId: string) => {
      // Primary: lesson_progress table
      if (lessonCompletions.isCompleted(lessonId)) return true;
      // Fallback: user_progress.completed (for video lessons completed before lesson_progress existed)
      const fallback = progress.find(
        (p) => p.lesson_id === lessonId && p.course_code === course?.code
      );
      return fallback?.completed ?? false;
    },
    [lessonCompletions, progress, course]
  );

  // Update video watch progress (saves to user_progress for watch % tracking)
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

        // Also mark in lesson_progress when threshold is reached
        if (completed) {
          await lessonCompletions.markComplete(course.code, lessonId);
        }
      } catch (err) {
        console.error("Failed to update watch progress:", err);
      }
    },
    [user, course, lessonCompletions]
  );

  // Get quiz attempt count
  const getQuizAttempts = useCallback(
    (quizId: string) => {
      return quizResults.filter((r) => r.quiz_id === quizId).length;
    },
    [quizResults]
  );

  // For progression/unlocking - respects Test Mode bypass
  const isQuizPassed = useCallback(
    (quizId: string) => {
      if (isTestModeEnabled) return true;
      return quizMap.get(quizId)?.passed || false;
    },
    [quizMap, isTestModeEnabled]
  );

  // For display/retake logic - always returns real status
  const isQuizActuallyPassed = useCallback(
    (quizId: string) => {
      return quizMap.get(quizId)?.passed || false;
    },
    [quizMap]
  );

  const canAttemptQuiz = useCallback(
    (quizId: string) => {
      if (isTestModeEnabled) {
        const reallyPassed = quizMap.get(quizId)?.passed || false;
        return !reallyPassed;
      }
      const attempts = getQuizAttempts(quizId);
      const passed = isQuizPassed(quizId);
      return !passed && attempts < 3;
    },
    [getQuizAttempts, isQuizPassed, isTestModeEnabled, quizMap]
  );

  // Calculate module completion percentage
  const getModuleProgress = useCallback(
    (module: Module) => {
      let completed = 0;
      let total = module.lessons.length;

      module.lessons.forEach((lesson) => {
        if (_isLessonCompletedRaw(lesson.id)) {
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
    [_isLessonCompletedRaw, quizMap]
  );

  // Public completion check (with test mode bypass)
  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      if (isTestModeEnabled) return true;
      return _isLessonCompletedRaw(lessonId);
    },
    [_isLessonCompletedRaw, isTestModeEnabled]
  );

  // Get watch percentage for a specific lesson
  const getWatchPercentage = useCallback(
    (lessonId: string) => {
      return watchMap.get(lessonId) || 0;
    },
    [watchMap]
  );

  /**
   * Mark a lesson complete. Writes to both lesson_progress (primary) and
   * user_progress (for backwards compatibility with video tracking).
   */
  const markLessonComplete = useCallback(
    async (courseCode: string, lessonId: string, creditsEarned: number = 0) => {
      if (!user) return { error: new Error("Not authenticated") };

      // Write to lesson_progress (new table)
      const { error: lpError } = await lessonCompletions.markComplete(courseCode, lessonId);

      // Also write to user_progress for video watch compatibility
      const { error: upError } = await markProgressComplete(courseCode, lessonId, creditsEarned);

      return { error: lpError || upError || null };
    },
    [user, lessonCompletions, markProgressComplete]
  );

  return {
    isContentUnlocked,
    updateWatchProgress,
    getQuizAttempts,
    isQuizPassed,
    isQuizActuallyPassed,
    canAttemptQuiz,
    getModuleProgress,
    isLessonCompleted,
    getWatchPercentage,
    markLessonComplete,
    watchThreshold: WATCH_THRESHOLD,
  };
}
