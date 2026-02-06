import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SiteSettings {
  login_video_url: string | null;
  login_logo_url: string | null;
  login_music_url: string | null;
  signup_disabled: string | null;
  // Admin background settings
  admin_bg_dashboard_video: string | null;
  admin_bg_dashboard_overlay: string | null;
  admin_bg_courses_video: string | null;
  admin_bg_courses_overlay: string | null;
  admin_bg_challenges_video: string | null;
  admin_bg_challenges_overlay: string | null;
  admin_bg_community_video: string | null;
  admin_bg_community_overlay: string | null;
  admin_bg_support_video: string | null;
  admin_bg_support_overlay: string | null;
  admin_bg_users_video: string | null;
  admin_bg_users_overlay: string | null;
  admin_bg_settings_video: string | null;
  admin_bg_settings_overlay: string | null;
  [key: string]: string | null;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    login_video_url: null,
    login_logo_url: null,
    login_music_url: null,
    signup_disabled: null,
    admin_bg_dashboard_video: null,
    admin_bg_dashboard_overlay: null,
    admin_bg_courses_video: null,
    admin_bg_courses_overlay: null,
    admin_bg_challenges_video: null,
    admin_bg_challenges_overlay: null,
    admin_bg_community_video: null,
    admin_bg_community_overlay: null,
    admin_bg_support_video: null,
    admin_bg_support_overlay: null,
    admin_bg_users_video: null,
    admin_bg_users_overlay: null,
    admin_bg_settings_video: null,
    admin_bg_settings_overlay: null,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("id, value");

      if (error) {
        console.error("Error fetching site settings:", error);
        return;
      }

      const settingsMap: SiteSettings = {
        login_video_url: null,
        login_logo_url: null,
        login_music_url: null,
        signup_disabled: null,
        admin_bg_dashboard_video: null,
        admin_bg_dashboard_overlay: null,
        admin_bg_courses_video: null,
        admin_bg_courses_overlay: null,
        admin_bg_challenges_video: null,
        admin_bg_challenges_overlay: null,
        admin_bg_community_video: null,
        admin_bg_community_overlay: null,
        admin_bg_support_video: null,
        admin_bg_support_overlay: null,
        admin_bg_users_video: null,
        admin_bg_users_overlay: null,
        admin_bg_settings_video: null,
        admin_bg_settings_overlay: null,
      };
      
      data?.forEach((s) => {
        settingsMap[s.id] = s.value;
      });
      
      setSettings(settingsMap);
    } catch (err) {
      console.error("Error fetching site settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (key: string, value: string | null) => {
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ 
          id: key, 
          value, 
          updated_at: new Date().toISOString(),
          updated_by: user?.id 
        });

      if (error) {
        console.error("Error updating site setting:", error);
        throw error;
      }

      setSettings((prev) => ({ ...prev, [key]: value }));
    } catch (err) {
      console.error("Error updating site setting:", err);
      throw err;
    }
  }, [user?.id]);

  const uploadAsset = useCallback(async (file: File, assetType: 'video' | 'logo' | 'music'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${assetType}-${Date.now()}.${fileExt}`;
    const filePath = `login/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error("Error uploading asset:", uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('site-assets')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }, []);

  const deleteAsset = useCallback(async (url: string) => {
    try {
      // Extract the file path from the URL
      const urlParts = url.split('/site-assets/');
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from('site-assets')
        .remove([filePath]);

      if (error) {
        console.error("Error deleting asset:", error);
      }
    } catch (err) {
      console.error("Error deleting asset:", err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { 
    settings, 
    loading, 
    fetchSettings, 
    updateSetting,
    uploadAsset,
    deleteAsset
  };
}
