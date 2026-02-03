import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAvatarUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadAvatar = async (file: File): Promise<{ url: string | null; error: Error | null }> => {
    if (!user) return { url: null, error: new Error("Not authenticated") };

    setUploading(true);
    setProgress(0);

    try {
      // Delete old avatar first
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("avatars").remove(filesToDelete);
      }

      setProgress(30);

      // Get file extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/avatar.${ext}`;

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setProgress(70);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Add cache buster to URL
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProgress(100);
      return { url: publicUrl, error: null };
    } catch (err) {
      return { url: null, error: err as Error };
    } finally {
      setUploading(false);
    }
  };

  const uploadCoverBanner = async (file: File): Promise<{ url: string | null; error: Error | null }> => {
    if (!user) return { url: null, error: new Error("Not authenticated") };

    setUploading(true);
    setProgress(0);

    try {
      // Delete old banner first
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(user.id);

      if (existingFiles) {
        const bannerFiles = existingFiles.filter((f) => f.name.startsWith("banner"));
        if (bannerFiles.length > 0) {
          const filesToDelete = bannerFiles.map((f) => `${user.id}/${f.name}`);
          await supabase.storage.from("avatars").remove(filesToDelete);
        }
      }

      setProgress(30);

      // Get file extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/banner.${ext}`;

      // Upload new banner
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setProgress(70);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile with new banner URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ cover_banner_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProgress(100);
      return { url: publicUrl, error: null };
    } catch (err) {
      return { url: null, error: err as Error };
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async (): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(user.id);

      if (existingFiles) {
        const avatarFiles = existingFiles.filter((f) => f.name.startsWith("avatar"));
        if (avatarFiles.length > 0) {
          const filesToDelete = avatarFiles.map((f) => `${user.id}/${f.name}`);
          await supabase.storage.from("avatars").remove(filesToDelete);
        }
      }

      await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const removeCoverBanner = async (): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(user.id);

      if (existingFiles) {
        const bannerFiles = existingFiles.filter((f) => f.name.startsWith("banner"));
        if (bannerFiles.length > 0) {
          const filesToDelete = bannerFiles.map((f) => `${user.id}/${f.name}`);
          await supabase.storage.from("avatars").remove(filesToDelete);
        }
      }

      await supabase
        .from("profiles")
        .update({ cover_banner_url: null })
        .eq("user_id", user.id);

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    uploadAvatar,
    uploadCoverBanner,
    removeAvatar,
    removeCoverBanner,
    uploading,
    progress,
  };
}
