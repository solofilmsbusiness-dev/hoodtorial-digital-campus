import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Check, X, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

interface GenerateQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizTitle: string;
  onGenerated: (questions: GeneratedQuestion[]) => void;
}

export function GenerateQuestionsDialog({
  open,
  onOpenChange,
  quizTitle,
  onGenerated,
}: GenerateQuestionsDialogProps) {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [step, setStep] = useState<"configure" | "preview">("configure");
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-questions", {
        body: {
          topic: topic || quizTitle,
          numQuestions: parseInt(numQuestions, 10),
          difficulty,
          context,
        },
      });

      if (error) throw error;

      if (data?.questions && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
        setStep("preview");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Failed to generate questions",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    if (generatedQuestions.length > 0) {
      onGenerated(generatedQuestions);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep("configure");
    setGeneratedQuestions([]);
    setTopic("");
    setContext("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Quiz Questions
          </DialogTitle>
        </DialogHeader>

        {step === "configure" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gen-topic">Topic</Label>
              <Input
                id="gen-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={quizTitle || "e.g., iPhone Cinematography Settings"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="num-questions">Number of Questions</Label>
                <Select value={numQuestions} onValueChange={setNumQuestions}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 questions</SelectItem>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                    <SelectItem value="15">15 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gen-context">Additional Context (optional)</Label>
              <Textarea
                id="gen-context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Focus on frame rates, exposure settings, and resolution options..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review the generated questions. Remove any you don't want, then save.
            </p>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {generatedQuestions.map((q, index) => (
                <Card key={index} className="relative">
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-muted-foreground text-sm">
                        {index + 1}.
                      </span>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{q.question}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`text-xs flex items-center gap-1 ${
                                optIdx === q.correct_answer
                                  ? "text-green-600 font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {optIdx === q.correct_answer ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3 opacity-50" />
                              )}
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleRemoveQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {generatedQuestions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                All questions removed. Go back to generate more.
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep("configure")}>
                Back
              </Button>
              <Button onClick={handleSaveAll} disabled={generatedQuestions.length === 0}>
                Save {generatedQuestions.length} Question{generatedQuestions.length !== 1 ? "s" : ""}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
