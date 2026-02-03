import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, ListChecks, Clock } from "lucide-react";
import { QuizDialog } from "./QuizDialog";
import { QuestionManager } from "./QuestionManager";
import { useAdminQuizContent, useAdminQuizQuestions } from "@/hooks/useAdminQuizContent";
import type { DbQuiz } from "@/hooks/useAdminQuizContent";

interface QuizSectionProps {
  moduleId: string;
}

function QuizItem({ quiz, onEdit, onDelete, onManageQuestions }: {
  quiz: DbQuiz;
  onEdit: () => void;
  onDelete: () => void;
  onManageQuestions: () => void;
}) {
  const { questions } = useAdminQuizQuestions(quiz.id);

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <ListChecks className="h-4 w-4 text-primary" />
        <div>
          <p className="font-medium text-sm">{quiz.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span>{questions.length} questions</span>
            <span>•</span>
            <span>{quiz.passing_score}% to pass</span>
            {quiz.use_per_question_timer ? (
              <>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{quiz.per_question_seconds || 60}s/question</span>
              </>
            ) : quiz.time_limit_minutes ? (
              <>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{quiz.time_limit_minutes} min</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onManageQuestions}>
          Questions
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{quiz.title}" and all its questions. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={onDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function QuizSection({ moduleId }: QuizSectionProps) {
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [questionManagerOpen, setQuestionManagerOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<DbQuiz | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<DbQuiz | null>(null);

  const { quizzes, addQuiz, updateQuiz, deleteQuiz } = useAdminQuizContent(moduleId);

  const handleAddQuiz = () => {
    setEditingQuiz(null);
    setQuizDialogOpen(true);
  };

  const handleEditQuiz = (quiz: DbQuiz) => {
    setEditingQuiz(quiz);
    setQuizDialogOpen(true);
  };

  const handleSaveQuiz = (data: {
    title: string;
    passing_score: number;
    time_limit_minutes: number | null;
    per_question_seconds: number | null;
    use_per_question_timer: boolean;
  }) => {
    if (editingQuiz) {
      updateQuiz.mutate(
        { id: editingQuiz.id, ...data },
        { onSuccess: () => setQuizDialogOpen(false) }
      );
    } else {
      addQuiz.mutate(data, { onSuccess: () => setQuizDialogOpen(false) });
    }
  };

  const handleDeleteQuiz = (quiz: DbQuiz) => {
    deleteQuiz.mutate(quiz.id);
  };

  const handleManageQuestions = (quiz: DbQuiz) => {
    setSelectedQuiz(quiz);
    setQuestionManagerOpen(true);
  };

  return (
    <>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">Module Quiz</p>
        </div>

        {quizzes.length === 0 ? (
          <Button variant="outline" size="sm" onClick={handleAddQuiz}>
            <Plus className="h-4 w-4 mr-1" />
            Add Quiz
          </Button>
        ) : (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <QuizItem
                key={quiz.id}
                quiz={quiz}
                onEdit={() => handleEditQuiz(quiz)}
                onDelete={() => handleDeleteQuiz(quiz)}
                onManageQuestions={() => handleManageQuestions(quiz)}
              />
            ))}
            {quizzes.length < 2 && (
              <Button variant="ghost" size="sm" onClick={handleAddQuiz} className="text-muted-foreground">
                <Plus className="h-4 w-4 mr-1" />
                Add Another Quiz
              </Button>
            )}
          </div>
        )}
      </div>

      <QuizDialog
        open={quizDialogOpen}
        onOpenChange={setQuizDialogOpen}
        quiz={editingQuiz}
        onSave={handleSaveQuiz}
        isPending={addQuiz.isPending || updateQuiz.isPending}
      />

      {selectedQuiz && (
        <QuestionManager
          open={questionManagerOpen}
          onOpenChange={setQuestionManagerOpen}
          quiz={selectedQuiz}
        />
      )}
    </>
  );
}
