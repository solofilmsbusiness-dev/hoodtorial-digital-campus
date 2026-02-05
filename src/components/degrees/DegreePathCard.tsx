 import { useState } from "react";
 import { Link, useNavigate } from "react-router-dom";
 import { Check, ChevronDown, ChevronUp, GraduationCap, ArrowRight } from "lucide-react";
 import { motion, AnimatePresence } from "framer-motion";
 import { useAuth } from "@/contexts/AuthContext";
 import { DEGREE_REQUIREMENTS } from "@/hooks/useDegreeProgress";
 import type { DegreePath, CertificateDepartment } from "@/hooks/useDegreeSelection";
 
 interface DegreePathCardProps {
   path: "associate" | "bachelor" | "certificate";
   isSelected: boolean;
   isExpanded: boolean;
   onToggleExpand: () => void;
   onSelect: () => void;
   onSelectCertificate?: (department: CertificateDepartment) => void;
 }
 
 const pathRequirements = {
   associate: [
     "6 foundation courses",
     "6 module quizzes",
     "1 scenario exam",
     "2 practical projects",
   ],
   bachelor: [
     "14 courses (all departments)",
     "12+ quizzes",
     "3 scenario exams",
     "6 major projects",
     "1 capstone film",
   ],
   certificate: [
     "3-4 department courses",
     "3-4 department quizzes",
     "1 focused project",
     "Department specialization",
   ],
 };
 
 export function DegreePathCard({
   path,
   isSelected,
   isExpanded,
   onToggleExpand,
   onSelect,
   onSelectCertificate,
 }: DegreePathCardProps) {
   const { user } = useAuth();
   const navigate = useNavigate();
   const config = DEGREE_REQUIREMENTS[path];
   const isFeatured = path === "bachelor";
 
   const handleSelect = () => {
     if (!user) {
       navigate("/auth?redirect=/degrees");
       return;
     }
     onSelect();
   };
 
   return (
     <motion.div
       layout
       className={`relative flex flex-col border-2 p-6 md:p-8 bg-card transition-all duration-300 ${
         isSelected
           ? "border-primary glow-gold"
           : isFeatured
           ? "border-primary/50"
           : "border-border hover:border-primary/50"
       }`}
     >
       {/* Featured badge */}
       {isFeatured && !isSelected && (
         <div className="absolute -top-3 left-1/2 -translate-x-1/2">
           <span className="tag-sticker text-xs">Most Popular</span>
         </div>
       )}
 
       {/* Selected badge */}
       {isSelected && (
         <div className="absolute -top-3 left-1/2 -translate-x-1/2">
           <span className="tag-sticker text-xs bg-primary text-primary-foreground">
             <GraduationCap className="w-3 h-3 mr-1 inline" />
             Your Path
           </span>
         </div>
       )}
 
       {/* Header */}
       <div className="mb-4">
         <h3 className="heading-4 text-foreground mb-2">{config.name}</h3>
         <div className="flex items-baseline gap-2 mb-2">
           <span className="text-3xl md:text-4xl font-black text-primary">{config.credits}</span>
           <span className="text-muted-foreground font-medium">credits</span>
         </div>
         <div className="text-sm text-muted-foreground">
           Duration: <span className="text-foreground font-medium">{config.duration}</span>
         </div>
       </div>
 
       <p className="text-muted-foreground text-sm mb-4 flex-1">{config.description}</p>
 
       {/* Expand/Collapse button */}
       <button
         onClick={onToggleExpand}
         className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
       >
         {isExpanded ? (
           <>
             Hide Details <ChevronUp className="w-4 h-4" />
           </>
         ) : (
           <>
             View Requirements <ChevronDown className="w-4 h-4" />
           </>
         )}
       </button>
 
       {/* Expandable requirements */}
       <AnimatePresence>
         {isExpanded && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.2 }}
             className="overflow-hidden"
           >
             <div className="space-y-2 mb-6 pt-4 border-t border-border">
               <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                 Requirements
               </div>
               {pathRequirements[path].map((req, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-5 h-5 bg-primary/20 border border-primary flex items-center justify-center shrink-0">
                     <Check className="h-3 w-3 text-primary" />
                   </div>
                   <span className="text-sm text-foreground">{req}</span>
                 </div>
               ))}
             </div>
           </motion.div>
         )}
       </AnimatePresence>
 
       {/* Action button */}
       {isSelected ? (
         <Link
           to={`/skill-tree/${path}`}
           className="btn-brutal w-full text-center flex items-center justify-center gap-2"
         >
           Continue Journey
           <ArrowRight className="w-4 h-4" />
         </Link>
       ) : (
         <button
           onClick={handleSelect}
           className={`w-full py-3 font-bold uppercase tracking-wide transition-all duration-300 ${
             isFeatured
               ? "btn-brutal"
               : "border-2 border-border hover:border-primary hover:bg-primary hover:text-primary-foreground"
           }`}
         >
           {path === "certificate" ? "Choose Specialization" : "Start This Path"}
         </button>
       )}
     </motion.div>
   );
 }