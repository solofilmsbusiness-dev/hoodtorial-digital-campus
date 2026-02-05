 import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
 import { useAdminAuth } from "@/hooks/useAdminAuth";
 import { useTesterAuth } from "@/hooks/useTesterAuth";

const TEST_MODE_KEY = "hu-admin-test-mode-v2";

interface TestModeState {
  enabled: boolean;
  autoPassQuizzes: boolean;
  bypassVideoProgress: boolean;
  bypassEnrollmentCheck: boolean;
  skipProgressionLocks: boolean;
}

interface TestModeContextType {
  isTestModeEnabled: boolean;
  autoPassQuizzes: boolean;
  bypassVideoProgress: boolean;
  bypassEnrollmentCheck: boolean;
  skipProgressionLocks: boolean;
  toggleTestMode: () => void;
  setAutoPassQuizzes: (value: boolean) => void;
  setBypassVideoProgress: (value: boolean) => void;
  setBypassEnrollmentCheck: (value: boolean) => void;
  setSkipProgressionLocks: (value: boolean) => void;
  canUseTestMode: boolean;
  activeBypassCount: number;
   isTesterRole: boolean;
}

const defaultState: TestModeState = {
  enabled: false,
  autoPassQuizzes: true,
  bypassVideoProgress: true,
  bypassEnrollmentCheck: false,
  skipProgressionLocks: false,
};

const TestModeContext = createContext<TestModeContextType | undefined>(undefined);

export function TestModeProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth();
   const { isTester, isLoading: testerLoading } = useTesterAuth();
  const [state, setState] = useState<TestModeState>(defaultState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TEST_MODE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<TestModeState>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.error("Failed to load test mode state:", err);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(TEST_MODE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save test mode state:", err);
    }
  }, [state]);

  // Disable test mode if user loses admin status
  useEffect(() => {
     if (!isLoading && !testerLoading && !isAdmin && !isTester && state.enabled) {
      setState((prev) => ({ ...prev, enabled: false }));
    }
   }, [isAdmin, isTester, isLoading, testerLoading, state.enabled]);

  const toggleTestMode = useCallback(() => {
     if (!isAdmin && !isTester) return;
    setState((prev) => ({ ...prev, enabled: !prev.enabled }));
   }, [isAdmin, isTester]);

  const setAutoPassQuizzes = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, autoPassQuizzes: value }));
  }, []);

  const setBypassVideoProgress = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, bypassVideoProgress: value }));
  }, []);

  const setBypassEnrollmentCheck = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, bypassEnrollmentCheck: value }));
  }, []);

  const setSkipProgressionLocks = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, skipProgressionLocks: value }));
  }, []);

   // Testers get automatic test mode, admins need to toggle it manually
   const effectiveEnabled = isTester || (isAdmin && state.enabled);

   // Testers get all bypasses enabled automatically (except autoPassQuizzes - results tracked)
   const effectiveBypassFlags = useMemo(() => {
     if (isTester) {
       return {
         bypassVideoProgress: true,
         bypassEnrollmentCheck: true,
         skipProgressionLocks: true,
         autoPassQuizzes: false, // Testers have quizzes tracked normally
       };
     }
     return {
       bypassVideoProgress: state.bypassVideoProgress,
       bypassEnrollmentCheck: state.bypassEnrollmentCheck,
       skipProgressionLocks: state.skipProgressionLocks,
       autoPassQuizzes: state.autoPassQuizzes,
     };
   }, [isTester, state.bypassVideoProgress, state.bypassEnrollmentCheck, state.skipProgressionLocks, state.autoPassQuizzes]);
 
   // Count active bypasses
   const activeBypassCount = effectiveEnabled
    ? [
         effectiveBypassFlags.autoPassQuizzes,
         effectiveBypassFlags.bypassVideoProgress,
         effectiveBypassFlags.bypassEnrollmentCheck,
         effectiveBypassFlags.skipProgressionLocks,
      ].filter(Boolean).length
    : 0;

  return (
    <TestModeContext.Provider
      value={{
        isTestModeEnabled: effectiveEnabled,
         autoPassQuizzes: effectiveBypassFlags.autoPassQuizzes,
         bypassVideoProgress: effectiveBypassFlags.bypassVideoProgress,
         bypassEnrollmentCheck: effectiveBypassFlags.bypassEnrollmentCheck,
         skipProgressionLocks: effectiveBypassFlags.skipProgressionLocks,
        toggleTestMode,
        setAutoPassQuizzes,
        setBypassVideoProgress,
        setBypassEnrollmentCheck,
        setSkipProgressionLocks,
         canUseTestMode: isAdmin || isTester,
        activeBypassCount,
         isTesterRole: isTester,
      }}
    >
      {children}
    </TestModeContext.Provider>
  );
}

export function useTestModeContext() {
  const context = useContext(TestModeContext);
  if (context === undefined) {
    throw new Error("useTestModeContext must be used within a TestModeProvider");
  }
  return context;
}
