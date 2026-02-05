 import { motion } from "framer-motion";
 import { useJourneyData } from "@/hooks/useJourneyData";
 import { JourneyHeader } from "./JourneyHeader";
 import { JourneyLevelSection } from "./JourneyLevelSection";
 import { JourneyConnector } from "./JourneyConnector";
 import type { DegreePath } from "@/hooks/useSkillTree";
 
 interface JourneyViewProps {
   path: DegreePath;
 }
 
 export function JourneyView({ path }: JourneyViewProps) {
   const {
     levels,
     pathName,
     totalCredits,
     earnedCredits,
     totalSkillPoints,
     earnedSkillPoints,
     currentLevel,
     rank,
     overallPercentage,
   } = useJourneyData(path);
 
   return (
     <div className="min-h-screen bg-background">
       {/* Sticky header with stats */}
       <JourneyHeader
         pathName={pathName}
         currentLevel={currentLevel}
         totalSkillPoints={totalSkillPoints}
         earnedSkillPoints={earnedSkillPoints}
         totalCredits={totalCredits}
         earnedCredits={earnedCredits}
         overallPercentage={overallPercentage}
         rank={rank}
       />
 
       {/* Main content */}
       <div className="container mx-auto px-4 py-8">
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="max-w-5xl mx-auto"
         >
           {/* Level sections with connectors */}
           {levels.map((level, index) => (
             <div key={level.id}>
               <JourneyLevelSection level={level} index={index} />
               
               {/* Connector to next level (if not last) */}
               {index < levels.length - 1 && (
                 <JourneyConnector
                   isActive={level.status === "complete"}
                   index={index}
                 />
               )}
             </div>
           ))}
 
           {/* Graduation section */}
           {overallPercentage === 100 && (
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.5 }}
               className="mt-8 p-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary text-center"
             >
               <div className="text-6xl mb-4">🎓</div>
               <h2 className="font-marker text-3xl text-primary mb-2">
                 Congratulations!
               </h2>
               <p className="text-muted-foreground max-w-md mx-auto">
                 You've completed all requirements for your {pathName}. 
                 Your dedication to the craft of filmmaking is truly inspiring.
               </p>
             </motion.div>
           )}
         </motion.div>
       </div>
     </div>
   );
 }