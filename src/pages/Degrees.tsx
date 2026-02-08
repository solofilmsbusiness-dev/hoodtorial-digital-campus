 import { useState } from "react";
 import { Link } from "react-router-dom";
 import { AnimatePresence } from "framer-motion";
 import { GraduationCap, Check, ArrowRight, AlertCircle } from "lucide-react";
 import { PageLayout, Section, SectionHeader } from "@/components/layout";
 import { DegreePathCard, DepartmentPicker, DegreeProgressSection } from "@/components/degrees";
 import { useDegreeSelection, type DegreePath, type CertificateDepartment } from "@/hooks/useDegreeSelection";
 import { useDegreeProgress, DEGREE_REQUIREMENTS, DEPARTMENT_CONFIG } from "@/hooks/useDegreeProgress";
 import { useAuth } from "@/contexts/AuthContext";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from "@/components/ui/alert-dialog";
 
 const benefits = [
   "Official degree certificate (digital + printable)",
   "Complete academic transcript",
   "LinkedIn-ready credentials",
   "Alumni network access",
   "Portfolio showcase page",
   "Letter of recommendation eligibility",
 ];
 
 const Degrees = () => {
   const { user } = useAuth();
   const { degreePath, certificateDepartment, loading, setDegreeSelection, clearDegreeSelection } =
     useDegreeSelection();
   const progress = useDegreeProgress(degreePath, certificateDepartment);
 
   const [expandedPath, setExpandedPath] = useState<DegreePath>(null);
   const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
   const [selectedDepartment, setSelectedDepartment] = useState<CertificateDepartment>(null);
   const [showChangeConfirm, setShowChangeConfirm] = useState(false);
   const [pendingPath, setPendingPath] = useState<DegreePath>(null);
 
   const handleSelectPath = async (path: DegreePath) => {
     // If user already has a path, confirm change
     if (degreePath && degreePath !== path) {
       setPendingPath(path);
       setShowChangeConfirm(true);
       return;
     }
 
     // Certificate requires department selection
     if (path === "certificate") {
       setShowDepartmentPicker(true);
       return;
     }
 
     await setDegreeSelection(path);
   };
 
   const handleConfirmChange = async () => {
     setShowChangeConfirm(false);
     if (pendingPath === "certificate") {
       setShowDepartmentPicker(true);
     } else if (pendingPath) {
       await setDegreeSelection(pendingPath);
     }
     setPendingPath(null);
   };
 
   const handleConfirmDepartment = async () => {
     if (selectedDepartment) {
       const success = await setDegreeSelection("certificate", selectedDepartment);
       if (success) {
         setShowDepartmentPicker(false);
         setSelectedDepartment(null);
       }
     }
   };
 
   const handleCancelDepartment = () => {
     setShowDepartmentPicker(false);
     setSelectedDepartment(null);
   };
 
   // Get display name for current path
   const currentPathName = degreePath
     ? degreePath === "certificate" && certificateDepartment
       ? `Certificate in ${DEPARTMENT_CONFIG[certificateDepartment].name}`
       : DEGREE_REQUIREMENTS[degreePath].name
     : null;
 
   return (
     <PageLayout pageKey="degrees">
       {/* Hero */}
       <section className="relative pt-32 pb-20 overflow-hidden bg-noise">
         <div className="absolute inset-0 bg-grid" />
         <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
         <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[120px]" />
 
         <div className="container-wide relative z-10">
           <div className="max-w-4xl">
             <span className="tag-sticker mb-6 animate-reveal">
               <GraduationCap className="w-3 h-3 mr-2" />
               Degree Programs
             </span>
             <h1 className="heading-1 mt-4 mb-6 animate-reveal stagger-1">
               EARN YOUR
               <span className="text-gold-gradient text-glow"> DEGREE</span>
             </h1>
             <p className="body-large text-muted-foreground max-w-2xl animate-reveal stagger-2">
               Real credentials for real creators. Complete the curriculum, submit your work, and
               graduate with proof of your skills.
             </p>
 
             {/* Current path indicator for logged-in users */}
             {user && degreePath && !loading && (
               <div className="mt-8 animate-reveal stagger-3">
                 <div className="inline-flex items-center gap-3 bg-primary/10 border-2 border-primary px-6 py-3">
                   <GraduationCap className="w-5 h-5 text-primary" />
                   <div>
                     <div className="text-xs text-muted-foreground uppercase tracking-widest">
                       Current Path
                     </div>
                     <div className="font-bold text-foreground">{currentPathName}</div>
                   </div>
                   <div className="ml-4 pl-4 border-l border-primary/30">
                     <div className="text-2xl font-black text-primary">{progress.percentage}%</div>
                   </div>
                 </div>
               </div>
             )}
           </div>
         </div>
       </section>
 
       {/* User Progress Section (if logged in and has path) */}
       {user && degreePath && (
         <Section>
           <DegreeProgressSection
             degreePath={degreePath}
             certificateDepartment={certificateDepartment}
             completedCourses={progress.completedCourses}
             completedQuizzes={progress.completedQuizzes}
             completedExams={progress.completedExams}
             completedProjects={progress.completedProjects}
             earnedCredits={progress.earnedCredits}
             percentage={progress.percentage}
             loading={progress.loading}
           />
 
           {/* Option to change path */}
           <div className="text-center mt-6">
             <button
               onClick={() => {
                 setPendingPath(null);
                 setShowChangeConfirm(true);
               }}
               className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
             >
               Want to change your degree path?
             </button>
           </div>
         </Section>
       )}
 
       {/* Degree Programs */}
       <Section>
         <SectionHeader
           eyebrow="Programs"
           title="CHOOSE YOUR PATH"
           description="Three degree tracks to match your goals and timeline."
           centered
         />
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {(["associate", "bachelor", "certificate"] as const).map((path) => (
             <DegreePathCard
               key={path}
               path={path}
               isSelected={degreePath === path}
               isExpanded={expandedPath === path}
               onToggleExpand={() => setExpandedPath(expandedPath === path ? null : path)}
               onSelect={() => handleSelectPath(path)}
             />
           ))}
         </div>
 
         {/* Department Picker (shows when certificate is selected) */}
         <AnimatePresence>
           {showDepartmentPicker && (
             <DepartmentPicker
               selectedDepartment={selectedDepartment}
               onSelect={setSelectedDepartment}
               onConfirm={handleConfirmDepartment}
               onCancel={handleCancelDepartment}
             />
           )}
         </AnimatePresence>
       </Section>
 
       {/* Dynamic Requirements (shows for selected or hovered path) */}
       {(degreePath || expandedPath) && (
         <Section className="bg-card/50 bg-noise">
           <DynamicRequirements path={degreePath || expandedPath!} />
         </Section>
       )}
 
       {/* Graduation Benefits */}
       <Section className={!degreePath && !expandedPath ? "bg-card/50 bg-noise" : ""}>
         <SectionHeader eyebrow="Benefits" title="WHAT YOU GET WHEN YOU GRADUATE" centered />
 
         <div className="max-w-3xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {benefits.map((benefit, index) => (
               <div
                 key={index}
                 className="flex items-center gap-4 p-4 border-2 border-border bg-card hover:border-primary transition-all duration-300 animate-reveal"
                 style={{ animationDelay: `${index * 0.1}s` }}
               >
                 <div className="w-8 h-8 bg-primary/20 border border-primary flex items-center justify-center shrink-0">
                   <Check className="h-4 w-4 text-primary" />
                 </div>
                 <span className="text-foreground font-medium">{benefit}</span>
               </div>
             ))}
           </div>
 
           {!user && (
             <div className="text-center mt-12">
               <Link to="/auth?redirect=/degrees" className="btn-brutal inline-flex animate-glow-pulse">
                 Get Started
                 <ArrowRight className="ml-2 h-5 w-5" />
               </Link>
             </div>
           )}
         </div>
       </Section>
 
       {/* Change Path Confirmation Dialog */}
       <AlertDialog open={showChangeConfirm} onOpenChange={setShowChangeConfirm}>
         <AlertDialogContent className="border-2 border-border">
           <AlertDialogHeader>
             <AlertDialogTitle className="flex items-center gap-2">
               <AlertCircle className="w-5 h-5 text-primary" />
               Change Degree Path?
             </AlertDialogTitle>
             <AlertDialogDescription>
               {pendingPath
                 ? `Switching from ${currentPathName} to ${
                     pendingPath === "certificate" ? "Certificate" : DEGREE_REQUIREMENTS[pendingPath].name
                   }. Your progress will be preserved but requirements will change.`
                 : "Changing your degree path will update your requirements. Your existing progress will be preserved."}
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Keep Current Path</AlertDialogCancel>
             <AlertDialogAction onClick={handleConfirmChange} className="btn-brutal">
               {pendingPath ? "Change Path" : "Select New Path"}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </PageLayout>
   );
 };
 
 // Dynamic Requirements Component
 function DynamicRequirements({ path }: { path: "associate" | "bachelor" | "certificate" }) {
   const config = DEGREE_REQUIREMENTS[path];
 
   const requirementItems = [
     { label: `${config.courses} Courses`, description: "Complete curriculum" },
     { label: `${config.quizzes} Quizzes`, description: "Pass with 80%+" },
     ...(config.exams > 0 ? [{ label: `${config.exams} Exam${config.exams > 1 ? "s" : ""}`, description: "Scenario challenges" }] : []),
     { label: `${config.projects} Project${config.projects > 1 ? "s" : ""}`, description: "Hands-on work" },
     ...(config.capstone ? [{ label: "1 Capstone", description: "Final film" }] : []),
     { label: "Certificate", description: "Official credentials" },
   ];
 
   return (
     <>
       <SectionHeader
         eyebrow={config.name}
         title="WHAT IT TAKES TO GRADUATE"
         description={`Requirements for the ${config.name} program.`}
         centered
       />
 
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         {requirementItems.map((item, index) => (
           <div
             key={index}
             className="text-center p-4 md:p-6 border-2 border-border bg-card hover:border-primary transition-all duration-300 animate-reveal"
             style={{ animationDelay: `${index * 0.1}s` }}
           >
             <div className="text-lg font-black text-foreground mb-1">{item.label}</div>
             <div className="text-xs text-muted-foreground">{item.description}</div>
           </div>
         ))}
       </div>
     </>
   );
 }
 
 export default Degrees;
