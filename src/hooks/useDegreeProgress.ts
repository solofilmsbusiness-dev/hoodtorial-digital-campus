 import { useState, useEffect, useMemo } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import type { DegreePath, CertificateDepartment } from "./useDegreeSelection";
 
 // Degree requirements configuration
 export const DEGREE_REQUIREMENTS = {
   associate: {
     name: "Associate of Film",
     credits: 30,
     courses: 6,
     quizzes: 6,
     exams: 1,
     projects: 2,
     capstone: false,
     duration: "3-6 months",
     description: "Foundation in mobile filmmaking. Perfect for beginners who want to build a solid base.",
   },
   bachelor: {
     name: "Bachelor of Film",
     credits: 60,
     courses: 14,
     quizzes: 12,
     exams: 3,
     projects: 6,
     capstone: true,
     duration: "6-12 months",
     description: "Complete mastery of filmmaking craft. For creators ready to go pro.",
   },
   certificate: {
     name: "Certificate",
     credits: 15,
     courses: 4,
     quizzes: 4,
     exams: 0,
     projects: 1,
     capstone: false,
     duration: "1-3 months",
     description: "Focused specialization in one department. Quick credentials for specific skills.",
   },
 } as const;
 
 // Department configurations for certificate
 export const DEPARTMENT_CONFIG = {
   cinematography: {
     name: "Cinematography",
     color: "primary", // gold
     courses: ["HU-101", "HU-102", "HU-201", "HU-301"],
     credits: 17,
   },
   "post-production": {
     name: "Post-Production",
     color: "neon-purple",
     courses: ["HU-103", "HU-104", "HU-202", "HU-302"],
     credits: 16,
   },
   directing: {
     name: "Directing",
     color: "neon-cyan",
     courses: ["HU-105", "HU-203", "HU-303"],
     credits: 13,
   },
   production: {
     name: "Production",
     color: "neon-pink",
     courses: ["HU-106", "HU-204", "HU-304"],
     credits: 12,
   },
 } as const;
 
 interface DegreeProgress {
   completedCourses: number;
   completedQuizzes: number;
   completedExams: number;
   completedProjects: number;
   earnedCredits: number;
   percentage: number;
   loading: boolean;
 }
 
 export function useDegreeProgress(
   degreePath: DegreePath,
   certificateDepartment: CertificateDepartment
 ): DegreeProgress {
   const { user } = useAuth();
   const [completedCourses, setCompletedCourses] = useState(0);
   const [completedQuizzes, setCompletedQuizzes] = useState(0);
   const [earnedCredits, setEarnedCredits] = useState(0);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (!user || !degreePath) {
       setCompletedCourses(0);
       setCompletedQuizzes(0);
       setEarnedCredits(0);
       setLoading(false);
       return;
     }
 
     const fetchProgress = async () => {
       setLoading(true);
       try {
         // Get completed enrollments
         const { data: enrollments } = await supabase
           .from("enrollments")
           .select("course_code, completed_at")
           .eq("user_id", user.id)
           .eq("status", "completed");
 
         // Get passed quizzes
         const { data: quizResults } = await supabase
           .from("quiz_results")
           .select("quiz_id, passed")
           .eq("user_id", user.id)
           .eq("passed", true);
 
         // Get credits earned
         const { data: progress } = await supabase
           .from("user_progress")
           .select("credits_earned")
           .eq("user_id", user.id);
 
         // Filter by department for certificate
         let relevantCourses = enrollments || [];
         if (degreePath === "certificate" && certificateDepartment) {
           const deptConfig = DEPARTMENT_CONFIG[certificateDepartment];
           relevantCourses = (enrollments || []).filter((e) =>
             (deptConfig.courses as readonly string[]).includes(e.course_code)
           );
         }
 
         const uniqueQuizzes = new Set((quizResults || []).map((q) => q.quiz_id));
         const totalCredits = (progress || []).reduce((sum, p) => sum + (p.credits_earned || 0), 0);
 
         setCompletedCourses(relevantCourses.length);
         setCompletedQuizzes(uniqueQuizzes.size);
         setEarnedCredits(totalCredits);
       } catch (err) {
         console.error("Failed to fetch degree progress:", err);
       } finally {
         setLoading(false);
       }
     };
 
     fetchProgress();
   }, [user, degreePath, certificateDepartment]);
 
   const requirements = degreePath ? DEGREE_REQUIREMENTS[degreePath] : null;
 
   const percentage = useMemo(() => {
     if (!requirements) return 0;
 
     const courseWeight = 0.4;
     const quizWeight = 0.3;
     const creditWeight = 0.3;
 
     const courseProgress = Math.min(completedCourses / requirements.courses, 1);
     const quizProgress = Math.min(completedQuizzes / requirements.quizzes, 1);
     const creditProgress = Math.min(earnedCredits / requirements.credits, 1);
 
     return Math.round(
       (courseProgress * courseWeight + quizProgress * quizWeight + creditProgress * creditWeight) * 100
     );
   }, [completedCourses, completedQuizzes, earnedCredits, requirements]);
 
   return {
     completedCourses,
     completedQuizzes,
     completedExams: 0, // Placeholder until exams are implemented
     completedProjects: 0, // Placeholder until projects are implemented
     earnedCredits,
     percentage,
     loading,
   };
 }