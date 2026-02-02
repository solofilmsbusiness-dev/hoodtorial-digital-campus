import { cn } from "@/lib/utils";
import { Lock, Check, Star, Play } from "lucide-react";
import { motion } from "framer-motion";

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

interface SkillNodeProps {
  node: SkillNodeData;
  isSelected: boolean;
  onClick: (node: SkillNodeData) => void;
}

const nodeColors = {
  locked: {
    bg: "bg-muted/50",
    border: "border-border",
    icon: "text-muted-foreground/50",
  },
  available: {
    bg: "bg-card",
    border: "border-primary/50",
    icon: "text-primary",
  },
  "in-progress": {
    bg: "bg-primary/10",
    border: "border-primary",
    icon: "text-primary",
  },
  completed: {
    bg: "bg-primary",
    border: "border-primary",
    icon: "text-primary-foreground",
  },
};

const nodeTypeIcons = {
  course: Play,
  milestone: Star,
  capstone: Star,
};

export function SkillNode({ node, isSelected, onClick }: SkillNodeProps) {
  const colors = nodeColors[node.status];
  const Icon = nodeTypeIcons[node.type];
  const isLocked = node.status === "locked";
  const isCompleted = node.status === "completed";

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: Math.random() * 0.3 
      }}
      whileHover={!isLocked ? { scale: 1.05 } : undefined}
      whileTap={!isLocked ? { scale: 0.95 } : undefined}
      onClick={() => onClick(node)}
      className={cn(
        "absolute w-16 h-16 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 group",
        colors.bg,
        colors.border,
        isSelected && "ring-4 ring-primary/30 ring-offset-2 ring-offset-background",
        isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:shadow-lg hover:shadow-primary/20",
        node.type === "capstone" && "w-20 h-20 md:w-24 md:h-24 border-[6px]",
        node.type === "milestone" && "border-dashed"
      )}
      style={{
        left: `${node.position.x}%`,
        top: `${node.position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      disabled={isLocked}
    >
      {/* Glow effect for available/in-progress nodes */}
      {(node.status === "available" || node.status === "in-progress") && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Node icon */}
      <div className={cn("relative z-10", colors.icon)}>
        {isLocked ? (
          <Lock className="w-6 h-6 md:w-8 md:h-8" />
        ) : isCompleted ? (
          <Check className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
        ) : (
          <Icon className={cn(
            "w-6 h-6 md:w-8 md:h-8",
            node.type === "capstone" && "w-8 h-8 md:w-10 md:h-10"
          )} />
        )}
      </div>

      {/* Skill points badge */}
      {node.skillPoints > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className={cn(
            "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            isCompleted 
              ? "bg-accent text-accent-foreground" 
              : "bg-muted text-muted-foreground"
          )}
        >
          {node.skillPoints}
        </motion.div>
      )}

      {/* Node title tooltip */}
      <div className={cn(
        "absolute top-full mt-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20",
        "bg-popover text-popover-foreground border border-border shadow-lg"
      )}>
        {node.title}
      </div>
    </motion.button>
  );
}
