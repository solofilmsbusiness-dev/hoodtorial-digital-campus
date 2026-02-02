import { useMemo } from "react";
import { useUserProgress } from "@/hooks/useUserProgress";
import { courses, departments } from "@/data/courses";
import type { SkillNodeData, NodeStatus } from "@/components/skill-tree/SkillNodeHex";

export type DegreePath = "associate" | "bachelor" | "certificate";

interface SkillTreeConnection {
  from: string;
  to: string;
}

interface SkillTreeData {
  nodes: SkillNodeData[];
  connections: SkillTreeConnection[];
  pathName: string;
  totalCredits: number;
  earnedCredits: number;
  totalSkillPoints: number;
  earnedSkillPoints: number;
  completedNodes: number;
  totalNodes: number;
}

// Define the curriculum structure for each path
interface PathConfig {
  name: string;
  totalCredits: number;
  courseCodes: string[];
  milestones: string[];
  projects: string[];
  capstone?: string;
}

const pathConfigs: Record<DegreePath, PathConfig> = {
  associate: {
    name: "Associate of Film",
    totalCredits: 30,
    courseCodes: ["HU-101", "HU-102", "HU-103", "HU-104", "HU-105", "HU-106"],
    milestones: ["scenario-exam-1"],
    projects: ["project-1", "project-2"],
  },
  bachelor: {
    name: "Bachelor of Film",
    totalCredits: 60,
    courseCodes: [
      // Cinematography
      "HU-101", "HU-102", "HU-201", "HU-301",
      // Post-Production
      "HU-103", "HU-104", "HU-202", "HU-302",
      // Directing
      "HU-105", "HU-203", "HU-303",
      // Production
      "HU-106", "HU-204", "HU-304",
    ],
    milestones: ["scenario-exam-1", "scenario-exam-2", "scenario-exam-3"],
    projects: ["project-1", "project-2", "project-3", "project-4", "project-5", "project-6"],
    capstone: "capstone-film",
  },
  certificate: {
    name: "Certificate",
    totalCredits: 15,
    courseCodes: ["HU-101", "HU-102", "HU-201"],
    milestones: [],
    projects: ["project-1"],
  },
};

// Generate skill tree layout positions - organized by department for visual clarity
function generateNodePositions(courseCodes: string[], hasMilestones: boolean, hasCapstone: boolean): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  
  // Group courses by their level (100, 200, 300 series)
  const level100: string[] = [];
  const level200: string[] = [];
  const level300: string[] = [];
  
  courseCodes.forEach((code) => {
    const levelMatch = code.match(/HU-(\d)/);
    if (levelMatch) {
      const level = parseInt(levelMatch[1]);
      if (level === 1) level100.push(code);
      else if (level === 2) level200.push(code);
      else if (level === 3) level300.push(code);
    }
  });

  // Position nodes in a clear grid layout
  // Row 1: Level 100 courses (foundation)
  // Row 2: Level 200 courses (intermediate)
  // Row 3: Level 300 courses (advanced)
  // Row 4: Milestones and Projects
  // Row 5: Capstone

  const rowY = {
    level100: 15,
    level200: 35,
    level300: 55,
    milestones: 75,
    capstone: 90,
  };

  // Position level 100 courses
  level100.forEach((code, index) => {
    const spacing = 80 / (level100.length + 1);
    positions.set(code, {
      x: 10 + spacing * (index + 1),
      y: rowY.level100,
    });
  });

  // Position level 200 courses
  level200.forEach((code, index) => {
    const spacing = 80 / (level200.length + 1);
    positions.set(code, {
      x: 10 + spacing * (index + 1),
      y: rowY.level200,
    });
  });

  // Position level 300 courses
  level300.forEach((code, index) => {
    const spacing = 80 / (level300.length + 1);
    positions.set(code, {
      x: 10 + spacing * (index + 1),
      y: rowY.level300,
    });
  });

  // Add milestone positions
  if (hasMilestones) {
    positions.set("scenario-exam-1", { x: 25, y: rowY.milestones });
    positions.set("scenario-exam-2", { x: 50, y: rowY.milestones });
    positions.set("scenario-exam-3", { x: 75, y: rowY.milestones });
    positions.set("project-1", { x: 15, y: rowY.milestones + 8 });
    positions.set("project-2", { x: 30, y: rowY.milestones + 8 });
    positions.set("project-3", { x: 45, y: rowY.milestones + 8 });
    positions.set("project-4", { x: 60, y: rowY.milestones + 8 });
    positions.set("project-5", { x: 75, y: rowY.milestones + 8 });
    positions.set("project-6", { x: 90, y: rowY.milestones + 8 });
  }

  // Add capstone position
  if (hasCapstone) {
    positions.set("capstone-film", { x: 50, y: rowY.capstone });
  }

  return positions;
}

