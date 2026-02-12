import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  CheckCircle, 
  Clock, 
  Flame,
  Camera,
  Sun,
  Film,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyChallenge } from "@/hooks/useDailyChallenges";
import { motion } from "framer-motion";

interface DailyChallengeCardProps {
  challenge: DailyChallenge | null;
  hasSubmitted: boolean;
  currentStreak: number;
  daysRemaining: number;
  onSubmit: () => void;
  isLoading?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  lighting: <Sun className="h-5 w-5" />,
  composition: <Eye className="h-5 w-5" />,
  movement: <Film className="h-5 w-5" />,
  storytelling: <Camera className="h-5 w-5" />,
  general: <Zap className="h-5 w-5" />,
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function DailyChallengeCard({
  challenge,
  hasSubmitted,
  currentStreak,
  daysRemaining,
  onSubmit,
  isLoading,
}: DailyChallengeCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-primary/20 rounded w-1/3" />
              <div className="h-3 bg-primary/10 rounded w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 text-center">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No challenge today. Check back tomorrow!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "relative overflow-hidden border-2 transition-all",
        hasSubmitted 
          ? "bg-gradient-to-r from-green-500/10 via-green-500/5 to-background border-green-500/30" 
          : "bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/30 hover:border-primary/50"
      )}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        </div>

        <CardContent className="relative p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Icon & Streak */}
            <div className="flex items-center gap-3 sm:flex-col sm:gap-1">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                hasSubmitted ? "bg-green-500/20" : "bg-primary/20"
              )}>
                {hasSubmitted ? (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                ) : (
                  categoryIcons[challenge.category] || <Zap className="h-6 w-6 text-primary" />
                )}
              </div>
              {currentStreak > 0 && (
                <div className="flex items-center gap-1 text-sm text-amber-400">
                  <Flame className="h-4 w-4" />
                  <span className="font-bold">{currentStreak}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {daysRemaining <= 1 ? "Last Day!" : `${daysRemaining} Days Left`}
                </span>
                <Badge className={cn("text-[10px] border", difficultyColors[challenge.difficulty])}>
                  {challenge.difficulty}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  +{challenge.credits_reward} cr
                </Badge>
              </div>
              
              <h3 className="font-bold text-lg text-foreground mb-1 truncate">
                {challenge.title}
              </h3>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {challenge.prompt}
              </p>
            </div>

            {/* Action */}
            <div className="flex-shrink-0">
              {hasSubmitted ? (
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-1" />
                  <span className="text-xs text-green-400 font-medium">Completed!</span>
                </div>
              ) : (
                <Button 
                  onClick={onSubmit}
                  className="btn-brutal gap-2 w-full sm:w-auto"
                >
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">Submit Work</span>
                  <span className="sm:hidden">Go</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
