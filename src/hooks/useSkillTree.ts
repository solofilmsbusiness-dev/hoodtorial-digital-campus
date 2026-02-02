import { useMemo } from "react";
import { useUserProgress } from "@/hooks/useUserProgress";
import { courses, departments } from "@/data/courses";
import type { SkillNodeData, NodeStatus } from "@/components/skill-tree/SkillNode";

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

// Generate skill tree layout positions
function generateNodePositions(courseCodes: string[], hasMilestones: boolean, hasCapstone: boolean): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const totalCourses = courseCodes.length;
  
  // Create a tree-like structure
  // Row 1: Foundation courses (first 2-3)
  // Row 2: Core courses
  // Row 3: Advanced courses
  // Row 4: Milestones/Projects
  // Row 5: Capstone

  const rows: string[][] = [];
  
  if (totalCourses <= 3) {
    rows.push(courseCodes);
  } else if (totalCourses <= 6) {
    rows.push(courseCodes.slice(0, 2));
    rows.push(courseCodes.slice(2, 4));
    if (courseCodes.length > 4) rows.push(courseCodes.slice(4));
  } else {
    // For larger trees (bachelor's)
    rows.push(courseCodes.slice(0, 2));  // Foundation
    rows.push(courseCodes.slice(2, 5));  // Early core
    rows.push(courseCodes.slice(5, 8));  // Mid core
    rows.push(courseCodes.slice(8, 11)); // Advanced
    if (courseCodes.length > 11) rows.push(courseCodes.slice(11)); // Expert
  }

  const rowCount = rows.length + (hasMilestones ? 1 : 0) + (hasCapstone ? 1 : 0);
  const verticalSpacing = 80 / (rowCount + 1);

  rows.forEach((row, rowIndex) => {
    const horizontalSpacing = 80 / (row.length + 1);
    row.forEach((code, colIndex) => {
      positions.set(code, {
        x: 10 + horizontalSpacing * (colIndex + 1),
        y: 10 + verticalSpacing * (rowIndex + 1),
      });
    });
  });

  // Add milestone positions
  if (hasMilestones) {
    const milestoneY = 10 + verticalSpacing * (rows.length + 1);
    positions.set("scenario-exam-1", { x: 30, y: milestoneY });
    positions.set("scenario-exam-2", { x: 50, y: milestoneY });
    positions.set("scenario-exam-3", { x: 70, y: milestoneY });
    positions.set("project-1", { x: 20, y: milestoneY + 8 });
    positions.set("project-2", { x: 40, y: milestoneY + 8 });
    positions.set("project-3", { x: 60, y: milestoneY + 8 });
    positions.set("project-4", { x: 80, y: milestoneY + 8 });
    positions.set("project-5", { x: 35, y: milestoneY + 16 });
    positions.set("project-6", { x: 65, y: milestoneY + 16 });
  }

  // Add capstone position
  if (hasCapstone) {
    positions.set("capstone-film", { x: 50, y: 90 });
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
        status: completedNodes >= 2 ? "available" : "locked",
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
        status: completedNodes >= config.courseCodes.length ? "available" : "locked",
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
