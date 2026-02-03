import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ShuffledAssessmentQuestion {
  id: string;
  shuffledCorrectAnswer: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface DifficultyBreakdownProps {
  questions: ShuffledAssessmentQuestion[];
  answers: Record<string, number>;
}

export const DifficultyBreakdown = memo(function DifficultyBreakdown({
  questions,
  answers,
}: DifficultyBreakdownProps) {
  const breakdown = useMemo(() => {
    const stats = {
      beginner: { correct: 0, total: 0 },
      intermediate: { correct: 0, total: 0 },
      advanced: { correct: 0, total: 0 },
    };

    questions.forEach((q) => {
      const diff = q.difficulty || "beginner";
      stats[diff].total++;
      if (answers[q.id] === q.shuffledCorrectAnswer) {
        stats[diff].correct++;
      }
    });

    return Object.entries(stats).map(([level, data]) => ({
      level: level as "beginner" | "intermediate" | "advanced",
      label: level.charAt(0).toUpperCase() + level.slice(1),
      correct: data.correct,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));
  }, [questions, answers]);

  const getBarColor = (percentage: number, level: string) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "beginner":
        return "🌱";
      case "intermediate":
        return "🔥";
      case "advanced":
        return "⭐";
      default:
        return "📚";
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Performance by Difficulty
      </h4>
      <TooltipProvider>
        <div className="space-y-3">
          {breakdown.map((item, index) => (
            <Tooltip key={item.level}>
              <TooltipTrigger asChild>
                <div className="space-y-1.5 cursor-help">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{getLevelIcon(item.level)}</span>
                      <span className="font-medium">{item.label}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {item.correct}/{item.total} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", getBarColor(item.percentage, item.level))}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {item.correct} of {item.total} {item.label.toLowerCase()} questions correct
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
});
