import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";

interface DemoStats {
  userCount: number;
  postCount: number;
  commentCount: number;
}

interface DemoModeState {
  isActive: boolean;
  showDemoData: boolean;
  stats: DemoStats;
  isLoading: boolean;
  isGenerating: boolean;
  lastGeneratedAt: Date | null;
}

interface GenerateConfig {
  userCount: number;
  postCount: number;
  commentCount: number;
}

interface DemoModeContextType extends DemoModeState {
  toggleShowDemoData: () => void;
  generateDemoData: (config: GenerateConfig) => Promise<void>;
  clearDemoData: () => Promise<void>;
  refreshStats: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [showDemoData, setShowDemoData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch demo settings from database
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ["demo-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demo_settings")
        .select("*")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .single();

      if (error) {
        console.error("Error fetching demo settings:", error);
        return null;
      }
      return data;
    },
    enabled: isAdmin,
    staleTime: 30000,
  });

  // Fetch actual demo data counts
  const { data: counts, refetch: refetchCounts } = useQuery({
    queryKey: ["demo-counts"],
    queryFn: async () => {
      const [profilesRes, postsRes, commentsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_demo", true),
        supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("is_demo", true),
        supabase.from("community_comments").select("id", { count: "exact", head: true }).eq("is_demo", true),
      ]);

      return {
        userCount: profilesRes.count || 0,
        postCount: postsRes.count || 0,
        commentCount: commentsRes.count || 0,
      };
    },
    enabled: isAdmin,
    staleTime: 30000,
  });

  // Load showDemoData preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin-show-demo-data");
    if (saved !== null) {
      setShowDemoData(JSON.parse(saved));
    }
  }, []);

  const toggleShowDemoData = useCallback(() => {
    setShowDemoData(prev => {
      const newValue = !prev;
      localStorage.setItem("admin-show-demo-data", JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const generateDemoData = useCallback(async (config: GenerateConfig) => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("generate-demo-data", {
        body: config,
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate demo data");
      }

      const result = response.data;
      if (!result.success) {
        throw new Error(result.error || "Generation failed");
      }

      toast.success(`Generated ${result.stats.users} users, ${result.stats.posts} posts, ${result.stats.comments} comments`);
      
      // Refresh all queries
      queryClient.invalidateQueries({ queryKey: ["demo-settings"] });
      queryClient.invalidateQueries({ queryKey: ["demo-counts"] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
    } catch (error) {
      console.error("Generate demo data error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate demo data");
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [queryClient]);

  const clearDemoData = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("generate-demo-data", {
        body: { action: "clear" },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to clear demo data");
      }

      toast.success("All demo data cleared");
      
      // Refresh all queries
      queryClient.invalidateQueries({ queryKey: ["demo-settings"] });
      queryClient.invalidateQueries({ queryKey: ["demo-counts"] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
    } catch (error) {
      console.error("Clear demo data error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to clear demo data");
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [queryClient]);

  const refreshStats = useCallback(() => {
    refetch();
    refetchCounts();
  }, [refetch, refetchCounts]);

  const value: DemoModeContextType = {
    isActive: settings?.is_active || false,
    showDemoData,
    stats: counts || { userCount: 0, postCount: 0, commentCount: 0 },
    isLoading,
    isGenerating,
    lastGeneratedAt: settings?.last_generated_at ? new Date(settings.last_generated_at) : null,
    toggleShowDemoData,
    generateDemoData,
    clearDemoData,
    refreshStats,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoModeContext() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error("useDemoModeContext must be used within a DemoModeProvider");
  }
  return context;
}
