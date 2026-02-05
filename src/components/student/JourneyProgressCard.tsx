 import { Link } from "react-router-dom";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Progress } from "@/components/ui/progress";
 import { Badge } from "@/components/ui/badge";
 import { 
   Compass, 
   Sparkles, 
   ChevronRight, 
   TrendingUp,
   Target,
   GraduationCap
 } from "lucide-react";
 import { useJourneyData } from "@/hooks/useJourneyData";
 import { useAssessmentResults } from "@/hooks/useAssessmentResults";
 import { useDegreeSelection, type DegreePath } from "@/hooks/useDegreeSelection";
 import { cn } from "@/lib/utils";
 
 const departmentLabels: Record<string, string> = {
   cinematography: "Cinematography",
   "post-production": "Post-Production",
   directing: "Directing",
   production: "Production",
   photography: "Photography",
   "camera-systems": "Camera Systems",
 };
 
 export function JourneyProgressCard() {
   const { degreePath, certificateDepartment, loading: degreeLoading } = useDegreeSelection();
   const { latestResult, hasCompletedAssessment } = useAssessmentResults();
   
   // Only fetch journey data if we have a degree path
   const journeyData = useJourneyData((degreePath || "associate") as DegreePath);
 
   // Get top strengths from assessment
   const getTopStrengths = () => {
     if (!latestResult?.department_scores) return [];
     const scores = latestResult.department_scores as Record<string, number>;
     return Object.entries(scores)
       .sort(([, a], [, b]) => b - a)
       .slice(0, 2)
       .map(([dept, score]) => ({
         department: departmentLabels[dept] || dept,
         score: Math.round(score),
       }));
   };
 
   // Get areas to improve (lowest scores)
   const getAreasToImprove = () => {
     if (!latestResult?.department_scores) return [];
     const scores = latestResult.department_scores as Record<string, number>;
     return Object.entries(scores)
       .sort(([, a], [, b]) => a - b)
       .slice(0, 1)
       .map(([dept, score]) => ({
         department: departmentLabels[dept] || dept,
         score: Math.round(score),
       }));
   };
 
   // Find next recommended course
   const getNextRecommendedCourse = () => {
     for (const level of journeyData.levels) {
       const recommended = level.courses.find(
         c => c.isRecommended && (c.status === "available" || c.status === "in_progress")
       );
       if (recommended) return recommended;
       
       // Fallback to any available course
       const available = level.courses.find(
         c => c.status === "available" || c.status === "in_progress"
       );
       if (available) return available;
     }
     return null;
   };
 
   const topStrengths = getTopStrengths();
   const areasToImprove = getAreasToImprove();
   const nextCourse = getNextRecommendedCourse();
 
   // Show skeleton while loading
   if (degreeLoading) {
     return (
       <Card className="card-urban animate-pulse">
         <CardContent className="p-6">
           <div className="h-48 bg-muted rounded" />
         </CardContent>
       </Card>
     );
   }
 
   // No degree path selected - prompt to start journey
   if (!degreePath) {
     return (
       <Card className="card-urban border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
         <CardContent className="p-6 text-center">
           <Compass className="h-12 w-12 mx-auto mb-4 text-primary" />
           <h3 className="font-bold text-lg mb-2">Start Your Learning Journey</h3>
           <p className="text-muted-foreground text-sm mb-4">
             {hasCompletedAssessment 
               ? "You've completed your assessment! Choose a degree path to begin."
               : "Take our assessment to get personalized course recommendations."}
           </p>
           <Link
             to={hasCompletedAssessment ? "/degrees" : "/assessment"}
             className="btn-brutal inline-flex items-center gap-2"
           >
             {hasCompletedAssessment ? "Choose Degree Path" : "Take Assessment"}
             <ChevronRight className="h-4 w-4" />
           </Link>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card className="card-urban overflow-hidden">
       <CardHeader className="pb-2">
         <CardTitle className="flex items-center gap-2">
           <GraduationCap className="h-5 w-5 text-primary" />
           Your Learning Journey
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-5">
         {/* Degree Path & Progress */}
         <div className="flex items-center justify-between">
           <div>
             <h3 className="font-bold text-lg">{journeyData.pathName}</h3>
             {certificateDepartment && (
               <p className="text-sm text-muted-foreground">
                 Focus: {departmentLabels[certificateDepartment] || certificateDepartment}
               </p>
             )}
           </div>
           <div className="text-right">
             <span className="text-2xl font-black text-primary">
               {journeyData.overallPercentage}%
             </span>
             <p className="text-xs text-muted-foreground">
               Level {journeyData.currentLevel}
             </p>
           </div>
         </div>
 
         {/* Progress Bar */}
         <div className="space-y-1.5">
           <Progress value={journeyData.overallPercentage} className="h-3" />
           <div className="flex justify-between text-xs text-muted-foreground">
             <span>{journeyData.completedCourses} of {journeyData.totalCourses} courses</span>
             <span>{journeyData.earnedCredits} / {journeyData.totalCredits} credits</span>
           </div>
         </div>
 
         {/* Assessment Insights */}
         {hasCompletedAssessment && (topStrengths.length > 0 || areasToImprove.length > 0) && (
           <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
             {/* Strengths */}
             <div className="space-y-2">
               <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                 Your Strengths
               </div>
               <div className="space-y-1">
                 {topStrengths.map((s) => (
                   <div key={s.department} className="flex items-center justify-between">
                     <span className="text-xs truncate">{s.department}</span>
                     <Badge variant="secondary" className="text-xs px-1.5 py-0">
                       {s.score}%
                     </Badge>
                   </div>
                 ))}
               </div>
             </div>
 
             {/* Areas to Improve */}
             <div className="space-y-2">
               <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Target className="h-3.5 w-3.5 text-accent" />
                 Focus Area
               </div>
               <div className="space-y-1">
                 {areasToImprove.map((s) => (
                   <div key={s.department} className="flex items-center justify-between">
                     <span className="text-xs truncate">{s.department}</span>
                     <Badge variant="outline" className="text-xs px-1.5 py-0">
                       {s.score}%
                     </Badge>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         )}
 
         {/* Next Recommended Course */}
         {nextCourse && (
           <div className="pt-3 border-t border-border">
             <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
               <Sparkles className="h-3.5 w-3.5 text-primary" />
               {nextCourse.isRecommended ? "Recommended Next" : "Continue With"}
             </div>
             <Link
               to={`/course/${nextCourse.code}`}
               className={cn(
                 "flex items-center justify-between p-3 rounded-lg transition-all",
                 "bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/20"
               )}
             >
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-primary">{nextCourse.code}</span>
                   {nextCourse.isRecommended && (
                     <Badge className="text-[10px] px-1 py-0 bg-primary/10 text-primary border-0">
                       For You
                     </Badge>
                   )}
                 </div>
                 <h4 className="font-medium text-sm truncate">{nextCourse.title}</h4>
                 {nextCourse.status === "in_progress" && (
                   <div className="flex items-center gap-2 mt-1">
                     <Progress value={nextCourse.progress.percentage} className="h-1.5 flex-1" />
                     <span className="text-xs text-muted-foreground">
                       {nextCourse.progress.percentage}%
                     </span>
                   </div>
                 )}
               </div>
               <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
             </Link>
           </div>
         )}
 
         {/* Journey Link */}
         <Link
           to="/journey"
           className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary hover:underline"
         >
           View Full Journey
           <ChevronRight className="h-4 w-4" />
         </Link>
       </CardContent>
     </Card>
   );
 }