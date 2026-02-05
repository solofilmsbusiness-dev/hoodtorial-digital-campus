 import { motion } from "framer-motion";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { cn } from "@/lib/utils";
 
 interface ProfileAvatarProps {
   avatarUrl: string | null;
   displayName: string | null;
   accentColor?: string | null;
   borderStyle?: string | null;
   size?: "md" | "lg" | "xl";
 }
 
 export function ProfileAvatar({ 
   avatarUrl, 
   displayName, 
   accentColor,
   borderStyle,
   size = "xl"
 }: ProfileAvatarProps) {
   const getInitials = (name?: string | null) => {
     if (!name) return "?";
     return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
   };
 
   const sizeClasses = {
     md: "h-20 w-20",
     lg: "h-28 w-28",
     xl: "h-36 w-36"
   };
 
   const glowColor = accentColor || "hsl(var(--primary))";
 
   return (
     <motion.div
       initial={{ scale: 0.8, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
       className="relative group"
     >
       {/* Animated glow ring */}
       <motion.div 
         className="absolute -inset-1 rounded-full opacity-60"
         style={{ 
           background: `conic-gradient(from 0deg, ${glowColor}, transparent, ${glowColor})`,
         }}
         animate={{ rotate: 360 }}
         transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
       />
       
       {/* Pulsing outer ring */}
       <motion.div 
         className="absolute -inset-2 rounded-full"
         style={{ 
           boxShadow: `0 0 30px ${glowColor}40, 0 0 60px ${glowColor}20`
         }}
         animate={{ 
           boxShadow: [
             `0 0 20px ${glowColor}30, 0 0 40px ${glowColor}10`,
             `0 0 40px ${glowColor}50, 0 0 80px ${glowColor}30`,
             `0 0 20px ${glowColor}30, 0 0 40px ${glowColor}10`
           ]
         }}
         transition={{ duration: 3, repeat: Infinity }}
       />
 
       <Avatar 
         className={cn(
           sizeClasses[size],
           "border-4 border-background shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-105",
           borderStyle === "gradient" && "ring-2 ring-primary",
           borderStyle === "gold" && "ring-2 ring-gold"
         )}
         style={accentColor ? { borderColor: accentColor } : undefined}
       >
         <AvatarImage src={avatarUrl || undefined} className="object-cover" />
         <AvatarFallback className="bg-charcoal-light text-primary font-black text-3xl">
           {getInitials(displayName)}
         </AvatarFallback>
       </Avatar>
     </motion.div>
   );
 }