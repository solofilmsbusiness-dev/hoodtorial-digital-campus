 import { useRef, useState } from "react";
 import {
   DndContext,
   closestCenter,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   DragEndEvent,
 } from "@dnd-kit/core";
 import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
   rectSortingStrategy,
 } from "@dnd-kit/sortable";
 import { Plus, Loader2, Images } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { SortableGalleryItem } from "./SortableGalleryItem";
 import { Dialog, DialogContent } from "@/components/ui/dialog";
 
 interface GalleryEditorProps {
   gallery: string[];
   onReorder: (newOrder: string[]) => void;
   onAdd: (files: File[]) => Promise<void>;
   onRemove: (url: string) => Promise<void>;
   isUploading: boolean;
   maxItems?: number;
 }
 
 export function GalleryEditor({
   gallery,
   onReorder,
   onAdd,
   onRemove,
   isUploading,
   maxItems = 12,
 }: GalleryEditorProps) {
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);
 
   const sensors = useSensors(
     useSensor(PointerSensor, {
       activationConstraint: {
         distance: 8,
       },
     }),
     useSensor(KeyboardSensor, {
       coordinateGetter: sortableKeyboardCoordinates,
     })
   );
 
   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;
 
     if (over && active.id !== over.id) {
       const oldIndex = gallery.indexOf(active.id as string);
       const newIndex = gallery.indexOf(over.id as string);
       const newOrder = arrayMove(gallery, oldIndex, newIndex);
       onReorder(newOrder);
     }
   };
 
   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = Array.from(e.target.files || []);
     if (files.length > 0) {
       await onAdd(files);
     }
     if (fileInputRef.current) {
       fileInputRef.current.value = "";
     }
   };
 
   const handleRemove = async (url: string) => {
     setIsDeleting(true);
     await onRemove(url);
     setIsDeleting(false);
     setConfirmDelete(null);
   };
 
   const canAddMore = gallery.length < maxItems;
 
   return (
     <Card className="card-urban">
       <CardHeader className="flex flex-row items-center justify-between">
         <CardTitle className="flex items-center gap-2">
           <Images className="h-5 w-5 text-primary" />
           Portfolio Gallery
         </CardTitle>
         <span className="text-sm text-muted-foreground">
           {gallery.length}/{maxItems} items
         </span>
       </CardHeader>
       <CardContent className="space-y-4">
         {gallery.length === 0 ? (
           <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
             <Images className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
             <p className="text-muted-foreground text-sm mb-2">
               No portfolio items yet
             </p>
             <p className="text-xs text-muted-foreground">
               Add photos and videos to showcase your work
             </p>
           </div>
         ) : (
           <DndContext
             sensors={sensors}
             collisionDetection={closestCenter}
             onDragEnd={handleDragEnd}
           >
             <SortableContext items={gallery} strategy={rectSortingStrategy}>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {gallery.map((url, index) => (
                   <SortableGalleryItem
                     key={url}
                     id={url}
                     url={url}
                     index={index}
                     onRemove={(url) => setConfirmDelete(url)}
                     isDeleting={isDeleting}
                   />
                 ))}
               </div>
             </SortableContext>
           </DndContext>
         )}
 
         {/* Add Media Button */}
         {canAddMore && (
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
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
               className="w-full gap-2 border-dashed border-2 border-primary/30 text-primary hover:bg-primary/10"
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
 
         <p className="text-xs text-muted-foreground text-center">
           💡 Drag items to reorder. First item shows as primary on your profile.
         </p>
 
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
       </CardContent>
     </Card>
   );
 }