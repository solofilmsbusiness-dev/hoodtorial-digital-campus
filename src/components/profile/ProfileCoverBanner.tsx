 import { motion } from "framer-motion";
 import { cn } from "@/lib/utils";
 
 interface ProfileCoverBannerProps {
   coverUrl: string | null;
   accentColor?: string | null;
   coverPosition?: number | null;
 }
 
 export function ProfileCoverBanner({ coverUrl, accentColor }: ProfileCoverBannerProps) {
   return (
     <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ duration: 0.5 }}
       className="relative h-56 md:h-72 rounded-xl overflow-hidden"
     >
       {/* Main banner image or gradient */}
       {coverUrl ? (
         <img
           src={coverUrl}
           alt="Cover"
           className="w-full h-full object-cover"
         />
       ) : (
         <div 
           className="w-full h-full bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal"
           style={{
             backgroundImage: accentColor 
               ? `linear-gradient(135deg, ${accentColor}20, hsl(var(--charcoal)), ${accentColor}10)`
               : undefined
           }}
         />
       )}
       
       {/* Gradient overlay fading to background */}
       <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
       
       {/* Noise texture overlay */}
       <div className="absolute inset-0 bg-noise pointer-events-none" />
       
       {/* Decorative corner accents */}
       <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50 rounded-tl-sm" />
       <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/50 rounded-tr-sm" />
       <div className="absolute bottom-16 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/30 rounded-bl-sm" />
       <div className="absolute bottom-16 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-sm" />
       
       {/* Animated glow line at bottom */}
       <motion.div 
         className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
         animate={{ opacity: [0.3, 0.7, 0.3] }}
         transition={{ duration: 3, repeat: Infinity }}
       />
     </motion.div>
   );
 }