import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DbQuiz {
  id: string;
  module_id: string | null;
  course_id: string | null;
  title: string;
  passing_score: number;
  time_limit_minutes: number | null;
  per_question_seconds: number | null;
  use_per_question_timer: boolean;
  is_final_exam: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbQuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface QuizWithQuestions extends DbQuiz {
  questions: DbQuizQuestion[];
}

export function useAdminQuizContent(moduleId?: string, courseId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = moduleId 
    ? ["admin-module-quizzes", moduleId] 
    : ["admin-course-quizzes", courseId];

  // Fetch quizzes for a module or course
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!moduleId && !courseId) return [];

      let query = supabase.from("quizzes").select("*");
      
      if (moduleId) {
        query = query.eq("module_id", moduleId);
      } else if (courseId) {
        query = query.eq("course_id", courseId).eq("is_final_exam", true);
      }
      
      const { data, error } = await query.order("sort_order");
      if (error) throw error;
      return data as DbQuiz[];
    },
    enabled: !!(moduleId || courseId),
  });

  // Fetch quiz with questions
  const fetchQuizWithQuestions = async (quizId: string): Promise<QuizWithQuestions | null> => {
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError) throw quizError;

    const { data: questions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("sort_order");

    if (questionsError) throw questionsError;

    return {
      ...quiz,
      questions: (questions || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as unknown as string),
      })),
    } as QuizWithQuestions;
  };

  // Add quiz
  const addQuiz = useMutation({
    mutationFn: async (data: {
      title: string;
      passing_score?: number;
      time_limit_minutes?: number | null;
      per_question_seconds?: number | null;
      use_per_question_timer?: boolean;
      is_final_exam?: boolean;
    }) => {
      const insertData = {
        title: data.title,
        passing_score: data.passing_score ?? 80,
        time_limit_minutes: data.time_limit_minutes ?? null,
        per_question_seconds: data.per_question_seconds ?? 60,
        use_per_question_timer: data.use_per_question_timer ?? false,
        is_final_exam: moduleId ? false : true,
        sort_order: 0,
        module_id: moduleId || null,
        course_id: courseId || null,
      };

      const { data: result, error } = await supabase
        .from("quizzes")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Quiz created" });
    },
    onError: (error) => {
      toast({ title: "Failed to create quiz", description: error.message, variant: "destructive" });
    },
  });

  // Update quiz
  const updateQuiz = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbQuiz> & { id: string }) => {
      const { error } = await supabase
        .from("quizzes")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Quiz updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update quiz", description: error.message, variant: "destructive" });
    },
  });

  // Delete quiz
  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Quiz deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete quiz", description: error.message, variant: "destructive" });
    },
  });

  // Add question
  const addQuestion = useMutation({
    mutationFn: async (data: {
      quiz_id: string;
      question: string;
      options: string[];
      correct_answer: number;
      explanation?: string;
    }) => {
      // Get current max sort_order
      const { data: existing } = await supabase
        .from("quiz_questions")
        .select("sort_order")
        .eq("quiz_id", data.quiz_id)
        .order("sort_order", { ascending: false })
        .limit(1);

      const maxOrder = existing?.[0]?.sort_order ?? -1;

      const { data: result, error } = await supabase
        .from("quiz_questions")
        .insert({
          quiz_id: data.quiz_id,
          question: data.question,
          options: data.options,
          correct_answer: data.correct_answer,
          explanation: data.explanation || null,
          sort_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions", variables.quiz_id] });
      toast({ title: "Question added" });
    },
    onError: (error) => {
      toast({ title: "Failed to add question", description: error.message, variant: "destructive" });
    },
  });

  // Update question
  const updateQuestion = useMutation({
    mutationFn: async ({ id, quiz_id, ...updates }: Partial<DbQuizQuestion> & { id: string; quiz_id: string }) => {
      const { error } = await supabase
        .from("quiz_questions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      return quiz_id;
    },
    onSuccess: (quizId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions", quizId] });
      toast({ title: "Question updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update question", description: error.message, variant: "destructive" });
    },
  });

  // Delete question
  const deleteQuestion = useMutation({
    mutationFn: async ({ id, quiz_id }: { id: string; quiz_id: string }) => {
      const { error } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return quiz_id;
    },
    onSuccess: (quizId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions", quizId] });
      toast({ title: "Question deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete question", description: error.message, variant: "destructive" });
    },
  });

  // Reorder questions
  const reorderQuestions = useMutation({
    mutationFn: async ({ quiz_id, orderedIds }: { quiz_id: string; orderedIds: string[] }) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from("quiz_questions")
          .update({ sort_order: i })
          .eq("id", orderedIds[i]);
        if (error) throw error;
      }
      return quiz_id;
    },
    onSuccess: (quizId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions", quizId] });
    },
    onError: (error) => {
      toast({ title: "Failed to reorder questions", description: error.message, variant: "destructive" });
    },
  });

  // Add multiple questions at once (for AI generation)
  const addBulkQuestions = useMutation({
    mutationFn: async ({ quiz_id, questions }: {
      quiz_id: string;
      questions: Array<{
        question: string;
        options: string[];
        correct_answer: number;
        explanation?: string;
      }>;
    }) => {
      // Get current max sort_order
      const { data: existing } = await supabase
        .from("quiz_questions")
        .select("sort_order")
        .eq("quiz_id", quiz_id)
        .order("sort_order", { ascending: false })
        .limit(1);

      const startOrder = (existing?.[0]?.sort_order ?? -1) + 1;

      const insertData = questions.map((q, i) => ({
        quiz_id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        sort_order: startOrder + i,
      }));

      const { error } = await supabase
        .from("quiz_questions")
        .insert(insertData);

      if (error) throw error;
      return quiz_id;
    },
    onSuccess: (quizId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions", quizId] });
      toast({ title: "Questions added" });
    },
    onError: (error) => {
      toast({ title: "Failed to add questions", description: error.message, variant: "destructive" });
    },
  });

  return {
    quizzes,
    isLoading,
    fetchQuizWithQuestions,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    addBulkQuestions,
  };
}

// Separate hook for fetching questions of a specific quiz
export function useAdminQuizQuestions(quizId: string | undefined) {
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["admin-quiz-questions", quizId],
    queryFn: async () => {
      if (!quizId) return [];

      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("sort_order");

      if (error) throw error;
      return (data || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as unknown as string),
      })) as DbQuizQuestion[];
    },
    enabled: !!quizId,
  });

  return { questions, isLoading };
}
