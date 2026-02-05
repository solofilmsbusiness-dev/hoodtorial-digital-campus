 import { useMemo } from "react";
 import { useUserProgress } from "@/hooks/useUserProgress";
 import { courses, departments } from "@/data/courses";
 import type { DegreePath } from "@/hooks/useSkillTree";
 
 export type LevelStatus = "locked" | "available" | "in_progress" | "complete";
 export type CourseStatus = "locked" | "available" | "in_progress" | "complete";
 
 export interface JourneyCourse {
   code: string;
   title: string;
   department: string;
   departmentId: string;
   departmentColor: string;
   credits: number;
   skillPoints: number;
   status: CourseStatus;
   progress: {
     lessonsCompleted: number;
     lessonsTotal: number;
     quizzesPassed: number;
     quizzesTotal: number;
     percentage: number;
   };
   prerequisites: string[];
 }
 
 export interface JourneyMilestone {
   id: string;
   type: "exam" | "project" | "capstone";
   title: string;
   description: string;
   status: "locked" | "available" | "complete";
   skillPoints: number;
   requiredCourses?: string[];
 }
 
 export interface JourneyLevel {
   id: string;
   name: string;
   number: number;
   status: LevelStatus;
   courses: JourneyCourse[];
   completedCount: number;
   totalCount: number;
   milestone?: JourneyMilestone;
 }
 
 interface JourneyData {
   levels: JourneyLevel[];
   pathName: string;
   totalCredits: number;
   earnedCredits: number;
   totalSkillPoints: number;
   earnedSkillPoints: number;
   completedCourses: number;
   totalCourses: number;
   currentLevel: number;
   rank: string;
   overallPercentage: number;
 }
 
 // Degree path configurations
 const pathConfigs: Record<DegreePath, { name: string; totalCredits: number; courseCodes: string[] }> = {
   associate: {
     name: "Associate of Film",
     totalCredits: 30,
     courseCodes: ["HU-101", "HU-102", "HU-103", "HU-104", "HU-105", "HU-106"],
   },
   bachelor: {
     name: "Bachelor of Film",
     totalCredits: 60,
     courseCodes: [
       "HU-101", "HU-102", "HU-103", "HU-104", "HU-105", "HU-106",
       "HU-201", "HU-202", "HU-203", "HU-204",
       "HU-301", "HU-302", "HU-303", "HU-304",
     ],
   },
   certificate: {
     name: "Certificate",
     totalCredits: 15,
     courseCodes: ["HU-101", "HU-102", "HU-201"],
   },
 };
 
 // Department color mapping
 const departmentColors: Record<string, string> = {
   cinematography: "hsl(var(--primary))",
   "post-production": "hsl(var(--neon-purple))",
   directing: "hsl(var(--accent))",
   production: "hsl(var(--neon-pink))",
   photography: "hsl(var(--neon-green))",
   "camera-systems": "hsl(var(--neon-blue))",
 };
 
 // Rank titles based on progress
 function getRank(percentage: number): string {
   if (percentage >= 100) return "MASTER FILMMAKER";
   if (percentage >= 80) return "SENIOR DIRECTOR";
   if (percentage >= 60) return "LEAD CREATIVE";
   if (percentage >= 40) return "ASSOCIATE PRODUCER";
   if (percentage >= 20) return "JUNIOR FILMMAKER";
   if (percentage >= 10) return "APPRENTICE";
   return "NEWCOMER";
 }
 
 export function useJourneyData(path: DegreePath): JourneyData {
   const { progress, getTotalCredits } = useUserProgress();
   const config = pathConfigs[path];
 
   // Get completed course codes from progress
   const completedCourseCodes = useMemo(() => {
     const completed = new Set<string>();
     progress.forEach((p) => {
       if (p.completed && p.lesson_id === null) {
         completed.add(p.course_code);
       }
     });
     return completed;
   }, [progress]);
 
   // Get in-progress course codes (have some progress but not completed)
   const inProgressCourseCodes = useMemo(() => {
     const inProgress = new Set<string>();
     progress.forEach((p) => {
       if (!p.completed && p.lesson_id !== null) {
         inProgress.add(p.course_code);
       }
     });
     // Remove completed ones
     completedCourseCodes.forEach((code) => inProgress.delete(code));
     return inProgress;
   }, [progress, completedCourseCodes]);
 
   // Build journey data
   const journeyData = useMemo(() => {
     // Group courses by level (100, 200, 300 series)
     const level100Codes = config.courseCodes.filter((c) => c.match(/HU-1/));
     const level200Codes = config.courseCodes.filter((c) => c.match(/HU-2/));
     const level300Codes = config.courseCodes.filter((c) => c.match(/HU-3/));
 
     // Helper to build course data
     const buildCourseData = (codes: string[], levelIndex: number): JourneyCourse[] => {
       return codes.map((code, index) => {
         const course = courses.find((c) => c.code === code);
         if (!course) {
           return {
             code,
             title: "Unknown Course",
             department: "Unknown",
             departmentId: "unknown",
             departmentColor: "hsl(var(--muted))",
             credits: 0,
             skillPoints: 0,
             status: "locked" as CourseStatus,
             progress: { lessonsCompleted: 0, lessonsTotal: 0, quizzesPassed: 0, quizzesTotal: 0, percentage: 0 },
             prerequisites: [],
           };
         }
 
         const isCompleted = completedCourseCodes.has(code);
         const isInProgress = inProgressCourseCodes.has(code);
 
         // Determine prerequisites (previous course in same level, or previous level completion)
         const prerequisites: string[] = [];
         if (index > 0) {
           prerequisites.push(codes[index - 1]);
         } else if (levelIndex > 0) {
           // First course in level needs previous level completed
           const prevLevel = levelIndex === 1 ? level100Codes : level200Codes;
           if (prevLevel.length > 0) {
             prerequisites.push(prevLevel[prevLevel.length - 1]);
           }
         }
 
         // Check if prerequisites are met
         const prereqsMet = prerequisites.every((p) => completedCourseCodes.has(p));
 
         let status: CourseStatus = "locked";
         if (isCompleted) {
           status = "complete";
         } else if (isInProgress) {
           status = "in_progress";
         } else if (prereqsMet || (levelIndex === 0 && index === 0)) {
           status = "available";
         }
 
         // Calculate lessons/quizzes from modules
         const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
         const totalQuizzes = course.modules.filter((m) => m.quiz).length + (course.finalExam ? 1 : 0);
 
         // For now, mock progress (in real app, fetch from progress table)
         const lessonsCompleted = isCompleted ? totalLessons : isInProgress ? Math.floor(totalLessons * 0.4) : 0;
         const quizzesPassed = isCompleted ? totalQuizzes : isInProgress ? Math.floor(totalQuizzes * 0.3) : 0;
         const percentage = isCompleted ? 100 : isInProgress ? 40 : 0;
 
         return {
           code,
           title: course.title,
           department: course.department,
           departmentId: course.departmentId,
           departmentColor: departmentColors[course.departmentId] || "hsl(var(--muted))",
           credits: course.credits,
           skillPoints: course.credits * 10,
           status,
           progress: {
             lessonsCompleted,
             lessonsTotal: totalLessons,
             quizzesPassed,
             quizzesTotal: totalQuizzes,
             percentage,
           },
           prerequisites,
         };
       });
     };
 
     // Build levels
     const levelConfigs = [
       { id: "level-1", name: "Foundations", number: 1, codes: level100Codes },
       { id: "level-2", name: "Intermediate", number: 2, codes: level200Codes },
       { id: "level-3", name: "Advanced", number: 3, codes: level300Codes },
     ];
 
     let earnedSP = 0;
     let totalSP = 0;
     let completedCount = 0;
 
     const levels: JourneyLevel[] = levelConfigs
       .map((levelConfig, levelIndex) => {
         if (levelConfig.codes.length === 0) return null;
 
         const levelCourses = buildCourseData(levelConfig.codes, levelIndex);
         const levelCompleted = levelCourses.filter((c) => c.status === "complete").length;
         const levelTotal = levelCourses.length;
 
         // Accumulate totals
         levelCourses.forEach((c) => {
           totalSP += c.skillPoints;
           if (c.status === "complete") {
             earnedSP += c.skillPoints;
             completedCount++;
           }
         });
 
         // Determine level status
         let levelStatus: LevelStatus = "locked";
         if (levelCompleted === levelTotal) {
           levelStatus = "complete";
         } else if (levelCourses.some((c) => c.status === "in_progress")) {
           levelStatus = "in_progress";
         } else if (levelCourses.some((c) => c.status === "available")) {
           levelStatus = "available";
         } else if (levelIndex === 0) {
           levelStatus = "available";
         }
 
         // Add milestone for each level
         let milestone: JourneyMilestone | undefined;
         if (levelIndex === 0 && path !== "certificate") {
           milestone = {
             id: "exam-1",
             type: "exam",
             title: "Scenario Exam 1",
             description: "Test your foundation skills with a real-world filmmaking challenge.",
             status: levelCompleted === levelTotal ? "available" : "locked",
             skillPoints: 50,
             requiredCourses: levelConfig.codes,
           };
         } else if (levelIndex === 1 && path === "bachelor") {
           milestone = {
             id: "exam-2",
             type: "exam",
             title: "Scenario Exam 2",
             description: "Demonstrate your intermediate proficiency with a complex scenario.",
             status: levelCompleted === levelTotal ? "available" : "locked",
             skillPoints: 75,
             requiredCourses: levelConfig.codes,
           };
         } else if (levelIndex === 2 && path === "bachelor") {
           milestone = {
             id: "capstone",
             type: "capstone",
             title: "Capstone Film",
             description: "Create your final masterpiece - a complete short film showcasing everything you've learned.",
             status: levelCompleted === levelTotal ? "available" : "locked",
             skillPoints: 200,
             requiredCourses: levelConfig.codes,
           };
         }
 
         return {
           id: levelConfig.id,
           name: levelConfig.name,
           number: levelConfig.number,
           status: levelStatus,
           courses: levelCourses,
           completedCount: levelCompleted,
           totalCount: levelTotal,
           milestone,
         };
       })
       .filter((l): l is NonNullable<typeof l> => l !== null) as JourneyLevel[];
 
     return {
       levels,
     };
   }, [config, completedCourseCodes, inProgressCourseCodes, getTotalCredits, path, progress]);
 
   const totalCourses = pathConfigs[path].courseCodes.length;
   const completedCourses = journeyData.levels.reduce((sum, l) => sum + l.completedCount, 0);
   const overallPercentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
   const totalSP = journeyData.levels.reduce((sum, l) => l.courses.reduce((s, c) => s + c.skillPoints, sum), 0);
   const earnedSP = journeyData.levels.reduce((sum, l) => l.courses.filter(c => c.status === "complete").reduce((s, c) => s + c.skillPoints, sum), 0);
   const currentLevel = journeyData.levels.find((l) => l.status !== "complete")?.number || journeyData.levels.length;
 
   return {
     levels: journeyData.levels,
     pathName: pathConfigs[path].name,
       totalCredits: config.totalCredits,
       earnedCredits: getTotalCredits(),
      totalSkillPoints: totalSP,
      earnedSkillPoints: earnedSP,
      completedCourses,
       totalCourses,
       currentLevel,
       rank: getRank(overallPercentage),
       overallPercentage,
   };
 }