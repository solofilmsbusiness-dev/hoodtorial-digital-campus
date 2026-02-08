import { useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageLayout, Section } from "@/components/layout";
import { 
  ProgressionModuleAccordion, 
  VideoPlayer, 
  DocumentViewer,
  LockedQuizCard, 
  QuizPlayer,
  ProgressionInfo,
  EnrollmentCard 
} from "@/components/course";
import { Badge } from "@/components/ui/badge";
import { getCourseByCode, getTotalLessonsCount, getTotalQuizzesCount, type Lesson, type Quiz, type Course, type Module } from "@/data/courses";
import { ArrowLeft, Clock, BookOpen, Award, CheckCircle2, X, Lock, Play, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { TrialBanner, SubscriptionGate } from "@/components/subscription";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { Progress } from "@/components/ui/progress";
import { useTestMode } from "@/hooks/useTestMode";
import { TestModeBanner } from "@/components/admin";
import { useQuizResults } from "@/hooks/useQuizResults";
import { supabase } from "@/integrations/supabase/client";
import { getVideoType, getYouTubeId, getVimeoId, getYouTubeEmbedUrl, getVimeoEmbedUrl } from "@/lib/videoUtils";

// Transform database course to Course interface
const transformDbCourse = (dbCourse: any): Course => {
  const modules: Module[] = (dbCourse.modules || [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((m: any) => ({
      id: m.id,
      title: m.title,
      lessons: (m.lessons || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((l: any): Lesson => ({
          id: l.id,
          title: l.title,
          type: l.type as "video" | "reading" | "practice",
          duration: l.duration || "",
          // Extended properties not in base interface but used by components
          ...(l.video_url && { video_url: l.video_url }),
          ...(l.content && { content: l.content }),
          ...(l.document_url && { document_url: l.document_url }),
        })),
      quiz: m.quizzes?.[0] ? {
        id: m.quizzes[0].id,
        title: m.quizzes[0].title,
        passingScore: m.quizzes[0].passing_score,
        questions: (m.quizzes[0].quiz_questions || []).length,
        timeLimitMinutes: m.quizzes[0].time_limit_minutes ?? undefined,
        perQuestionSeconds: m.quizzes[0].per_question_seconds ?? undefined,
        usePerQuestionTimer: m.quizzes[0].use_per_question_timer ?? true,
      } : undefined,
    }));

  // Check for final exam
  const finalExamData = dbCourse.quizzes?.find((q: any) => q.is_final_exam);
  const finalExam = finalExamData ? {
    id: finalExamData.id,
    title: finalExamData.title,
    passingScore: finalExamData.passing_score,
    questions: (finalExamData.quiz_questions || []).length,
    timeLimitMinutes: finalExamData.time_limit_minutes ?? undefined,
    perQuestionSeconds: finalExamData.per_question_seconds ?? undefined,
    usePerQuestionTimer: finalExamData.use_per_question_timer ?? true,
  } : undefined;

  return {
    code: dbCourse.code,
    title: dbCourse.title,
    description: dbCourse.description || "",
    department: dbCourse.department_id,
    departmentId: dbCourse.department_id,
    credits: dbCourse.credits,
    level: dbCourse.level as "Beginner" | "Intermediate" | "Advanced",
    duration: dbCourse.duration || "Self-paced",
    lessons: modules.reduce((acc, m) => acc + m.lessons.length, 0),
    modules,
    finalExam,
    intro_video_url: dbCourse.intro_video_url || null,
  };
};

const CourseDetail = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch course from database first
  const { data: dbCourse, isLoading: isLoadingCourse } = useQuery({
    queryKey: ["course-detail", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          modules (
            *,
            lessons (*),
            quizzes:quizzes!quizzes_module_id_fkey (
              *,
              quiz_questions (*)
            )
          ),
          quizzes:quizzes!quizzes_course_id_fkey (
            *,
            quiz_questions (*)
          )
        `)
        .eq("code", code || "")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!code,
  });

  // Fallback to static course if not in database
  const staticCourse = getCourseByCode(code || "");
  
  // Build the course from database, falling back to static for content
  const course = useMemo(() => {
    if (!dbCourse) return staticCourse;
    
    const transformed = transformDbCourse(dbCourse);
    
    // Prefer database content when it has modules (admin-edited content)
    if (transformed.modules && transformed.modules.length > 0) {
      return transformed;
    }
    
    // Fall back to static content if database has no modules
    if (staticCourse?.modules && staticCourse.modules.length > 0) {
      return {
        ...transformed,
        modules: staticCourse.modules,
        finalExam: staticCourse.finalExam,
        lessons: staticCourse.lessons,
        duration: staticCourse.duration || transformed.duration,
      };
    }
    
    return transformed;
  }, [dbCourse, staticCourse]);
  const { toast } = useToast();
  const { hasAccess, isTrialing, trialDaysRemaining } = useSubscription();
  const { isTestModeEnabled, shouldAutoPassQuiz } = useTestMode();
  const { instantPassQuiz } = useQuizResults();
  
  const [activeLesson, setActiveLesson] = useState<Lesson | undefined>(
    course?.modules[0]?.lessons[0]
  );
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  // Video progress tracking
  const videoProgress = useVideoProgress({
    courseCode: course?.code || "",
    lessonId: activeLesson?.id || "",
    onComplete: () => {
      toast({
        title: "Lesson Complete! 🎉",
        description: "You've watched enough of this video. Progress saved!",
      });
    },
  });

  // Enrollment state
  const { 
    isEnrolled, 
    getEnrollment, 
    enroll, 
    canEnroll, 
    slotsRemaining, 
    maxSlots,
    completeCourse 
  } = useEnrollments();

  // Progression state
  const {
    isContentUnlocked,
    isLessonCompleted,
    isQuizPassed,
    isQuizActuallyPassed,
    getQuizAttempts,
    canAttemptQuiz,
    getModuleProgress,
    markLessonComplete,
    getWatchPercentage,
  } = useLessonProgress(course);

  const enrollment = course ? getEnrollment(course.code) : undefined;
  // Test mode: treat as enrolled for all courses
  const enrolled = isTestModeEnabled || (course ? isEnrolled(course.code) : false);

  // Calculate overall course progress
  const courseProgress = useMemo(() => {
    if (!course) return { completedLessons: 0, completedQuizzes: 0, percent: 0 };

    let completedLessons = 0;
    let completedQuizzes = 0;
    
    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        if (isLessonCompleted(lesson.id)) completedLessons++;
      });
      if (module.quiz && isQuizPassed(module.quiz.id)) completedQuizzes++;
    });
    
    if (course.finalExam && isQuizPassed(course.finalExam.id)) completedQuizzes++;

    const totalLessons = getTotalLessonsCount(course);
    const totalQuizzes = getTotalQuizzesCount(course);
    const total = totalLessons + totalQuizzes;
    const completed = completedLessons + completedQuizzes;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completedLessons, completedQuizzes, percent };
  }, [course, isLessonCompleted, isQuizPassed]);

  // Auto-complete course when 100% progress is reached
  const checkAndCompleteCourse = useCallback(async () => {
    if (!enrolled || !course) return;
    
    // Calculate actual completion using real status (not test mode bypass)
    let completedLessons = 0;
    let completedQuizzes = 0;
    
    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        // Use isLessonCompleted - in test mode it returns true, but we check real quiz pass
        if (isLessonCompleted(lesson.id)) completedLessons++;
      });
      if (module.quiz && isQuizActuallyPassed(module.quiz.id)) completedQuizzes++;
    });
    
    if (course.finalExam && isQuizActuallyPassed(course.finalExam.id)) {
      completedQuizzes++;
    }

    const total = getTotalLessonsCount(course) + getTotalQuizzesCount(course);
    const completed = completedLessons + completedQuizzes;
    
    if (completed >= total && total > 0) {
      await completeCourse(course.code);
    }
  }, [course, enrolled, isLessonCompleted, isQuizActuallyPassed, completeCourse]);

  // Check if final exam is unlocked (all modules complete) - MUST be before early returns
  const isFinalExamUnlocked = useMemo(() => {
    if (!course?.finalExam) return false;
    return course.modules.every((module) => {
      const progress = getModuleProgress(module);
      return progress.percent === 100;
    });
  }, [course, getModuleProgress]);

  // Loading state
  if (isLoadingCourse) {
    return (
      <PageLayout>
        <Section className="pt-32">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading course...</p>
          </div>
        </Section>
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout>
        <Section className="pt-32">
          <div className="text-center">
            <h1 className="heading-2 text-foreground mb-4">Course Not Found</h1>
            <p className="text-muted-foreground mb-8">The course you're looking for doesn't exist.</p>
            <Link to="/academics" className="btn-brutal inline-flex">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Courses
            </Link>
          </div>
        </Section>
      </PageLayout>
    );
  }

  const levelColors = {
    Beginner: "bg-accent/20 text-accent border-accent/50",
    Intermediate: "bg-primary/20 text-primary border-primary/50",
    Advanced: "bg-neon-purple/20 text-neon-purple border-neon-purple/50",
  };

  const totalLessons = getTotalLessonsCount(course);
  const totalQuizzes = getTotalQuizzesCount(course);


  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to enroll in courses.",
        variant: "destructive",
      });
      return;
    }
    setEnrolling(true);
    const result = await enroll(course.code);
    setEnrolling(false);
    
    // Redirect to Student Center with highlight on success
    if (!result.error) {
      navigate(`/student?enrolled=${course.code}`);
    }
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    toast({
      title: passed ? "Quiz Passed! 🎉" : "Quiz Not Passed",
      description: passed
        ? `Great job! You scored ${score}%. Your progress has been saved.`
        : `You scored ${score}%. Review the material and try again.`,
      variant: passed ? "default" : "destructive",
    });
    
    // Check if course is now complete after quiz pass
    if (passed) {
      setTimeout(() => {
        checkAndCompleteCourse();
      }, 500);
    }
  };

  const handleQuizClick = (quiz: Quiz) => {
    if (enrolled && canAttemptQuiz(quiz.id)) {
      setActiveQuiz(quiz);
    }
  };

  const handleMarkComplete = async () => {
    if (!enrolled) {
      toast({
        title: "Enrollment Required",
        description: "Please enroll in this course to track your progress.",
        variant: "destructive",
      });
      return;
    }
    
    if (!activeLesson) return;

    // Test mode: allow instant completion
    if (isTestModeEnabled) {
      await markLessonComplete(course.code, activeLesson.id, 0);
      toast({
        title: "Lesson Completed (Test Mode)",
        description: "Progress saved instantly via test mode.",
      });
      // Check if course is now complete
      setTimeout(() => {
        checkAndCompleteCourse();
      }, 500);
      return;
    }

    // Video lessons can be completed at any time (no 90% requirement)

    // For non-video lessons (reading, practice), allow manual completion
    await markLessonComplete(course.code, activeLesson.id, 0);
    toast({
      title: "Lesson Completed!",
      description: "Your progress has been saved.",
    });
    
    // Check if course is now complete
    setTimeout(() => {
      checkAndCompleteCourse();
    }, 500);
  };

  // Test mode: instant quiz pass handler
  const handleInstantPassQuiz = async (quiz: Quiz) => {
    if (!shouldAutoPassQuiz || !course) return;
    
    const result = await instantPassQuiz(quiz.id, course.code, quiz.questions);
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to auto-pass quiz.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Quiz Passed (Test Mode)",
        description: `${quiz.title} marked as passed.`,
      });
      // Check if course is now complete
      setTimeout(() => {
        checkAndCompleteCourse();
      }, 500);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    // Find the lesson's module and index
    for (let mi = 0; mi < course.modules.length; mi++) {
      const module = course.modules[mi];
      const li = module.lessons.findIndex((l) => l.id === lesson.id);
      if (li !== -1) {
        if (enrolled && isContentUnlocked(mi, li, "lesson")) {
          setActiveLesson(lesson);
        } else if (!enrolled) {
          toast({
            title: "Enrollment Required",
            description: "Enroll in this course to access lessons.",
            variant: "destructive",
          });
        }
        return;
      }
    }
  };

  // isFinalExamUnlocked is now calculated before early returns (line ~211)

  return (
    <PageLayout>
      {/* Test Mode Banner */}
      <TestModeBanner className={isTrialing ? "top-12" : ""} />
      
      {/* Trial Banner */}
      {isTrialing && <TrialBanner />}

      {/* Quiz Modal Overlay */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
          <div className="container-wide py-8">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setActiveQuiz(null)}
                className="p-2 border-2 border-border hover:border-primary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close quiz"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="max-w-3xl mx-auto">
              <QuizPlayer
                quiz={activeQuiz}
                courseCode={course.code}
                onComplete={handleQuizComplete}
                onClose={() => setActiveQuiz(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <section className="relative pt-24 pb-8 bg-noise border-b-2 border-border">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="container-wide relative z-10">
          <Link
            to="/academics"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="tag-sticker">{course.code}</span>
                <Badge variant="outline" className={cn("border-2", levelColors[course.level])}>
                  {course.level}
                </Badge>
              </div>

              <h1 className="heading-2 text-foreground mb-4">{course.title}</h1>
              <p className="text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{totalLessons} Lessons</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border">
                  <CheckCircle2 className="w-4 h-4 text-neon-purple" />
                  <span className="text-sm font-medium">{totalQuizzes} Quizzes</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border">
                  <Award className="w-4 h-4 text-gold" />
                  <span className="text-sm font-medium">{course.credits} Credits</span>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="w-full lg:w-72 border-2 border-primary bg-card p-6">
              <div className="text-center mb-4">
                <div className="text-4xl font-black text-primary">{courseProgress.percent}%</div>
                <div className="text-sm text-muted-foreground mt-1">Complete</div>
              </div>
              <div className="h-2 bg-muted border border-border mb-4">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${courseProgress.percent}%` }}
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lessons</span>
                  <span className="font-bold text-foreground">
                    {courseProgress.completedLessons}/{totalLessons}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quizzes</span>
                  <span className="font-bold text-foreground">
                    {courseProgress.completedQuizzes}/{totalQuizzes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Video Section */}
      {course.intro_video_url && (
        <Section className="py-8 bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-4 text-foreground mb-4">Course Introduction</h2>
            {(() => {
              const url = course.intro_video_url!;
              const videoType = getVideoType(url);
              
              if (videoType === "youtube") {
                const videoId = getYouTubeId(url);
                if (!videoId) return null;
                return (
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-border">
                    <iframe
                      src={getYouTubeEmbedUrl(videoId)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }
              
              if (videoType === "vimeo") {
                const videoId = getVimeoId(url);
                if (!videoId) return null;
                return (
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-border">
                    <iframe
                      src={getVimeoEmbedUrl(videoId)}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }
              
              if (videoType === "direct") {
                return (
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-border">
                    <video src={url} controls className="w-full h-full" />
                  </div>
                );
              }
              
              return null;
            })()}
          </div>
        </Section>
      )}

      {/* Course Content */}
      <Section className="py-8">
        <SubscriptionGate>
          {enrolled ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Video Player Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progression info */}
                <ProgressionInfo isEnrolled={enrolled} />

              {activeLesson ? (
                <>
                  {/* Show DocumentViewer for reading lessons with document_url */}
                  {activeLesson.type === "reading" && (activeLesson as unknown as { document_url?: string }).document_url ? (
                    <DocumentViewer 
                      documentUrl={(activeLesson as unknown as { document_url: string }).document_url}
                      title={activeLesson.title}
                    />
                  ) : (
                    <VideoPlayer 
                      lesson={activeLesson} 
                      onProgress={videoProgress.updateProgress}
                      initialTime={videoProgress.getResumePosition()}
                      watchPercentage={videoProgress.watchPercentage}
                      isCompleted={videoProgress.isCompleted}
                    />
                  )}
                  <div className="border-2 border-border p-6 bg-card/50">
                    <h2 className="heading-4 text-foreground mb-2">{activeLesson.title}</h2>
                    <p className="text-muted-foreground text-sm">
                      {activeLesson.type === "video" 
                        ? "Watch 90% of the video to complete this lesson and unlock the next content."
                        : "Complete this lesson and move on to the next one to continue your progress."
                      }
                    </p>

                    {/* Progress indicator for video lessons */}
                    {activeLesson.type === "video" && (
                      <div className="mt-4 p-4 bg-muted/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Watch Progress</span>
                          <span className={cn(
                            "text-sm font-bold",
                            videoProgress.isCompleted ? "text-accent" : "text-primary"
                          )}>
                            {videoProgress.watchPercentage}%
                          </span>
                        </div>
                        <Progress value={videoProgress.watchPercentage} className="h-2" />
                        {videoProgress.isCompleted ? (
                          <p className="text-xs text-accent mt-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Lesson complete! You can proceed to the next content.
                          </p>
                        ) : null}
                      </div>
                    )}

                    <div className="flex gap-4 mt-6">
                      {/* Test Mode Quick Complete Button */}
                      {isTestModeEnabled && (
                        <button 
                          onClick={handleMarkComplete}
                          className="btn-brutal bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          <Zap className="mr-2 h-5 w-5" />
                          Quick Complete
                        </button>
                      )}

                      {!isTestModeEnabled && (
                        <button onClick={handleMarkComplete} className="btn-brutal">
                          Mark Complete
                          <CheckCircle2 className="ml-2 h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Course Modules Sidebar */}
            <div className="space-y-4">
              <h3 className="heading-4 text-foreground">Course Content</h3>

              <div className="space-y-3">
                {course.modules.map((module, index) => (
                  <ProgressionModuleAccordion
                    key={module.id}
                    module={module}
                    moduleIndex={index}
                    activeLesson={activeLesson}
                    onLessonSelect={handleLessonSelect}
                    onQuizClick={handleQuizClick}
                    isContentUnlocked={(mi, li, type) =>
                      enrolled ? isContentUnlocked(mi, li, type) : false
                    }
                    isLessonCompleted={isLessonCompleted}
                    isQuizPassed={isQuizPassed}
                    isQuizActuallyPassed={isQuizActuallyPassed}
                    getQuizAttempts={getQuizAttempts}
                    canAttemptQuiz={canAttemptQuiz}
                    moduleProgress={getModuleProgress(module)}
                    defaultOpen={index === 0}
                    getWatchPercentage={getWatchPercentage}
                  />
                ))}

                {course.finalExam && (
                  <div className="pt-4 border-t-2 border-border">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      Final Exam
                    </h4>
                    <LockedQuizCard
                      quiz={course.finalExam}
                      type="final"
                      isUnlocked={enrolled && isFinalExamUnlocked}
                      isPassed={isQuizActuallyPassed(course.finalExam.id)}
                      attemptCount={getQuizAttempts(course.finalExam.id)}
                      maxAttempts={3}
                      onClick={() => handleQuizClick(course.finalExam!)}
                    />
                    {/* Test Mode: Auto-pass final exam button */}
                    {isTestModeEnabled && shouldAutoPassQuiz && !isQuizActuallyPassed(course.finalExam.id) && (
                      <button
                        onClick={() => handleInstantPassQuiz(course.finalExam!)}
                        className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                        Auto-Pass Exam (Test Mode)
                      </button>
                    )}
                  </div>
                )}
                </div>
              </div>
            </div>
          ) : (
            /* Non-enrolled teaser view */
            <div className="max-w-2xl mx-auto">
              <EnrollmentCard
                course={course}
                isEnrolled={false}
                canEnroll={canEnroll && hasAccess}
                slotsRemaining={slotsRemaining}
                maxSlots={maxSlots}
                onEnroll={handleEnroll}
                isLoading={enrolling}
              />
              
              <div className="mt-8 p-8 border-2 border-dashed border-border text-center bg-card/50">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="heading-4 text-foreground mb-2">Course Content Locked</h3>
                <p className="text-muted-foreground mb-6">
                  Enroll in this course to access all lessons and quizzes.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    📚 {course.modules.length} Modules
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    🎬 {totalLessons} Lessons
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    ✅ {totalQuizzes} Quizzes
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </SubscriptionGate>
      </Section>
    </PageLayout>
  );
};

export default CourseDetail;
