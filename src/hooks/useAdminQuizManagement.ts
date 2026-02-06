import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQuizQuestions, type QuizQuestion } from "@/data/quizQuestions";

export interface QuizAnswer {
  id: string;
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface QuizResultDetail {
  id: string;
  quizId: string;
  courseCode: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  attemptNumber: number | null;
  createdAt: string;
  timeTakenSeconds: number | null;
  answers: Array<{
    questionId: string;
    questionText: string;
    options: string[];
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
  }>;
}

export function useAdminQuizManagement() {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch detailed quiz results with answers for a specific user
  const fetchQuizResultsWithAnswers = useCallback(async (userId: string): Promise<QuizResultDetail[]> => {
    // Fetch quiz results
    const { data: results, error: resultsError } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (resultsError) throw resultsError;
    if (!results || results.length === 0) return [];

    // Fetch answers for all quiz results
    const resultIds = results.map((r) => r.id);
    const { data: answersData, error: answersError } = await supabase
      .from("quiz_answers")
      .select("*")
      .in("quiz_result_id", resultIds);

    if (answersError) throw answersError;

    // Group answers by quiz_result_id
    const answersByResultId: Record<string, QuizAnswer[]> = {};
    (answersData || []).forEach((answer) => {
      if (!answersByResultId[answer.quiz_result_id]) {
        answersByResultId[answer.quiz_result_id] = [];
      }
      answersByResultId[answer.quiz_result_id].push({
        id: answer.id,
        questionId: answer.question_id,
        selectedAnswer: answer.selected_answer,
        isCorrect: answer.is_correct,
      });
    });

    // Build the detailed results
    return results.map((result) => {
      const quizQuestions = getQuizQuestions(result.quiz_id);
      const resultAnswers = answersByResultId[result.id] || [];
      
      // Map answers to include question details
      const answersWithDetails = resultAnswers.map((answer, idx) => {
        const question = quizQuestions.find((q) => q.id === answer.questionId);
        
        // Log warning if question not found for debugging
        if (!question) {
          console.warn(`Admin Quiz View: Question not found - questionId: ${answer.questionId}, quizId: ${result.quiz_id}`);
        }
        
        return {
          questionId: answer.questionId,
          questionText: question?.question || `Question ${idx + 1} (data not available)`,
          options: question?.options || [],
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: question?.correctAnswer ?? -1,
          isCorrect: answer.isCorrect,
        };
      });

      return {
        id: result.id,
        quizId: result.quiz_id,
        courseCode: result.course_code,
        score: result.score,
        totalQuestions: result.total_questions,
        passed: result.passed,
        attemptNumber: result.attempt_number,
        createdAt: result.created_at,
        timeTakenSeconds: result.time_taken_seconds,
        answers: answersWithDetails,
      };
    });
  }, []);

  // Delete a specific quiz result (and its answers via cascade)
  const deleteQuizResult = useCallback(async (quizResultId: string, userId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("quiz_results")
        .delete()
        .eq("id", quizResultId);

      if (error) throw error;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["admin-student-detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient]);

  // Delete all quiz results for a user
  const deleteAllQuizResults = useCallback(async (userId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("quiz_results")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["admin-student-detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient]);

  // Delete an enrollment for a user
  const deleteEnrollment = useCallback(async (userId: string, courseCode: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("user_id", userId)
        .eq("course_code", courseCode);

      if (error) throw error;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["admin-student-detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient]);

  // Delete all enrollments for a user (expel from all classes)
  const deleteAllEnrollments = useCallback(async (userId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["admin-student-detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient]);

  // Delete all progress for a user (reset all lesson progress)
  const deleteAllProgress = useCallback(async (userId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("user_progress")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["admin-student-detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient]);

  // Ban a user
  const banUser = useCallback(async (userId: string, reason: string, bannedBy: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: true,
          banned_at: new Date().toISOString(),
          banned_by: bannedBy,
          ban_reason: reason,
        })
        .eq("user_id", userId);

      if (error) throw error;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["admin-student-detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient]);

  // Unban a user
  const unbanUser = useCallback(async (userId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: false,
          banned_at: null,
          banned_by: null,
          ban_reason: null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["admin-student-detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient]);

  // Delete a user permanently (calls edge function)
  const deleteUser = useCallback(async (userId: string) => {
    setIsDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("delete-user", {
        body: { userId },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to delete user");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      // Invalidate all relevant queries (use exact: false to match keys with additional params like showDemoData)
      queryClient.invalidateQueries({ queryKey: ["admin-students"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-student-detail"], exact: false });

      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient]);

  return {
    fetchQuizResultsWithAnswers,
    deleteQuizResult,
    deleteAllQuizResults,
    deleteEnrollment,
    deleteAllEnrollments,
    deleteAllProgress,
    banUser,
    unbanUser,
    deleteUser,
    isDeleting,
  };
}
