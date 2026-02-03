import { useState } from "react";
import { ChevronDown, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LockedLessonCard } from "./LockedLessonCard";
import { LockedQuizCard } from "./LockedQuizCard";
import type { Module, Lesson, Quiz } from "@/data/courses";

interface ProgressionModuleAccordionProps {
  module: Module;
  moduleIndex: number;
  activeLesson?: Lesson;
  onLessonSelect: (lesson: Lesson) => void;
  onQuizClick?: (quiz: Quiz) => void;
  isContentUnlocked: (moduleIndex: number, lessonIndex: number, type?: "lesson" | "quiz") => boolean;
  isLessonCompleted: (lessonId: string) => boolean;
  isQuizPassed: (quizId: string) => boolean;
  isQuizActuallyPassed?: (quizId: string) => boolean;
  getQuizAttempts: (quizId: string) => number;
  canAttemptQuiz: (quizId: string) => boolean;
  moduleProgress: { completed: number; total: number; percent: number };
  defaultOpen?: boolean;
  getWatchPercentage?: (lessonId: string) => number;
}

export function ProgressionModuleAccordion({
  module,
  moduleIndex,
  activeLesson,
  onLessonSelect,
  onQuizClick,
  isContentUnlocked,
  isLessonCompleted,
  isQuizPassed,
  isQuizActuallyPassed,
  getQuizAttempts,
  canAttemptQuiz,
  moduleProgress,
  defaultOpen = false,
  getWatchPercentage,
}: ProgressionModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isModuleComplete = moduleProgress.percent === 100;
  const firstLessonUnlocked = isContentUnlocked(moduleIndex, 0, "lesson");

  return (
    <div className="border-2 border-border bg-card/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center shrink-0 border-2 font-black",
            isModuleComplete
              ? "bg-accent/20 border-accent text-accent"
              : firstLessonUnlocked
              ? "bg-muted border-border text-foreground"
              : "bg-muted/50 border-border/50 text-muted-foreground/50"
          )}
        >
          {isModuleComplete ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : !firstLessonUnlocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            <span>{moduleIndex + 1}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-bold",
              !firstLessonUnlocked && "text-muted-foreground/60"
            )}
          >
            {module.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-muted-foreground">
              {moduleProgress.completed}/{moduleProgress.total} completed
              {module.quiz && " • 1 quiz"}
            </p>
            {/* Progress bar */}
            <div className="flex-1 max-w-24 h-1.5 bg-muted border border-border">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${moduleProgress.percent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-accent">
              {moduleProgress.percent}%
            </span>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t-2 border-border p-2 space-y-2 animate-accordion-down">
          {module.lessons.map((lesson, lessonIndex) => {
            const unlocked = isContentUnlocked(moduleIndex, lessonIndex, "lesson");
            const completed = isLessonCompleted(lesson.id);
            const watchPercentage = getWatchPercentage?.(lesson.id) || 0;

            return (
              <LockedLessonCard
                key={lesson.id}
                lesson={lesson}
                index={lessonIndex}
                isActive={activeLesson?.id === lesson.id}
                isUnlocked={unlocked}
                isCompleted={completed}
                watchPercentage={watchPercentage}
                onClick={() => onLessonSelect(lesson)}
              />
            );
          })}

          {module.quiz && (
            <LockedQuizCard
              quiz={module.quiz}
              type="module"
              isUnlocked={isContentUnlocked(moduleIndex, module.lessons.length, "quiz")}
              isPassed={isQuizActuallyPassed?.(module.quiz.id) ?? isQuizPassed(module.quiz.id)}
              attemptCount={getQuizAttempts(module.quiz.id)}
              maxAttempts={3}
              onClick={onQuizClick ? () => onQuizClick(module.quiz!) : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}
