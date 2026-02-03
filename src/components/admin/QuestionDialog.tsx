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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import type { DbQuizQuestion } from "@/hooks/useAdminQuizContent";

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: DbQuizQuestion | null;
  onSave: (data: {
    question: string;
    options: string[];
    correct_answer: number;
    explanation?: string;
  }) => void;
  isPending?: boolean;
}

export function QuestionDialog({
  open,
  onOpenChange,
  question,
  onSave,
  isPending,
}: QuestionDialogProps) {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (question) {
      setQuestionText(question.question);
      setOptions(question.options.length >= 2 ? [...question.options] : ["", "", "", ""]);
      setCorrectAnswer(question.correct_answer);
      setExplanation(question.explanation || "");
    } else {
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
      setExplanation("");
    }
  }, [question, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredOptions = options.filter((opt) => opt.trim() !== "");
    if (filteredOptions.length < 2) {
      return; // Need at least 2 options
    }
    onSave({
      question: questionText,
      options: filteredOptions,
      correct_answer: correctAnswer,
      explanation: explanation || undefined,
    });
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions((prev) => [...prev, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, i) => i !== index));
      if (correctAnswer >= index && correctAnswer > 0) {
        setCorrectAnswer(correctAnswer - 1);
      }
    }
  };

  const isEdit = !!question;
  const validOptions = options.filter((opt) => opt.trim() !== "");
  const isValid = questionText.trim() && validOptions.length >= 2 && correctAnswer < validOptions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Question" : "Add Question"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">Question</Label>
            <Textarea
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="What is the recommended frame rate for cinematic footage?"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Answer Options</Label>
            <p className="text-xs text-muted-foreground">
              Select the correct answer by clicking the radio button
            </p>
            <RadioGroup
              value={correctAnswer.toString()}
              onValueChange={(v) => setCorrectAnswer(parseInt(v, 10))}
              className="space-y-2"
            >
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>

            {options.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation (optional)</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="24fps is the standard cinematic frame rate, giving footage that classic film look."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Shown to students after they answer
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !isValid}>
              {isPending ? "Saving..." : isEdit ? "Update Question" : "Add Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
