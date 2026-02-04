import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ClipboardList, CheckCircle2, Lock, AlertCircle, Clock } from "lucide-react";
import { formatCooldown } from "@/lib/quizUtils";
import type { Quiz } from "@/data/courses";

export interface CooldownStatus {
  canAttempt: boolean;
  cooldownEndsAt: Date | null;
  minutesRemaining?: number;
  failedAttempts?: number;
  hasPassed?: boolean;
  attemptsUntilCooldown?: number;
}

interface LockedQuizCardProps {
  quiz: Quiz;
  type: "module" | "final";
  isUnlocked: boolean;
  isPassed: boolean;
  attemptCount: number;
  maxAttempts: number;
  cooldownStatus?: CooldownStatus;
  onClick?: () => void;
}

export function LockedQuizCard({
  quiz,
  type,
  isUnlocked,
  isPassed,
  attemptCount,
  maxAttempts,
  cooldownStatus,
  onClick,
}: LockedQuizCardProps) {
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);
  
  // Live countdown timer for cooldown
  useEffect(() => {
    if (!cooldownStatus?.cooldownEndsAt) {
      setCooldownRemaining(null);
      return;
    }
    
    const updateRemaining = () => {
      const remaining = Math.max(0, cooldownStatus.cooldownEndsAt!.getTime() - Date.now());
      setCooldownRemaining(remaining);
    };
    
    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [cooldownStatus?.cooldownEndsAt]);

  const isInCooldown = cooldownStatus && !cooldownStatus.canAttempt && cooldownStatus.cooldownEndsAt;
  const canAttempt = isUnlocked && !isPassed && (cooldownStatus?.canAttempt ?? attemptCount < maxAttempts);
  const isLocked = !isUnlocked;
  const outOfAttempts = !isPassed && !isInCooldown && attemptCount >= maxAttempts;

  // Status display
  let statusText = "Not Started";
  let statusColor = "text-muted-foreground";
  
  if (isPassed) {
    statusText = "Passed";
    statusColor = "text-accent";
  } else if (isInCooldown && cooldownRemaining !== null) {
    statusText = `Cooldown: ${formatCooldown(cooldownRemaining)}`;
    statusColor = "text-primary";
  } else if (outOfAttempts) {
    statusText = "Max Attempts Reached";
    statusColor = "text-destructive";
  } else if (attemptCount > 0) {
    statusText = cooldownStatus?.attemptsUntilCooldown === 1 
      ? "1 retake left" 
      : `${attemptCount}/${maxAttempts} Attempts`;
    statusColor = "text-primary";
  }

  return (
    <button
      onClick={canAttempt ? onClick : undefined}
      disabled={!canAttempt}
      className={cn(
        "w-full flex items-center gap-4 p-4 text-left transition-all duration-200 border-2",
        isLocked && "opacity-60 cursor-not-allowed bg-muted/20 border-border",
        isInCooldown && "opacity-70 cursor-not-allowed bg-primary/5 border-primary/30",
        outOfAttempts && "opacity-70 cursor-not-allowed",
        isPassed && "opacity-70",
        canAttempt &&
          type === "final" &&
          "bg-primary/5 border-primary/50 hover:bg-primary/10 cursor-pointer",
        canAttempt &&
          type === "module" &&
          "bg-neon-purple/5 border-neon-purple/50 hover:bg-neon-purple/10 cursor-pointer"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 flex items-center justify-center shrink-0 border-2",
          isLocked && "bg-muted/50 border-border/50",
          isPassed && "bg-accent/20 border-accent",
          isInCooldown && "bg-primary/20 border-primary",
          outOfAttempts && "bg-destructive/20 border-destructive",
          canAttempt && type === "final" && "bg-primary/20 border-primary",
          canAttempt && type === "module" && "bg-neon-purple/20 border-neon-purple"
        )}
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-muted-foreground/50" />
        ) : isPassed ? (
          <CheckCircle2 className="w-5 h-5 text-accent" />
        ) : isInCooldown ? (
          <Clock className="w-5 h-5 text-primary animate-pulse" />
        ) : outOfAttempts ? (
          <AlertCircle className="w-5 h-5 text-destructive" />
        ) : (
          <ClipboardList
            className={cn(
              "w-5 h-5",
              type === "final" ? "text-primary" : "text-neon-purple"
            )}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            "font-bold text-sm",
            isLocked && "text-muted-foreground/60",
            isPassed && "text-accent",
            isInCooldown && "text-primary",
            outOfAttempts && "text-destructive",
            canAttempt && type === "final" && "text-primary",
            canAttempt && type === "module" && "text-neon-purple"
          )}
        >
          {quiz.title}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{quiz.questions} questions</span>
          <span>•</span>
          <span>Pass: {quiz.passingScore}%</span>
          <span>•</span>
          <span className={statusColor}>{statusText}</span>
        </div>
        
        {/* Cooldown message */}
        {isInCooldown && (
          <p className="text-xs text-muted-foreground mt-2">
            Review the material while you wait
          </p>
        )}
      </div>

      {isPassed && <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />}
      {isLocked && <Lock className="w-4 h-4 text-muted-foreground/50 shrink-0" />}
      {isInCooldown && <Clock className="w-4 h-4 text-primary shrink-0" />}
    </button>
  );
}
