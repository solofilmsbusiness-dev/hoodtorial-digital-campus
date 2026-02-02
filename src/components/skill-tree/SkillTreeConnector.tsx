import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { SkillNodeData } from "./SkillNode";

interface SkillTreeConnectorProps {
  fromNode: SkillNodeData;
  toNode: SkillNodeData;
  isActive: boolean;
}

export function SkillTreeConnector({ fromNode, toNode, isActive }: SkillTreeConnectorProps) {
  // Calculate the line path between two nodes
  const fromX = fromNode.position.x;
  const fromY = fromNode.position.y;
  const toX = toNode.position.x;
  const toY = toNode.position.y;

  // Calculate angle and distance
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Node radius offset (to start/end at node edges)
  const nodeRadius = 4; // percentage

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        "absolute h-1 origin-left",
        isActive 
          ? "bg-gradient-to-r from-primary to-primary/50" 
          : "bg-border"
      )}
      style={{
        left: `${fromX}%`,
        top: `${fromY}%`,
        width: `${distance - nodeRadius * 2}%`,
        transform: `rotate(${angle}deg) translateX(${nodeRadius}%)`,
        transformOrigin: "left center",
      }}
    >
      {/* Animated glow for active connections */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-primary/50 blur-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
