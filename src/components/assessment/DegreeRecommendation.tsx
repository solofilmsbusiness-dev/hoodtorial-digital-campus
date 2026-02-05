 import { motion, AnimatePresence } from "framer-motion";
 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { 
   GraduationCap, 
   Award, 
   BookOpen, 
   Sparkles,
   ArrowRight,
   Check,
   Zap
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import type { DegreePath } from "@/hooks/useSkillTree";
 
 interface DegreeRecommendationProps {
   totalScore: number;
   experienceLevel: string;
   primaryStrength: string;
   strengthScore: number;
   interests: string[];
   onSelectPath: (path: DegreePath, department?: string) => void;
   onSkip: () => void;
 }
 
 type RecommendationResult = {
   path: DegreePath;
   reason: string;
   department?: string;
   highlights: string[];
   duration: string;
   courses: number;
 };
 
 function getRecommendedPath(
   totalScore: number,
   experienceLevel: string,
   primaryStrength: string,
   strengthScore: number
 ): RecommendationResult {
   // Professional with 70%+ in one area → Certificate
   if (experienceLevel === "professional" && strengthScore >= 70) {
     return {
       path: "certificate",
       department: primaryStrength,
       reason: "You already have strong skills. A focused certificate will add credentials quickly.",
       highlights: [
         "Fast-track to certification",
         "Focus on your strongest area",
         "Perfect for career advancement"
       ],
       duration: "2-3 months",
       courses: 3,
     };
   }
   
   // Semi-pro or intermediate with 50%+ overall → Bachelor
   if (
     (experienceLevel === "semi-professional" || experienceLevel === "intermediate") &&
     totalScore >= 50
   ) {
     return {
       path: "bachelor",
       reason: "You have a solid foundation. The full Bachelor program will take you to mastery.",
       highlights: [
         "Comprehensive curriculum",
         "Master all departments",
         "Industry-ready portfolio"
       ],
       duration: "12-18 months",
       courses: 14,
     };
   }
   
   // Default: Associate for everyone else
   return {
     path: "associate",
     reason: "Build a strong foundation first. You can always upgrade to Bachelor later.",
     highlights: [
       "Perfect for beginners",
       "Core fundamentals",
       "Upgrade anytime"
     ],
     duration: "3-6 months",
     courses: 6,
   };
 }
 
 const pathDetails: Record<DegreePath, { 
   title: string; 
   icon: React.ElementType; 
   color: string;
   bgColor: string;
 }> = {
   associate: {
     title: "Associate of Film",
     icon: BookOpen,
     color: "text-accent",
     bgColor: "bg-accent/10",
   },
   bachelor: {
     title: "Bachelor of Film",
     icon: GraduationCap,
     color: "text-primary",
     bgColor: "bg-primary/10",
   },
   certificate: {
     title: "Certificate Program",
     icon: Award,
     color: "text-neon-purple",
     bgColor: "bg-neon-purple/10",
   },
 };
 
 const departmentLabels: Record<string, string> = {
   cinematography: "Cinematography",
   "post-production": "Post-Production",
   directing: "Directing",
   production: "Production",
   photography: "Photography",
   "camera-systems": "Camera Systems",
 };
 
 export function DegreeRecommendation({
   totalScore,
   experienceLevel,
   primaryStrength,
   strengthScore,
   interests,
   onSelectPath,
   onSkip,
 }: DegreeRecommendationProps) {
   const recommendation = getRecommendedPath(
     totalScore,
     experienceLevel,
     primaryStrength,
     strengthScore
   );
   
   const recommendedDetails = pathDetails[recommendation.path];
   const RecommendedIcon = recommendedDetails.icon;
   
   // Get alternative paths
   const alternativePaths = (Object.keys(pathDetails) as DegreePath[])
     .filter(p => p !== recommendation.path);
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5 }}
       className="space-y-8"
     >
       {/* Header */}
       <div className="text-center space-y-4">
         <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
           className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
         >
           <Sparkles className="w-10 h-10 text-primary" />
         </motion.div>
         <h2 className="text-3xl font-bold">Your Personalized Degree Path</h2>
         <p className="text-muted-foreground max-w-lg mx-auto">
           Based on your assessment results, we've identified the perfect learning path for you.
         </p>
       </div>
 
       {/* Assessment Summary */}
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.3 }}
         className="bg-muted/50 rounded-lg p-4 border border-border"
       >
         <div className="grid grid-cols-3 gap-4 text-center">
           <div>
             <p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Score</p>
             <p className="text-2xl font-bold text-primary">{totalScore}%</p>
           </div>
           <div>
             <p className="text-xs text-muted-foreground uppercase tracking-wide">Experience</p>
             <p className="text-lg font-semibold capitalize">{experienceLevel.replace("-", " ")}</p>
           </div>
           <div>
             <p className="text-xs text-muted-foreground uppercase tracking-wide">Strongest Area</p>
             <p className="text-lg font-semibold">{departmentLabels[primaryStrength] || primaryStrength}</p>
             <p className="text-xs text-primary font-bold">{strengthScore}%</p>
           </div>
         </div>
       </motion.div>
 
       {/* Recommended Path Card */}
       <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.4 }}
       >
         <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent overflow-hidden relative">
           {/* Recommended Badge */}
           <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-wide rounded-bl-lg flex items-center gap-1">
             <Zap className="w-3 h-3" />
             Recommended
           </div>
           
           <CardContent className="pt-8 pb-6 px-6">
             <div className="flex flex-col md:flex-row gap-6 items-start">
               {/* Icon */}
               <div className={cn(
                 "w-16 h-16 rounded-xl flex items-center justify-center shrink-0",
                 recommendedDetails.bgColor
               )}>
                 <RecommendedIcon className={cn("w-8 h-8", recommendedDetails.color)} />
               </div>
               
               {/* Content */}
               <div className="flex-1 space-y-4">
                 <div>
                   <h3 className="text-2xl font-bold flex items-center gap-2">
                     {recommendedDetails.title}
                     {recommendation.department && (
                       <span className="text-lg font-normal text-muted-foreground">
                         in {departmentLabels[recommendation.department]}
                       </span>
                     )}
                   </h3>
                   <p className="text-muted-foreground mt-1">
                     {recommendation.reason}
                   </p>
                 </div>
                 
                 {/* Highlights */}
                 <ul className="space-y-2">
                   {recommendation.highlights.map((highlight, i) => (
                     <li key={i} className="flex items-center gap-2 text-sm">
                       <Check className="w-4 h-4 text-primary shrink-0" />
                       {highlight}
                     </li>
                   ))}
                 </ul>
                 
                 {/* Stats */}
                 <div className="flex gap-6 pt-2">
                   <div>
                     <p className="text-xs text-muted-foreground">Duration</p>
                     <p className="font-bold">{recommendation.duration}</p>
                   </div>
                   <div>
                     <p className="text-xs text-muted-foreground">Courses</p>
                     <p className="font-bold">{recommendation.courses} courses</p>
                   </div>
                 </div>
                 
                 {/* CTA */}
                 <Button
                   size="lg"
                   className="mt-4"
                   onClick={() => onSelectPath(recommendation.path, recommendation.department)}
                 >
                   Choose This Path
                   <ArrowRight className="ml-2 w-5 h-5" />
                 </Button>
               </div>
             </div>
           </CardContent>
         </Card>
       </motion.div>
 
       {/* Alternative Paths */}
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.5 }}
         className="space-y-3"
       >
         <p className="text-sm text-muted-foreground text-center">
           Or explore other options:
         </p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {alternativePaths.map((path) => {
             const details = pathDetails[path];
             const Icon = details.icon;
             return (
               <Card
                 key={path}
                 className="cursor-pointer hover:border-primary/50 transition-colors"
                 onClick={() => onSelectPath(path)}
               >
                 <CardContent className="p-4 flex items-center gap-4">
                   <div className={cn(
                     "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                     details.bgColor
                   )}>
                     <Icon className={cn("w-6 h-6", details.color)} />
                   </div>
                   <div className="flex-1">
                     <h4 className="font-semibold">{details.title}</h4>
                     <p className="text-xs text-muted-foreground">
                       {path === "associate" && "6 courses • 3-6 months"}
                       {path === "bachelor" && "14 courses • 12-18 months"}
                       {path === "certificate" && "3 courses • 2-3 months"}
                     </p>
                   </div>
                   <ArrowRight className="w-5 h-5 text-muted-foreground" />
                 </CardContent>
               </Card>
             );
           })}
         </div>
       </motion.div>
 
       {/* Skip Option */}
       <div className="text-center pt-4">
         <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
           Skip for now and explore on my own
         </Button>
       </div>
     </motion.div>
   );
 }