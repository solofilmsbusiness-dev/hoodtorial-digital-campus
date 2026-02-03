import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw,
  AlertCircle,
  Loader2
} from "lucide-react";
import { getQuizQuestions, calculateScore, type QuizQuestion } from "@/data/quizQuestions";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useAuth } from "@/contexts/AuthContext";
import type { Quiz } from "@/data/courses";

interface QuizPlayerProps {
  quiz: Quiz;
  courseCode: string;
  onComplete?: (score: number, passed: boolean) => void;
  onClose?: () => void;
}

type QuizState = "intro" | "playing" | "review" | "results";

export function QuizPlayer({ quiz, courseCode, onComplete, onClose }: QuizPlayerProps) {
  const questions = getQuizQuestions(quiz.id);
  const { user } = useAuth();
  const { saveQuizResult } = useQuizResults();
  
  const [state, setState] = useState<QuizState>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const score = calculateScore(answers, questions);
  const passed = score >= quiz.passingScore;

  // Start timer when quiz begins
  useEffect(() => {
    if (state === "playing" && startTime === null) {
      setStartTime(Date.now());
    }
  }, [state, startTime]);

  const handleSelectAnswer = useCallback((optionIndex: number) => {
    if (state === "review") return;
    if (currentQuestion) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    }
  }, [currentQuestion, state]);

  const handleFinishQuiz = useCallback(async () => {
    setState("results");
    
    // Save to database if user is logged in
    if (user && startTime) {
      setIsSaving(true);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      
      // Pass questions and answers to saveQuizResult for detailed tracking
      await saveQuizResult(
        {
          quiz_id: quiz.id,
          course_code: courseCode,
          score,
          total_questions: questions.length,
          passed,
          time_taken_seconds: timeTaken,
        },
        questions,  // Pass the questions array
        answers     // Pass the user's answers
      );
      
      setIsSaving(false);
    }
    
    onComplete?.(score, passed);
  }, [user, startTime, quiz.id, courseCode, score, questions.length, passed, saveQuizResult, onComplete, questions, answers]);

  const handleNext = useCallback(() => {
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  }, [currentIndex, questions.length, handleFinishQuiz]);

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
    setIsSaving(false);
    setState("intro");
  }, []);

  const handleReviewAnswers = useCallback(() => {
    setCurrentIndex(0);
    setShowExplanation(true);
    setState("review");
  }, []);

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  // No questions available
  if (questions.length === 0) {
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

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="p-4 border border-border bg-muted/30">
              <div className="text-2xl font-black text-primary">{questions.length}</div>
              <div className="text-muted-foreground">Questions</div>
            </div>
            <div className="p-4 border border-border bg-muted/30">
              <div className="text-2xl font-black text-accent">{quiz.passingScore}%</div>
              <div className="text-muted-foreground">To Pass</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            {onClose && (
              <button onClick={onClose} className="px-6 py-3 border-2 border-border text-muted-foreground hover:border-primary hover:text-foreground transition-colors font-bold">
                Cancel
              </button>
            )}
            <button onClick={() => setState("playing")} className="btn-brutal">
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
            {score}%
          </div>
          <p className="text-muted-foreground mb-4">
            {Object.values(answers).filter((a, i) => a === questions[i]?.correctAnswer).length} of {questions.length} correct
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
          Question <span className="text-foreground font-bold">{currentIndex + 1}</span> of {questions.length}
        </div>
        {state === "review" && (
          <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 bg-neon-purple/20 text-neon-purple border border-neon-purple/50">
            Review Mode
          </span>
        )}
        <div className="text-sm text-muted-foreground">
          Answered: <span className="text-primary font-bold">{answeredCount}</span>/{questions.length}
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <h3 className="heading-4 text-foreground mb-6">{currentQuestion.question}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showResult = state === "review" || (showExplanation && isSelected);

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

        {/* Explanation */}
        {(showExplanation || state === "review") && currentQuestion.explanation && (
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

        {state === "playing" && selectedAnswer !== undefined && !showExplanation && (
          <button
            onClick={() => setShowExplanation(true)}
            className="px-4 py-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Check Answer
          </button>
        )}

        {state === "review" && currentIndex === questions.length - 1 ? (
          <button onClick={handleRestart} className="btn-brutal inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={state === "playing" && selectedAnswer === undefined}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-bold transition-colors",
              (state === "playing" && selectedAnswer === undefined)
                ? "text-muted-foreground/50 cursor-not-allowed" 
                : "btn-brutal"
            )}
          >
            {currentIndex === questions.length - 1 && state === "playing" ? "Finish" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
