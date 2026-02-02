import { motion } from "framer-motion";
import type { DepartmentConfig } from "@/hooks/useSkillTreeLayout";

interface DepartmentLaneProps {
  config: DepartmentConfig;
  index: number;
  laneWidth: number;
  laneGap: number;
  height: number;
}

export function DepartmentLane({ 
  config, 
  index, 
  laneWidth, 
  laneGap,
  height 
}: DepartmentLaneProps) {
  const x = index * (laneWidth + laneGap) + 60;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Lane background gradient */}
      <defs>
        <linearGradient 
          id={`lane-gradient-${config.id}`} 
          x1="0%" 
          y1="0%" 
          x2="0%" 
          y2="100%"
        >
          <stop offset="0%" stopColor={config.bgColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor={config.bgColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={config.bgColor} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Lane background */}
      <rect
        x={x}
        y={40}
        width={laneWidth}
        height={height - 80}
        rx={12}
        fill={`url(#lane-gradient-${config.id})`}
        className="transition-all duration-500"
      />

      {/* Lane border accent */}
      <rect
        x={x}
        y={40}
        width={laneWidth}
        height={height - 80}
        rx={12}
        fill="none"
        stroke={config.color}
        strokeWidth={1}
        strokeOpacity={0.2}
      />

      {/* Lane header */}
      <g transform={`translate(${x + laneWidth / 2}, 25)`}>
        {/* Department name */}
        <text
          textAnchor="middle"
          fill={config.color}
          fontSize="11"
          fontWeight="800"
          letterSpacing="0.1em"
          style={{ fontFamily: "Inter, system-ui, sans-serif", textTransform: "uppercase" as const }}
        >
          {config.name.toUpperCase()}
        </text>
        
        {/* Underline accent */}
        <motion.rect
          x={-40}
          y={6}
          width={80}
          height={2}
          rx={1}
          fill={config.color}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          style={{ transformOrigin: "center" }}
        />
      </g>

      {/* Level indicators on the side */}
      {[0, 1, 2].map((level) => (
        <g 
          key={level} 
          transform={`translate(${x + 10}, ${80 + level * 160 + 80})`}
        >
          <text
            fill="hsl(var(--muted-foreground))"
            fontSize="9"
            fontWeight="600"
            opacity={0.5}
            style={{ fontFamily: "monospace" }}
          >
            {level === 0 ? "100" : level === 1 ? "200" : "300"}
          </text>
        </g>
      ))}

      {/* Decorative corner accents */}
      <motion.path
        d={`M ${x + 2} ${50} L ${x + 2} ${46} L ${x + 12} ${46}`}
        stroke={config.color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
      />
      <motion.path
        d={`M ${x + laneWidth - 2} ${50} L ${x + laneWidth - 2} ${46} L ${x + laneWidth - 12} ${46}`}
        stroke={config.color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
      />
    </motion.g>
  );
}
