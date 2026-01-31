import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type UserProgress = Tables<"user_progress">;

export function useUserProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setProgress(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  const markLessonComplete = async (courseCode: string, lessonId: string, creditsEarned: number = 0) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data, error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          course_code: courseCode,
          lesson_id: lessonId,
          completed: true,
          credits_earned: creditsEarned,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,course_code,lesson_id",
        })
        .select()
        .single();

      if (error) throw error;

      setProgress((prev) => {
        const existing = prev.findIndex(
          (p) => p.course_code === courseCode && p.lesson_id === lessonId
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        }
        return [data, ...prev];
      });

      return { error: null, data };
    } catch (err) {
      return { error: err as Error, data: null };
    }
  };

  const getTotalCredits = () => {
    return progress.reduce((sum, p) => sum + (p.credits_earned || 0), 0);
  };

  const getCompletedCourses = () => {
    const courseCompletions = progress.filter((p) => !p.lesson_id && p.completed);
    return courseCompletions.length;
  };

  return { progress, loading, error, markLessonComplete, getTotalCredits, getCompletedCourses };
}
