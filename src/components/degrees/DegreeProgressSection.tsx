 import { Link } from "react-router-dom";
 import { ArrowRight, Trophy, BookOpen, FileText, Zap, GraduationCap } from "lucide-react";
 import { Progress } from "@/components/ui/progress";
 import { DEGREE_REQUIREMENTS, DEPARTMENT_CONFIG } from "@/hooks/useDegreeProgress";
 import type { DegreePath, CertificateDepartment } from "@/hooks/useDegreeSelection";
 
 interface DegreeProgressSectionProps {
   degreePath: DegreePath;
   certificateDepartment: CertificateDepartment;
   completedCourses: number;
   completedQuizzes: number;
   completedExams: number;
   completedProjects: number;
   earnedCredits: number;
   percentage: number;
   loading: boolean;
 }
 
 export function DegreeProgressSection({
   degreePath,
   certificateDepartment,
   completedCourses,
   completedQuizzes,
   completedExams,
   completedProjects,
   earnedCredits,
   percentage,
   loading,
 }: DegreeProgressSectionProps) {
   if (!degreePath) return null;
 
   const requirements = DEGREE_REQUIREMENTS[degreePath];
   const deptConfig = certificateDepartment ? DEPARTMENT_CONFIG[certificateDepartment] : null;
 
   const pathName =
     degreePath === "certificate" && deptConfig
       ? `Certificate in ${deptConfig.name}`
       : requirements.name;
 
   const totalCredits =
     degreePath === "certificate" && deptConfig ? deptConfig.credits : requirements.credits;
 
   const progressItems = [
     {
       label: "Courses",
       icon: BookOpen,
       current: completedCourses,
       total: requirements.courses,
     },
     {
       label: "Quizzes",
       icon: FileText,
       current: completedQuizzes,
       total: requirements.quizzes,
     },
     ...(requirements.exams > 0
       ? [
           {
             label: "Exams",
             icon: Trophy,
             current: completedExams,
             total: requirements.exams,
           },
         ]
       : []),
     {
       label: "Projects",
       icon: Zap,
       current: completedProjects,
       total: requirements.projects,
     },
   ];
 
   if (loading) {
     return (
       <div className="animate-pulse">
         <div className="h-8 bg-muted rounded w-1/3 mb-4" />
         <div className="h-4 bg-muted rounded w-full mb-6" />
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[1, 2, 3, 4].map((i) => (
             <div key={i} className="h-24 bg-muted rounded" />
           ))}
         </div>
       </div>
     );
   }
 
   return (
     <div className="bg-card border-2 border-border p-6 md:p-8">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
         <div>
           <div className="flex items-center gap-2 mb-1">
             <GraduationCap className="w-5 h-5 text-primary" />
             <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
               Your Progress
             </span>
           </div>
           <h3 className="heading-4 text-foreground">{pathName}</h3>
         </div>
         <div className="text-right">
           <div className="text-4xl font-black text-primary">{percentage}%</div>
           <div className="text-sm text-muted-foreground">
             {earnedCredits}/{totalCredits} credits
           </div>
         </div>
       </div>
 
       {/* Overall progress bar */}
       <div className="mb-8">
         <Progress value={percentage} className="h-3 bg-muted border border-border rounded-none" />
       </div>
 
       {/* Individual progress items */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         {progressItems.map((item) => {
           const itemPercentage = item.total > 0 ? (item.current / item.total) * 100 : 0;
           return (
             <div key={item.label} className="text-center p-4 border border-border bg-background">
               <item.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
               <div className="font-bold text-foreground mb-1">
                 {item.current}/{item.total}
               </div>
               <div className="text-xs text-muted-foreground mb-2">{item.label}</div>
               <Progress value={itemPercentage} className="h-1 bg-muted rounded-none" />
             </div>
           );
         })}
       </div>
 
       {/* Action */}
       <div className="text-center">
         <Link
           to={`/skill-tree/${degreePath}`}
           className="btn-brutal inline-flex items-center gap-2"
         >
           View Skill Tree
           <ArrowRight className="w-4 h-4" />
         </Link>
       </div>
     </div>
   );
 }