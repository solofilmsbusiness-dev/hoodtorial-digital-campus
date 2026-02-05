 import { FlaskConical } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface TesterModeBannerProps {
   className?: string;
 }
 
 export function TesterModeBanner({ className }: TesterModeBannerProps) {
   return (
     <div
       className={cn(
         "fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground py-2 px-4",
         "flex items-center justify-center gap-3 shadow-lg",
         className
       )}
       style={{ backgroundColor: "hsl(270 60% 50%)" }}
     >
       <FlaskConical className="w-5 h-5 animate-pulse shrink-0" />
       <span className="font-bold text-sm uppercase tracking-wider">
         Tester Mode Active
       </span>
       <span className="hidden sm:inline text-sm opacity-90">
         — Full platform access for testing
       </span>
     </div>
   );
 }