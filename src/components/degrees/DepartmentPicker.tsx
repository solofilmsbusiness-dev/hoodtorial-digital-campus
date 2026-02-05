 import { motion } from "framer-motion";
 import { Camera, Film, Clapperboard, Palette, Check } from "lucide-react";
 import { DEPARTMENT_CONFIG } from "@/hooks/useDegreeProgress";
 import type { CertificateDepartment } from "@/hooks/useDegreeSelection";
 
 interface DepartmentPickerProps {
   selectedDepartment: CertificateDepartment;
   onSelect: (department: CertificateDepartment) => void;
   onConfirm: () => void;
   onCancel: () => void;
 }
 
 const departmentIcons = {
   cinematography: Camera,
   "post-production": Palette,
   directing: Clapperboard,
   production: Film,
 };
 
 const departmentColors = {
   cinematography: "border-primary text-primary bg-primary/10",
   "post-production": "border-neon-purple text-neon-purple bg-neon-purple/10",
   directing: "border-neon-cyan text-neon-cyan bg-neon-cyan/10",
   production: "border-neon-pink text-neon-pink bg-neon-pink/10",
 };
 
 const departmentSelectedColors = {
   cinematography: "border-primary bg-primary text-primary-foreground",
   "post-production": "border-neon-purple bg-neon-purple text-white",
   directing: "border-neon-cyan bg-neon-cyan text-black",
   production: "border-neon-pink bg-neon-pink text-white",
 };
 
 export function DepartmentPicker({
   selectedDepartment,
   onSelect,
   onConfirm,
   onCancel,
 }: DepartmentPickerProps) {
   const departments = Object.entries(DEPARTMENT_CONFIG) as [
     CertificateDepartment,
     typeof DEPARTMENT_CONFIG[keyof typeof DEPARTMENT_CONFIG]
   ][];
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -20 }}
       className="bg-card border-2 border-primary p-6 md:p-8 mt-8"
     >
       <div className="text-center mb-6">
         <h3 className="heading-4 text-foreground mb-2">Choose Your Specialization</h3>
         <p className="text-muted-foreground text-sm">
           Select a department to focus your certificate program
         </p>
       </div>
 
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         {departments.map(([key, config]) => {
           const Icon = departmentIcons[key];
           const isSelected = selectedDepartment === key;
 
           return (
             <button
               key={key}
               onClick={() => onSelect(key)}
               className={`relative p-4 border-2 transition-all duration-300 group ${
                 isSelected ? departmentSelectedColors[key] : departmentColors[key]
               }`}
             >
               {isSelected && (
                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-background border-2 border-current rounded-full flex items-center justify-center">
                   <Check className="w-3 h-3" />
                 </div>
               )}
 
               <Icon className="w-8 h-8 mx-auto mb-2" />
               <div className="font-bold text-sm mb-1">{config.name}</div>
               <div className={`text-xs ${isSelected ? "opacity-80" : "text-muted-foreground"}`}>
                 {config.courses.length} courses • {config.credits} credits
               </div>
             </button>
           );
         })}
       </div>
 
       <div className="flex gap-4 justify-center">
         <button
           onClick={onCancel}
           className="px-6 py-2 border-2 border-border hover:border-muted-foreground font-medium transition-colors"
         >
           Cancel
         </button>
         <button
           onClick={onConfirm}
           disabled={!selectedDepartment}
           className={`px-6 py-2 font-bold transition-all ${
             selectedDepartment
               ? "btn-brutal"
               : "bg-muted text-muted-foreground cursor-not-allowed"
           }`}
         >
           Confirm Selection
         </button>
       </div>
     </motion.div>
   );
 }