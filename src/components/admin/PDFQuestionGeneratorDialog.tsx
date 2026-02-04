import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import {
  FileUp,
  Sparkles,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Loader2,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

interface PDFQuestionGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizTitle: string;
  onGenerated: (questions: GeneratedQuestion[]) => void;
}

type Step = "upload" | "generating" | "review";

export function PDFQuestionGeneratorDialog({
  open,
  onOpenChange,
  quizTitle,
  onGenerated,
}: PDFQuestionGeneratorDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ text: string; pageCount: number; fileName: string } | null>(null);
  const [numQuestions, setNumQuestions] = useState("10");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionType, setQuestionType] = useState<"test" | "extra_credit">("test");
  const [focusKeywords, setFocusKeywords] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetDialog = useCallback(() => {
    setStep("upload");
    setFile(null);
    setPdfInfo(null);
    setNumQuestions("10");
    setDifficulty("intermediate");
    setQuestionType("test");
    setFocusKeywords("");
    setIsUploading(false);
    setIsGenerating(false);
    setProgress(0);
    setGeneratedQuestions([]);
    setDragActive(false);
  }, []);

  const handleClose = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "PDF must be under 20MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-pdf`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to parse PDF");
      }

      const result = await response.json();
      setPdfInfo({
        text: result.text,
        pageCount: result.pageCount,
        fileName: result.fileName,
      });

      toast({
        title: "PDF uploaded",
        description: `Extracted content from ${result.pageCount} page(s).`,
      });
    } catch (error) {
      console.error("PDF upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not parse PDF",
        variant: "destructive",
      });
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!pdfInfo) return;

    setStep("generating");
    setIsGenerating(true);
    setProgress(10);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke("generate-questions", {
        body: {
          pdfContent: pdfInfo.text,
          numQuestions: parseInt(numQuestions),
          difficulty,
          questionType,
          focusKeywords,
        },
      });

      clearInterval(progressInterval);

      if (error) throw error;

      if (data?.questions) {
        setProgress(100);
        setGeneratedQuestions(data.questions);
        setStep("review");
      } else {
        throw new Error("No questions generated");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Could not generate questions",
        variant: "destructive",
      });
      setStep("upload");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveQuestions = () => {
    if (generatedQuestions.length === 0) {
      toast({
        title: "No questions to save",
        description: "All questions have been removed.",
        variant: "destructive",
      });
      return;
    }

    onGenerated(generatedQuestions);
    toast({
      title: "Questions added",
      description: `${generatedQuestions.length} question(s) added to quiz.`,
    });
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {step === "upload" && "Generate Questions from PDF"}
            {step === "generating" && "Generating Questions..."}
            {step === "review" && "Review Generated Questions"}
          </DialogTitle>
        </DialogHeader>

        {/* Upload Step */}
        {step === "upload" && (
          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : file
                  ? "border-green-500 bg-green-500/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileInputChange}
              />

              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Parsing PDF...</p>
                </div>
              ) : file && pdfInfo ? (
                <div className="space-y-2">
                  <Check className="h-10 w-10 mx-auto text-green-500" />
                  <p className="font-medium">{pdfInfo.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {pdfInfo.pageCount} page(s) • {Math.round(pdfInfo.text.length / 1000)}k characters
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPdfInfo(null);
                    }}
                  >
                    Choose different file
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 cursor-pointer">
                  <FileUp className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Click to upload</span> or drag and
                    drop
                  </p>
                  <p className="text-xs text-muted-foreground">PDF (max 20MB)</p>
                </div>
              )}
            </div>

            {/* Configuration */}
            {pdfInfo && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Questions</Label>
                    <Select value={numQuestions} onValueChange={setNumQuestions}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 questions</SelectItem>
                        <SelectItem value="10">10 questions</SelectItem>
                        <SelectItem value="15">15 questions</SelectItem>
                        <SelectItem value="20">20 questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty</Label>
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
                  <Label>Question Type</Label>
                  <Select value={questionType} onValueChange={(v) => setQuestionType(v as "test" | "extra_credit")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="test">Test Questions</SelectItem>
                      <SelectItem value="extra_credit">Extra Credit Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Focus Keywords (optional)</Label>
                  <Input
                    placeholder="e.g., lighting techniques, camera angles"
                    value={focusKeywords}
                    onChange={(e) => setFocusKeywords(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Generating Step */}
        {step === "generating" && (
          <div className="space-y-4 py-8">
            <div className="text-center space-y-4">
              <Sparkles className="h-12 w-12 mx-auto text-primary animate-pulse" />
              <div className="space-y-2">
                <p className="font-medium">Analyzing document and generating questions...</p>
                <p className="text-sm text-muted-foreground">
                  Creating {numQuestions} {difficulty}-level {questionType === "extra_credit" ? "extra credit" : "test"} questions
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Review Step */}
        {step === "review" && (
          <div className="flex-1 min-h-0 space-y-3">
            <div className="text-sm text-muted-foreground">
              Generated from: <span className="font-medium">{pdfInfo?.fileName}</span> •{" "}
              {generatedQuestions.length} question(s)
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {generatedQuestions.map((q, index) => (
                  <Card key={index}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-muted-foreground min-w-[24px]">
                          {index + 1}.
                        </span>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium text-sm">{q.question}</p>
                          <div className="grid grid-cols-2 gap-1">
                            {q.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`text-xs flex items-center gap-1 ${
                                  optIndex === q.correct_answer
                                    ? "text-green-600 font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {optIndex === q.correct_answer ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <X className="h-3 w-3 opacity-50" />
                                )}
                                <span>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </span>
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <p className="text-xs text-muted-foreground italic">{q.explanation}</p>
                          )}
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
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="mt-4">
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={!pdfInfo || isUploading}>
                <Sparkles className="h-4 w-4 mr-1" />
                Generate Questions
              </Button>
            </>
          )}

          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={handleSaveQuestions} disabled={generatedQuestions.length === 0}>
                Save {generatedQuestions.length} Question{generatedQuestions.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
