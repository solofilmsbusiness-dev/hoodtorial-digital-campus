import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { DbQuiz } from "@/hooks/useAdminQuizContent";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: DbQuiz | null;
  onSave: (data: {
    title: string;
    passing_score: number;
    time_limit_minutes: number | null;
    per_question_seconds: number | null;
    use_per_question_timer: boolean;
  }) => void;
  isPending?: boolean;
}

export function QuizDialog({
  open,
  onOpenChange,
  quiz,
  onSave,
  isPending,
}: QuizDialogProps) {
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(80);
  const [timeLimit, setTimeLimit] = useState<string>("");
  const [usePerQuestionTimer, setUsePerQuestionTimer] = useState(false);
  const [perQuestionSeconds, setPerQuestionSeconds] = useState<string>("60");

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setPassingScore(quiz.passing_score);
      setTimeLimit(quiz.time_limit_minutes?.toString() || "");
      setUsePerQuestionTimer(quiz.use_per_question_timer);
      setPerQuestionSeconds(quiz.per_question_seconds?.toString() || "60");
    } else {
      setTitle("");
      setPassingScore(80);
      setTimeLimit("");
      setUsePerQuestionTimer(false);
      setPerQuestionSeconds("60");
    }
  }, [quiz, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      passing_score: passingScore,
      time_limit_minutes: timeLimit ? parseInt(timeLimit, 10) : null,
      per_question_seconds: usePerQuestionTimer ? parseInt(perQuestionSeconds, 10) || 60 : null,
      use_per_question_timer: usePerQuestionTimer,
    });
  };

  const isEdit = !!quiz;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Quiz" : "Add Quiz"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Quiz Title</Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Module Assessment"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passing-score">Passing Score (%)</Label>
              <Input
                id="passing-score"
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value, 10) || 80)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-limit">Total Time Limit (min)</Label>
              <Input
                id="time-limit"
                type="number"
                min={1}
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="No limit"
                disabled={usePerQuestionTimer}
              />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label>Per-Question Timer</Label>
                <p className="text-xs text-muted-foreground">
                  Each question has its own countdown
                </p>
              </div>
              <Switch
                checked={usePerQuestionTimer}
                onCheckedChange={setUsePerQuestionTimer}
              />
            </div>

            {usePerQuestionTimer && (
              <div className="space-y-2">
                <Label htmlFor="per-question-seconds">Seconds Per Question</Label>
                <Input
                  id="per-question-seconds"
                  type="number"
                  min={10}
                  max={600}
                  value={perQuestionSeconds}
                  onChange={(e) => setPerQuestionSeconds(e.target.value)}
                  placeholder="60"
                />
                <p className="text-xs text-muted-foreground">
                  Questions auto-advance when time runs out
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Saving..." : isEdit ? "Update Quiz" : "Create Quiz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
