import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTestMode } from "@/hooks/useTestMode";
import type { Tables } from "@/integrations/supabase/types";
import type { QuizQuestion } from "@/data/quizQuestions";

type QuizResult = Tables<"quiz_results">;

export interface QuizAnswerInput {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

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

  /**
   * Cooldown status for quiz retakes
   * - First attempt: Always allowed
   * - After 1st fail: One immediate retake
   * - After 2nd+ fail: 30-minute cooldown from last attempt
   */
  const getCooldownStatus = useCallback((quizId: string) => {
    // In test mode, no cooldown
    if (isTestModeEnabled) {
      return { canAttempt: true, cooldownEndsAt: null, attemptsUntilCooldown: 2, failedAttempts: 0 };
    }

    const attempts = results.filter(r => r.quiz_id === quizId);
    const hasPassed = attempts.some(r => r.passed);
    const failedAttempts = attempts.filter(r => !r.passed).length;
    
    // If passed, no need for cooldown logic
    if (hasPassed) {
      return { canAttempt: false, cooldownEndsAt: null, attemptsUntilCooldown: 0, failedAttempts, hasPassed: true };
    }
    
    // First attempt or no failed attempts yet
    if (failedAttempts === 0) {
      return { canAttempt: true, cooldownEndsAt: null, attemptsUntilCooldown: 2, failedAttempts };
    }
    
    // First fail = immediate retake allowed
    if (failedAttempts === 1) {
      return { canAttempt: true, cooldownEndsAt: null, attemptsUntilCooldown: 1, failedAttempts };
    }
    
    // 2+ fails = check 30-minute cooldown from last attempt
    const lastAttempt = attempts[0]; // Already sorted by created_at desc
    const cooldownEnd = new Date(lastAttempt.created_at);
    cooldownEnd.setMinutes(cooldownEnd.getMinutes() + 30);
    
    const now = new Date();
    if (now < cooldownEnd) {
      return { 
        canAttempt: false, 
        cooldownEndsAt: cooldownEnd,
        minutesRemaining: Math.ceil((cooldownEnd.getTime() - now.getTime()) / 60000),
        failedAttempts
      };
    }
    
    // Cooldown has passed, allow retry
    return { canAttempt: true, cooldownEndsAt: null, attemptsUntilCooldown: 1, failedAttempts };
  }, [results, isTestModeEnabled]);

  // Save individual quiz answers after quiz result is created
  const saveQuizAnswers = async (quizResultId: string, answers: QuizAnswerInput[]) => {
    if (!user || answers.length === 0) return { error: null };

    try {
      const answersToInsert = answers.map((answer) => ({
        quiz_result_id: quizResultId,
        question_id: answer.questionId,
        selected_answer: answer.selectedAnswer,
        is_correct: answer.isCorrect,
      }));

      const { error } = await supabase
        .from("quiz_answers")
        .insert(answersToInsert);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error("Error saving quiz answers:", err);
      return { error: err as Error };
    }
  };

  const saveQuizResult = async (
    result: {
      quiz_id: string;
      course_code: string;
      score: number;
      total_questions: number;
      passed: boolean;
      time_taken_seconds?: number;
    },
    questions?: QuizQuestion[],
    userAnswers?: Record<string, number>
  ) => {
    if (!user) return { error: new Error("Not authenticated"), data: null };

    // Always save actual results - auto-pass is only for instant-pass buttons
    const finalResult = result;

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

      // Save individual answers if questions and userAnswers are provided
      if (data && questions && userAnswers) {
        const answersToSave: QuizAnswerInput[] = questions.map((q) => ({
          questionId: q.id,
          selectedAnswer: userAnswers[q.id] ?? -1,
          isCorrect: userAnswers[q.id] === q.correctAnswer,
        }));
        await saveQuizAnswers(data.id, answersToSave);
      }

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

  return { results, loading, error, saveQuizResult, saveQuizAnswers, getAttemptCount, getCooldownStatus, instantPassQuiz, isTestModeEnabled };
}
