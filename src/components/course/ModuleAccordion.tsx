import { useState } from "react";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonCard } from "./LessonCard";
import { QuizCard } from "./QuizCard";
import type { Module, Lesson } from "@/data/courses";

interface ModuleAccordionProps {
  module: Module;
  index: number;
  activeLesson?: Lesson;
  onLessonSelect: (lesson: Lesson) => void;
  defaultOpen?: boolean;
}

export function ModuleAccordion({ 
  module, 
  index, 
  activeLesson, 
  onLessonSelect,
  defaultOpen = false 
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const completedCount = module.lessons.filter(l => l.completed).length;
  const totalCount = module.lessons.length;
  const isComplete = completedCount === totalCount;

  return (
    <div className="border-2 border-border bg-card/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className={cn(
          "w-10 h-10 flex items-center justify-center shrink-0 border-2 font-black",
          isComplete 
            ? "bg-accent/20 border-accent text-accent" 
            : "bg-muted border-border text-foreground"
        )}>
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground">{module.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {completedCount}/{totalCount} lessons {module.quiz && "• 1 quiz"}
          </p>
        </div>

        <ChevronDown className={cn(
          "w-5 h-5 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="border-t-2 border-border p-2 space-y-2 animate-accordion-down">
          {module.lessons.map((lesson, lessonIndex) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={lessonIndex}
              isActive={activeLesson?.id === lesson.id}
              onClick={() => onLessonSelect(lesson)}
            />
          ))}

          {module.quiz && (
            <QuizCard
              quiz={module.quiz}
              type="module"
            />
          )}
        </div>
      )}
    </div>
  );
}
