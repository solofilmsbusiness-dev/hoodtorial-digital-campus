import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Check,
  X,
  FileText,
} from "lucide-react";
import { QuestionDialog } from "./QuestionDialog";
import { GenerateQuestionsDialog } from "./GenerateQuestionsDialog";
import { PDFQuestionGeneratorDialog } from "./PDFQuestionGeneratorDialog";
import {
  useAdminQuizContent,
  useAdminQuizQuestions,
  type DbQuizQuestion,
  type DbQuiz,
} from "@/hooks/useAdminQuizContent";

interface QuestionManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: DbQuiz;
}

export function QuestionManager({ open, onOpenChange, quiz }: QuestionManagerProps) {
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<DbQuizQuestion | null>(null);

  const { questions, isLoading } = useAdminQuizQuestions(quiz.id);
  const { addQuestion, updateQuestion, deleteQuestion, reorderQuestions, addBulkQuestions } =
    useAdminQuizContent(quiz.module_id || undefined, quiz.course_id || undefined);

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: DbQuizQuestion) => {
    setEditingQuestion(question);
    setQuestionDialogOpen(true);
  };

  const handleSaveQuestion = (data: {
    question: string;
    options: string[];
    correct_answer: number;
    explanation?: string;
  }) => {
    if (editingQuestion) {
      updateQuestion.mutate(
        {
          id: editingQuestion.id,
          quiz_id: quiz.id,
          question: data.question,
          options: data.options,
          correct_answer: data.correct_answer,
          explanation: data.explanation || null,
        },
        {
          onSuccess: () => setQuestionDialogOpen(false),
        }
      );
    } else {
      addQuestion.mutate(
        {
          quiz_id: quiz.id,
          ...data,
        },
        {
          onSuccess: () => setQuestionDialogOpen(false),
        }
      );
    }
  };

  const handleDeleteQuestion = (question: DbQuizQuestion) => {
    deleteQuestion.mutate({ id: question.id, quiz_id: quiz.id });
  };

  const handleMoveQuestion = (questionId: string, direction: "up" | "down") => {
    const currentIndex = questions.findIndex((q) => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newOrder = [...questions];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

    reorderQuestions.mutate({
      quiz_id: quiz.id,
      orderedIds: newOrder.map((q) => q.id),
    });
  };

  const handleGeneratedQuestions = (
    generatedQuestions: Array<{
      question: string;
      options: string[];
      correct_answer: number;
      explanation?: string;
    }>
  ) => {
    addBulkQuestions.mutate({
      quiz_id: quiz.id,
      questions: generatedQuestions,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Questions: {quiz.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPdfDialogOpen(true)}>
                  <FileText className="h-4 w-4 mr-1" />
                  From PDF
                </Button>
                <Button variant="outline" onClick={() => setGenerateDialogOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate AI
                </Button>
                <Button onClick={handleAddQuestion}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : questions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No questions yet. Add your first question or generate with AI.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <Card key={question.id} className="relative">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-muted-foreground min-w-[24px]">
                          {index + 1}.
                        </span>
                        <div className="flex-1 space-y-2">
                          <CardTitle className="text-sm font-medium leading-normal">
                            {question.question}
                          </CardTitle>
                          <div className="grid grid-cols-2 gap-1">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`text-xs flex items-center gap-1 ${
                                  optIndex === question.correct_answer
                                    ? "text-green-600 font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {optIndex === question.correct_answer ? (
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
                          {question.explanation && (
                            <p className="text-xs text-muted-foreground italic">
                              {question.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleMoveQuestion(question.id, "up")}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleMoveQuestion(question.id, "down")}
                            disabled={index === questions.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this question. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteQuestion(question)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <QuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        question={editingQuestion}
        onSave={handleSaveQuestion}
        isPending={addQuestion.isPending || updateQuestion.isPending}
      />

      <GenerateQuestionsDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        quizTitle={quiz.title}
        onGenerated={handleGeneratedQuestions}
      />

      <PDFQuestionGeneratorDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        quizTitle={quiz.title}
        onGenerated={handleGeneratedQuestions}
      />
    </>
  );
}
