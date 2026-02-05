 import { Link } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Lock, Play, CheckCircle2, Zap, BookOpen, GraduationCap } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { Progress } from "@/components/ui/progress";
 import { Button } from "@/components/ui/button";
 import type { CourseStatus } from "@/hooks/useJourneyData";
 
 interface JourneyCourseCardProps {
   code: string;
   title: string;
   department: string;
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
   index: number;
 }
 
 export function JourneyCourseCard({
   code,
   title,
   department,
   departmentColor,
   credits,
   skillPoints,
   status,
   progress,
   prerequisites,
   index,
 }: JourneyCourseCardProps) {
   const isLocked = status === "locked";
   const isComplete = status === "complete";
   const isInProgress = status === "in_progress";
   const isAvailable = status === "available";
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: index * 0.1 }}
       className={cn(
         "relative bg-card rounded-xl border overflow-hidden transition-all duration-300",
         isLocked && "opacity-60 grayscale",
         isComplete && "border-primary shadow-lg shadow-primary/20",
         isInProgress && "border-primary/50 shadow-md",
         isAvailable && "border-border hover:border-primary/50 hover:shadow-lg",
         isAvailable && "animate-pulse-slow"
       )}
     >
       {/* Department color bar */}
       <div
         className="h-1.5 w-full"
         style={{ backgroundColor: isLocked ? "hsl(var(--muted))" : departmentColor }}
       />
 
       <div className="p-4">
         {/* Header row */}
         <div className="flex items-start justify-between mb-2">
           <div>
             <span className="text-xs font-mono text-muted-foreground">{code}</span>
             <h3 className="font-semibold text-foreground line-clamp-2 mt-0.5">{title}</h3>
           </div>
           <div className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded-full">
             <Zap className="w-3 h-3 text-primary" />
             <span className="text-xs font-bold text-primary">
               {isComplete ? "+" : ""}{skillPoints} SP
             </span>
           </div>
         </div>
 
         {/* Department label */}
         <div className="flex items-center gap-2 mb-3">
           <span
             className="text-xs px-2 py-0.5 rounded-full"
             style={{
               backgroundColor: isLocked ? "hsl(var(--muted))" : `${departmentColor}20`,
               color: isLocked ? "hsl(var(--muted-foreground))" : departmentColor,
             }}
           >
             {department}
           </span>
           <span className="text-xs text-muted-foreground">{credits} credits</span>
         </div>
 
         {/* Progress section */}
         {!isLocked && (
           <div className="mb-4">
             <div className="flex justify-between text-xs text-muted-foreground mb-1">
               <span>{progress.percentage}% complete</span>
               <span>
                 {progress.lessonsCompleted}/{progress.lessonsTotal} lessons • {progress.quizzesPassed}/{progress.quizzesTotal} quizzes
               </span>
             </div>
             <Progress value={progress.percentage} className="h-1.5" />
           </div>
         )}
 
         {/* Locked message */}
         {isLocked && prerequisites.length > 0 && (
           <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
             <Lock className="w-3 h-3" />
             <span>Complete {prerequisites.join(", ")} to unlock</span>
           </div>
         )}
 
         {/* Action button */}
         <div>
           {isLocked && (
             <Button variant="outline" size="sm" className="w-full" disabled>
               <Lock className="w-4 h-4 mr-2" />
               Locked
             </Button>
           )}
           {isAvailable && (
             <Button asChild size="sm" className="w-full">
               <Link to={`/courses/${code}`}>
                 <Play className="w-4 h-4 mr-2" />
                 Start Course
               </Link>
             </Button>
           )}
           {isInProgress && (
             <Button asChild size="sm" className="w-full">
               <Link to={`/courses/${code}`}>
                 <BookOpen className="w-4 h-4 mr-2" />
                 Continue
               </Link>
             </Button>
           )}
           {isComplete && (
             <Button asChild variant="outline" size="sm" className="w-full border-primary text-primary">
               <Link to={`/courses/${code}`}>
                 <CheckCircle2 className="w-4 h-4 mr-2" />
                 Review
               </Link>
             </Button>
           )}
         </div>
       </div>
 
       {/* Complete badge */}
       {isComplete && (
         <div className="absolute top-3 right-3">
           <div className="bg-primary text-primary-foreground rounded-full p-1">
             <GraduationCap className="w-4 h-4" />
           </div>
         </div>
       )}
     </motion.div>
   );
 }