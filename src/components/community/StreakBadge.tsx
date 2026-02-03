import { Flame, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  totalSubmissions: number;
  variant?: 'compact' | 'detailed';
}

export function StreakBadge({ 
  currentStreak, 
  longestStreak, 
  totalSubmissions,
  variant = 'compact' 
}: StreakBadgeProps) {
  const getStreakColor = () => {
    if (currentStreak >= 30) return "text-amber-400";
    if (currentStreak >= 14) return "text-orange-400";
    if (currentStreak >= 7) return "text-red-400";
    return "text-muted-foreground";
  };

  const getStreakBg = () => {
    if (currentStreak >= 30) return "bg-amber-500/10 border-amber-500/30";
    if (currentStreak >= 14) return "bg-orange-500/10 border-orange-500/30";
    if (currentStreak >= 7) return "bg-red-500/10 border-red-500/30";
    return "bg-muted/30 border-border";
  };

  if (variant === 'compact') {
    if (currentStreak === 0) return null;

    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
          getStreakBg()
        )}
      >
        <Flame className={cn("h-4 w-4", getStreakColor())} />
        <span className={cn("text-sm font-bold", getStreakColor())}>
          {currentStreak}
        </span>
      </motion.div>
    );
  }

  return (
    <div className={cn("p-4 rounded-lg border", getStreakBg())}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          currentStreak > 0 ? "bg-gradient-to-br from-amber-500/20 to-red-500/20" : "bg-muted"
        )}>
          <Flame className={cn("h-5 w-5", getStreakColor())} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Current Streak
          </p>
          <p className={cn("text-2xl font-bold", getStreakColor())}>
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-primary" />
          <div>
            <p className="text-muted-foreground text-xs">Longest</p>
            <p className="font-bold">{longestStreak} days</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-primary" />
          <div>
            <p className="text-muted-foreground text-xs">Total</p>
            <p className="font-bold">{totalSubmissions}</p>
          </div>
        </div>
      </div>

      {/* Streak milestones */}
      {currentStreak > 0 && currentStreak < 30 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Next milestone</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(currentStreak / (currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : 30)) * 100}%` 
                }}
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              {currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : 30}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
