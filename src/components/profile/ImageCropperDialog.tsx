 import { useState, useCallback } from "react";
 import Cropper from "react-easy-crop";
 import type { Area } from "react-easy-crop";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Slider } from "@/components/ui/slider";
 import { getCroppedImg } from "@/lib/cropImage";
 import { ZoomIn, ZoomOut } from "lucide-react";
 
 interface ImageCropperDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   imageSrc: string | null;
   onCropComplete: (croppedBlob: Blob) => void;
   accentColor?: string;
 }
 
 export function ImageCropperDialog({
   open,
   onOpenChange,
   imageSrc,
   onCropComplete,
   accentColor = "#D4AF37",
 }: ImageCropperDialogProps) {
   const [crop, setCrop] = useState({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
   const [isSaving, setIsSaving] = useState(false);
 
   const onCropChange = useCallback(
     (_: Area, croppedAreaPixels: Area) => {
       setCroppedAreaPixels(croppedAreaPixels);
     },
     []
   );
 
   const handleSave = async () => {
     if (!imageSrc || !croppedAreaPixels) return;
 
     setIsSaving(true);
     try {
       const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
       onCropComplete(croppedBlob);
       onOpenChange(false);
       // Reset state for next use
       setCrop({ x: 0, y: 0 });
       setZoom(1);
     } catch (error) {
       console.error("Error cropping image:", error);
     } finally {
       setIsSaving(false);
     }
   };
 
   const handleCancel = () => {
     onOpenChange(false);
     setCrop({ x: 0, y: 0 });
     setZoom(1);
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle>Adjust Your Photo</DialogTitle>
         </DialogHeader>
 
         <div className="relative h-64 w-full bg-black/20 rounded-lg overflow-hidden">
           {imageSrc && (
             <Cropper
               image={imageSrc}
               crop={crop}
               zoom={zoom}
               aspect={1}
               cropShape="round"
               showGrid={false}
               onCropChange={setCrop}
               onZoomChange={setZoom}
               onCropComplete={onCropChange}
               style={{
                 cropAreaStyle: {
                   border: `3px solid ${accentColor}`,
                 },
               }}
             />
           )}
         </div>
 
         <div className="flex items-center gap-3 px-2">
           <ZoomOut className="h-4 w-4 text-muted-foreground" />
           <Slider
             value={[zoom]}
             min={1}
             max={3}
             step={0.1}
             onValueChange={(value) => setZoom(value[0])}
             className="flex-1"
           />
           <ZoomIn className="h-4 w-4 text-muted-foreground" />
         </div>
 
         <DialogFooter className="gap-2 sm:gap-0">
           <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
             Cancel
           </Button>
           <Button onClick={handleSave} disabled={isSaving || !croppedAreaPixels}>
             {isSaving ? "Saving..." : "Save"}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }