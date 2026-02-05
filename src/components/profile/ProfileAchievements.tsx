 import { motion } from "framer-motion";
 import { Award, Calendar, Sparkles } from "lucide-react";
 import { format } from "date-fns";
 import { ProfileAchievement } from "@/hooks/useProfileAchievements";
 import { StampBadge } from "@/components/ui/custom-badges";
 
 interface ProfileAchievementsProps {
   achievements: ProfileAchievement[];
   isLoading?: boolean;
 }
 
 export function ProfileAchievements({ achievements, isLoading }: ProfileAchievementsProps) {
   if (isLoading) {
     return (
       <div className="space-y-4">
         <div className="h-6 w-40 bg-charcoal rounded animate-pulse" />
         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
           {[1, 2, 3].map((i) => (
             <div key={i} className="h-40 bg-charcoal rounded-lg animate-pulse" />
           ))}
         </div>
       </div>
     );
   }
 
   if (achievements.length === 0) {
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
         <span className="text-gold">◆</span>
         Course Achievements
         <span className="text-sm font-normal text-muted-foreground">
           ({achievements.length})
         </span>
       </motion.h3>
 
       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
         {achievements.map((achievement, index) => (
           <motion.div
             key={achievement.course_code}
             initial={{ opacity: 0, y: 20, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             transition={{ duration: 0.4, delay: index * 0.1 }}
             className="group relative"
           >
             <div className="relative bg-charcoal/60 border-2 border-gold/30 rounded-lg p-4 overflow-hidden hover:border-gold/60 transition-all duration-300">
               {/* Shimmer effect */}
               <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
 
               {/* Trophy icon */}
               <div className="flex justify-center mb-3">
                 <div className="relative">
                   <div className="p-3 rounded-full bg-gold/10 border border-gold/30">
                     <Award className="h-6 w-6 text-gold" />
                   </div>
                   <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-gold animate-pulse" />
                 </div>
               </div>
 
               {/* Course info */}
               <div className="text-center space-y-2">
                 <p className="text-xs font-mono text-primary">{achievement.course_code}</p>
                 <p className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
                   {achievement.course_title}
                 </p>
 
                 {/* Certified stamp */}
                 <div className="flex justify-center pt-1">
                   <StampBadge>✓ Certified</StampBadge>
                 </div>
 
                 {/* Details */}
                 <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                   {achievement.completed_at && (
                     <p className="flex items-center justify-center gap-1">
                       <Calendar className="h-3 w-3" />
                       {format(new Date(achievement.completed_at), "MMM d, yyyy")}
                     </p>
                   )}
                   <p className="text-gold/80">{achievement.credits} credits earned</p>
                 </div>
               </div>
             </div>
           </motion.div>
         ))}
       </div>
     </div>
   );
 }