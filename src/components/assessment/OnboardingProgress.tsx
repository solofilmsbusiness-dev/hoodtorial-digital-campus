 import { cn } from "@/lib/utils";
 import { Check } from "lucide-react";
 
 interface OnboardingStep {
   id: string;
   label: string;
   completed?: boolean;
 }
 
 interface OnboardingProgressProps {
   steps: OnboardingStep[];
   currentStepIndex: number;
   className?: string;
 }
 
 export function OnboardingProgress({ steps, currentStepIndex, className }: OnboardingProgressProps) {
   return (
     <div className={cn("p-4 rounded-lg bg-primary/5 border border-primary/20", className)}>
       <div className="flex items-center justify-between mb-3">
         <span className="text-sm font-medium text-muted-foreground">Getting Started</span>
         <span className="text-xs text-muted-foreground">
           Step {currentStepIndex + 1} of {steps.length}
         </span>
       </div>
       <div className="flex items-center gap-2">
         {steps.map((step, i) => {
           const isCompleted = step.completed || i < currentStepIndex;
           const isActive = i === currentStepIndex;
           
           return (
             <div key={step.id} className="flex items-center gap-2 flex-1">
               <div className="flex items-center gap-2 flex-1">
                 <div
                   className={cn(
                     "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                     isCompleted
                       ? "bg-primary text-primary-foreground"
                       : isActive
                         ? "bg-primary text-primary-foreground"
                         : "bg-muted text-muted-foreground"
                   )}
                 >
                   {isCompleted ? (
                     <Check className="w-3 h-3" />
                   ) : (
                     i + 1
                   )}
                 </div>
                 <span
                   className={cn(
                     "text-sm font-medium transition-colors",
                     isActive ? "text-foreground" : "text-muted-foreground"
                   )}
                 >
                   {step.label}
                 </span>
               </div>
               {i < steps.length - 1 && (
                 <div 
                   className={cn(
                     "h-0.5 flex-1 transition-colors",
                     isCompleted ? "bg-primary" : "bg-muted"
                   )} 
                 />
               )}
             </div>
           );
         })}
       </div>
     </div>
   );
 }