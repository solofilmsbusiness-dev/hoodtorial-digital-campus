import { cn } from "@/lib/utils";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import type { Quiz } from "@/data/courses";

interface QuizCardProps {
  quiz: Quiz;
  type: "module" | "final";
  isCompleted?: boolean;
  onClick?: () => void;
}

export function QuizCard({ quiz, type, isCompleted, onClick }: QuizCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 text-left transition-all duration-200 border-2",
        type === "final" 
          ? "bg-primary/5 border-primary/50 hover:bg-primary/10" 
          : "bg-neon-purple/5 border-neon-purple/50 hover:bg-neon-purple/10",
        isCompleted && "opacity-70"
      )}
    >
      <div className={cn(
        "w-10 h-10 flex items-center justify-center shrink-0 border-2",
        type === "final" 
          ? "bg-primary/20 border-primary" 
          : "bg-neon-purple/20 border-neon-purple"
      )}>
        <ClipboardList className={cn(
          "w-5 h-5",
          type === "final" ? "text-primary" : "text-neon-purple"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-bold text-sm",
          type === "final" ? "text-primary" : "text-neon-purple"
        )}>
          {quiz.title}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{quiz.questions} questions</span>
          <span>•</span>
          <span>Pass: {quiz.passingScore}%</span>
        </div>
      </div>

      {isCompleted && (
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
      )}
    </button>
  );
}
