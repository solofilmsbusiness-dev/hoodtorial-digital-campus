 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { courses } from "@/data/courses";
 
 export interface ProfileAchievement {
   course_code: string;
   course_title: string;
   department: string;
   credits: number;
   completed_at: string;
 }
 
 export interface ProfileStats {
   creditsEarned: number;
   coursesCompleted: number;
   quizzesPassed: number;
 }
 
 export function useProfileAchievements(userId: string | null) {
   const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
     queryKey: ["profile-achievements", userId],
     queryFn: async () => {
       if (!userId) return [];
       
       // Fetch completed enrollments for this user
       const { data: enrollments, error } = await supabase
         .from("enrollments")
         .select("course_code, completed_at")
         .eq("user_id", userId)
         .eq("status", "completed")
         .order("completed_at", { ascending: false });
       
       if (error) throw error;
       if (!enrollments) return [];
       
       // Map enrollments to achievements with course details
       const achievements: ProfileAchievement[] = enrollments.map((enrollment) => {
         const course = courses.find((c) => c.code === enrollment.course_code);
         return {
           course_code: enrollment.course_code,
           course_title: course?.title || "Unknown Course",
           department: course?.department || "Unknown",
           credits: course?.credits || 0,
           completed_at: enrollment.completed_at || "",
         };
       });
       
       return achievements;
     },
     enabled: !!userId,
   });
   
   const { data: stats, isLoading: statsLoading } = useQuery({
     queryKey: ["profile-stats", userId],
     queryFn: async () => {
       if (!userId) return { creditsEarned: 0, coursesCompleted: 0, quizzesPassed: 0 };
       
       // Get completed courses count and calculate credits
       const { data: enrollments, error: enrollError } = await supabase
         .from("enrollments")
         .select("course_code")
         .eq("user_id", userId)
         .eq("status", "completed");
       
       if (enrollError) throw enrollError;
       
       const completedCodes = enrollments?.map((e) => e.course_code) || [];
       const creditsEarned = completedCodes.reduce((sum, code) => {
         const course = courses.find((c) => c.code === code);
         return sum + (course?.credits || 0);
       }, 0);
       
       // Get passed quizzes count
       const { count: quizzesPassed, error: quizError } = await supabase
         .from("quiz_results")
         .select("*", { count: "exact", head: true })
         .eq("user_id", userId)
         .eq("passed", true);
       
       if (quizError) throw quizError;
       
       return {
         creditsEarned,
         coursesCompleted: completedCodes.length,
         quizzesPassed: quizzesPassed || 0,
       };
     },
     enabled: !!userId,
   });
   
   return {
     achievements,
     stats: stats || { creditsEarned: 0, coursesCompleted: 0, quizzesPassed: 0 },
     isLoading: achievementsLoading || statsLoading,
   };
 }