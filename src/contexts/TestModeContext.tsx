import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

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
    if (!isLoading && !isAdmin && state.enabled) {
      setState((prev) => ({ ...prev, enabled: false }));
    }
  }, [isAdmin, isLoading, state.enabled]);

  const toggleTestMode = useCallback(() => {
    if (!isAdmin) return;
    setState((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, [isAdmin]);

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

  // Only enable test mode if user is verified admin
  const effectiveEnabled = isAdmin && state.enabled;

  // Count active bypasses
  const activeBypassCount = effectiveEnabled
    ? [
        state.autoPassQuizzes,
        state.bypassVideoProgress,
        state.bypassEnrollmentCheck,
        state.skipProgressionLocks,
      ].filter(Boolean).length
    : 0;

  return (
    <TestModeContext.Provider
      value={{
        isTestModeEnabled: effectiveEnabled,
        autoPassQuizzes: state.autoPassQuizzes,
        bypassVideoProgress: state.bypassVideoProgress,
        bypassEnrollmentCheck: state.bypassEnrollmentCheck,
        skipProgressionLocks: state.skipProgressionLocks,
        toggleTestMode,
        setAutoPassQuizzes,
        setBypassVideoProgress,
        setBypassEnrollmentCheck,
        setSkipProgressionLocks,
        canUseTestMode: isAdmin,
        activeBypassCount,
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
