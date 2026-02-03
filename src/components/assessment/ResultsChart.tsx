import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ResultsChartProps {
  scores: Record<string, number>;
}

const departmentLabels: Record<string, string> = {
  cinematography: "Cinematography",
  "post-production": "Post-Production",
  directing: "Directing",
  production: "Production",
  photography: "Photography",
  "camera-systems": "Camera Systems",
};

const departmentEmoji: Record<string, string> = {
  cinematography: "🎬",
  "post-production": "🎞️",
  directing: "🎯",
  production: "📋",
  photography: "📷",
  "camera-systems": "🎥",
};

export const ResultsChart = memo(function ResultsChart({ scores }: ResultsChartProps) {
  const data = useMemo(() => {
    return Object.entries(scores)
      .map(([dept, score]) => ({
        department: dept,
        label: departmentLabels[dept] || dept,
        emoji: departmentEmoji[dept] || "📚",
        score: Math.round(score),
      }))
      .sort((a, b) => b.score - a.score);
  }, [scores]);

  const strongest = data[0];
  const weakest = data[data.length - 1];

  if (data.length === 0) {
    return null;
  }

  const getBarColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Department Progress Bars */}
      <TooltipProvider>
        <div className="space-y-4">
          {data.map((item, index) => (
            <Tooltip key={item.department}>
              <TooltipTrigger asChild>
                <div className="space-y-2 cursor-help">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </span>
                    <span className={cn("text-sm font-bold", getScoreColor(item.score))}>
                      {item.score}%
                    </span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", getBarColor(item.score))}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {item.score >= 75
                    ? "Excellent! You've mastered the fundamentals"
                    : item.score >= 50
                    ? "Good foundation, room for growth"
                    : "This is a great area to focus your learning"}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Strength & Focus Area Cards */}
      {data.length >= 2 && (
        <div className="grid grid-cols-2 gap-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Strongest Area
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{strongest.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm">{strongest.label}</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {strongest.score}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Focus Area</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{weakest.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm">{weakest.label}</div>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {weakest.score}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Score Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>75%+ Excellent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>50-74% Good</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>&lt;50% Focus</span>
        </div>
      </div>
    </div>
  );
});
