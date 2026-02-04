import { useMemo } from "react";
import { useSubscription } from "./useSubscription";
import { useTestModeContext } from "@/contexts/TestModeContext";

export interface TrialLimits {
  maxModules: number;
  maxEnrollments: number;
  canTakeFinalExams: boolean;
  canPostInCommunity: boolean;
  canSubmitProjects: boolean;
}

export function useTrialLimits() {
  const { isTrialing, isPaid, hasAccess } = useSubscription();
  const testModeContext = useTestModeContext();
  const isTestModeEnabled = testModeContext.isTestModeEnabled;

  const trialLimits: TrialLimits = useMemo(() => ({
    maxModules: 2,           // Can only access first 2 modules per course
    maxEnrollments: 2,       // Only 2 active courses during trial
    canTakeFinalExams: false,
    canPostInCommunity: false,
    canSubmitProjects: false,
  }), []);

  const paidLimits: TrialLimits = useMemo(() => ({
    maxModules: Infinity,
    maxEnrollments: 3,
    canTakeFinalExams: true,
    canPostInCommunity: true,
    canSubmitProjects: true,
  }), []);

  // Test mode or paid = full access
  const currentLimits = isTestModeEnabled || isPaid ? paidLimits : trialLimits;

  const canAccessModule = (moduleIndex: number): boolean => {
    if (isTestModeEnabled || isPaid) return true;
    if (isTrialing) return moduleIndex < trialLimits.maxModules;
    return false;
  };

  const canTakeFinalExam = isTestModeEnabled || isPaid;
  const canPostInCommunity = isTestModeEnabled || isPaid;
  const canSubmitProjects = isTestModeEnabled || isPaid;
  const maxEnrollments = currentLimits.maxEnrollments;

  return {
    trialLimits,
    currentLimits,
    canAccessModule,
    canTakeFinalExam,
    canPostInCommunity,
    canSubmitProjects,
    maxEnrollments,
    isTrialing,
    isPaid,
    hasAccess,
    isTestModeEnabled,
  };
}
