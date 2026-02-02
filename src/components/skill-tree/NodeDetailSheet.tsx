import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Check, Star, BookOpen, Award, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import type { SkillNodeData } from "./SkillNodeHex";
import { departmentConfigs, type DepartmentId } from "@/hooks/useSkillTreeLayout";

interface NodeDetailSheetProps {
  node: (SkillNodeData & { department?: DepartmentId }) | null;
  onClose: () => void;
}

export function NodeDetailSheet({ node, onClose }: NodeDetailSheetProps) {
  if (!node) return null;

  const isLocked = node.status === "locked";
  const isCompleted = node.status === "completed";
  const isInProgress = node.status === "in-progress";
  const isAvailable = node.status === "available";

  const deptConfig = node.department 
    ? departmentConfigs[node.department] 
    : departmentConfigs.cinematography;

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Sheet - bottom on mobile, side on desktop */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 bg-card border-t md:border-l md:border-t-0 border-border",
              // Mobile: bottom sheet
              "bottom-0 left-0 right-0 max-h-[80vh] rounded-t-2xl",
              // Desktop: side panel
              "md:top-0 md:bottom-0 md:left-auto md:right-0 md:w-96 md:max-h-full md:rounded-none"
            )}
          >
            {/* Handle for mobile */}
            <div className="flex justify-center pt-3 pb-2 md:hidden">
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-40px)] md:max-h-[calc(100vh-24px)]">
              {/* Header with department color accent */}
              <div 
                className="mb-6 pb-4 border-b"
                style={{ borderColor: `${deptConfig.color}40` }}
              >
                {/* Type & Code badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span 
                    className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded"
                    style={{ 
                      background: `${deptConfig.color}20`,
                      color: deptConfig.color
                    }}
                  >
                    {node.type}
                  </span>
                  {node.courseCode && (
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                      {node.courseCode}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black text-foreground leading-tight mb-2">
                  {node.title}
                </h3>

                {/* Department */}
                {node.department && (
                  <p className="text-sm font-medium" style={{ color: deptConfig.color }}>
                    {deptConfig.name}
                  </p>
                )}
              </div>

              {/* Status card */}
              <motion.div 
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl mb-6",
                  "border transition-all"
                )}
                style={{
                  background: isCompleted 
                    ? `${deptConfig.color}15`
                    : isInProgress
                      ? `${deptConfig.color}10`
                      : isAvailable
                        ? `${deptConfig.color}08`
                        : "hsl(var(--muted) / 0.3)",
                  borderColor: isLocked 
                    ? "hsl(var(--border))"
                    : `${deptConfig.color}40`
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {isLocked ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-muted-foreground">Locked</p>
                      <p className="text-sm text-muted-foreground">Complete prerequisites first</p>
                    </div>
                  </>
                ) : isCompleted ? (
                  <>
                    <motion.div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: deptConfig.color }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Check className="w-6 h-6 text-primary-foreground" strokeWidth={3} />
                    </motion.div>
                    <div>
                      <p className="font-bold" style={{ color: deptConfig.color }}>Completed!</p>
                      <p className="text-sm text-muted-foreground">
                        +{node.skillPoints} skill points earned
                      </p>
                    </div>
                  </>
                ) : isInProgress ? (
                  <>
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${deptConfig.color}20` }}
                    >
                      <BookOpen className="w-6 h-6" style={{ color: deptConfig.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold" style={{ color: deptConfig.color }}>In Progress</p>
                      <Progress value={45} className="h-2 mt-1" />
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${deptConfig.color}20` }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Play className="w-6 h-6 ml-0.5" style={{ color: deptConfig.color }} />
                    </motion.div>
                    <div>
                      <p className="font-bold" style={{ color: deptConfig.color }}>Ready to Start</p>
                      <p className="text-sm text-muted-foreground">Unlock {node.skillPoints} skill points</p>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {node.description}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.div 
                  className="p-4 bg-muted/30 rounded-xl text-center border border-border"
                  whileHover={{ scale: 1.02 }}
                >
                  <Award className="w-6 h-6 mx-auto mb-2" style={{ color: deptConfig.color }} />
                  <div className="text-2xl font-black text-foreground">{node.credits}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Credits</div>
                </motion.div>
                <motion.div 
                  className="p-4 bg-muted/30 rounded-xl text-center border border-border"
                  whileHover={{ scale: 1.02 }}
                >
                  <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-black text-foreground">{node.skillPoints}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Skill Points</div>
                </motion.div>
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
                        className="flex items-center gap-3 text-sm p-2 bg-muted/20 rounded-lg"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground font-medium">{prereq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action button */}
              {!isLocked && (
                <Button 
                  asChild
                  className="w-full h-12 text-base font-bold gap-2 group"
                  style={{
                    background: isCompleted ? "transparent" : deptConfig.color,
                    color: isCompleted ? deptConfig.color : "hsl(var(--primary-foreground))",
                    border: isCompleted ? `2px solid ${deptConfig.color}` : "none",
                  }}
                >
                  <Link to={node.courseCode ? `/course/${node.courseCode}` : "#"}>
                    {isCompleted ? "Review Course" : isInProgress ? "Continue Learning" : "Start Course"}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}

              {isLocked && (
                <div className="p-6 bg-muted/30 rounded-xl text-center border border-dashed border-border">
                  <Lock className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Complete the required courses to unlock this skill
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
