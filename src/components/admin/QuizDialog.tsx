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
import type { DbQuiz } from "@/hooks/useAdminQuizContent";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: DbQuiz | null;
  onSave: (data: {
    title: string;
    passing_score: number;
    time_limit_minutes: number | null;
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

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setPassingScore(quiz.passing_score);
      setTimeLimit(quiz.time_limit_minutes?.toString() || "");
    } else {
      setTitle("");
      setPassingScore(80);
      setTimeLimit("");
    }
  }, [quiz, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      passing_score: passingScore,
      time_limit_minutes: timeLimit ? parseInt(timeLimit, 10) : null,
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
              <Label htmlFor="time-limit">Time Limit (minutes)</Label>
              <Input
                id="time-limit"
                type="number"
                min={1}
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="No limit"
              />
            </div>
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
