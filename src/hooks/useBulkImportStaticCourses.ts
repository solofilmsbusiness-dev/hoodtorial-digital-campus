import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses } from "@/data/courses";
import { quizQuestions } from "@/data/quizQuestions";
import { useToast } from "@/hooks/use-toast";

interface CourseImportResult {
  courseCode: string;
  courseTitle: string;
  modulesImported: number;
  lessonsImported: number;
  quizzesImported: number;
  questionsImported: number;
}

interface BulkImportProgress {
  current: number;
  total: number;
  currentCourse: string | null;
}

interface DbCourse {
  id: string;
  code: string;
  title: string;
}

export function useBulkImportStaticCourses(dbCourses: DbCourse[] | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [progress, setProgress] = useState<BulkImportProgress>({
    current: 0,
    total: 0,
    currentCourse: null,
  });

  // Find static courses that have content and match DB courses without modules
  const getCoursesNeedingImport = async () => {
    if (!dbCourses || dbCourses.length === 0) return [];

    const coursesNeedingImport: { dbCourse: DbCourse; staticCourse: typeof staticCourses[0] }[] = [];

    for (const staticCourse of staticCourses) {
      // Must have modules to import
      if (!staticCourse.modules || staticCourse.modules.length === 0) continue;

      // Find matching DB course
      const dbCourse = dbCourses.find(c => c.code === staticCourse.code);
      if (!dbCourse) continue;

      // Check if already has modules in DB
      const { count } = await supabase
        .from("modules")
        .select("*", { count: "exact", head: true })
        .eq("course_id", dbCourse.id);

      if (count === 0) {
        coursesNeedingImport.push({ dbCourse, staticCourse });
      }
    }

    return coursesNeedingImport;
  };

  const importCourseContent = async (
    courseId: string,
    staticCourse: typeof staticCourses[0]
  ): Promise<CourseImportResult> => {
    let modulesImported = 0;
    let lessonsImported = 0;
    let quizzesImported = 0;
    let questionsImported = 0;

    if (!staticCourse.modules) {
      return {
        courseCode: staticCourse.code,
        courseTitle: staticCourse.title,
        modulesImported: 0,
        lessonsImported: 0,
        quizzesImported: 0,
        questionsImported: 0,
      };
    }

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

    return {
      courseCode: staticCourse.code,
      courseTitle: staticCourse.title,
      modulesImported,
      lessonsImported,
      quizzesImported,
      questionsImported,
    };
  };

  const bulkImportMutation = useMutation({
    mutationFn: async (): Promise<CourseImportResult[]> => {
      const coursesToImport = await getCoursesNeedingImport();
      
      if (coursesToImport.length === 0) {
        throw new Error("No courses need importing");
      }

      setProgress({ current: 0, total: coursesToImport.length, currentCourse: null });

      const results: CourseImportResult[] = [];

      for (let i = 0; i < coursesToImport.length; i++) {
        const { dbCourse, staticCourse } = coursesToImport[i];
        
        setProgress({
          current: i + 1,
          total: coursesToImport.length,
          currentCourse: `${staticCourse.code}: ${staticCourse.title}`,
        });

        const result = await importCourseContent(dbCourse.id, staticCourse);
        results.push(result);
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules"] });
      
      const totalModules = results.reduce((sum, r) => sum + r.modulesImported, 0);
      const totalLessons = results.reduce((sum, r) => sum + r.lessonsImported, 0);
      const totalQuizzes = results.reduce((sum, r) => sum + r.quizzesImported, 0);
      const totalQuestions = results.reduce((sum, r) => sum + r.questionsImported, 0);

      toast({
        title: `Successfully imported ${results.length} courses`,
        description: `${totalModules} modules, ${totalLessons} lessons, ${totalQuizzes} quizzes, ${totalQuestions} questions`,
      });

      setProgress({ current: 0, total: 0, currentCourse: null });
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setProgress({ current: 0, total: 0, currentCourse: null });
    },
  });

  // Count courses that need import (synchronous estimate based on static data)
  const staticCoursesWithContent = staticCourses.filter(
    c => c.modules && c.modules.length > 0
  );

  return {
    bulkImport: bulkImportMutation.mutate,
    isImporting: bulkImportMutation.isPending,
    progress,
    staticCoursesCount: staticCoursesWithContent.length,
  };
}
