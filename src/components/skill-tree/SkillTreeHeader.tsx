import { motion } from "framer-motion";
import { ArrowLeft, Star, Award, BookOpen, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SkillTreeHeaderProps {
  pathName: string;
  totalCredits: number;
  earnedCredits: number;
  totalSkillPoints: number;
  earnedSkillPoints: number;
  completedNodes: number;
  totalNodes: number;
}

export function SkillTreeHeader({
  pathName,
  totalCredits,
  earnedCredits,
  totalSkillPoints,
  earnedSkillPoints,
  completedNodes,
  totalNodes,
}: SkillTreeHeaderProps) {
  const progressPercent = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur-sm border-b border-border p-4 md:p-6"
    >
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Back & Title */}
          <div className="flex items-center gap-4">
            <Link
              to="/degrees"
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground">
                {pathName}
              </h1>
              <p className="text-sm text-muted-foreground">Skill Tree Progression</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            {/* Skill Points */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-center"
            >
              <div className="flex items-center gap-1.5 justify-center">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-lg font-black text-foreground">
                  {earnedSkillPoints}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {totalSkillPoints}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Skill Points</div>
            </motion.div>

            {/* Credits */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-center"
            >
              <div className="flex items-center gap-1.5 justify-center">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-lg font-black text-foreground">
                  {earnedCredits}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {totalCredits}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Credits</div>
            </motion.div>

            {/* Courses */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-center"
            >
              <div className="flex items-center gap-1.5 justify-center">
                <BookOpen className="w-4 h-4 text-neon-purple" />
                <span className="text-lg font-black text-foreground">
                  {completedNodes}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {totalNodes}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </motion.div>
          </div>
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Path Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
