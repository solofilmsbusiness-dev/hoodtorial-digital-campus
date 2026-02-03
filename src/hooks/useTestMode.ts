import { useTestModeContext } from "@/contexts/TestModeContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function useTestMode() {
  const { isAdmin } = useAdminAuth();
  const context = useTestModeContext();

  return {
    // Core state
    isTestModeEnabled: context.isTestModeEnabled,
    autoPassQuizzes: context.autoPassQuizzes,
    bypassVideoProgress: context.bypassVideoProgress,
    
    // Controls
    toggleTestMode: context.toggleTestMode,
    setAutoPassQuizzes: context.setAutoPassQuizzes,
    setBypassVideoProgress: context.setBypassVideoProgress,
    
    // Computed
    canUseTestMode: isAdmin,
    
    // Bypass helpers
    shouldBypassVideoProgress: context.isTestModeEnabled && context.bypassVideoProgress,
    shouldAutoPassQuiz: context.isTestModeEnabled && context.autoPassQuizzes,
  };
}
