 import { useState } from "react";
 import { useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useCommunityUploads } from "@/hooks/useCommunityUploads";
 import { toast } from "sonner";
 
 const MAX_GALLERY_ITEMS = 12;
 
 export function useProfileGallery(
   currentGallery: string[] = [],
   isOwnProfile: boolean
 ) {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const { uploadImages, deleteImage, isUploading, uploadProgress } = useCommunityUploads();
   const [isDeleting, setIsDeleting] = useState(false);
 
   const updateGalleryMutation = useMutation({
     mutationFn: async (newGallery: string[]) => {
       if (!user) throw new Error("Not authenticated");
       
       const { error } = await supabase
         .from("profiles")
         .update({ portfolio_gallery: newGallery })
         .eq("user_id", user.id);
       
       if (error) throw error;
       return newGallery;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["public-profile"] });
       queryClient.invalidateQueries({ queryKey: ["profile"] });
     },
   });
 
   const addMedia = async (files: File[]) => {
    if (!user) {
      toast.error("You must be logged in");
      return [];
     }
 
     const remainingSlots = MAX_GALLERY_ITEMS - currentGallery.length;
     if (remainingSlots <= 0) {
       toast.error(`Gallery is full (max ${MAX_GALLERY_ITEMS} items)`);
      return [];
     }
 
     const filesToUpload = files.slice(0, remainingSlots);
     if (filesToUpload.length < files.length) {
       toast.info(`Only uploading ${filesToUpload.length} of ${files.length} files (gallery limit)`);
     }
 
     const uploadedUrls = await uploadImages(filesToUpload);
     if (uploadedUrls.length > 0) {
       const newGallery = [...currentGallery, ...uploadedUrls];
       await updateGalleryMutation.mutateAsync(newGallery);
       toast.success(`Added ${uploadedUrls.length} item(s) to gallery`);
     }
    return uploadedUrls;
   };
 
   const removeMedia = async (urlToRemove: string) => {
    if (!user) {
      toast.error("You must be logged in");
       return;
     }
 
     setIsDeleting(true);
     try {
       // Delete from storage
       await deleteImage(urlToRemove);
       
       // Update gallery array
       const newGallery = currentGallery.filter((url) => url !== urlToRemove);
       await updateGalleryMutation.mutateAsync(newGallery);
       toast.success("Removed from gallery");
     } catch (error) {
       console.error("Error removing from gallery:", error);
       toast.error("Failed to remove from gallery");
     } finally {
       setIsDeleting(false);
     }
   };
 
  const reorderGallery = async (newOrder: string[]) => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    
    try {
      await updateGalleryMutation.mutateAsync(newOrder);
    } catch (error) {
      console.error("Error reordering gallery:", error);
      toast.error("Failed to reorder gallery");
    }
  };

   return {
     addMedia,
     removeMedia,
    reorderGallery,
     isUploading,
     isDeleting,
     uploadProgress,
     canAddMore: currentGallery.length < MAX_GALLERY_ITEMS,
     remainingSlots: MAX_GALLERY_ITEMS - currentGallery.length,
   };
 }