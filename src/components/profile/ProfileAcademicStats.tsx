 import { motion } from "framer-motion";
 import { GraduationCap, BookOpen, Award } from "lucide-react";
 import { ProfileStats } from "@/hooks/useProfileAchievements";
 import { Progress } from "@/components/ui/progress";
 
 interface ProfileAcademicStatsProps {
   stats: ProfileStats;
   isLoading?: boolean;
 }
 
 const TOTAL_CREDITS_REQUIRED = 60;
 const TOTAL_COURSES_AVAILABLE = 24;
 
 export function ProfileAcademicStats({ stats, isLoading }: ProfileAcademicStatsProps) {
   const statCards = [
     {
       icon: GraduationCap,
       label: "Credits Earned",
       value: stats.creditsEarned,
       max: TOTAL_CREDITS_REQUIRED,
       suffix: `/ ${TOTAL_CREDITS_REQUIRED}`,
       color: "primary",
     },
     {
       icon: BookOpen,
       label: "Courses Completed",
       value: stats.coursesCompleted,
       max: TOTAL_COURSES_AVAILABLE,
       suffix: "",
       color: "neon-purple",
     },
     {
       icon: Award,
       label: "Quizzes Passed",
       value: stats.quizzesPassed,
       max: null,
       suffix: "",
       color: "gold",
     },
   ];
 
   if (isLoading) {
     return (
       <div className="grid grid-cols-3 gap-3">
         {[1, 2, 3].map((i) => (
           <div
             key={i}
             className="h-28 bg-charcoal rounded-lg animate-pulse"
           />
         ))}
       </div>
     );
   }
 
   // Don't show section if no stats
   if (stats.creditsEarned === 0 && stats.coursesCompleted === 0 && stats.quizzesPassed === 0) {
     return null;
   }
 
   return (
     <div className="space-y-4">
       <motion.h3
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.4 }}
         className="text-lg font-semibold text-foreground flex items-center gap-2"
       >
         <span className="text-primary">◆</span>
         Academic Progress
       </motion.h3>
 
       <div className="grid grid-cols-3 gap-3">
         {statCards.map((stat, index) => {
           const Icon = stat.icon;
           const progressValue = stat.max ? (stat.value / stat.max) * 100 : 0;
 
           return (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4, delay: index * 0.1 }}
               className="relative bg-charcoal/50 border border-border/50 rounded-lg p-4 overflow-hidden group hover:border-primary/30 transition-colors"
             >
               {/* Background glow */}
               <div
                 className={`absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${
                   stat.color === "primary"
                     ? "bg-primary"
                     : stat.color === "neon-purple"
                     ? "bg-neon-purple"
                     : "bg-gold"
                 }`}
               />
 
               <div className="relative z-10 flex flex-col items-center text-center gap-2">
                 <div
                   className={`p-2 rounded-lg ${
                     stat.color === "primary"
                       ? "bg-primary/10 text-primary"
                       : stat.color === "neon-purple"
                       ? "bg-neon-purple/10 text-neon-purple"
                       : "bg-gold/10 text-gold"
                   }`}
                 >
                   <Icon className="h-5 w-5" />
                 </div>
 
                 <div className="space-y-1">
                   <p className="text-2xl font-bold text-foreground">
                     {stat.value}
                     {stat.suffix && (
                       <span className="text-sm font-normal text-muted-foreground ml-1">
                         {stat.suffix}
                       </span>
                     )}
                   </p>
                   <p className="text-xs text-muted-foreground">{stat.label}</p>
                 </div>
 
                 {stat.max && (
                   <Progress
                     value={progressValue}
                     className="h-1.5 w-full bg-charcoal-light"
                   />
                 )}
               </div>
             </motion.div>
           );
         })}
       </div>
     </div>
   );
 }