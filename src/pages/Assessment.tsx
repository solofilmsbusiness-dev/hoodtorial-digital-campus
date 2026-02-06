import { useState, useEffect, useMemo, useCallback } from "react";
 import { useNavigate, useSearchParams } from "react-router-dom";
 import { ArrowLeft, ArrowRight, Clock, Trophy, AlertTriangle, Shuffle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout";
import { 
  InterestCard, 
  ExperienceCard, 
  ResultsChart, 
  ScoreComparison, 
  RoadmapDisplay,
  AnswerReview,
  DifficultyBreakdown,
 DegreeRecommendation,
 OnboardingProgress,
} from "@/components/assessment";
import {
  assessmentQuestions,
  departmentInfo,
  experienceLevels,
  type AssessmentQuestion,
} from "@/data/quizzes/assessment";
import { useAssessmentResults, type LearningRoadmap } from "@/hooks/useAssessmentResults";
import { courses } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
 import { useProfileContext } from "@/contexts/ProfileContext";
import { cn } from "@/lib/utils";
import { 
  shuffleArray, 
  shuffleQuestionOptions, 
  getDefaultTimeLimit,
  formatTimeRemaining,
  type ShuffledQuestion 
} from "@/lib/quizUtils";

 type Step = "welcome" | "interests" | "experience" | "quiz" | "results" | "degree-recommendation" | "review" | "expired";
 
 import type { DegreePath } from "@/hooks/useSkillTree";

// Extend ShuffledQuestion for assessment (includes department and difficulty)
interface ShuffledAssessmentQuestion extends ShuffledQuestion {
  department: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  explanation?: string;
}

export default function Assessment() {
  const navigate = useNavigate();
   const [searchParams] = useSearchParams();
  const { user } = useAuth();
   const { profile, updateProfile, refetch } = useProfileContext();
  const { saveAssessmentResult, latestResult, latestRoadmap, hasCompletedAssessment, calculateRoadmap, loading: resultsLoading } = useAssessmentResults();

  const [step, setStep] = useState<Step>("welcome");
   
  // Detect and fix corrupted profile state (degree_path set without assessment)
  useEffect(() => {
    if (!resultsLoading && !hasCompletedAssessment && profile?.degree_path) {
      console.warn("Detected corrupted profile state: degree_path set without assessment");
      updateProfile({
        degree_path: null,
        certificate_department: null,
        recommended_degree_path: null,
      });
    }
  }, [resultsLoading, hasCompletedAssessment, profile?.degree_path, updateProfile]);

   // Check for query param to jump to degree recommendation
   useEffect(() => {
     const stepParam = searchParams.get("step");
     if (stepParam === "degree-recommendation" && hasCompletedAssessment && latestResult && latestRoadmap) {
       setFinalResults({
         departmentScores: latestResult.department_scores as Record<string, number>,
         totalScore: latestResult.total_score,
         recommendedCourses: latestResult.recommended_courses,
         roadmap: latestRoadmap,
       });
       setInterests(latestResult.interests);
       setExperienceLevel(latestResult.experience_level);
       setStep("degree-recommendation");
     }
   }, [searchParams, hasCompletedAssessment, latestResult, latestRoadmap]);
  const [interests, setInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledAssessmentQuestion[]>([]);
  
  // Per-question timer state
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(60);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const PER_QUESTION_SECONDS = 60;
  
  // Review mode state
  const [completedQuestions, setCompletedQuestions] = useState<ShuffledAssessmentQuestion[]>([]);
  const [completedAnswers, setCompletedAnswers] = useState<Record<string, number>>({});
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);
   
   // Saving degree path state
   const [savingDegreePath, setSavingDegreePath] = useState(false);
  
  const [finalResults, setFinalResults] = useState<{
    departmentScores: Record<string, number>;
    totalScore: number;
    recommendedCourses: string[];
    roadmap: LearningRoadmap | null;
  } | null>(null);

  // Adaptive question selection: 2 beginner, 3 intermediate, 1 advanced per department
  const baseQuestions = useMemo(() => {
    const selected: AssessmentQuestion[] = [];

    interests.forEach((dept) => {
      const deptQuestions = assessmentQuestions.filter((q) => q.department === dept);
      
      // Group by difficulty
      const beginner = shuffleArray(deptQuestions.filter((q) => q.difficulty === "beginner"));
      const intermediate = shuffleArray(deptQuestions.filter((q) => q.difficulty === "intermediate"));
      const advanced = shuffleArray(deptQuestions.filter((q) => q.difficulty === "advanced"));

      // Progressive selection: 2 easy, 3 medium, 1 hard = 6 questions per department
      selected.push(...beginner.slice(0, 2));
      selected.push(...intermediate.slice(0, 3));
      selected.push(...advanced.slice(0, 1));
    });

    return selected;
  }, [interests]);

  // Total time tracking for results (still track elapsed time for stats)
  const totalTimeLimitSeconds = useMemo(() => {
    // Each question has 60 seconds
    return baseQuestions.length * PER_QUESTION_SECONDS;
  }, [baseQuestions.length]);

  // Initialize shuffled questions when starting quiz
  const initializeQuiz = useCallback(() => {
    // Shuffle question order
    const shuffledOrder = shuffleArray(baseQuestions);
    
    // Shuffle options for each question
    const randomized: ShuffledAssessmentQuestion[] = shuffledOrder.map(q => {
      const shuffled = shuffleQuestionOptions({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      });
      return {
        ...shuffled,
        department: q.department,
        difficulty: q.difficulty,
        explanation: q.explanation,
      };
    });
    
    setShuffledQuestions(randomized);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setQuestionTimeRemaining(PER_QUESTION_SECONDS);
    setStep("quiz");
  }, [baseQuestions]);

  // Reset timer when question changes
  useEffect(() => {
    if (step === "quiz") {
      setQuestionStartTime(Date.now());
      setQuestionTimeRemaining(PER_QUESTION_SECONDS);
    }
  }, [step, currentQuestionIndex]);

  // Handle per-question time expired
  const handleQuestionTimeExpired = useCallback(() => {
    // If on last question, finish the quiz
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
      handleFinishQuiz();
    } else {
      // Auto-advance to next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, shuffledQuestions.length]);

  // Per-question countdown timer
  useEffect(() => {
    if (step !== "quiz" || questionStartTime === 0) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      const remaining = Math.max(0, PER_QUESTION_SECONDS - elapsed);
      setQuestionTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        handleQuestionTimeExpired();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [step, questionStartTime, currentQuestionIndex, handleQuestionTimeExpired]);


  const handleInterestToggle = (id: string) => {
    setInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const question = shuffledQuestions[currentQuestionIndex];
    setAnswers((prev) => ({ ...prev, [question.id]: answerIndex }));

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }, 300);
  };

  const calculateResults = () => {
    const departmentScores: Record<string, { correct: number; total: number }> = {};

    shuffledQuestions.forEach((q) => {
      if (!departmentScores[q.department]) {
        departmentScores[q.department] = { correct: 0, total: 0 };
      }
      departmentScores[q.department].total++;
      // Use shuffledCorrectAnswer for comparison
      if (answers[q.id] === q.shuffledCorrectAnswer) {
        departmentScores[q.department].correct++;
      }
    });

    const percentageScores: Record<string, number> = {};
    let totalCorrect = 0;
    let totalQuestions = 0;

    Object.entries(departmentScores).forEach(([dept, { correct, total }]) => {
      percentageScores[dept] = Math.round((correct / total) * 100);
      totalCorrect += correct;
      totalQuestions += total;
    });

    const totalScore = Math.round((totalCorrect / totalQuestions) * 100);

    return { departmentScores: percentageScores, totalScore };
  };

  const handleFinishQuiz = async () => {
    const { departmentScores, totalScore } = calculateResults();
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);

    // Store questions and answers for review mode
    setCompletedQuestions([...shuffledQuestions]);
    setCompletedAnswers({ ...answers });

    setSaving(true);

    const { data, error } = await saveAssessmentResult({
      interests,
      experience_level: experienceLevel,
      department_scores: departmentScores,
      total_score: totalScore,
      time_taken_seconds: elapsedTime,
    });

    setSaving(false);

    if (error) {
      console.error("Failed to save assessment:", error);
    }

    const roadmap = calculateRoadmap(departmentScores, interests, experienceLevel);
    setFinalResults({
      departmentScores,
      totalScore,
      recommendedCourses: data?.recommended_courses || [],
      roadmap,
    });
    setStep("results");
  };
  
  // Handle entering review mode
  const handleReviewAnswers = () => {
    setReviewIndex(0);
    setShowOnlyIncorrect(false);
    setStep("review");
  };
 
   // Handle degree path selection
   const handleSelectDegreePath = async (path: DegreePath, department?: string) => {
     setSavingDegreePath(true);
     
     try {
       // Get the primary strength from results
       const primaryStrength = finalResults?.roadmap?.primaryStrength || interests[0];
       
       const { error } = await updateProfile({
         degree_path: path,
         certificate_department: path === "certificate" ? (department || primaryStrength) : null,
         recommended_degree_path: path,
         onboarding_completed: true,
       });
       
       if (!error) {
         // Refetch to ensure context is synced before navigation
         await refetch();
         // Navigate to skill tree view (correct route)
         navigate(`/skill-tree/${path}`);
       }
     } catch (error) {
       console.error("Failed to save degree path:", error);
     } finally {
       setSavingDegreePath(false);
     }
   };
 
   const handleSkipDegreeSelection = async () => {
     // Mark onboarding as completed even if they skip
     const { error } = await updateProfile({
       onboarding_completed: true,
     });
     if (!error) {
       await refetch();
     }
     navigate("/academics");
   };
 
   // Calculate current onboarding step index
   const getOnboardingStepIndex = () => {
     if (step === "degree-recommendation") return 1;
     return 0; // Assessment step
   };
 
  const isTimeWarning = questionTimeRemaining > 0 && questionTimeRemaining <= 10; // 10 seconds warning

  const recommendedCourseDetails = useMemo(() => {
    if (!finalResults?.recommendedCourses) return [];
    return finalResults.recommendedCourses
      .map((code) => courses.find((c) => c.code === code))
      .filter(Boolean);
  }, [finalResults]);

  const canProceedFromInterests = interests.length >= 2;
  const canProceedFromExperience = experienceLevel !== "";

  if (!user) {
    return (
      <PageLayout>
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Entry Assessment</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to take the assessment and get personalized course recommendations.
          </p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </PageLayout>
    );
  }

  // Show loading while checking assessment status to prevent race conditions
  // This prevents showing the wrong step while data is being fetched
  const stepParam = searchParams.get("step");
  if (resultsLoading && stepParam === "degree-recommendation") {
    return (
      <PageLayout>
        <div className="container max-w-4xl py-16 text-center">
          <div className="animate-pulse text-primary font-bold text-xl">
            Loading your assessment data...
          </div>
        </div>
      </PageLayout>
    );
  }

   // Onboarding step configuration
   const currentOnboardingStepIndex = step === "degree-recommendation" ? 1 : 0;
   const onboardingStepsConfig = [
     { id: "assessment", label: "Assessment", completed: step === "results" || step === "degree-recommendation" },
     { id: "degree", label: "Choose Your Path", completed: !!profile?.onboarding_completed },
   ];

  return (
    <PageLayout>
      <div className="container max-w-4xl py-8 md:py-12">
        {/* Onboarding Progress Indicator */}
         <OnboardingProgress
           steps={onboardingStepsConfig}
           currentStepIndex={currentOnboardingStepIndex}
           className="mb-8"
         />

        {/* Welcome Step */}
        {step === "welcome" && (
          <div className="text-center space-y-8">
            {/* Returning User Skip Option */}
            {hasCompletedAssessment && !isRetaking && latestResult && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Trophy className="w-6 h-6" />
                    <span className="font-semibold">You've already completed an assessment!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your last score was <span className="font-bold text-foreground">{latestResult.total_score}%</span>. 
                    You can view your previous results or retake the assessment for updated recommendations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="default"
                      onClick={() => {
                        setFinalResults({
                          departmentScores: latestResult.department_scores as Record<string, number>,
                          totalScore: latestResult.total_score,
                          recommendedCourses: latestResult.recommended_courses,
                          roadmap: latestRoadmap,
                        });
                        setStep("results");
                      }}
                    >
                      View My Results
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsRetaking(true)}
                    >
                      Retake Assessment
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/academics")}
                    >
                      Skip to Courses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {(!hasCompletedAssessment || isRetaking) && (
              <>
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold">
                    {isRetaking ? "Retake Your Assessment" : "Welcome to Your Assessment"}
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {isRetaking 
                      ? "Start fresh to update your course recommendations based on your current knowledge."
                      : "This quick assessment will help us understand your current knowledge and interests. Based on your results, we'll recommend the perfect courses to start your filmmaking journey."
                    }
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 py-8">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">1</span>
                      </div>
                      <h3 className="font-semibold mb-2">Choose Interests</h3>
                      <p className="text-sm text-muted-foreground">
                        Select 2-3 areas you want to focus on
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">2</span>
                      </div>
                      <h3 className="font-semibold mb-2">Answer Questions</h3>
                      <p className="text-sm text-muted-foreground">
                        Timed knowledge check across your interests
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">3</span>
                      </div>
                      <h3 className="font-semibold mb-2">Get Recommendations</h3>
                      <p className="text-sm text-muted-foreground">
                        Personalized course path based on your results
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => setStep("interests")} className="px-8">
                    {isRetaking ? "Start Fresh" : "Start Assessment"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  {isRetaking && (
                    <Button size="lg" variant="ghost" onClick={() => setIsRetaking(false)}>
                      <ArrowLeft className="mr-2 w-5 h-5" />
                      Go Back
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Interest Selection Step */}
        {step === "interests" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">What interests you most?</h2>
              <p className="text-muted-foreground">
                Select 2-3 areas you'd like to focus on ({interests.length}/3 selected)
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(departmentInfo).map(([id, info]) => (
                <InterestCard
                  key={id}
                  id={id}
                  name={info.name}
                  tagline={info.tagline}
                  icon={info.icon}
                  selected={interests.includes(id)}
                  disabled={interests.length >= 3}
                  onToggle={handleInterestToggle}
                />
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("welcome")}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep("experience")}
                disabled={!canProceedFromInterests}
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Experience Level Step */}
        {step === "experience" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">What's your experience level?</h2>
              <p className="text-muted-foreground">
                This helps us calibrate your recommendations
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {experienceLevels.map((level) => (
                <ExperienceCard
                  key={level.id}
                  id={level.id}
                  title={level.title}
                  description={level.description}
                  icon={level.icon}
                  selected={experienceLevel === level.id}
                  onSelect={setExperienceLevel}
                />
              ))}
            </div>

            {/* Assessment info */}
            <Card className="max-w-2xl mx-auto border-accent/50 bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-accent mb-3">
                  <Shuffle className="w-5 h-5" />
                  <span className="font-semibold">Assessment Info</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    60 seconds per question
                  </li>
                  <li>• Questions and answers are randomized for fairness</li>
                  <li>• Questions auto-advance when time expires</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("interests")}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={initializeQuiz}
                disabled={!canProceedFromExperience}
              >
                Start Quiz
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Quiz Step */}
        {step === "quiz" && shuffledQuestions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
              </div>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 text-sm font-bold transition-colors rounded",
                isTimeWarning 
                  ? "text-destructive bg-destructive/10 border border-destructive/50 animate-pulse" 
                  : "text-muted-foreground"
              )}>
                {isTimeWarning && <AlertTriangle className="w-4 h-4" />}
                <Clock className="w-4 h-4" />
                {formatTimeRemaining(questionTimeRemaining)}
              </div>
            </div>

            {/* Per-question timer progress bar */}
            <Progress
              value={(questionTimeRemaining / PER_QUESTION_SECONDS) * 100}
              className={cn(
                "h-1 mb-2",
                isTimeWarning && "bg-destructive/20 [&>div]:bg-destructive"
              )}
            />

            <Progress
              value={((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}
              className="h-2"
            />

            <Card>
              <CardHeader>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  {departmentInfo[shuffledQuestions[currentQuestionIndex].department as keyof typeof departmentInfo]?.name}
                </div>
                <CardTitle className="text-xl">
                  {shuffledQuestions[currentQuestionIndex].question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shuffledQuestions[currentQuestionIndex].shuffledOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all",
                      answers[shuffledQuestions[currentQuestionIndex].id] === index
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    )}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() =>
                  currentQuestionIndex > 0
                    ? setCurrentQuestionIndex((prev) => prev - 1)
                    : setStep("experience")
                }
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                {currentQuestionIndex === 0 ? "Back to Experience" : "Previous"}
              </Button>

              {currentQuestionIndex === shuffledQuestions.length - 1 ? (
                <Button
                  onClick={handleFinishQuiz}
                  disabled={Object.keys(answers).length < shuffledQuestions.length || saving}
                >
                  {saving ? "Saving..." : "Finish Assessment"}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  disabled={answers[shuffledQuestions[currentQuestionIndex].id] === undefined}
                >
                  Next
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Time Expired Step */}
        {step === "expired" && finalResults && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-3xl font-bold">Time's Up!</h2>
              <p className="text-lg text-muted-foreground">
                Your assessment has been automatically submitted.
              </p>
              <p className="text-lg text-muted-foreground">
                Your score: <span className="text-primary font-bold">{finalResults.totalScore}%</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {Object.keys(answers).length} of {shuffledQuestions.length} questions answered
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Strengths by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsChart scores={finalResults.departmentScores} />
              </CardContent>
            </Card>

            {finalResults.roadmap && <RoadmapDisplay roadmap={finalResults.roadmap} />}

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Recommended Courses for You</h3>
              <div className="grid gap-4">
                {recommendedCourseDetails.map((course) => (
                  <Card key={course!.code} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">{course!.code}</div>
                        <h4 className="font-semibold">{course!.title}</h4>
                        <p className="text-sm text-muted-foreground">{course!.department} • {course!.level}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/course/${course!.code}`)}
                      >
                        View Course
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(recommendedCourseDetails[0] ? `/course/${recommendedCourseDetails[0].code}` : "/academics")}
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/student")}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Results Step */}
        {step === "results" && finalResults && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">
                {isRetaking ? "Retake Complete!" : "Assessment Complete!"}
              </h2>
              <p className="text-lg text-muted-foreground">
                Your overall readiness score: <span className="text-primary font-bold">{finalResults.totalScore}%</span>
              </p>
            </div>

            {/* Show comparison if this was a retake */}
            {isRetaking && latestResult && (
              <ScoreComparison
                previousScores={latestResult.department_scores as Record<string, number>}
                currentScores={finalResults.departmentScores}
                previousTotal={latestResult.total_score}
                currentTotal={finalResults.totalScore}
              />
            )}

            {/* Standard results chart when not comparing */}
            {!isRetaking && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Strengths by Department</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <ResultsChart scores={finalResults.departmentScores} />
                  
                  {/* Difficulty Breakdown */}
                  {completedQuestions.length > 0 && (
                    <DifficultyBreakdown
                      questions={completedQuestions}
                      answers={completedAnswers}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Learning Progress Indicator */}
            {finalResults.roadmap && <RoadmapDisplay roadmap={finalResults.roadmap} />}

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Recommended Courses for You</h3>
              <div className="grid gap-4">
                {recommendedCourseDetails.map((course) => (
                  <Card key={course!.code} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">{course!.code}</div>
                        <h4 className="font-semibold">{course!.title}</h4>
                        <p className="text-sm text-muted-foreground">{course!.department} • {course!.level}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/course/${course!.code}`)}
                      >
                        View Course
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                 onClick={() => setStep("degree-recommendation")}
              >
                 Choose Your Degree Path
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              {completedQuestions.length > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReviewAnswers}
                >
                  <BookOpen className="mr-2 w-5 h-5" />
                  Review Your Answers
                </Button>
              )}
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate("/student")}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === "review" && completedQuestions.length > 0 && (
          <AnswerReview
            questions={completedQuestions}
            answers={completedAnswers}
            currentIndex={reviewIndex}
            showOnlyIncorrect={showOnlyIncorrect}
            onIndexChange={setReviewIndex}
            onToggleIncorrect={setShowOnlyIncorrect}
            onBackToResults={() => setStep("results")}
          />
        )}
 
         {/* Degree Recommendation Step */}
         {step === "degree-recommendation" && finalResults && finalResults.roadmap && (
           <DegreeRecommendation
             totalScore={finalResults.totalScore}
             experienceLevel={experienceLevel || latestResult?.experience_level || "beginner"}
             primaryStrength={finalResults.roadmap.primaryStrength}
             strengthScore={finalResults.departmentScores[finalResults.roadmap.primaryStrength] || 0}
             interests={interests.length > 0 ? interests : (latestResult?.interests || [])}
             onSelectPath={handleSelectDegreePath}
             onSkip={handleSkipDegreeSelection}
           />
         )}
      </div>
    </PageLayout>
  );
}
