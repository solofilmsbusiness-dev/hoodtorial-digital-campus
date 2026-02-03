import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTestMode } from "@/hooks/useTestMode";
import type { Tables } from "@/integrations/supabase/types";

type QuizResult = Tables<"quiz_results">;

export function useQuizResults() {
  const { user } = useAuth();
  const { shouldAutoPassQuiz, isTestModeEnabled } = useTestMode();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const { data, error } = await supabase
          .from("quiz_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  const getAttemptCount = useCallback((quizId: string) => {
    // In test mode, report 0 attempts to allow unlimited retries
    if (isTestModeEnabled) return 0;
    return results.filter((r) => r.quiz_id === quizId).length;
  }, [results, isTestModeEnabled]);

  const saveQuizResult = async (result: {
    quiz_id: string;
    course_code: string;
    score: number;
    total_questions: number;
    passed: boolean;
    time_taken_seconds?: number;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    // In test mode with auto-pass, override the passed status
    const finalResult = shouldAutoPassQuiz
      ? { ...result, passed: true, score: result.total_questions }
      : result;

    // Get current attempt count for this quiz
    const attemptNumber = getAttemptCount(finalResult.quiz_id) + 1;

    try {
      const { data, error } = await supabase
        .from("quiz_results")
        .insert({
          user_id: user.id,
          ...finalResult,
          attempt_number: attemptNumber,
        })
        .select()
        .single();

      if (error) throw error;

      setResults((prev) => [data, ...prev]);
      return { error: null, data };
    } catch (err) {
      return { error: err as Error, data: null };
    }
  };

  // Test mode helper: instantly pass a quiz without going through the player
  const instantPassQuiz = useCallback(async (quizId: string, courseCode: string, totalQuestions: number) => {
    if (!user || !shouldAutoPassQuiz) return { error: new Error("Not in test mode") };

    try {
      const { data, error } = await supabase
        .from("quiz_results")
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          course_code: courseCode,
          score: totalQuestions,
          total_questions: totalQuestions,
          passed: true,
          attempt_number: 1,
          time_taken_seconds: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setResults((prev) => [data, ...prev]);
      return { error: null, data };
    } catch (err) {
      return { error: err as Error, data: null };
    }
  }, [user, shouldAutoPassQuiz]);

  return { results, loading, error, saveQuizResult, getAttemptCount, instantPassQuiz, isTestModeEnabled };
}
