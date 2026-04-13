import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Tracks lesson completion in the `lesson_progress` table.
 * This is the source of truth for whether a lesson is marked complete by the student.
 * Video watch progress is handled separately by useVideoProgress / user_progress.
 */
export function useLessonCompletions(courseId: string | undefined) {
  const { user } = useAuth();
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !courseId) {
      setCompletedLessonIds(new Set());
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCompletions = async () => {
      try {
        const { data, error } = await (supabase
          .from("lesson_progress" as any)
          .select("lesson_id") as any)
          .eq("user_id", user.id)
          .eq("course_id", courseId);

        if (!cancelled) {
          if (error) {
            // Table may not exist in this environment yet — degrade gracefully
            console.warn("[useLessonCompletions] Could not fetch lesson_progress:", error.message);
          } else {
            setCompletedLessonIds(new Set(data?.map((r) => r.lesson_id) ?? []));
          }
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[useLessonCompletions] Unexpected error:", err);
          setLoading(false);
        }
      }
    };

    fetchCompletions();

    // Real-time subscription so any device/tab updates are reflected immediately
    const channel = supabase
      .channel(`lesson_progress:${user.id}:${courseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lesson_progress",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.course_id === courseId) {
            setCompletedLessonIds((prev) => new Set([...prev, payload.new.lesson_id as string]));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "lesson_progress",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setCompletedLessonIds((prev) => {
            const next = new Set(prev);
            next.delete(payload.old.lesson_id as string);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, courseId]);

  /**
   * Mark a lesson as complete. Inserts into lesson_progress (upsert-safe).
   * Returns silently if the table doesn't exist (graceful degradation).
   */
  const markComplete = useCallback(
    async (cId: string, lessonId: string): Promise<{ error: Error | null }> => {
      if (!user) return { error: new Error("Not authenticated") };

      try {
        const { error } = await (supabase.from("lesson_progress" as any) as any).upsert(
          {
            user_id: user.id,
            course_id: cId,
            lesson_id: lessonId,
          },
          { onConflict: "user_id,course_id,lesson_id" }
        );

        if (error) {
          console.warn("[useLessonCompletions] markComplete error:", error.message);
          return { error: new Error(error.message) };
        }

        // Optimistically update local state
        setCompletedLessonIds((prev) => new Set([...prev, lessonId]));
        return { error: null };
      } catch (err) {
        console.warn("[useLessonCompletions] markComplete exception:", err);
        return { error: err as Error };
      }
    },
    [user]
  );

  const isCompleted = useCallback(
    (lessonId: string) => completedLessonIds.has(lessonId),
    [completedLessonIds]
  );

  return { completedLessonIds, loading, markComplete, isCompleted };
}
