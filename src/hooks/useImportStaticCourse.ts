import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses } from "@/data/courses";
import { quizQuestions } from "@/data/quizQuestions";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  modulesImported: number;
  lessonsImported: number;
  quizzesImported: number;
  questionsImported: number;
}

export function useImportStaticCourse(courseId: string, courseCode: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async (): Promise<ImportResult> => {
      // Find the static course by code
      const staticCourse = staticCourses.find(c => c.code === courseCode);
      if (!staticCourse) {
        throw new Error(`Static course not found: ${courseCode}`);
      }

      if (!staticCourse.modules || staticCourse.modules.length === 0) {
        throw new Error("No modules to import");
      }

      let modulesImported = 0;
      let lessonsImported = 0;
      let quizzesImported = 0;
      let questionsImported = 0;

      // Import each module
      for (let moduleIndex = 0; moduleIndex < staticCourse.modules.length; moduleIndex++) {
        const staticModule = staticCourse.modules[moduleIndex];

        // Insert module
        const { data: dbModule, error: moduleError } = await supabase
          .from("modules")
          .insert({
            course_id: courseId,
            title: staticModule.title,
            sort_order: moduleIndex,
          })
          .select()
          .single();

        if (moduleError) throw moduleError;
        modulesImported++;

        // Import lessons for this module
        for (let lessonIndex = 0; lessonIndex < staticModule.lessons.length; lessonIndex++) {
          const staticLesson = staticModule.lessons[lessonIndex];

          const { error: lessonError } = await supabase
            .from("lessons")
            .insert({
              module_id: dbModule.id,
              title: staticLesson.title,
              duration: staticLesson.duration,
              type: staticLesson.type,
              sort_order: lessonIndex,
            });

          if (lessonError) throw lessonError;
          lessonsImported++;
        }

        // Import quiz for this module if exists
        if (staticModule.quiz) {
          const staticQuiz = staticModule.quiz;

          const { data: dbQuiz, error: quizError } = await supabase
            .from("quizzes")
            .insert({
              module_id: dbModule.id,
              course_id: courseId,
              title: staticQuiz.title,
              passing_score: staticQuiz.passingScore,
              time_limit_minutes: staticQuiz.timeLimitMinutes ?? null,
              per_question_seconds: staticQuiz.perQuestionSeconds ?? 60,
              use_per_question_timer: staticQuiz.usePerQuestionTimer ?? true,
              is_final_exam: false,
              sort_order: 0,
            })
            .select()
            .single();

          if (quizError) throw quizError;
          quizzesImported++;

          // Import quiz questions from the question bank
          const staticQuestions = quizQuestions[staticQuiz.id] || [];
          for (let qIndex = 0; qIndex < staticQuestions.length; qIndex++) {
            const q = staticQuestions[qIndex];

            const { error: questionError } = await supabase
              .from("quiz_questions")
              .insert({
                quiz_id: dbQuiz.id,
                question: q.question,
                options: q.options,
                correct_answer: q.correctAnswer,
                explanation: q.explanation ?? null,
                sort_order: qIndex,
              });

            if (questionError) throw questionError;
            questionsImported++;
          }
        }
      }

      // Import final exam if exists
      if (staticCourse.finalExam) {
        const staticFinal = staticCourse.finalExam;

        const { data: dbFinalQuiz, error: finalQuizError } = await supabase
          .from("quizzes")
          .insert({
            course_id: courseId,
            module_id: null,
            title: staticFinal.title,
            passing_score: staticFinal.passingScore,
            time_limit_minutes: staticFinal.timeLimitMinutes ?? null,
            per_question_seconds: staticFinal.perQuestionSeconds ?? 60,
            use_per_question_timer: staticFinal.usePerQuestionTimer ?? true,
            is_final_exam: true,
            sort_order: 999,
          })
          .select()
          .single();

        if (finalQuizError) throw finalQuizError;
        quizzesImported++;

        // Import final exam questions
        const finalQuestions = quizQuestions[staticFinal.id] || [];
        for (let qIndex = 0; qIndex < finalQuestions.length; qIndex++) {
          const q = finalQuestions[qIndex];

          const { error: questionError } = await supabase
            .from("quiz_questions")
            .insert({
              quiz_id: dbFinalQuiz.id,
              question: q.question,
              options: q.options,
              correct_answer: q.correctAnswer,
              explanation: q.explanation ?? null,
              sort_order: qIndex,
            });

          if (questionError) throw questionError;
          questionsImported++;
        }
      }

      return { modulesImported, lessonsImported, quizzesImported, questionsImported };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      queryClient.invalidateQueries({ queryKey: ["admin-module-quizzes"] });
      toast({
        title: "Content imported successfully",
        description: `Imported ${result.modulesImported} modules, ${result.lessonsImported} lessons, ${result.quizzesImported} quizzes, and ${result.questionsImported} questions.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  // Check if static content exists for this course
  const staticCourse = staticCourses.find(c => c.code === courseCode);
  const hasStaticContent = staticCourse && staticCourse.modules && staticCourse.modules.length > 0;

  return {
    importContent: importMutation.mutate,
    isImporting: importMutation.isPending,
    hasStaticContent,
    staticModuleCount: staticCourse?.modules?.length ?? 0,
  };
}