export function useSkillTree(path: DegreePath): SkillTreeData {
  const { progress, getTotalCredits } = useUserProgress();
  const config = pathConfigs[path];

  const completedCourseCodes = useMemo(() => {
    const completed = new Set<string>();
    progress.forEach((p) => {
      if (p.completed && p.lesson_id === null) {
        completed.add(p.course_code);
      }
    });
    return completed;
  }, [progress]);

  const { nodes, connections, earnedSkillPoints, completedNodes } = useMemo(() => {
    const positions = generateNodePositions(
      config.courseCodes,
      (config.milestones?.length ?? 0) > 0,
      !!config.capstone
    );

    const nodeList: SkillNodeData[] = [];
    const connectionList: SkillTreeConnection[] = [];
    let totalSP = 0;
    let completedCount = 0;

    // Create course nodes
    config.courseCodes.forEach((code, index) => {
      const course = courses.find((c) => c.code === code);
      if (!course) return;

      const isCompleted = completedCourseCodes.has(code);
      const prereqIndex = index > 0 ? index - 1 : -1;
      const prereqCompleted = prereqIndex < 0 || completedCourseCodes.has(config.courseCodes[prereqIndex]);
      
      let status: NodeStatus = "locked";
      if (isCompleted) {
        status = "completed";
        completedCount++;
      } else if (prereqCompleted) {
        status = index === 0 ? "available" : "available";
      }

      const skillPoints = course.credits * 10;
      if (isCompleted) totalSP += skillPoints;

      const pos = positions.get(code) || { x: 50, y: 50 };

      nodeList.push({
        id: code,
        title: course.title,
        description: course.description,
        type: "course",
        status,
        credits: course.credits,
        skillPoints,
        courseCode: code,
        prerequisites: prereqIndex >= 0 ? [config.courseCodes[prereqIndex]] : undefined,
        position: pos,
      });

      // Create connections
      if (prereqIndex >= 0) {
        connectionList.push({
          from: config.courseCodes[prereqIndex],
          to: code,
        });
      }
    });

    // Create milestone nodes
    config.milestones?.forEach((milestoneId, index) => {
      const pos = positions.get(milestoneId) || { x: 50, y: 70 };
      const prereqCount = Math.floor(config.courseCodes.length / 3);
      const prereqIndex = (index + 1) * prereqCount - 1;
      const prereqCode = config.courseCodes[prereqIndex];
      const prereqCompleted = prereqCode ? completedCourseCodes.has(prereqCode) : false;

      nodeList.push({
        id: milestoneId,
        title: `Scenario Exam ${index + 1}`,
        description: "Test your skills with a real-world filmmaking scenario challenge.",
        type: "milestone",
        status: prereqCompleted ? "available" : "locked",
        credits: 3,
        skillPoints: 50,
        prerequisites: prereqCode ? [prereqCode] : undefined,
        position: pos,
      });

      if (prereqCode) {
        connectionList.push({
          from: prereqCode,
          to: milestoneId,
        });
      }
    });

    // Create project nodes
    config.projects?.forEach((projectId, index) => {
      const pos = positions.get(projectId) || { x: 30 + index * 15, y: 80 };
      
      nodeList.push({
        id: projectId,
        title: `Project ${index + 1}`,
        description: "Hands-on practical project to demonstrate your skills.",
        type: "milestone",
        status: completedCount >= 2 ? "available" : "locked",
        credits: 2,
        skillPoints: 30,
        position: pos,
      });
    });

    // Create capstone node
    if (config.capstone) {
      const pos = positions.get(config.capstone) || { x: 50, y: 90 };
      
      nodeList.push({
        id: config.capstone,
        title: "Capstone Film",
        description: "Your final masterpiece. Create a complete short film showcasing everything you've learned.",
        type: "capstone",
        status: completedCount >= config.courseCodes.length ? "available" : "locked",
        credits: 10,
        skillPoints: 200,
        position: pos,
      });

      // Connect last courses to capstone
      const lastCourses = config.courseCodes.slice(-2);
      lastCourses.forEach((code) => {
        connectionList.push({
          from: code,
          to: config.capstone!,
        });
      });
    }

    return {
      nodes: nodeList,
      connections: connectionList,
      earnedSkillPoints: totalSP,
      completedNodes: completedCount,
    };
  }, [config, completedCourseCodes, progress]);

  const totalSkillPoints = nodes.reduce((sum, node) => sum + node.skillPoints, 0);

  return {
    nodes,
    connections,
    pathName: config.name,
    totalCredits: config.totalCredits,
    earnedCredits: getTotalCredits(),
    totalSkillPoints,
    earnedSkillPoints,
    completedNodes,
    totalNodes: nodes.length,
  };
}
