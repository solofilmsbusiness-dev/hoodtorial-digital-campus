import { useMemo } from "react";
import type { SkillNodeData } from "@/components/skill-tree/SkillNodeHex";

export type DepartmentId = "cinematography" | "post-production" | "directing" | "production";

export interface DepartmentConfig {
  id: DepartmentId;
  name: string;
  color: string;
  glowColor: string;
  bgColor: string;
}

export const departmentConfigs: Record<DepartmentId, DepartmentConfig> = {
  cinematography: {
    id: "cinematography",
    name: "Cinematography",
    color: "hsl(var(--primary))",
    glowColor: "hsl(var(--primary) / 0.4)",
    bgColor: "hsl(var(--primary) / 0.05)",
  },
  "post-production": {
    id: "post-production",
    name: "Post-Production",
    color: "hsl(var(--neon-purple))",
    glowColor: "hsl(var(--neon-purple) / 0.4)",
    bgColor: "hsl(var(--neon-purple) / 0.05)",
  },
  directing: {
    id: "directing",
    name: "Directing",
    color: "hsl(var(--accent))",
    glowColor: "hsl(var(--accent) / 0.4)",
    bgColor: "hsl(var(--accent) / 0.05)",
  },
  production: {
    id: "production",
    name: "Production",
    color: "hsl(var(--neon-pink))",
    glowColor: "hsl(var(--neon-pink) / 0.4)",
    bgColor: "hsl(var(--neon-pink) / 0.05)",
  },
};

export const departmentOrder: DepartmentId[] = [
  "cinematography",
  "post-production",
  "directing",
  "production",
];

interface LayoutNode extends SkillNodeData {
  department: DepartmentId;
  laneIndex: number;
  levelIndex: number;
}

interface LayoutResult {
  nodes: LayoutNode[];
  canvasWidth: number;
  canvasHeight: number;
  laneWidth: number;
  levelHeight: number;
}

// Map course codes to their departments
const courseDepartmentMap: Record<string, DepartmentId> = {
  "HU-101": "cinematography",
  "HU-102": "cinematography",
  "HU-201": "cinematography",
  "HU-301": "cinematography",
  "HU-103": "post-production",
  "HU-104": "post-production",
  "HU-202": "post-production",
  "HU-302": "post-production",
  "HU-105": "directing",
  "HU-203": "directing",
  "HU-303": "directing",
  "HU-106": "production",
  "HU-204": "production",
  "HU-304": "production",
};

// Get level from course code (1xx = level 0, 2xx = level 1, 3xx = level 2)
function getCourseLevel(code: string): number {
  const match = code.match(/HU-(\d)/);
  if (match) {
    return parseInt(match[1]) - 1;
  }
  return 0;
}

export function useSkillTreeLayout(nodes: SkillNodeData[]): LayoutResult {
  return useMemo(() => {
    const laneWidth = 220;
    const levelHeight = 160;
    const headerOffset = 80;
    const laneGap = 40;
    const nodeSize = 80;
    
    // Group nodes by department and level
    const departmentNodes: Record<DepartmentId, Record<number, SkillNodeData[]>> = {
      cinematography: { 0: [], 1: [], 2: [] },
      "post-production": { 0: [], 1: [], 2: [] },
      directing: { 0: [], 1: [], 2: [] },
      production: { 0: [], 1: [], 2: [] },
    };

    // Separate courses from special nodes
    const courseNodes: SkillNodeData[] = [];
    const milestoneNodes: SkillNodeData[] = [];
    const capstoneNode = nodes.find(n => n.type === "capstone");

    nodes.forEach(node => {
      if (node.type === "course" && node.courseCode) {
        courseNodes.push(node);
        const dept = courseDepartmentMap[node.courseCode];
        const level = getCourseLevel(node.courseCode);
        if (dept && departmentNodes[dept]) {
          departmentNodes[dept][level]?.push(node);
        }
      } else if (node.type === "milestone") {
        milestoneNodes.push(node);
      }
    });

    // Calculate positions for each node
    const layoutNodes: LayoutNode[] = [];

    // Position course nodes in department lanes
    departmentOrder.forEach((deptId, laneIndex) => {
      const laneX = laneIndex * (laneWidth + laneGap) + laneWidth / 2 + 60;
      
      [0, 1, 2].forEach(level => {
        const nodesAtLevel = departmentNodes[deptId][level] || [];
        nodesAtLevel.forEach((node, nodeIndex) => {
          const y = headerOffset + level * levelHeight + levelHeight / 2;
          const xOffset = nodesAtLevel.length > 1 
            ? (nodeIndex - (nodesAtLevel.length - 1) / 2) * (nodeSize + 20)
            : 0;
          
          layoutNodes.push({
            ...node,
            department: deptId,
            laneIndex,
            levelIndex: level,
            position: {
              x: laneX + xOffset,
              y,
            },
          });
        });
      });
    });

    // Position milestone nodes at the bottom of each department
    const milestoneY = headerOffset + 3 * levelHeight + 40;
    milestoneNodes.forEach((node, index) => {
      const laneIndex = index % departmentOrder.length;
      const laneX = laneIndex * (laneWidth + laneGap) + laneWidth / 2 + 60;
      
      layoutNodes.push({
        ...node,
        department: departmentOrder[laneIndex],
        laneIndex,
        levelIndex: 3,
        position: {
          x: laneX,
          y: milestoneY,
        },
      });
    });

    // Position capstone at the center bottom
    if (capstoneNode) {
      const totalWidth = departmentOrder.length * (laneWidth + laneGap) - laneGap;
      layoutNodes.push({
        ...capstoneNode,
        department: "cinematography", // Default, but styled differently
        laneIndex: 2,
        levelIndex: 4,
        position: {
          x: totalWidth / 2 + 60,
          y: milestoneY + levelHeight,
        },
      });
    }

    const canvasWidth = departmentOrder.length * (laneWidth + laneGap) + 120;
    const canvasHeight = headerOffset + 5 * levelHeight + 80;

    return {
      nodes: layoutNodes,
      canvasWidth,
      canvasHeight,
      laneWidth,
      levelHeight,
    };
  }, [nodes]);
}
