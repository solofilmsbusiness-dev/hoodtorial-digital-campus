 import { motion } from "framer-motion";
 import { ExternalLink, Play } from "lucide-react";
 import { AspectRatio } from "@/components/ui/aspect-ratio";
 
 interface FeaturedProjectShowcaseProps {
   title: string;
   url: string;
   thumbnail: string | null;
 }
 
 export function FeaturedProjectShowcase({
   title,
   url,
   thumbnail,
 }: FeaturedProjectShowcaseProps) {
   if (!url && !thumbnail) return null;
 
   const getEmbedType = (url: string): "youtube" | "vimeo" | "other" | null => {
     if (!url) return null;
     if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
     if (url.includes("vimeo.com")) return "vimeo";
     return "other";
   };
 
   const getYouTubeId = (url: string): string | null => {
     const match = url.match(
       /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
     );
     return match ? match[1] : null;
   };
 
   const getVimeoId = (url: string): string | null => {
     const match = url.match(/vimeo\.com\/(\d+)/);
     return match ? match[1] : null;
   };
 
   const embedType = getEmbedType(url);
   const youtubeId = embedType === "youtube" ? getYouTubeId(url) : null;
   const vimeoId = embedType === "vimeo" ? getVimeoId(url) : null;
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5 }}
       className="space-y-3"
     >
       <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
         <span className="text-primary">◆</span>
         Featured Project
       </h3>
 
       <motion.div
         className="group relative rounded-xl overflow-hidden border-2 border-border/50 bg-charcoal"
         whileHover={{ scale: 1.005 }}
         transition={{ duration: 0.2 }}
       >
         {/* Glow effect on hover */}
         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
           <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
         </div>
 
         <AspectRatio ratio={16 / 9}>
           {youtubeId ? (
             <iframe
               src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
               title={title || "Featured Project"}
               className="w-full h-full"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             />
           ) : vimeoId ? (
             <iframe
               src={`https://player.vimeo.com/video/${vimeoId}`}
               title={title || "Featured Project"}
               className="w-full h-full"
               allow="autoplay; fullscreen; picture-in-picture"
               allowFullScreen
             />
           ) : thumbnail ? (
             <a
               href={url}
               target="_blank"
               rel="noopener noreferrer"
               className="relative block w-full h-full"
             >
               <img
                 src={thumbnail}
                 alt={title || "Featured Project"}
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
               {/* Film grain overlay */}
               <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 mix-blend-overlay pointer-events-none" />
               
               {/* Gradient overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
               
               {/* Play button */}
               <div className="absolute inset-0 flex items-center justify-center">
                 <motion.div
                   className="p-5 rounded-full bg-primary/90 text-primary-foreground shadow-xl"
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   <Play className="h-10 w-10" fill="currentColor" />
                 </motion.div>
               </div>
             </a>
           ) : url ? (
             <a
               href={url}
               target="_blank"
               rel="noopener noreferrer"
               className="w-full h-full flex items-center justify-center bg-charcoal-light hover:bg-charcoal transition-colors"
             >
               <div className="text-center">
                 <ExternalLink className="h-12 w-12 mx-auto mb-2 text-primary" />
                 <span className="text-sm text-muted-foreground">View Project</span>
               </div>
             </a>
           ) : null}
         </AspectRatio>
 
         {/* Title bar */}
         {title && (
           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 to-transparent">
             <h4 className="text-lg font-bold text-foreground">{title}</h4>
           </div>
         )}
       </motion.div>
     </motion.div>
   );
 }