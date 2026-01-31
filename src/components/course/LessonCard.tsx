import { cn } from "@/lib/utils";
import { Play, FileText, Wrench, CheckCircle2, Circle } from "lucide-react";
import type { Lesson } from "@/data/courses";

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  isActive?: boolean;
  onClick?: () => void;
}

export function LessonCard({ lesson, index, isActive, onClick }: LessonCardProps) {
  const typeIcons = {
    video: Play,
    reading: FileText,
    practice: Wrench,
  };

  const TypeIcon = typeIcons[lesson.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 text-left transition-all duration-200 border-2",
        isActive
          ? "bg-primary/10 border-primary"
          : "bg-card/50 border-border hover:border-primary/50 hover:bg-card"
      )}
    >
      <div className={cn(
        "w-8 h-8 flex items-center justify-center shrink-0 border",
        lesson.completed 
          ? "bg-accent/20 border-accent text-accent" 
          : "bg-muted border-border text-muted-foreground"
      )}>
        {lesson.completed ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <span className="text-xs font-bold">{index + 1}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-bold text-sm truncate",
          isActive ? "text-primary" : "text-foreground"
        )}>
          {lesson.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <TypeIcon className="w-3 h-3" />
          <span className="capitalize">{lesson.type}</span>
          <span>•</span>
          <span>{lesson.duration}</span>
        </div>
      </div>

      {lesson.completed && (
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
      )}
    </button>
  );
}
