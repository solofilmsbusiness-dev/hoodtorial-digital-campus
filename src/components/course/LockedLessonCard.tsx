import { cn } from "@/lib/utils";
import { Play, FileText, Wrench, CheckCircle2, Lock, Circle } from "lucide-react";
import type { Lesson } from "@/data/courses";

interface LockedLessonCardProps {
  lesson: Lesson;
  index: number;
  isActive?: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
  watchPercentage?: number;
  onClick?: () => void;
}

export function LockedLessonCard({
  lesson,
  index,
  isActive,
  isUnlocked,
  isCompleted,
  watchPercentage = 0,
  onClick,
}: LockedLessonCardProps) {
  const typeIcons = {
    video: Play,
    reading: FileText,
    practice: Wrench,
  };

  const TypeIcon = typeIcons[lesson.type];
  const showProgress = lesson.type === "video" && watchPercentage > 0 && !isCompleted;

  return (
    <button
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={cn(
        "w-full flex items-center gap-4 p-4 text-left transition-all duration-200 border-2 relative overflow-hidden",
        !isUnlocked && "opacity-60 cursor-not-allowed bg-muted/20 border-border",
        isUnlocked && isActive && "bg-primary/10 border-primary",
        isUnlocked &&
          !isActive &&
          "bg-card/50 border-border hover:border-primary/50 hover:bg-card"
      )}
    >
      {/* Progress bar for video lessons */}
      {showProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${watchPercentage}%` }}
          />
        </div>
      )}

      <div
        className={cn(
          "w-8 h-8 flex items-center justify-center shrink-0 border",
          isCompleted && "bg-accent/20 border-accent text-accent",
          !isCompleted && isUnlocked && "bg-muted border-border text-muted-foreground",
          !isUnlocked && "bg-muted/50 border-border/50 text-muted-foreground/50"
        )}
      >
        {!isUnlocked ? (
          <Lock className="w-3.5 h-3.5" />
        ) : isCompleted ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <span className="text-xs font-bold">{index + 1}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            "font-bold text-sm truncate",
            !isUnlocked && "text-muted-foreground/60",
            isUnlocked && isActive && "text-primary",
            isUnlocked && !isActive && "text-foreground"
          )}
        >
          {lesson.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <TypeIcon className={cn("w-3 h-3", !isUnlocked && "opacity-50")} />
          <span className="capitalize">{lesson.type}</span>
          <span>•</span>
          <span>{lesson.duration}</span>
          {showProgress && (
            <>
              <span>•</span>
              <span className="text-primary">{watchPercentage}% watched</span>
            </>
          )}
        </div>
      </div>

      {!isUnlocked && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <Lock className="w-4 h-4" />
        </div>
      )}

      {isCompleted && isUnlocked && <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />}
    </button>
  );
}
