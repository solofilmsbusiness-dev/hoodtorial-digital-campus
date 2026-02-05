 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { ChevronDown, ChevronUp, CheckCircle2, Lock } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { Progress } from "@/components/ui/progress";
 import { JourneyCourseCard } from "./JourneyCourseCard";
 import { JourneyMilestone } from "./JourneyMilestone";
 import type { JourneyLevel, LevelStatus } from "@/hooks/useJourneyData";
 
 interface JourneyLevelSectionProps {
   level: JourneyLevel;
   index: number;
 }
 
 export function JourneyLevelSection({ level, index }: JourneyLevelSectionProps) {
   const [isExpanded, setIsExpanded] = useState(
     level.status === "in_progress" || level.status === "available"
   );
 
   const isLocked = level.status === "locked";
   const isComplete = level.status === "complete";
   const progressPercentage = level.totalCount > 0 
     ? Math.round((level.completedCount / level.totalCount) * 100) 
     : 0;
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: index * 0.15 }}
       className={cn(
         "rounded-xl border overflow-hidden",
         isLocked && "opacity-60 border-border bg-muted/30",
         isComplete && "border-primary bg-primary/5",
         !isLocked && !isComplete && "border-border bg-card"
       )}
     >
       {/* Level header */}
       <button
         onClick={() => !isLocked && setIsExpanded(!isExpanded)}
         disabled={isLocked}
         className={cn(
           "w-full p-4 md:p-6 flex items-center justify-between transition-colors",
           !isLocked && "hover:bg-muted/50 cursor-pointer"
         )}
       >
         <div className="flex items-center gap-4">
           {/* Level indicator */}
           <div
             className={cn(
               "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
               isLocked && "bg-muted text-muted-foreground",
               isComplete && "bg-primary text-primary-foreground",
               !isLocked && !isComplete && "bg-primary/20 text-primary border-2 border-primary"
             )}
           >
             {isComplete ? (
               <CheckCircle2 className="w-6 h-6" />
             ) : isLocked ? (
               <Lock className="w-5 h-5" />
             ) : (
               level.number
             )}
           </div>
 
           {/* Level info */}
           <div className="text-left">
             <h2 className="font-marker text-xl md:text-2xl text-foreground">
               Level {level.number}: {level.name}
             </h2>
             <p className="text-sm text-muted-foreground">
               {level.completedCount} / {level.totalCount} courses completed
             </p>
           </div>
         </div>
 
         {/* Progress and expand indicator */}
         <div className="flex items-center gap-4">
           {!isLocked && (
             <div className="hidden md:block w-32">
               <Progress value={progressPercentage} className="h-2" />
             </div>
           )}
           
           {isComplete && (
             <span className="hidden md:inline-block text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
               Complete!
             </span>
           )}
 
           {!isLocked && (
             <div className="text-muted-foreground">
               {isExpanded ? (
                 <ChevronUp className="w-5 h-5" />
               ) : (
                 <ChevronDown className="w-5 h-5" />
               )}
             </div>
           )}
         </div>
       </button>
 
       {/* Expanded content */}
       <AnimatePresence>
         {isExpanded && !isLocked && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.3 }}
             className="overflow-hidden"
           >
             <div className="p-4 md:p-6 pt-0 border-t border-border">
               {/* Mobile progress bar */}
               <div className="md:hidden mb-4">
                 <div className="flex justify-between text-xs text-muted-foreground mb-1">
                   <span>{progressPercentage}%</span>
                 </div>
                 <Progress value={progressPercentage} className="h-2" />
               </div>
 
               {/* Course cards grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {level.courses.map((course, courseIndex) => (
                   <JourneyCourseCard
                     key={course.code}
                     {...course}
                     index={courseIndex}
                   />
                 ))}
               </div>
 
               {/* Milestone (if exists) */}
               {level.milestone && (
                 <div className="mt-6">
                   <JourneyMilestone milestone={level.milestone} />
                 </div>
               )}
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </motion.div>
   );
 }