 import { Link } from "react-router-dom";
 import { motion } from "framer-motion";
 import { ArrowLeft, Zap, Award, BookOpen } from "lucide-react";
 import { Progress } from "@/components/ui/progress";
 import { CountingNumber } from "@/components/animations";
 
interface JourneyHeaderProps {
    pathName: string;
    currentLevel: number;
    currentLevelName: string;
    totalSkillPoints: number;
   earnedSkillPoints: number;
   totalCredits: number;
   earnedCredits: number;
   overallPercentage: number;
   rank: string;
 }
 
 export function JourneyHeader({
  pathName,
    currentLevel,
    currentLevelName,
    totalSkillPoints,
   earnedSkillPoints,
   totalCredits,
   earnedCredits,
   overallPercentage,
   rank,
}: JourneyHeaderProps) {
    return (
     <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
       {/* Top bar with back button and title */}
       <div className="container mx-auto px-4 py-3 flex items-center justify-between">
         <Link
           to="/degrees"
           className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
         >
           <ArrowLeft className="w-4 h-4" />
           <span className="text-sm">Back to Degrees</span>
         </Link>
         <h1 className="font-marker text-xl md:text-2xl text-primary">{pathName}</h1>
         <div className="w-20" /> {/* Spacer for centering */}
       </div>
 
       {/* Stats bar */}
       <div className="container mx-auto px-4 py-4">
         <div className="grid grid-cols-3 gap-4 mb-4">
           {/* Level indicator */}
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-card rounded-lg p-3 border border-border"
           >
             <div className="flex items-center gap-2 mb-1">
               <Award className="w-4 h-4 text-primary" />
               <span className="text-xs text-muted-foreground uppercase tracking-wider">Level</span>
             </div>
             <div className="text-2xl font-bold text-foreground">{currentLevel}</div>
             <div className="text-xs text-muted-foreground">{currentLevelName}</div>
           </motion.div>
 
           {/* Skill Points */}
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-card rounded-lg p-3 border border-border"
           >
             <div className="flex items-center gap-2 mb-1">
               <Zap className="w-4 h-4 text-primary" />
               <span className="text-xs text-muted-foreground uppercase tracking-wider">Skill Points</span>
             </div>
             <div className="text-2xl font-bold text-foreground flex items-baseline gap-1">
               <CountingNumber value={earnedSkillPoints} duration={1} />
               <span className="text-sm text-muted-foreground font-normal"> / {totalSkillPoints}</span>
             </div>
           </motion.div>
 
           {/* Credits */}
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-card rounded-lg p-3 border border-border"
           >
             <div className="flex items-center gap-2 mb-1">
               <BookOpen className="w-4 h-4 text-primary" />
               <span className="text-xs text-muted-foreground uppercase tracking-wider">Credits</span>
             </div>
             <div className="text-2xl font-bold text-foreground flex items-baseline gap-1">
               <CountingNumber value={earnedCredits} duration={1} />
               <span className="text-sm text-muted-foreground font-normal"> / {totalCredits}</span>
             </div>
           </motion.div>
         </div>
 
         {/* Overall progress bar */}
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
         >
           <div className="flex items-center justify-between mb-2">
             <span className="text-sm text-muted-foreground">{overallPercentage}% Complete</span>
             <span className="text-xs font-bold text-primary uppercase tracking-wider">{rank}</span>
           </div>
           <Progress value={overallPercentage} className="h-2" />
         </motion.div>
       </div>
     </div>
   );
 }