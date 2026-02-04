import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw,
  AlertCircle,
  Loader2,
  Clock,
  AlertTriangle,
  Shuffle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getQuizQuestions, type QuizQuestion } from "@/data/quizQuestions";
import { 
  getRandomizedQuiz, 
  calculateShuffledScore,
  calculateCorrectCount,
  getGradingData,
  getDefaultTimeLimit,
  formatTimeRemaining,
  getPerQuestionTime,
  type ShuffledQuestion 
} from "@/lib/quizUtils";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { Quiz } from "@/data/courses";

interface QuizPlayerProps {
  quiz: Quiz;
  courseCode: string;
  onComplete?: (score: number, passed: boolean) => void;
  onClose?: () => void;
}

type QuizState = "intro" | "playing" | "review" | "results" | "expired";

export function QuizPlayer({ quiz, courseCode, onComplete, onClose }: QuizPlayerProps) {
  const { user } = useAuth();
  const { saveQuizResult } = useQuizResults();

  // Fetch questions from database first, fall back to static if none found
  const { data: dbQuestions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["quiz-questions", quiz.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quiz.id)
        .order("sort_order");
      
      if (error) throw error;
      
      // Transform to QuizQuestion format
      return (data || []).map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options as string[] : JSON.parse(q.options as string) as string[],
        correctAnswer: q.correct_answer,
        explanation: q.explanation || undefined,
      })) as QuizQuestion[];
    },
  });

  // Use database questions if available, otherwise fall back to static
  const staticQuestions = getQuizQuestions(quiz.id);
  const originalQuestions = dbQuestions.length > 0 ? dbQuestions : staticQuestions;
  
  const [state, setState] = useState<QuizState>("intro");
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Per-question timer state
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [questionRemainingTime, setQuestionRemainingTime] = useState<number>(0);
  const isAutoAdvancing = useRef(false);

  // Timer mode configuration - ALWAYS use per-question mode with 60 seconds
  const usePerQuestionMode = true;
  const perQuestionTime = 60; // Fixed 60 seconds per question

  // Calculate time limit for global mode (from quiz or default 1 min per question)
  const timeLimitSeconds = useMemo(() => {
    const minutes = quiz.timeLimitMinutes ?? getDefaultTimeLimit(originalQuestions.length);
    return minutes * 60;
  }, [quiz.timeLimitMinutes, originalQuestions.length]);

  const currentQuestion = shuffledQuestions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  // Raw correct count for database storage
  const correctCount = useMemo(() => 
    shuffledQuestions.filter(q => answers[q.id] === q.shuffledCorrectAnswer).length,
    [answers, shuffledQuestions]
  );
  // Score as percentage for display and pass/fail logic
  const scorePercent = useMemo(() => 
    shuffledQuestions.length > 0 ? Math.round((correctCount / shuffledQuestions.length) * 100) : 0,
    [correctCount, shuffledQuestions.length]
  );
  const passed = scorePercent >= quiz.passingScore;
  
  // Time warnings
  const isTimeWarning = usePerQuestionMode 
    ? questionRemainingTime > 0 && questionRemainingTime <= 10
    : remainingTime > 0 && remainingTime <= 120;

  // Initialize shuffled questions when quiz starts
  const handleStartQuiz = useCallback(() => {
    const randomized = getRandomizedQuiz(originalQuestions);
    setShuffledQuestions(randomized);
    setAnswers({});
    setCurrentIndex(0);
    setShowExplanation(false);
    setStartTime(Date.now());
    setRemainingTime(timeLimitSeconds);
    
    // Initialize per-question timer (always enabled with 60 seconds)
    setQuestionStartTime(Date.now());
    setQuestionRemainingTime(60);
    
    setState("playing");
  }, [originalQuestions, timeLimitSeconds, usePerQuestionMode, perQuestionTime]);

  // Handle finishing the quiz
  const handleFinishQuiz = useCallback(async () => {
    setState("results");
    
    // Save to database if user is logged in
    if (user && startTime) {
      setIsSaving(true);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const gradingData = getGradingData(answers, shuffledQuestions);
      
      // Convert shuffled questions back to original for saving
      const originalQuestionsForSave = shuffledQuestions.map(sq => ({
        id: sq.id,
        question: sq.question,
        options: sq.originalOptions,
        correctAnswer: sq.originalCorrectAnswer,
        explanation: sq.explanation,
      }));
      
      // Convert shuffled answers to original indices
      const originalAnswers: Record<string, number> = {};
      gradingData.forEach(gd => {
        if (gd.selectedAnswer >= 0) {
          originalAnswers[gd.questionId] = gd.selectedAnswer;
        }
      });
      
      await saveQuizResult(
        {
          quiz_id: quiz.id,
          course_code: courseCode,
          score: correctCount, // Store raw correct count, not percentage
          total_questions: shuffledQuestions.length,
          passed,
          time_taken_seconds: timeTaken,
        },
        originalQuestionsForSave as QuizQuestion[],
        originalAnswers
      );
      
      setIsSaving(false);
    }
    
    onComplete?.(scorePercent, passed);
  }, [user, startTime, quiz.id, courseCode, correctCount, shuffledQuestions, passed, saveQuizResult, onComplete, answers, scorePercent]);

  // Handle question timeout (per-question mode)
  const handleQuestionTimeout = useCallback(() => {
    if (isAutoAdvancing.current) return;
    isAutoAdvancing.current = true;
    
    // Mark as skipped if no answer selected
    if (currentQuestion && answers[currentQuestion.id] === undefined) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: -1 }));
    }
    
    // Auto-advance to next question or finish
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      setQuestionRemainingTime(60);
    } else {
      handleFinishQuiz();
    }
    
    setTimeout(() => {
      isAutoAdvancing.current = false;
    }, 100);
  }, [currentQuestion, currentIndex, shuffledQuestions.length, perQuestionTime, answers, handleFinishQuiz]);

  // Handle global time expired
  const handleTimeExpired = useCallback(async () => {
    setState("expired");
    
    // Save with current answers
    if (user && startTime) {
      setIsSaving(true);
      const timeTaken = timeLimitSeconds;
      const gradingData = getGradingData(answers, shuffledQuestions);
      // Calculate raw correct count for database storage
      const finalCorrectCount = calculateCorrectCount(answers, shuffledQuestions);
      const finalScorePercent = shuffledQuestions.length > 0 
        ? Math.round((finalCorrectCount / shuffledQuestions.length) * 100) 
        : 0;
      const didPass = finalScorePercent >= quiz.passingScore;
      
      // Convert shuffled questions back to original for saving
      const originalQuestionsForSave = shuffledQuestions.map(sq => ({
        id: sq.id,
        question: sq.question,
        options: sq.originalOptions,
        correctAnswer: sq.originalCorrectAnswer,
        explanation: sq.explanation,
      }));
      
      // Convert shuffled answers to original indices
      const originalAnswers: Record<string, number> = {};
      gradingData.forEach(gd => {
        if (gd.selectedAnswer >= 0) {
          originalAnswers[gd.questionId] = gd.selectedAnswer;
        }
      });
      
      await saveQuizResult(
        {
          quiz_id: quiz.id,
          course_code: courseCode,
          score: finalCorrectCount, // Store raw count, not percentage
          total_questions: shuffledQuestions.length,
          passed: didPass,
          time_taken_seconds: timeTaken,
        },
        originalQuestionsForSave as QuizQuestion[],
        originalAnswers
      );
      
      setIsSaving(false);
      onComplete?.(finalScorePercent, didPass);
    }
  }, [user, startTime, timeLimitSeconds, answers, shuffledQuestions, quiz, courseCode, saveQuizResult, onComplete]);

  // Per-question countdown timer
  useEffect(() => {
    if (state !== "playing" || !questionStartTime || !usePerQuestionMode) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      const remaining = Math.max(0, perQuestionTime - elapsed);
      setQuestionRemainingTime(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        handleQuestionTimeout();
      }
    }, 100); // Update more frequently for smoother countdown
    
    return () => clearInterval(interval);
  }, [state, questionStartTime, perQuestionTime, usePerQuestionMode, handleQuestionTimeout]);

  // Global countdown timer (when not using per-question mode)
  useEffect(() => {
    if (state !== "playing" || !startTime || usePerQuestionMode) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, timeLimitSeconds - elapsed);
      setRemainingTime(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        handleTimeExpired();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state, startTime, timeLimitSeconds, usePerQuestionMode, handleTimeExpired]);

  const handleSelectAnswer = useCallback((optionIndex: number) => {
    if (state === "review") return;
    if (currentQuestion) {
      // Set the answer
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
      
      // Auto-advance to next question after a brief delay (no going back)
      setTimeout(() => {
        if (currentIndex < shuffledQuestions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          // Reset per-question timer for next question
          setQuestionStartTime(Date.now());
          setQuestionRemainingTime(60); // Always 60 seconds per question
        } else {
          // Last question - finish the quiz
          handleFinishQuiz();
        }
      }, 300); // Short delay so user sees their selection
    }
  }, [currentQuestion, state, currentIndex, shuffledQuestions.length, handleFinishQuiz]);

  const handleNext = useCallback(() => {
    setShowExplanation(false);
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Reset per-question timer
      if (usePerQuestionMode) {
        setQuestionStartTime(Date.now());
        setQuestionRemainingTime(perQuestionTime);
      }
    } else {
      handleFinishQuiz();
    }
  }, [currentIndex, shuffledQuestions.length, handleFinishQuiz, usePerQuestionMode, perQuestionTime]);

  // handlePrev is only used in review mode now
  const handlePrev = useCallback(() => {
    setShowExplanation(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setShowExplanation(false);
    setStartTime(null);
    setRemainingTime(0);
    setQuestionStartTime(null);
    setQuestionRemainingTime(0);
    setIsSaving(false);
    setShuffledQuestions([]);
    setState("intro");
  }, []);

  const handleReviewAnswers = useCallback(() => {
    setCurrentIndex(0);
    setShowExplanation(true);
    setState("review");
  }, []);

  const answeredCount = Object.keys(answers).filter(k => answers[k] !== -1).length;
  const progress = shuffledQuestions.length > 0 ? (answeredCount / shuffledQuestions.length) * 100 : 0;
  const timeLimitDisplay = quiz.timeLimitMinutes ?? getDefaultTimeLimit(originalQuestions.length);


  // Calculate progress ring offset for per-question timer
  const progressRingOffset = useMemo(() => {
    const circumference = 2 * Math.PI * 16; // radius = 16
    const progress = questionRemainingTime / 60;
    return circumference * (1 - progress);
  }, [questionRemainingTime]);

  // Loading state while fetching questions from database
  if (isLoadingQuestions) {
    return (
      <div className="border-2 border-border bg-card p-8">
        <div className="text-center max-w-md mx-auto">
          <Skeleton className="w-16 h-16 mx-auto mb-6" />
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-12 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  // No questions available
  if (originalQuestions.length === 0) {
    return (
      <div className="border-2 border-border bg-card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="heading-4 text-foreground mb-2">Quiz Not Available</h3>
        <p className="text-muted-foreground mb-6">Questions for this quiz are coming soon.</p>
        <button onClick={onClose} className="btn-brutal">
          Go Back
        </button>
      </div>
    );
  }

  // Time Expired screen
  if (state === "expired") {
    const expiredScore = calculateShuffledScore(answers, shuffledQuestions);
    const expiredPassed = expiredScore >= quiz.passingScore;
    
    return (
      <div className="border-2 border-border bg-card p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 border-4 bg-destructive/20 border-destructive">
            <Clock className="w-10 h-10 text-destructive" />
          </div>

          <h2 className="heading-2 text-foreground mb-2">TIME'S UP!</h2>
          <p className="text-muted-foreground mb-8">
            Your quiz has been automatically submitted.
          </p>

          <div className={cn(
            "text-7xl font-black mb-2",
            expiredPassed ? "text-accent text-glow" : "text-destructive"
          )}>
            {expiredScore}%
          </div>
          <p className="text-muted-foreground mb-4">
            {shuffledQuestions.filter(q => answers[q.id] === q.shuffledCorrectAnswer).length} of {shuffledQuestions.length} correct
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {answeredCount} of {shuffledQuestions.length} questions answered
          </p>

          {isSaving && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving your progress...
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <button onClick={handleReviewAnswers} className="px-6 py-3 border-2 border-border text-muted-foreground hover:border-primary hover:text-foreground transition-colors font-bold">
              Review Answers
            </button>
            <button onClick={handleRestart} className="btn-brutal inline-flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Intro screen
  if (state === "intro") {
    return (
      <div className="border-2 border-border bg-card p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h2 className="heading-3 text-foreground mb-2">{quiz.title}</h2>
          <p className="text-muted-foreground mb-8">
            Test your knowledge with {quiz.questions} questions. 
            You need {quiz.passingScore}% to pass.
          </p>

          {!user && (
            <div className="mb-6 p-4 border border-primary/50 bg-primary/5 text-sm">
              <p className="text-muted-foreground">
                <span className="text-primary font-bold">Note:</span> Log in to save your progress and track your quiz results.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
            <div className="p-4 border border-border bg-muted/30">
              <div className="text-2xl font-black text-primary">{originalQuestions.length}</div>
              <div className="text-muted-foreground">Questions</div>
            </div>
            <div className="p-4 border border-border bg-muted/30">
              <div className="text-2xl font-black text-accent">{quiz.passingScore}%</div>
              <div className="text-muted-foreground">To Pass</div>
            </div>
            <div className="p-4 border border-border bg-muted/30">
              <div className="text-2xl font-black text-neon-purple">60</div>
              <div className="text-muted-foreground">Sec/Q</div>
            </div>
          </div>

          {/* Timer mode notice */}
          <div className="mb-6 p-4 border border-destructive/50 bg-destructive/5 text-sm">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-bold">60-Second Timer Per Question</span>
            </div>
            <p className="text-muted-foreground text-left">
              Each question has a 60-second time limit. When time expires, the question is marked as incorrect and you move to the next one automatically.
            </p>
          </div>

          {/* Anti-cheat notice */}
          <div className="mb-8 p-4 border border-accent/50 bg-accent/5 text-sm">
            <div className="flex items-center gap-2 text-accent mb-2">
              <Shuffle className="w-4 h-4" />
              <span className="font-bold">No Going Back</span>
            </div>
            <p className="text-muted-foreground text-left">
              Once you answer a question, you cannot go back. Questions and answer options are randomized for each attempt.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            {onClose && (
              <button onClick={onClose} className="px-6 py-3 border-2 border-border text-muted-foreground hover:border-primary hover:text-foreground transition-colors font-bold">
                Cancel
              </button>
            )}
            <button onClick={handleStartQuiz} className="btn-brutal">
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (state === "results") {
    return (
      <div className="border-2 border-border bg-card p-8">
        <div className="text-center max-w-md mx-auto">
          <div className={cn(
            "w-20 h-20 flex items-center justify-center mx-auto mb-6 border-4",
            passed 
              ? "bg-accent/20 border-accent" 
              : "bg-destructive/20 border-destructive"
          )}>
            {passed ? (
              <Trophy className="w-10 h-10 text-accent" />
            ) : (
              <XCircle className="w-10 h-10 text-destructive" />
            )}
          </div>

          <h2 className="heading-2 text-foreground mb-2">
            {passed ? "CONGRATULATIONS!" : "KEEP PRACTICING"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {passed 
              ? "You've demonstrated your understanding of this material."
              : `You need ${quiz.passingScore}% to pass. Review the material and try again.`
            }
          </p>

          <div className={cn(
            "text-7xl font-black mb-2",
            passed ? "text-accent text-glow" : "text-destructive"
          )}>
            {scorePercent}%
          </div>
          <p className="text-muted-foreground mb-4">
            {correctCount} of {shuffledQuestions.length} correct
          </p>

          {isSaving && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving your progress...
            </div>
          )}

          {user && !isSaving && passed && (
            <p className="text-sm text-accent mb-4">
              ✓ Your result has been saved
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <button onClick={handleReviewAnswers} className="px-6 py-3 border-2 border-border text-muted-foreground hover:border-primary hover:text-foreground transition-colors font-bold">
              Review Answers
            </button>
            <button onClick={handleRestart} className="btn-brutal inline-flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question screen (playing or review)
  return (
    <div className="border-2 border-border bg-card">
      {/* Progress bar */}
      <div className="h-2 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="text-sm text-muted-foreground">
          Question <span className="text-foreground font-bold">{currentIndex + 1}</span> of {shuffledQuestions.length}
        </div>
        
        {state === "review" ? (
          <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 bg-neon-purple/20 text-neon-purple border border-neon-purple/50">
            Review Mode
          </span>
        ) : (
          // Per-question timer with circular progress
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="24"
                  cy="24"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-muted"
                />
                {/* Progress circle */}
                <circle
                  cx="24"
                  cy="24"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 16}
                  strokeDashoffset={progressRingOffset}
                  strokeLinecap="round"
                  className={cn(
                    "transition-all duration-100",
                    isTimeWarning ? "text-destructive" : "text-primary"
                  )}
                />
              </svg>
              <span className={cn(
                "absolute inset-0 flex items-center justify-center text-sm font-black",
                isTimeWarning ? "text-destructive animate-pulse" : "text-foreground"
              )}>
                {questionRemainingTime}
              </span>
            </div>
            {isTimeWarning && (
              <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
            )}
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          Answered: <span className="text-primary font-bold">{answeredCount}</span>/{shuffledQuestions.length}
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <h3 className="heading-4 text-foreground mb-6">{currentQuestion?.question}</h3>

        <div className="space-y-3">
          {currentQuestion?.shuffledOptions.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.shuffledCorrectAnswer;
            const showResult = state === "review";

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={state === "review"}
                className={cn(
                  "w-full flex items-center gap-4 p-4 text-left transition-all duration-200 border-2",
                  state === "review" ? "cursor-default" : "cursor-pointer",
                  isSelected && !showResult && "border-primary bg-primary/10",
                  !isSelected && !showResult && "border-border hover:border-primary/50 bg-card/50",
                  showResult && isCorrect && "border-accent bg-accent/10",
                  showResult && isSelected && !isCorrect && "border-destructive bg-destructive/10"
                )}
              >
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center shrink-0 border-2 font-bold",
                  isSelected && !showResult && "border-primary bg-primary text-primary-foreground",
                  !isSelected && !showResult && "border-border bg-muted text-muted-foreground",
                  showResult && isCorrect && "border-accent bg-accent text-accent-foreground",
                  showResult && isSelected && !isCorrect && "border-destructive bg-destructive text-destructive-foreground"
                )}>
                  {showResult ? (
                    isCorrect ? <CheckCircle2 className="w-4 h-4" /> : isSelected ? <XCircle className="w-4 h-4" /> : String.fromCharCode(65 + index)
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>
                <span className={cn(
                  "flex-1",
                  isSelected && "text-foreground font-medium",
                  !isSelected && "text-muted-foreground",
                  showResult && isCorrect && "text-accent font-medium",
                  showResult && isSelected && !isCorrect && "text-destructive"
                )}>
                  {option}
                </span>
                {showResult && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation - only show in review mode */}
        {state === "review" && currentQuestion?.explanation && (
          <div className="mt-6 p-4 border border-accent/50 bg-accent/5 animate-fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-accent mb-1">Explanation</div>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
        {/* Previous button - only shown in review mode */}
        {state === "review" ? (
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-bold transition-colors",
              currentIndex === 0 
                ? "text-muted-foreground/50 cursor-not-allowed" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
        ) : (
          // Empty placeholder to maintain layout during playing
          <div className="px-4 py-2">
            <span className="text-xs text-muted-foreground/50">No going back</span>
          </div>
        )}

        {/* Skip button during playing (when no answer selected) */}
        {state === "playing" && selectedAnswer === undefined && (
          <button
            onClick={handleNext}
            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground border border-border hover:border-primary transition-colors"
          >
            Skip Question
          </button>
        )}

        {/* Next/Finish/Retake button */}
        {state === "review" && currentIndex === shuffledQuestions.length - 1 ? (
          <button onClick={handleRestart} className="btn-brutal inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
        ) : state === "review" ? (
          <button
            onClick={handleNext}
            className="btn-brutal flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
