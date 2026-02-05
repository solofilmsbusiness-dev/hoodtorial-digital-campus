 import { motion } from "framer-motion";
 import { Star, Award, Film, Lock, CheckCircle2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { Button } from "@/components/ui/button";
 import type { JourneyMilestone as JourneyMilestoneType } from "@/hooks/useJourneyData";
 
 interface JourneyMilestoneProps {
   milestone: JourneyMilestoneType;
 }
 
 export function JourneyMilestone({ milestone }: JourneyMilestoneProps) {
   const isLocked = milestone.status === "locked";
   const isComplete = milestone.status === "complete";
   const isAvailable = milestone.status === "available";
 
   const icons = {
     exam: Award,
     project: Star,
     capstone: Film,
   };
 
   const Icon = icons[milestone.type];
 
   const typeLabels = {
     exam: "Scenario Exam",
     project: "Project",
     capstone: "Capstone",
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       className={cn(
         "relative p-6 rounded-xl border-2 border-dashed transition-all",
         isLocked && "border-muted bg-muted/20 opacity-60",
         isComplete && "border-primary bg-primary/10",
         isAvailable && "border-primary/50 bg-card hover:border-primary"
       )}
     >
       <div className="flex items-start gap-4">
         {/* Icon */}
         <div
           className={cn(
             "w-14 h-14 rounded-xl flex items-center justify-center",
             isLocked && "bg-muted text-muted-foreground",
             isComplete && "bg-primary text-primary-foreground",
             isAvailable && "bg-primary/20 text-primary"
           )}
         >
           <Icon className="w-7 h-7" />
         </div>
 
         {/* Content */}
         <div className="flex-1">
           <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold uppercase tracking-wider text-primary">
               {typeLabels[milestone.type]}
             </span>
             {isComplete && (
               <CheckCircle2 className="w-4 h-4 text-primary" />
             )}
           </div>
           <h3 className="font-semibold text-lg text-foreground mb-1">
             {milestone.title}
           </h3>
           <p className="text-sm text-muted-foreground mb-3">
             {milestone.description}
           </p>
 
           {/* Requirements or action */}
           {isLocked && milestone.requiredCourses && (
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <Lock className="w-3 h-3" />
               <span>Complete all level courses to unlock</span>
             </div>
           )}
 
           {isAvailable && (
             <Button size="sm" className="mt-2">
               <Star className="w-4 h-4 mr-2" />
               Begin {typeLabels[milestone.type]}
             </Button>
           )}
 
           {isComplete && (
             <div className="flex items-center gap-2 text-sm text-primary font-medium">
               <CheckCircle2 className="w-4 h-4" />
               <span>Completed! +{milestone.skillPoints} SP earned</span>
             </div>
           )}
         </div>
 
         {/* Skill points badge */}
         <div
           className={cn(
             "px-3 py-1 rounded-full text-sm font-bold",
             isLocked && "bg-muted text-muted-foreground",
             !isLocked && "bg-primary/20 text-primary"
           )}
         >
           ⚡ {milestone.skillPoints} SP
         </div>
       </div>
     </motion.div>
   );
 }