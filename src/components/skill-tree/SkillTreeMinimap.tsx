import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SkillNodeData } from "./SkillNodeHex";
import { departmentConfigs, type DepartmentId } from "@/hooks/useSkillTreeLayout";

interface SkillTreeMinimapProps {
  nodes: (SkillNodeData & { department?: DepartmentId })[];
  canvasWidth: number;
  canvasHeight: number;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
  scale: number;
  onNavigate: (x: number, y: number) => void;
}

export function SkillTreeMinimap({
  nodes,
  canvasWidth,
  canvasHeight,
  viewportX,
  viewportY,
  viewportWidth,
  viewportHeight,
  scale,
  onNavigate,
}: SkillTreeMinimapProps) {
  const minimapWidth = 160;
  const minimapHeight = 100;
  const scaleX = minimapWidth / canvasWidth;
  const scaleY = minimapHeight / canvasHeight;

  // Calculate viewport rectangle in minimap coordinates
  const vpX = Math.max(0, (-viewportX / scale) * scaleX);
  const vpY = Math.max(0, (-viewportY / scale) * scaleY);
  const vpW = Math.min(minimapWidth - vpX, (viewportWidth / scale) * scaleX);
  const vpH = Math.min(minimapHeight - vpY, (viewportHeight / scale) * scaleY);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / scaleX;
    const clickY = (e.clientY - rect.top) / scaleY;
    
    // Center the viewport on the clicked position
    const newX = -(clickX - viewportWidth / scale / 2) * scale;
    const newY = -(clickY - viewportHeight / scale / 2) * scale;
    
    onNavigate(newX, newY);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="absolute bottom-4 right-4 z-20"
    >
      <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-2 shadow-lg">
        <svg
          width={minimapWidth}
          height={minimapHeight}
          className="cursor-pointer"
          onClick={handleClick}
        >
          {/* Background */}
          <rect
            width={minimapWidth}
            height={minimapHeight}
            fill="hsl(var(--muted) / 0.5)"
            rx={4}
          />

          {/* Department lanes preview */}
          {["cinematography", "post-production", "directing", "production"].map((dept, i) => {
            const config = departmentConfigs[dept as DepartmentId];
            const laneX = (60 + i * 260) * scaleX;
            const laneW = 220 * scaleX;
            return (
              <rect
                key={dept}
                x={laneX}
                y={4}
                width={laneW}
                height={minimapHeight - 8}
                fill={config.bgColor}
                rx={2}
                opacity={0.5}
              />
            );
          })}

          {/* Nodes as dots */}
          {nodes.map((node) => {
            const x = node.position.x * scaleX;
            const y = node.position.y * scaleY;
            const deptConfig = node.department 
              ? departmentConfigs[node.department] 
              : departmentConfigs.cinematography;
            
            return (
              <circle
                key={node.id}
                cx={x}
                cy={y}
                r={node.type === "capstone" ? 4 : node.status === "completed" ? 3 : 2}
                fill={
                  node.status === "completed" 
                    ? deptConfig.color 
                    : node.status === "locked" 
                      ? "hsl(var(--muted-foreground) / 0.3)"
                      : deptConfig.color
                }
                opacity={node.status === "locked" ? 0.3 : 0.8}
              />
            );
          })}

          {/* Viewport indicator */}
          <rect
            x={vpX}
            y={vpY}
            width={vpW}
            height={vpH}
            fill="hsl(var(--primary) / 0.2)"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            rx={2}
            className="pointer-events-none"
          />
        </svg>
        
        <p className="text-[9px] text-muted-foreground text-center mt-1 font-medium">
          Click to navigate
        </p>
      </div>
    </motion.div>
  );
}
