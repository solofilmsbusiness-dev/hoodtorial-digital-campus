import { memo } from "react";
import { ArrowLeft, ArrowRight, Check, X, BookOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { departmentInfo, type AssessmentQuestion } from "@/data/quizzes/assessment";

interface ShuffledAssessmentQuestion {
  id: string;
  question: string;
  shuffledOptions: string[];
  shuffledCorrectAnswer: number;
  originalOptions: string[];
  originalCorrectAnswer: number;
  department: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  explanation?: string;
}

interface AnswerReviewProps {
  questions: ShuffledAssessmentQuestion[];
  answers: Record<string, number>;
  currentIndex: number;
  showOnlyIncorrect: boolean;
  onIndexChange: (index: number) => void;
  onToggleIncorrect: (value: boolean) => void;
  onBackToResults: () => void;
}

export const AnswerReview = memo(function AnswerReview({
  questions,
  answers,
  currentIndex,
  showOnlyIncorrect,
  onIndexChange,
  onToggleIncorrect,
  onBackToResults,
}: AnswerReviewProps) {
  // Filter questions based on toggle
  const filteredQuestions = showOnlyIncorrect
    ? questions.filter((q) => answers[q.id] !== q.shuffledCorrectAnswer)
    : questions;

  const currentQuestion = filteredQuestions[currentIndex];
  const totalFiltered = filteredQuestions.length;
  const incorrectCount = questions.filter((q) => answers[q.id] !== q.shuffledCorrectAnswer).length;

  if (!currentQuestion) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">All Correct!</h3>
          <p className="text-muted-foreground mb-4">
            You answered all questions correctly. Great job!
          </p>
          <Button onClick={onBackToResults}>Back to Results</Button>
        </CardContent>
      </Card>
    );
  }

  const userAnswer = answers[currentQuestion.id];
  const isCorrect = userAnswer === currentQuestion.shuffledCorrectAnswer;
  const departmentName =
    departmentInfo[currentQuestion.department as keyof typeof departmentInfo]?.name ||
    currentQuestion.department;

  const difficultyColors = {
    beginner: "bg-green-500/10 text-green-600 border-green-500/30",
    intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    advanced: "bg-red-500/10 text-red-600 border-red-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="text-lg font-semibold">
          Review: Question {currentIndex + 1} of {totalFiltered}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="only-incorrect"
              checked={showOnlyIncorrect}
              onCheckedChange={(checked) => {
                onToggleIncorrect(checked);
                onIndexChange(0);
              }}
            />
            <Label htmlFor="only-incorrect" className="flex items-center gap-1 cursor-pointer">
              <Filter className="w-4 h-4" />
              Only Incorrect ({incorrectCount})
            </Label>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="secondary" className="uppercase text-xs">
              {departmentName}
            </Badge>
            {currentQuestion.difficulty && (
              <Badge
                variant="outline"
                className={cn("capitalize text-xs", difficultyColors[currentQuestion.difficulty])}
              >
                {currentQuestion.difficulty}
              </Badge>
            )}
            <Badge
              variant={isCorrect ? "default" : "destructive"}
              className="ml-auto"
            >
              {isCorrect ? "Correct" : "Incorrect"}
            </Badge>
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.shuffledOptions.map((option, index) => {
            const isUserAnswer = userAnswer === index;
            const isCorrectAnswer = currentQuestion.shuffledCorrectAnswer === index;

            let optionStyle = "border-border bg-background";
            let icon = null;

            if (isCorrectAnswer) {
              optionStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
              icon = <Check className="w-5 h-5 text-green-500 shrink-0" />;
            } else if (isUserAnswer && !isCorrectAnswer) {
              optionStyle = "border-destructive bg-destructive/10 text-destructive";
              icon = <X className="w-5 h-5 text-destructive shrink-0" />;
            }

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                  optionStyle
                )}
              >
                <span className="font-bold shrink-0">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1">{option}</span>
                {icon}
                {isCorrectAnswer && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 shrink-0">
                    CORRECT
                  </span>
                )}
                {isUserAnswer && !isCorrectAnswer && (
                  <span className="text-xs font-medium text-destructive shrink-0">YOUR ANSWER</span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Explanation */}
      {currentQuestion.explanation && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-primary mb-3">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">Explanation</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Previous
        </Button>

        <Button variant="outline" onClick={onBackToResults}>
          Back to Results
        </Button>

        <Button
          variant="ghost"
          onClick={() => onIndexChange(currentIndex + 1)}
          disabled={currentIndex >= totalFiltered - 1}
        >
          Next
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      {/* Question dots for quick navigation */}
      <div className="flex flex-wrap justify-center gap-2 pt-4">
        {filteredQuestions.map((q, idx) => {
          const isAnswerCorrect = answers[q.id] === q.shuffledCorrectAnswer;
          return (
            <button
              key={q.id}
              onClick={() => onIndexChange(idx)}
              className={cn(
                "w-8 h-8 rounded-full text-xs font-bold transition-all",
                idx === currentIndex
                  ? "ring-2 ring-primary ring-offset-2"
                  : "",
                isAnswerCorrect
                  ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                  : "bg-destructive/20 text-destructive hover:bg-destructive/30"
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
});
