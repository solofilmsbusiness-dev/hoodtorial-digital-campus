import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { PageLayout, Section } from "@/components/layout";
import { 
  ProgressionModuleAccordion, 
  VideoPlayer, 
  LockedQuizCard, 
  QuizPlayer,
  ProgressionInfo,
  EnrollmentCard 
} from "@/components/course";
import { Badge } from "@/components/ui/badge";
import { getCourseByCode, getTotalLessonsCount, getTotalQuizzesCount, type Lesson, type Quiz } from "@/data/courses";
import { ArrowLeft, Clock, BookOpen, Award, CheckCircle2, X, Lock, Play, Zap } from "lucide-react";
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

const CourseDetail = () => {
  const { code } = useParams<{ code: string }>();
  const course = getCourseByCode(code || "");
  const { user } = useAuth();
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
    maxSlots 
  } = useEnrollments();

  // Progression state
  const {
    isContentUnlocked,
    isLessonCompleted,
    isQuizPassed,
    getQuizAttempts,
    canAttemptQuiz,
    getModuleProgress,
    markLessonComplete,
    getWatchPercentage,
  } = useLessonProgress(course);

  const enrollment = course ? getEnrollment(course.code) : undefined;
  const enrolled = course ? isEnrolled(course.code) : false;

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
    await enroll(course.code);
    setEnrolling(false);
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    toast({
      title: passed ? "Quiz Passed! 🎉" : "Quiz Not Passed",
      description: passed
        ? `Great job! You scored ${score}%. Your progress has been saved.`
        : `You scored ${score}%. Review the material and try again.`,
      variant: passed ? "default" : "destructive",
    });
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
      return;
    }

    // For video lessons, require 90% watch
    if (activeLesson.type === "video") {
      if (videoProgress.watchPercentage < 90 && !videoProgress.isCompleted) {
        toast({
          title: "Watch More Video",
          description: `Watch at least 90% of the video to complete this lesson. Currently: ${videoProgress.watchPercentage}%`,
          variant: "destructive",
        });
        return;
      }
    }

    // For non-video lessons (reading, practice), allow manual completion
    await markLessonComplete(course.code, activeLesson.id, 0);
    toast({
      title: "Lesson Completed!",
      description: "Your progress has been saved.",
    });
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

  // Check if final exam is unlocked (all modules complete)
  const isFinalExamUnlocked = useMemo(() => {
    if (!course.finalExam) return false;
    return course.modules.every((module) => {
      const progress = getModuleProgress(module);
      return progress.percent === 100;
    });
  }, [course, getModuleProgress]);

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

      {/* Course Content */}
      <Section className="py-8">
        <SubscriptionGate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enrollment Card for non-enrolled users */}
              {!enrolled && (
                <EnrollmentCard
                  course={course}
                  isEnrolled={false}
                  canEnroll={canEnroll && hasAccess}
                  slotsRemaining={slotsRemaining}
                  maxSlots={maxSlots}
                  onEnroll={handleEnroll}
                  isLoading={enrolling}
                />
              )}

              {/* Progression info */}
              <ProgressionInfo isEnrolled={enrolled} />

            {activeLesson && enrolled ? (
              <>
                <VideoPlayer 
                  lesson={activeLesson} 
                  onProgress={videoProgress.updateProgress}
                  initialTime={videoProgress.getResumePosition()}
                  watchPercentage={videoProgress.watchPercentage}
                  isCompleted={videoProgress.isCompleted}
                />
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
                      ) : (
                        <p className="text-xs text-muted-foreground mt-2">
                          Watch at least 90% to complete this lesson
                        </p>
                      )}
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

                    {!isTestModeEnabled && activeLesson.type === "video" ? (
                      <button 
                        onClick={handleMarkComplete} 
                        disabled={!videoProgress.isCompleted && videoProgress.watchPercentage < 90}
                        className={cn(
                          "btn-brutal",
                          (!videoProgress.isCompleted && videoProgress.watchPercentage < 90) && 
                          "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {videoProgress.isCompleted || videoProgress.watchPercentage >= 90 ? (
                          <>
                            Complete Lesson
                            <CheckCircle2 className="ml-2 h-5 w-5" />
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-5 w-5" />
                            Watch Video ({videoProgress.watchPercentage}%)
                          </>
                        )}
                      </button>
                    ) : !isTestModeEnabled ? (
                      <button onClick={handleMarkComplete} className="btn-brutal">
                        Mark Complete
                        <CheckCircle2 className="ml-2 h-5 w-5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </>
            ) : !enrolled ? (
              <div className="border-2 border-border p-12 bg-card/50 text-center">
                <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="heading-4 text-foreground mb-2">Enroll to Access Content</h3>
                <p className="text-muted-foreground mb-6">
                  Enroll in this course to watch lessons and track your progress.
                </p>
              </div>
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
                    isPassed={isQuizPassed(course.finalExam.id)}
                    attemptCount={getQuizAttempts(course.finalExam.id)}
                    maxAttempts={3}
                    onClick={() => handleQuizClick(course.finalExam!)}
                  />
                  {/* Test Mode: Auto-pass final exam button */}
                  {isTestModeEnabled && shouldAutoPassQuiz && !isQuizPassed(course.finalExam.id) && (
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
        </SubscriptionGate>
      </Section>
    </PageLayout>
  );
};

export default CourseDetail;
