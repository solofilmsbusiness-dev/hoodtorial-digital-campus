import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Check, Star, BookOpen, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { SkillNodeData } from "./SkillNode";
import { Link } from "react-router-dom";

interface SkillNodeDetailProps {
  node: SkillNodeData | null;
  onClose: () => void;
}

export function SkillNodeDetail({ node, onClose }: SkillNodeDetailProps) {
  if (!node) return null;

  const isLocked = node.status === "locked";
  const isCompleted = node.status === "completed";
  const isInProgress = node.status === "in-progress";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="absolute right-0 top-0 bottom-0 w-80 md:w-96 bg-card border-l border-border p-6 overflow-y-auto z-30"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded",
              node.type === "course" && "bg-primary/20 text-primary",
              node.type === "milestone" && "bg-accent/20 text-accent",
              node.type === "capstone" && "bg-neon-purple/20 text-neon-purple"
            )}>
              {node.type}
            </span>
            {node.courseCode && (
              <span className="text-xs text-muted-foreground font-mono">
                {node.courseCode}
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-foreground">{node.title}</h3>
        </div>

        {/* Status indicator */}
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-lg mb-6",
          isLocked && "bg-muted/50",
          isCompleted && "bg-primary/10",
          isInProgress && "bg-accent/10",
          node.status === "available" && "bg-primary/5 border border-primary/30"
        )}>
          {isLocked ? (
            <>
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Locked</div>
                <div className="text-xs text-muted-foreground">Complete prerequisites to unlock</div>
              </div>
            </>
          ) : isCompleted ? (
            <>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
              </div>
              <div>
                <div className="text-sm font-medium text-primary">Completed</div>
                <div className="text-xs text-muted-foreground">+{node.skillPoints} skill points earned</div>
              </div>
            </>
          ) : isInProgress ? (
            <>
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">In Progress</div>
                <Progress value={45} className="h-1.5 mt-1" />
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-primary">Available</div>
                <div className="text-xs text-muted-foreground">Ready to start</div>
              </div>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6">
          {node.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <Award className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">{node.credits}</div>
            <div className="text-xs text-muted-foreground">Credits</div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <Star className="w-5 h-5 mx-auto mb-1 text-accent" />
            <div className="text-lg font-bold text-foreground">{node.skillPoints}</div>
            <div className="text-xs text-muted-foreground">Skill Points</div>
          </div>
        </div>

        {/* Prerequisites */}
        {node.prerequisites && node.prerequisites.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Prerequisites
            </h4>
            <div className="space-y-2">
              {node.prerequisites.map((prereq, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  {prereq}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        {!isLocked && (
          <Button 
            asChild
            className="w-full" 
            variant={isCompleted ? "outline" : "default"}
          >
            <Link to={node.courseCode ? `/course/${node.courseCode}` : "#"}>
              {isCompleted ? "Review Course" : isInProgress ? "Continue Learning" : "Start Course"}
            </Link>
          </Button>
        )}

        {isLocked && (
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Complete the required courses to unlock this skill
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
