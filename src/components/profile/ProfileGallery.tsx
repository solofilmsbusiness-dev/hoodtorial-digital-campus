 import { useState, useRef } from "react";
 import { motion } from "framer-motion";
 import { Plus, Play, X, Image as ImageIcon, Loader2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Dialog, DialogContent } from "@/components/ui/dialog";
 import { AspectRatio } from "@/components/ui/aspect-ratio";
 import { useProfileGallery } from "@/hooks/useProfileGallery";
 
 interface ProfileGalleryProps {
   gallery: string[];
   isOwnProfile: boolean;
 }
 
 export function ProfileGallery({ gallery, isOwnProfile }: ProfileGalleryProps) {
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
   const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
 
   const {
     addMedia,
     removeMedia,
     isUploading,
     isDeleting,
     canAddMore,
     remainingSlots,
   } = useProfileGallery(gallery, isOwnProfile);
 
   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = Array.from(e.target.files || []);
     if (files.length > 0) {
       await addMedia(files);
     }
     // Reset input
     if (fileInputRef.current) {
       fileInputRef.current.value = "";
     }
   };
 
   const isVideo = (url: string) => {
     return /\.(mp4|webm|mov|avi)$/i.test(url);
   };
 
   const handleRemove = async (url: string) => {
     await removeMedia(url);
     setConfirmDelete(null);
   };
 
   // Don't show section if empty and not own profile
   if (gallery.length === 0 && !isOwnProfile) {
     return null;
   }
 
   return (
     <div className="space-y-4">
       <motion.div
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.4 }}
         className="flex items-center justify-between"
       >
         <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
           <span className="text-neon-purple">◆</span>
           Portfolio Gallery
           {gallery.length > 0 && (
             <span className="text-sm font-normal text-muted-foreground">
               ({gallery.length})
             </span>
           )}
         </h3>
 
         {isOwnProfile && canAddMore && (
           <>
             <input
               ref={fileInputRef}
               type="file"
               accept="image/*,video/*"
               multiple
               className="hidden"
               onChange={handleFileSelect}
             />
             <Button
               variant="outline"
               size="sm"
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
               className="gap-2 border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10"
             >
               {isUploading ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <Plus className="h-4 w-4" />
               )}
               Add Media
             </Button>
           </>
         )}
       </motion.div>
 
       {gallery.length === 0 ? (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center"
         >
           <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
           <p className="text-muted-foreground text-sm">
             No portfolio items yet
           </p>
           {isOwnProfile && (
             <p className="text-xs text-muted-foreground mt-1">
               Add photos and videos to showcase your work
             </p>
           )}
         </motion.div>
       ) : (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
           {gallery.map((url, index) => (
             <motion.div
               key={url}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.3, delay: index * 0.05 }}
               className="relative group"
             >
               <AspectRatio ratio={1} className="bg-charcoal rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-colors">
                 {isVideo(url) ? (
                   <div className="relative w-full h-full">
                     <video
                       src={url}
                       className="w-full h-full object-cover cursor-pointer"
                       onClick={() => setSelectedIndex(index)}
                     />
                     <div className="absolute inset-0 flex items-center justify-center bg-background/30 pointer-events-none">
                       <div className="p-2 rounded-full bg-background/80">
                         <Play className="h-6 w-6 text-foreground" />
                       </div>
                     </div>
                   </div>
                 ) : (
                   <img
                     src={url}
                     alt={`Portfolio item ${index + 1}`}
                     className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                     onClick={() => setSelectedIndex(index)}
                   />
                 )}
 
                 {/* Delete button overlay */}
                 {isOwnProfile && (
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button
                       variant="destructive"
                       size="icon"
                       className="h-7 w-7"
                       onClick={(e) => {
                         e.stopPropagation();
                         setConfirmDelete(url);
                       }}
                       disabled={isDeleting}
                     >
                       <X className="h-3 w-3" />
                     </Button>
                   </div>
                 )}
               </AspectRatio>
             </motion.div>
           ))}
         </div>
       )}
 
       {/* Lightbox */}
       <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
         <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur border-border">
           {selectedIndex !== null && (
             <div className="relative p-4">
               {isVideo(gallery[selectedIndex]) ? (
                 <video
                   src={gallery[selectedIndex]}
                   controls
                   autoPlay
                   className="w-full max-h-[70vh] rounded"
                 />
               ) : (
                 <img
                   src={gallery[selectedIndex]}
                   alt={`Portfolio item ${selectedIndex + 1}`}
                   className="w-full max-h-[70vh] object-contain rounded"
                 />
               )}
               {gallery.length > 1 && (
                 <div className="text-center pt-4 text-sm text-muted-foreground">
                   {selectedIndex + 1} / {gallery.length}
                 </div>
               )}
             </div>
           )}
         </DialogContent>
       </Dialog>
 
       {/* Delete confirmation */}
       <Dialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
         <DialogContent className="max-w-sm">
           <div className="text-center space-y-4">
             <h4 className="text-lg font-semibold">Remove from Gallery?</h4>
             <p className="text-sm text-muted-foreground">
               This will permanently delete this item from your portfolio.
             </p>
             <div className="flex gap-3 justify-center">
               <Button
                 variant="outline"
                 onClick={() => setConfirmDelete(null)}
               >
                 Cancel
               </Button>
               <Button
                 variant="destructive"
                 onClick={() => confirmDelete && handleRemove(confirmDelete)}
                 disabled={isDeleting}
               >
                 {isDeleting ? (
                   <Loader2 className="h-4 w-4 animate-spin mr-2" />
                 ) : null}
                 Remove
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 }