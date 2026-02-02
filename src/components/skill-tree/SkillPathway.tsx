import { motion } from "framer-motion";
import type { DepartmentConfig } from "@/hooks/useSkillTreeLayout";

interface SkillPathwayProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isActive: boolean;
  isCompleted: boolean;
  departmentConfig?: DepartmentConfig;
  index: number;
}

export function SkillPathway({ 
  fromX, 
  fromY, 
  toX, 
  toY, 
  isActive, 
  isCompleted,
  departmentConfig,
  index 
}: SkillPathwayProps) {
  // Calculate bezier curve control points
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  
  // Create a smooth curve - vertical connections curve outward, horizontal curve upward
  const isVertical = Math.abs(toY - fromY) > Math.abs(toX - fromX);
  const curvature = 30;
  
  let controlX1: number, controlY1: number, controlX2: number, controlY2: number;
  
  if (isVertical) {
    // For vertical paths, curve slightly horizontally
    controlX1 = fromX;
    controlY1 = fromY + (toY - fromY) * 0.3;
    controlX2 = toX;
    controlY2 = fromY + (toY - fromY) * 0.7;
  } else {
    // For horizontal paths, curve upward
    controlX1 = fromX + (toX - fromX) * 0.3;
    controlY1 = fromY - curvature;
    controlX2 = fromX + (toX - fromX) * 0.7;
    controlY2 = toY - curvature;
  }

  const pathD = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
  
  // Calculate path length for animation
  const pathLength = Math.sqrt(
    Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)
  ) * 1.2; // Approximate curve length

  const strokeColor = departmentConfig?.color || "hsl(var(--primary))";
  const glowColor = departmentConfig?.glowColor || "hsl(var(--primary) / 0.4)";

  return (
    <g>
      {/* Background glow for active/completed paths */}
      {(isActive || isCompleted) && (
        <motion.path
          d={pathD}
          fill="none"
          stroke={glowColor}
          strokeWidth={8}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          style={{ filter: "blur(8px)" }}
        />
      )}

      {/* Main path stroke */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={isCompleted 
          ? strokeColor 
          : isActive 
            ? strokeColor
            : "hsl(var(--border))"
        }
        strokeWidth={isCompleted ? 3 : 2}
        strokeLinecap="round"
        strokeDasharray={isActive && !isCompleted ? "8 4" : "none"}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: isCompleted ? 1 : isActive ? 0.8 : 0.3 
        }}
        transition={{ 
          duration: 0.8, 
          delay: index * 0.05,
          ease: "easeInOut"
        }}
      />

      {/* Animated energy flow for active paths */}
      {isActive && (
        <motion.circle
          r={4}
          fill={strokeColor}
          filter="url(#glow)"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            delay: index * 0.2,
          }}
          style={{
            offsetPath: `path('${pathD}')`,
          }}
        />
      )}

      {/* Completed path sparkle */}
      {isCompleted && (
        <>
          <motion.circle
            cx={midX}
            cy={midY - 5}
            r={3}
            fill={strokeColor}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 2,
              delay: index * 0.3,
            }}
          />
        </>
      )}
    </g>
  );
}

// SVG defs for glow filter
export function SkillPathwayDefs() {
  return (
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="pathGradientGold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--primary) / 0.5)" />
      </linearGradient>
      <linearGradient id="pathGradientPurple" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(var(--neon-purple))" />
        <stop offset="100%" stopColor="hsl(var(--neon-purple) / 0.5)" />
      </linearGradient>
      <linearGradient id="pathGradientCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(var(--accent))" />
        <stop offset="100%" stopColor="hsl(var(--accent) / 0.5)" />
      </linearGradient>
      <linearGradient id="pathGradientPink" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(var(--neon-pink))" />
        <stop offset="100%" stopColor="hsl(var(--neon-pink) / 0.5)" />
      </linearGradient>
    </defs>
  );
}
