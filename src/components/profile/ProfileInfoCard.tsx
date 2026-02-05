 import { useState, useRef } from "react";
 import { motion } from "framer-motion";
 import { Card, CardContent } from "@/components/ui/card";
 import { cn } from "@/lib/utils";
 
 interface ProfileInfoCardProps {
   icon: React.ReactNode;
   label: string;
   children: React.ReactNode;
   delay?: number;
   accentColor?: string;
 }
 
 export function ProfileInfoCard({ 
   icon, 
   label, 
   children, 
   delay = 0,
   accentColor
 }: ProfileInfoCardProps) {
   const [rotateX, setRotateX] = useState(0);
   const [rotateY, setRotateY] = useState(0);
   const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
   const cardRef = useRef<HTMLDivElement>(null);
 
   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
     if (!cardRef.current) return;
     const rect = cardRef.current.getBoundingClientRect();
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     const centerX = rect.width / 2;
     const centerY = rect.height / 2;
     
     setRotateX((y - centerY) / 12);
     setRotateY((centerX - x) / 12);
     setGlarePosition({ 
       x: (x / rect.width) * 100, 
       y: (y / rect.height) * 100 
     });
   };
 
   const handleMouseLeave = () => {
     setRotateX(0);
     setRotateY(0);
   };
 
   return (
     <motion.div
       ref={cardRef}
       initial={{ opacity: 0, y: 30 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5, delay }}
       onMouseMove={handleMouseMove}
       onMouseLeave={handleMouseLeave}
       style={{
         transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
         transformStyle: "preserve-3d"
       }}
       className="relative"
     >
       <Card className={cn(
         "bg-charcoal border-2 border-border overflow-hidden transition-all duration-300",
         "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
       )}>
         {/* Glare effect */}
         <div 
           className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
           style={{
             background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, hsl(var(--primary) / 0.15) 0%, transparent 50%)`
           }}
         />
         
         <CardContent className="pt-5 pb-4 relative z-10">
           {/* Icon box with hover effect */}
           <div className={cn(
             "inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3",
             "bg-charcoal-light border border-border transition-all duration-300",
             "group-hover:border-primary group-hover:bg-primary/10"
           )}
           style={accentColor ? { borderColor: `${accentColor}50` } : undefined}
           >
             <span className="text-primary">{icon}</span>
           </div>
           
           {/* Label */}
           <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
             {label}
           </p>
           
           {/* Content */}
           <div className="text-foreground text-sm leading-relaxed">
             {children}
           </div>
         </CardContent>
       </Card>
     </motion.div>
   );
 }