import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout";
import { InterestCard, ExperienceCard, ResultsChart, ScoreComparison } from "@/components/assessment";
import {
  assessmentQuestions,
  departmentInfo,
  experienceLevels,
  type AssessmentQuestion,
} from "@/data/quizzes/assessment";
import { useAssessmentResults } from "@/hooks/useAssessmentResults";
import { courses } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Step = "welcome" | "interests" | "experience" | "quiz" | "results";

export default function Assessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveAssessmentResult, latestResult, hasCompletedAssessment, loading: resultsLoading } = useAssessmentResults();

  const [step, setStep] = useState<Step>("welcome");
  const [interests, setInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const [finalResults, setFinalResults] = useState<{
    departmentScores: Record<string, number>;
    totalScore: number;
    recommendedCourses: string[];
  } | null>(null);

  // Filter questions based on selected interests (5-6 per department)
  const quizQuestions = useMemo(() => {
    const questionsPerDepartment: Record<string, AssessmentQuestion[]> = {};

    assessmentQuestions.forEach((q) => {
      if (interests.includes(q.department)) {
        if (!questionsPerDepartment[q.department]) {
          questionsPerDepartment[q.department] = [];
        }
        questionsPerDepartment[q.department].push(q);
      }
    });

    // Take 5-6 questions per selected interest
    const selected: AssessmentQuestion[] = [];
    Object.values(questionsPerDepartment).forEach((deptQuestions) => {
      const shuffled = [...deptQuestions].sort(() => Math.random() - 0.5);
      selected.push(...shuffled.slice(0, 6));
    });

    return selected.sort(() => Math.random() - 0.5);
  }, [interests]);

  // Timer for quiz
  useEffect(() => {
    if (step === "quiz" && startTime > 0) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, startTime]);

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
    const question = quizQuestions[currentQuestionIndex];
    setAnswers((prev) => ({ ...prev, [question.id]: answerIndex }));

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }, 300);
  };

  const calculateResults = () => {
    const departmentScores: Record<string, { correct: number; total: number }> = {};

    quizQuestions.forEach((q) => {
      if (!departmentScores[q.department]) {
        departmentScores[q.department] = { correct: 0, total: 0 };
      }
      departmentScores[q.department].total++;
      if (answers[q.id] === q.correctAnswer) {
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

    setFinalResults({
      departmentScores,
      totalScore,
      recommendedCourses: data?.recommended_courses || [],
    });
    setStep("results");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  const onboardingSteps = [
    { label: "Assessment", active: true },
    { label: "Explore Courses", active: false },
  ];

  return (
    <PageLayout>
      <div className="container max-w-4xl py-8 md:py-12">
        {/* Onboarding Progress Indicator */}
        <div className="mb-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Getting Started</span>
            <span className="text-xs text-muted-foreground">Step 1 of 2</span>
          </div>
          <div className="flex items-center gap-2">
            {onboardingSteps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      s.active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      s.active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < onboardingSteps.length - 1 && (
                  <div className="h-0.5 flex-1 bg-muted" />
                )}
              </div>
            ))}
          </div>
        </div>

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
                        Quick knowledge check across your interests
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

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("interests")}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={() => {
                  setStep("quiz");
                  setStartTime(Date.now());
                }}
                disabled={!canProceedFromExperience}
              >
                Start Quiz
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Quiz Step */}
        {step === "quiz" && quizQuestions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formatTime(elapsedTime)}
              </div>
            </div>

            <Progress
              value={((currentQuestionIndex + 1) / quizQuestions.length) * 100}
              className="h-2"
            />

            <Card>
              <CardHeader>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  {departmentInfo[quizQuestions[currentQuestionIndex].department as keyof typeof departmentInfo]?.name}
                </div>
                <CardTitle className="text-xl">
                  {quizQuestions[currentQuestionIndex].question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all",
                      answers[quizQuestions[currentQuestionIndex].id] === index
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    )}
                  >
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

              {currentQuestionIndex === quizQuestions.length - 1 ? (
                <Button
                  onClick={handleFinishQuiz}
                  disabled={Object.keys(answers).length < quizQuestions.length || saving}
                >
                  {saving ? "Saving..." : "Finish Assessment"}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  disabled={!answers[quizQuestions[currentQuestionIndex].id]}
                >
                  Next
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
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
              {elapsedTime > 0 && (
                <p className="text-sm text-muted-foreground">
                  Completed in {formatTime(elapsedTime)}
                </p>
              )}
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
                <CardContent>
                  <ResultsChart scores={finalResults.departmentScores} />
                </CardContent>
              </Card>
            )}

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
      </div>
    </PageLayout>
  );
}
