import { cn } from "@/lib/utils";
import { Lock, Check, Star, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { DepartmentId, DepartmentConfig } from "@/hooks/useSkillTreeLayout";

export type NodeStatus = "locked" | "available" | "in-progress" | "completed";
export type NodeType = "course" | "milestone" | "capstone";

export interface SkillNodeData {
  id: string;
  title: string;
  description: string;
  type: NodeType;
  status: NodeStatus;
  credits: number;
  skillPoints: number;
  courseCode?: string;
  prerequisites?: string[];
  position: { x: number; y: number };
}

interface SkillNodeHexProps {
  node: SkillNodeData & { department?: DepartmentId };
  departmentConfig?: DepartmentConfig;
  isSelected: boolean;
  onClick: (node: SkillNodeData) => void;
}

export function SkillNodeHex({ node, departmentConfig, isSelected, onClick }: SkillNodeHexProps) {
  const isLocked = node.status === "locked";
  const isCompleted = node.status === "completed";
  const isAvailable = node.status === "available";
  const isInProgress = node.status === "in-progress";
  const isCapstone = node.type === "capstone";
  const isMilestone = node.type === "milestone";

  // Size based on node type
  const sizeClass = isCapstone 
    ? "w-24 h-24 md:w-28 md:h-28" 
    : isMilestone 
      ? "w-18 h-18 md:w-20 md:h-20"
      : "w-16 h-16 md:w-20 md:h-20";

  // Get department color or fallback to primary
  const nodeColor = departmentConfig?.color || "hsl(var(--primary))";
  const glowColor = departmentConfig?.glowColor || "hsl(var(--primary) / 0.4)";

  return (
    // Outer wrapper - handles positioning, NOT clipped
    <div
      className="absolute"
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Main interactive button with visual shape */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: Math.random() * 0.3 
        }}
        whileHover={!isLocked ? { scale: 1.1, rotate: 5 } : undefined}
        whileTap={!isLocked ? { scale: 0.95 } : undefined}
        onClick={() => onClick(node)}
        className={cn(
          "relative flex items-center justify-center transition-all duration-300 group",
          sizeClass,
          // Hexagon clip path for courses, circle for milestones, star for capstone
          node.type === "course" && "hex-node",
          node.type === "milestone" && "rounded-full",
          node.type === "capstone" && "capstone-node",
          // Selected state
          isSelected && "ring-4 ring-offset-2 ring-offset-background z-10",
          // Locked state
          isLocked && "grayscale opacity-50 cursor-not-allowed",
          !isLocked && "cursor-pointer"
        )}
        style={{
          // Dynamic colors based on department and status
          background: isCompleted 
            ? nodeColor
            : isInProgress
              ? `linear-gradient(135deg, ${nodeColor}20, ${nodeColor}40)`
              : isAvailable
                ? `linear-gradient(135deg, hsl(var(--card)), hsl(var(--card)))`
                : "hsl(var(--muted) / 0.5)",
          borderWidth: isCapstone ? 4 : 3,
          borderStyle: isMilestone ? "dashed" : "solid",
          borderColor: isLocked 
            ? "hsl(var(--border))" 
            : isCompleted 
              ? nodeColor 
              : isInProgress || isAvailable
                ? nodeColor
                : "hsl(var(--border))",
          boxShadow: isCompleted 
            ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`
            : isInProgress || isAvailable
              ? `0 0 20px ${glowColor}`
              : "none",
          ...(isSelected && { 
            ringColor: nodeColor,
          }),
        }}
        disabled={isLocked}
      >
        {/* Animated pulse for available/in-progress nodes */}
        {(isAvailable || isInProgress) && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ 
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` 
            }}
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.6, 0, 0.6] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        )}

        {/* Progress ring for in-progress nodes */}
        {isInProgress && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="3"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke={nodeColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 * 0.55 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
        )}

        {/* Node icon */}
        <div className={cn(
          "relative z-10 flex items-center justify-center",
          isCompleted 
            ? "text-primary-foreground" 
            : isLocked 
              ? "text-muted-foreground/50" 
              : "text-foreground"
        )}>
          {isLocked ? (
            <Lock className={cn(
              "w-6 h-6",
              isCapstone && "w-8 h-8"
            )} />
          ) : isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <Check className={cn(
                "w-6 h-6",
                isCapstone && "w-8 h-8"
              )} strokeWidth={3} />
            </motion.div>
          ) : isCapstone ? (
            <Sparkles className="w-8 h-8" />
          ) : isMilestone ? (
            <Star className="w-6 h-6" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </div>

        {/* Unlock particles effect for newly available */}
        {isAvailable && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ 
                  background: nodeColor,
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 60],
                  y: [0, (Math.random() - 0.5) * 60],
                  opacity: [1, 0],
                  scale: [0, 1],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.button>

      {/* Skill points badge - OUTSIDE the clipped button */}
      {node.skillPoints > 0 && (
        <motion.div
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ 
            delay: 0.5, 
            type: "spring",
            stiffness: 400,
            damping: 15
          }}
          className={cn(
            "absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-black flex items-center gap-0.5 z-20",
            isCompleted 
              ? "bg-accent text-accent-foreground animate-sp-pop" 
              : "bg-muted text-muted-foreground"
          )}
        >
          <span>{node.skillPoints}</span>
          <span className="text-[8px] opacity-70">SP</span>
        </motion.div>
      )}

      {/* Course code badge - OUTSIDE the clipped button */}
      {node.courseCode && (
        <div 
          className={cn(
            "absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap z-20",
            "bg-background/80 backdrop-blur-sm border border-border"
          )}
          style={{ color: isCompleted || isInProgress ? nodeColor : "inherit" }}
        >
          {node.courseCode}
        </div>
      )}

      {/* Hover tooltip with title - OUTSIDE the clipped button */}
      <div className={cn(
        "absolute top-full mt-8 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap z-30",
        "opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none",
        "bg-popover/95 backdrop-blur-sm text-popover-foreground border border-border shadow-xl",
        "max-w-[180px] truncate"
      )}>
        {node.title}
      </div>
    </div>
  );
}
