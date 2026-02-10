import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BUCKET_NAME = "lesson-videos";
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_FILE_SIZE = 400 * 1024 * 1024; // 400MB

export function useLessonVideoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadVideo = useCallback(async (file: File): Promise<string | null> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP4, WebM, or MOV video file",
        variant: "destructive",
      });
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 400MB",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      // Simulate progress for large uploads
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 2, 90));
      }, 500);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      setUploadProgress(100);

      toast({
        title: "Video uploaded",
        description: file.name,
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error("Video upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload video",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [toast]);

  const deleteVideo = useCallback(async (url: string): Promise<boolean> => {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/lesson-videos\/(.+)/);

      if (!pathMatch) {
        console.error("Could not extract file path from URL");
        return false;
      }

      const filePath = decodeURIComponent(pathMatch[1]);

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      toast({ title: "Video removed" });
      return true;
    } catch (error) {
      console.error("Video delete error:", error);
      toast({
        title: "Failed to remove video",
        description: error instanceof Error ? error.message : "Could not delete video",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    uploadVideo,
    deleteVideo,
    isUploading,
    uploadProgress,
  };
}
