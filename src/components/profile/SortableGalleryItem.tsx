 import { useSortable } from "@dnd-kit/sortable";
 import { CSS } from "@dnd-kit/utilities";
 import { GripVertical, Play, X } from "lucide-react";
 import { AspectRatio } from "@/components/ui/aspect-ratio";
 import { Button } from "@/components/ui/button";
 
 interface SortableGalleryItemProps {
   id: string;
   url: string;
   index: number;
   onRemove: (url: string) => void;
   isDeleting: boolean;
 }
 
 export function SortableGalleryItem({
   id,
   url,
   index,
   onRemove,
   isDeleting,
 }: SortableGalleryItemProps) {
   const {
     attributes,
     listeners,
     setNodeRef,
     transform,
     transition,
     isDragging,
   } = useSortable({ id });
 
   const style = {
     transform: CSS.Transform.toString(transform),
     transition,
     opacity: isDragging ? 0.5 : 1,
     zIndex: isDragging ? 50 : undefined,
   };
 
   const isVideo = (url: string) => /\.(mp4|webm|mov|avi)$/i.test(url);
 
   return (
     <div
       ref={setNodeRef}
       style={style}
       className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
         isDragging
           ? "border-primary shadow-lg scale-105"
           : "border-border hover:border-primary/50"
       }`}
     >
       <AspectRatio ratio={1}>
         {/* Drag Handle */}
         <div
           {...attributes}
           {...listeners}
           className="absolute top-2 left-2 z-20 p-1.5 rounded bg-background/80 backdrop-blur-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
         >
           <GripVertical className="h-4 w-4 text-foreground" />
         </div>
 
         {/* Position Number */}
         <div className="absolute top-2 right-10 z-20 px-2 py-0.5 rounded bg-background/80 backdrop-blur-sm text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
           #{index + 1}
         </div>
 
         {/* Delete Button */}
         <Button
           variant="destructive"
           size="icon"
           className="absolute top-2 right-2 z-20 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
           onClick={(e) => {
             e.stopPropagation();
             onRemove(url);
           }}
           disabled={isDeleting}
         >
           <X className="h-3 w-3" />
         </Button>
 
         {/* Media Content */}
         {isVideo(url) ? (
           <div className="relative w-full h-full">
             <video
               src={url}
               className="w-full h-full object-cover"
               muted
             />
             <div className="absolute inset-0 flex items-center justify-center bg-background/30 pointer-events-none">
               <div className="p-2 rounded-full bg-background/80">
                 <Play className="h-5 w-5 text-foreground" />
               </div>
             </div>
           </div>
         ) : (
           <img
             src={url}
             alt={`Gallery item ${index + 1}`}
             className="w-full h-full object-cover"
             draggable={false}
           />
         )}
       </AspectRatio>
     </div>
   );
 }