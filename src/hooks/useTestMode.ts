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
    bypassEnrollmentCheck: context.bypassEnrollmentCheck,
    skipProgressionLocks: context.skipProgressionLocks,
    
    // Controls
    toggleTestMode: context.toggleTestMode,
    setAutoPassQuizzes: context.setAutoPassQuizzes,
    setBypassVideoProgress: context.setBypassVideoProgress,
    setBypassEnrollmentCheck: context.setBypassEnrollmentCheck,
    setSkipProgressionLocks: context.setSkipProgressionLocks,
    
    // Computed
    canUseTestMode: isAdmin,
    activeBypassCount: context.activeBypassCount,
     isTesterRole: context.isTesterRole,
    
    // Bypass helpers - only active when test mode is enabled AND the specific bypass is on
    shouldBypassVideoProgress: context.isTestModeEnabled && context.bypassVideoProgress,
    shouldAutoPassQuiz: context.isTestModeEnabled && context.autoPassQuizzes,
    shouldBypassEnrollment: context.isTestModeEnabled && context.bypassEnrollmentCheck,
    shouldSkipProgressionLocks: context.isTestModeEnabled && context.skipProgressionLocks,
  };
}
