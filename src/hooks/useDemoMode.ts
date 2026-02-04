import { useDemoModeContext } from "@/contexts/DemoModeContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function useDemoMode() {
  const { isAdmin } = useAdminAuth();
  const context = useDemoModeContext();

  return {
    // Core state
    isActive: context.isActive,
    showDemoData: context.showDemoData,
    stats: context.stats,
    isLoading: context.isLoading,
    isGenerating: context.isGenerating,
    lastGeneratedAt: context.lastGeneratedAt,

    // Controls
    toggleShowDemoData: context.toggleShowDemoData,
    generateDemoData: context.generateDemoData,
    clearDemoData: context.clearDemoData,
    refreshStats: context.refreshStats,

    // Computed
    canUseDemoMode: isAdmin,
    hasDemoData: context.stats.userCount > 0 || context.stats.postCount > 0,
  };
}
