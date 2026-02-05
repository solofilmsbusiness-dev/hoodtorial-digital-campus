 import { motion } from "framer-motion";
 import { Play, ExternalLink, Film } from "lucide-react";
 import { AspectRatio } from "@/components/ui/aspect-ratio";
 import { cn } from "@/lib/utils";
 
 interface FeaturedProjectCompactProps {
   title: string;
   url: string;
   thumbnail: string | null;
   accentColor?: string | null;
 }
 
 // Helper to detect video platform and get embed URL
 const getVideoEmbed = (url: string) => {
   if (!url) return null;
   
   // YouTube
   const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/);
   if (ytMatch) {
     return {
       type: "youtube",
       embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
     };
   }
   
   // Vimeo
   const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
   if (vimeoMatch) {
     return {
       type: "vimeo",
       embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0`,
     };
   }
   
   return null;
 };
 
 export function FeaturedProjectCompact({ 
   title, 
   url, 
   thumbnail,
   accentColor 
 }: FeaturedProjectCompactProps) {
   const videoEmbed = getVideoEmbed(url);
   const hasContent = url || thumbnail;
   
   if (!hasContent) return null;
 
   const accentStyle = accentColor ? { 
     '--accent-glow': accentColor,
     boxShadow: `0 0 20px ${accentColor}20`
   } as React.CSSProperties : {};
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.4, delay: 0.5 }}
       className="max-w-md"
     >
       {/* Header */}
       <div className="flex items-center gap-2 mb-3">
         <Film className="h-4 w-4 text-primary" />
         <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
           Featured Project
         </span>
       </div>
 
       {/* Compact Video/Image Card */}
       <motion.div
         whileHover={{ scale: 1.02 }}
         transition={{ duration: 0.2 }}
         className={cn(
           "relative rounded-lg overflow-hidden",
           "border-2 border-border/50 bg-charcoal/50",
           "hover:border-primary/50 transition-all duration-300",
           "group cursor-pointer"
         )}
         style={accentStyle}
       >
         <AspectRatio ratio={4 / 3}>
           {videoEmbed ? (
             <iframe
               src={videoEmbed.embedUrl}
               title={title || "Featured Project"}
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
               className="w-full h-full"
             />
           ) : thumbnail ? (
             <a 
               href={url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="block w-full h-full"
             >
               <img
                 src={thumbnail}
                 alt={title || "Featured Project"}
                 className="w-full h-full object-cover"
               />
               {/* Play overlay for thumbnails */}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="bg-primary/90 rounded-full p-3">
                   <Play className="h-6 w-6 text-primary-foreground fill-current" />
                 </div>
               </div>
             </a>
           ) : url ? (
             <a
               href={url}
               target="_blank"
               rel="noopener noreferrer"
               className="w-full h-full flex items-center justify-center bg-charcoal"
             >
               <div className="text-center">
                 <ExternalLink className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                 <span className="text-sm text-muted-foreground">View Project</span>
               </div>
             </a>
           ) : null}
         </AspectRatio>
       </motion.div>
 
       {/* Title with external link */}
       {title && (
         <a
           href={url}
           target="_blank"
           rel="noopener noreferrer"
           className="flex items-center gap-1.5 mt-2 text-sm font-medium text-foreground hover:text-primary transition-colors group"
         >
           <span className="truncate">{title}</span>
           <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50 group-hover:opacity-100" />
         </a>
       )}
     </motion.div>
   );
 }