import { motion } from "framer-motion";
import { ArrowLeft, Star, Award, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SkillTreeStatsProps {
  pathName: string;
  totalSkillPoints: number;
  earnedSkillPoints: number;
  totalCredits: number;
  earnedCredits: number;
  completedNodes: number;
  totalNodes: number;
}

export function SkillTreeStats({
  pathName,
  totalSkillPoints,
  earnedSkillPoints,
  totalCredits,
  earnedCredits,
  completedNodes,
  totalNodes,
}: SkillTreeStatsProps) {
  const progressPercentage = totalNodes > 0 
    ? Math.round((completedNodes / totalNodes) * 100) 
    : 0;

  // Calculate "level" based on skill points (every 100 SP = 1 level)
  const currentLevel = Math.floor(earnedSkillPoints / 100) + 1;
  const pointsToNextLevel = 100 - (earnedSkillPoints % 100);
  const levelProgress = (earnedSkillPoints % 100);

  // Determine rank title based on credits
  const getRankTitle = () => {
    if (earnedCredits >= 50) return "Master Filmmaker";
    if (earnedCredits >= 30) return "Senior Director";
    if (earnedCredits >= 15) return "Junior Director";
    if (earnedCredits >= 5) return "Apprentice";
    return "Freshman";
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 md:px-6 md:py-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top row - Navigation and title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Link to="/degrees">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Degrees</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <h1 className="text-lg md:text-xl font-black tracking-tight text-foreground">
              {pathName}
            </h1>
          </div>

          {/* Level badge */}
          <motion.div 
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/30"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">
              Level {currentLevel}
            </span>
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Skill Points */}
          <motion.div 
            className="p-3 bg-muted/30 rounded-lg border border-border"
            whileHover={{ scale: 1.02, borderColor: "hsl(var(--primary) / 0.5)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Skill Points
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <motion.span 
                className="text-xl md:text-2xl font-black text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={earnedSkillPoints}
              >
                {earnedSkillPoints}
              </motion.span>
              <span className="text-sm text-muted-foreground">/ {totalSkillPoints}</span>
            </div>
            <Progress 
              value={levelProgress} 
              className="h-1.5 mt-2" 
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {pointsToNextLevel} SP to next level
            </p>
          </motion.div>

          {/* Credits */}
          <motion.div 
            className="p-3 bg-muted/30 rounded-lg border border-border"
            whileHover={{ scale: 1.02, borderColor: "hsl(var(--accent) / 0.5)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Credits
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-black text-foreground">
                {earnedCredits}
              </span>
              <span className="text-sm text-muted-foreground">/ {totalCredits}</span>
            </div>
            <Progress 
              value={(earnedCredits / totalCredits) * 100} 
              className="h-1.5 mt-2 [&>div]:bg-accent" 
            />
          </motion.div>

          {/* Courses */}
          <motion.div 
            className="p-3 bg-muted/30 rounded-lg border border-border"
            whileHover={{ scale: 1.02, borderColor: "hsl(var(--neon-purple) / 0.5)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-neon-purple" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Courses
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-black text-foreground">
                {completedNodes}
              </span>
              <span className="text-sm text-muted-foreground">/ {totalNodes}</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-1.5 mt-2 [&>div]:bg-neon-purple" 
            />
          </motion.div>

          {/* Rank */}
          <motion.div 
            className="p-3 bg-muted/30 rounded-lg border border-border"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Current Rank
              </span>
            </div>
            <p className={cn(
              "text-lg md:text-xl font-black",
              earnedCredits >= 50 && "text-gold-gradient",
              earnedCredits >= 30 && earnedCredits < 50 && "text-neon-gradient",
              earnedCredits < 30 && "text-foreground"
            )}>
              {getRankTitle()}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {progressPercentage}% Complete
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
