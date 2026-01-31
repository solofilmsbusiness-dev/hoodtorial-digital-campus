import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type QuizResult = Tables<"quiz_results">;

export function useQuizResults() {
  const { user } = useAuth();
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

  const saveQuizResult = async (result: {
    quiz_id: string;
    course_code: string;
    score: number;
    total_questions: number;
    passed: boolean;
    time_taken_seconds?: number;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data, error } = await supabase
        .from("quiz_results")
        .insert({
          user_id: user.id,
          ...result,
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

  return { results, loading, error, saveQuizResult };
}
