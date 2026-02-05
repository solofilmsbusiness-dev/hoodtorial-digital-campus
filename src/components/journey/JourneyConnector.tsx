 import { motion } from "framer-motion";
 import { ChevronDown } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface JourneyConnectorProps {
   isActive: boolean;
   index: number;
 }
 
 export function JourneyConnector({ isActive, index }: JourneyConnectorProps) {
   return (
     <motion.div
       initial={{ opacity: 0, scaleY: 0 }}
       animate={{ opacity: 1, scaleY: 1 }}
       transition={{ delay: index * 0.1 + 0.3 }}
       className="flex flex-col items-center py-4"
     >
       {/* Vertical line */}
       <div
         className={cn(
           "w-0.5 h-8 rounded-full",
           isActive ? "bg-primary" : "bg-border"
         )}
       />
       
       {/* Chevron indicator */}
       <div
         className={cn(
           "rounded-full p-1 my-1",
           isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
         )}
       >
         <ChevronDown className="w-4 h-4" />
       </div>
       
       {/* Bottom line */}
       <div
         className={cn(
           "w-0.5 h-8 rounded-full",
           isActive ? "bg-primary" : "bg-border"
         )}
       />
     </motion.div>
   );
 }